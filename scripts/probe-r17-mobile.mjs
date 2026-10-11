#!/usr/bin/env node
// probe-r17-mobile.mjs — mobile navigation audit (session 18 / parity round 17).
// User priority surface: top bar (390×73 white sticky), bottom tabs (pitches,
// label/icon sizes, active color), drawer (geometry-located: position:fixed +
// ~288px wide — offsetParent is null for fixed elements, the session-16
// lesson), kicker (53px@89, 18px/700, scroll-away), md boundary (767 mobile
// chrome → 800 desktop sidebar). REF vs LOC. No Tailwind v4 bug expected —
// prior rounds byte-identical.
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 140);
  }
}

async function evalOn(session, expr, ms = 1200) {
  await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
  } catch {
    return { error: out.slice(0, 120) };
  }
}

// ---- 1. top bar + bottom tabs at 390×844 --------------------------------
const CHROME = `(() => {
  const out = {};
  const bar = [...document.querySelectorAll("header,div")].find(d => {
    if (d.tagName !== "HEADER" && !(d.getBoundingClientRect().height > 55 && d.getBoundingClientRect().height < 95)) return false;
    const r = d.getBoundingClientRect(); const cs = getComputedStyle(d);
    return r.y < 10 && r.width > 350 && r.width <= 400 && (d.tagName === "HEADER" || cs.position === "sticky" || cs.position === "fixed");
  });
  if (bar) { const r = bar.getBoundingClientRect(); const cs = getComputedStyle(bar);
    out.topBar = { w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, pos: cs.position, bb: cs.borderBottomWidth + " " + cs.borderBottomColor }; }
  const tabs = [...document.querySelectorAll("nav a, [role=navigation] a, a")].filter(a => {
    const r = a.getBoundingClientRect(); return r.y > 700 && r.y < 830 && r.width > 40 && a.offsetParent !== null;
  });
  if (tabs.length >= 4) {
    out.tabs = tabs.slice(0, 6).map(a => { const r = a.getBoundingClientRect();
      const label = a.querySelector("span"); const icon = a.querySelector("svg");
      const active = getComputedStyle(a).color;
      return { t: (label?.textContent || a.textContent || "").trim().slice(0, 12), x: Math.round(r.x), y: Math.round(r.y),
        labFs: label ? getComputedStyle(label).fontSize : null, iconW: icon ? Math.round(icon.getBoundingClientRect().width) : null, color: active }; });
    const row = tabs[0].parentElement.getBoundingClientRect();
    out.tabBar = { y: Math.round(row.y), h: Math.round(row.height) };
  }
  return JSON.stringify(out);
})()`;

// ---- 2. drawer (geometry-located) ----------------------------------------
const DRAWER = `(() => {
  const out = {};
  const btns = [...document.querySelectorAll("button")].filter(b => b.offsetParent !== null);
  const burger = btns.find(b => { const r = b.getBoundingClientRect(); return r.y < 80 && r.x < 80 && r.width >= 20 && r.width <= 44; });
  if (burger) { const r = burger.getBoundingClientRect(); out.burger = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; }
  const panel = [...document.querySelectorAll("div,aside,nav")].find(d => {
    const cs = getComputedStyle(d);
    if (cs.position !== "fixed" || cs.display === "none") return false;
    const r = d.getBoundingClientRect();
    return r.x <= 1 && r.width >= 250 && r.width <= 330 && r.height >= 600 && cs.backgroundColor !== "rgba(0, 0, 0, 0.8)";
  });
  if (panel) {
    const r = panel.getBoundingClientRect(); const cs = getComputedStyle(panel);
    out.panel = { x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, z: cs.zIndex, pos: cs.position };
    const links = [...panel.querySelectorAll("a")].filter(a => a.getBoundingClientRect().height > 20).slice(0, 10)
      .map(a => ({ t: (a.textContent || "").trim().slice(0, 16), y: Math.round(a.getBoundingClientRect().y) }));
    out.links = links;
    const foot = [...panel.querySelectorAll("div")].filter(d => { const rr = d.getBoundingClientRect(); return rr.height > 100 && rr.height < 140; }).pop();
    if (foot) out.footer = { y: Math.round(foot.getBoundingClientRect().y), h: Math.round(foot.getBoundingClientRect().height) };
  }
  const ov = [...document.querySelectorAll("div")].find(d => { const cs = getComputedStyle(d); const r = d.getBoundingClientRect();
    return cs.position === "fixed" && cs.backgroundColor.startsWith("rgba(0") && r.width > 300; });
  if (ov) { const r = ov.getBoundingClientRect(); out.overlay = { w: Math.round(r.width), h: Math.round(r.height), z: getComputedStyle(ov).zIndex }; }
  return JSON.stringify(out);
})()`;

// ---- 3. kicker (dashboard category-A) ------------------------------------
const KICKER = `(() => {
  const out = {};
  const bar = [...document.querySelectorAll("div")].find(d => {
    const cs = getComputedStyle(d); const r = d.getBoundingClientRect();
    return cs.display !== "none" && r.y >= 80 && r.y <= 120 && r.height >= 45 && r.height <= 65 && cs.backgroundColor === "rgb(255, 255, 255)" && cs.borderBottomWidth === "1px";
  });
  if (bar) { const r = bar.getBoundingClientRect(); const cs = getComputedStyle(bar);
    out.kicker = { y: Math.round(r.y), h: Math.round(r.height), bg: cs.backgroundColor, bb: cs.borderBottomColor };
    const h1 = bar.querySelector("h1");
    if (h1) { const hr = h1.getBoundingClientRect(); const hcs = getComputedStyle(h1);
      out.kickerH1 = { t: h1.textContent.trim().slice(0, 20), fs: hcs.fontSize, fw: hcs.fontWeight, x: Math.round(hr.x), y: Math.round(hr.y) }; } }
  return JSON.stringify(out);
})()`;

async function openPage(session, base, route, vp) {
  run(`agent-browser --session ${session} set viewport ${vp[0]} ${vp[1]}`);
  run(`agent-browser --session ${session} open "${base}${route}"`);
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

console.log("── 1. TOP BAR + BOTTOM TABS @390×844 (/dashboard) ──");
await openPage("ref", baseRef, "/dashboard", [390, 844]);
await openPage("loc", baseLoc, "/dashboard", [390, 844]);
const refChrome = await evalOn("ref", CHROME, 2500);
const locChrome = await evalOn("loc", CHROME, 2500);
console.log("REF:", JSON.stringify(refChrome));
console.log("LOC:", JSON.stringify(locChrome));

console.log("\n── 2. DRAWER (geometry-located) @390×844 ──");
for (const s of ["ref", "loc"]) {
  run(`agent-browser --session ${s} eval "document.querySelector('button[aria-label=\\\\\\\"Toggle Sidebar\\\\\\\"]')?.click(); 'x'"`);
}
const refDrawer = await evalOn("ref", DRAWER, 2000);
const locDrawer = await evalOn("loc", DRAWER, 2000);
console.log("REF:", JSON.stringify(refDrawer));
console.log("LOC:", JSON.stringify(locDrawer));
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} press Escape`);

console.log("\n── 3. KICKER (/dashboard @390×844, post-scroll-away check) ──");
const refKick = await evalOn("ref", KICKER, 1500);
const locKick = await evalOn("loc", KICKER, 1500);
console.log("REF:", JSON.stringify(refKick));
console.log("LOC:", JSON.stringify(locKick));
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} eval "window.scrollTo(0, 300); 'x'"`);
const refKick2 = await evalOn("ref", `(() => { const k = ${KICKER}; return k; })()`.replace(/^.*?=>/, "(() =>").replace(/\}$/, "})()"), 800);
console.log("(scrolled REF):", JSON.stringify(refKick2));

console.log("\n── 4. md BOUNDARY (767 = mobile chrome / 800 = desktop sidebar) ──");
const BOUND = `(() => {
  const out = {};
  const header = document.querySelector("header");
  out.headerVisible = header ? getComputedStyle(header).display !== "none" : false;
  out.hamburger = [...document.querySelectorAll("button")].some(b => b.offsetParent !== null && (b.getAttribute("aria-label") || "").includes("Sidebar"));
  out.sidebar = [...document.querySelectorAll("aside,nav")].some(n => { const cs = getComputedStyle(n); const r = n.getBoundingClientRect(); return cs.display !== "none" && r.width > 200 && r.x < 30 && r.y < 130; });
  out.docW = document.documentElement.scrollWidth;
  return JSON.stringify(out);
})()`;
for (const vp of [767, 800]) {
  await openPage("ref", baseRef, "/dashboard", [vp, 844]);
  await openPage("loc", baseLoc, "/dashboard", [vp, 844]);
  const r = await evalOn("ref", BOUND, 1800);
  const l = await evalOn("loc", BOUND, 1800);
  const match = JSON.stringify(r) === JSON.stringify(l);
  console.log(`@${vp}: REF ${JSON.stringify(r)} | LOC ${JSON.stringify(l)} | ${match ? "MATCH" : "**DIFF**"}`);
}

run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc set viewport 1440 900`);
console.log("\nMOBILE-AUDIT-DONE");
