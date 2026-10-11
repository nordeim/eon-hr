#!/usr/bin/env node
// probe-r16-analytics768.mjs — how does REF render the /analytics stat row
// (tile-right cards) at 768 where it fits, vs LOC's overflowing 4-col grid?
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 100);
  }
}

const PROBE = `(() => {
  const out = {};
  const grids = [...document.querySelectorAll("main .grid")].slice(0, 3);
  out.grids = grids.map(g => {
    const cs = getComputedStyle(g);
    const r = g.getBoundingClientRect();
    const kids = [...g.children].map(c => { const cr = c.getBoundingClientRect(); return { w: Math.round(cr.width), h: Math.round(cr.height), right: Math.round(cr.right) }; }).slice(0, 6);
    return { cls: String(g.className).slice(0, 50), cols: cs.gridTemplateColumns, w: Math.round(r.width), kids };
  });
  out.docW = document.documentElement.scrollWidth;
  return JSON.stringify(out);
})()`;

async function probe(session, base, vp) {
  run(`agent-browser --session ${session} set viewport ${vp} 844`);
  run(`agent-browser --session ${session} open "${base}/analytics"`);
  await new Promise(r => setTimeout(r, 2200));
  const oneLine = PROBE.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
  } catch {
    return { parseErr: out.slice(0, 80) };
  }
}

for (const vp of [768, 900, 1024]) {
  const ref = await probe("ref", "https://eon.base44.app", vp);
  const loc = await probe("loc", "http://127.0.0.1:3200", vp);
  console.log(`\n== /analytics @${vp} ==  REF docW=${ref.docW} LOC docW=${loc.docW}`);
  console.log("REF grids:", JSON.stringify(ref.grids));
  console.log("LOC grids:", JSON.stringify(loc.grids));
}
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc set viewport 1440 900`);
