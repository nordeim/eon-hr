#!/usr/bin/env node
// probe-r16-drawer.mjs — mobile drawer audit (session 17 / parity round 16).
// Finds the drawer panel by GEOMETRY (position:fixed, left 0, ~288px wide,
// full height) — offsetParent is null for fixed elements (the session-16
// lesson). Also verifies hamburger geometry, footer, submenu links, and the
// absence of a close (X) button. REF vs LOC at 390×844.
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 140);
  }
}

const PROBE = `(() => {
  const out = {};
  const btns = [...document.querySelectorAll("button")].filter(b => b.offsetParent !== null);
  const burger = btns.find(b => { const r = b.getBoundingClientRect(); return r.y < 80 && r.x < 80 && r.width >= 20 && r.width <= 44; });
  if (burger) { const r = burger.getBoundingClientRect(); out.burger = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), label: burger.getAttribute("aria-label") || "" }; }
  const panel = [...document.querySelectorAll("div,aside,nav")].find(d => {
    const cs = getComputedStyle(d);
    if (cs.position !== "fixed" || cs.display === "none") return false;
    const r = d.getBoundingClientRect();
    return r.x <= 1 && r.width >= 250 && r.width <= 330 && r.height >= 600 && cs.backgroundColor !== "rgba(0, 0, 0, 0.8)";
  });
  if (panel) {
    const r = panel.getBoundingClientRect(); const cs = getComputedStyle(panel);
    out.panel = { x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, z: cs.zIndex, pos: cs.position };
    const links = [...panel.querySelectorAll("a")].map(a => { const ar = a.getBoundingClientRect(); return { t: (a.textContent || "").trim().slice(0, 20), y: Math.round(ar.y), h: Math.round(ar.height) }; }).filter(l => l.t).slice(0, 14);
    out.links = links;
    const foot = [...panel.querySelectorAll("div")].filter(d => { const fr = d.getBoundingClientRect(); return fr.height > 100 && fr.height < 140 && fr.width > 200; }).pop();
    if (foot) out.footer = { y: Math.round(foot.getBoundingClientRect().y), h: Math.round(foot.getBoundingClientRect().height) };
    const closeBtn = [...panel.querySelectorAll("button")].find(b => { const t = (b.textContent || "").trim(); const br = b.getBoundingClientRect(); return !t && br.width <= 40 && br.height <= 40 && b !== burger; });
    out.closeBtn = closeBtn ? "PRESENT" : "none";
    out.docW = document.documentElement.scrollWidth;
  }
  const ov = [...document.querySelectorAll("div")].find(d => { const cs = getComputedStyle(d); const r = d.getBoundingClientRect(); return cs.position === "fixed" && r.width > 300 && (cs.backgroundColor === "rgba(0, 0, 0, 0.8)" || cs.backgroundColor === "rgba(0,0,0,0.8)"); });
  if (ov) { const r = ov.getBoundingClientRect(); out.overlay = { w: Math.round(r.width), h: Math.round(r.height), z: getComputedStyle(ov).zIndex }; }
  return JSON.stringify(out);
})()`;

async function probe(session, base) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3500));
  // open the drawer via the hamburger (geometry-located)
  run(`agent-browser --session ${session} eval "(() => { const b = [...document.querySelectorAll('button')].find(x => { const r = x.getBoundingClientRect(); return x.offsetParent !== null && r.y < 80 && r.x < 80 && r.width >= 20 && r.width <= 44; }); if (b) b.click(); return b ? 'clicked' : 'no-burger'; })()"`);
  await new Promise(r => setTimeout(r, 1800));
  const oneLine = PROBE.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\\\/g, "\\\\"));
  } catch {
    return { raw: out.slice(0, 300) };
  }
}

const ref = await probe("ref", "https://eon.base44.app");
const loc = await probe("loc", "http://127.0.0.1:3200");
console.log("REF:", JSON.stringify(ref, null, 1));
console.log("LOC:", JSON.stringify(loc, null, 1));
