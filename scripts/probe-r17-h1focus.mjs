#!/usr/bin/env node
// probe-r17-h1focus.mjs — deep probe of the three tablet-band h1 wrap
// candidates: /payrollmodule, /recruitmentkanban, /documenttracker.
// Measures the h1's containing block, the header row layout, and the h1's
// own min/max width story on REF vs LOC at the flagged viewports.
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 100);
  }
}

const PROBE = `(() => {
  const h1 = [...document.querySelectorAll("h1")].find(h => h.offsetParent !== null);
  if (!h1) return JSON.stringify({ noH1: true });
  const r = h1.getBoundingClientRect(); const cs = getComputedStyle(h1);
  const out = { h1: { t: h1.textContent.trim().slice(0, 24), w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y), fs: cs.fontSize } };
  const parent = h1.parentElement;
  if (parent) { const pr = parent.getBoundingClientRect(); const pcs = getComputedStyle(parent);
    out.parent = { tag: parent.tagName, cls: String(parent.className).slice(0, 70), w: Math.round(pr.width), h: Math.round(pr.height), display: pcs.display, flexWrap: pcs.flexWrap, gap: pcs.gap, flexDirection: pcs.flexDirection }; }
  const gp = parent?.parentElement;
  if (gp) { const gr = gp.getBoundingClientRect(); const gcs = getComputedStyle(gp);
    out.grandparent = { tag: gp.tagName, cls: String(gp.className).slice(0, 70), w: Math.round(gr.width), display: gcs.display, flexWrap: gcs.flexWrap, gap: gcs.gap, pad: gcs.padding }; }
  const main = document.querySelector("main");
  if (main) { const mr = main.getBoundingClientRect(); out.main = { w: Math.round(mr.width) }; }
  out.docW = document.documentElement.scrollWidth;
  const sibs = [...(parent?.children || [])].filter(c => c !== h1).slice(0, 3).map(c => { const cr = c.getBoundingClientRect();
    return { tag: c.tagName, cls: String(c.className).slice(0, 40), w: Math.round(cr.width), x: Math.round(cr.x), y: Math.round(cr.y) }; });
  out.siblings = sibs;
  return JSON.stringify(out);
})()`;

async function measure(session, base, route, vp) {
  run(`agent-browser --session ${session} set viewport ${vp} 844`);
  run(`agent-browser --session ${session} open "${base}${route}"`);
  await new Promise(r => setTimeout(r, 1600));
  const oneLine = PROBE.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
  } catch {
    return { error: out.slice(0, 100) };
  }
}

const CASES = [
  ["/payrollmodule", 768], ["/payrollmodule", 900],
  ["/recruitmentkanban", 768],
  ["/documenttracker", 768], ["/documenttracker", 1024],
];
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
for (const [route, vp] of CASES) {
  const ref = await measure("ref", baseRef, route, vp);
  const loc = await measure("loc", baseLoc, route, vp);
  console.log(`\n═══ ${route} @${vp} ═══`);
  console.log("REF:", JSON.stringify(ref));
  console.log("LOC:", JSON.stringify(loc));
}
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc set viewport 1440 900`);
