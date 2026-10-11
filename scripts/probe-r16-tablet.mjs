#!/usr/bin/env node
// probe-r16-tablet.mjs — tablet-band geometry sweep (768/900/1024): docW
// overflow + h1 wrap on both REF and LOC across the fitting-sensitive routes.
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 100);
  }
}

const PROBE = `(() => {
  const out = { vw: window.innerWidth, docW: document.documentElement.scrollWidth };
  const h1 = [...document.querySelectorAll("h1")].find(h => h.offsetParent !== null);
  if (h1) { const r = h1.getBoundingClientRect(); out.h1 = { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y) }; }
  const wide = [...document.querySelectorAll("main *")].filter(e => { const r = e.getBoundingClientRect(); return r.right > window.innerWidth + 1 && r.width > 80; }).slice(0, 2);
  out.overflow = wide.map(e => { const r = e.getBoundingClientRect(); return { cls: String(e.className).slice(0, 40), w: Math.round(r.width), right: Math.round(r.right) }; });
  return JSON.stringify(out);
})()`;

const ROUTES = ["/dashboard", "/attendance", "/employees", "/payroll", "/taskmanager", "/settings", "/hrreports", "/compliancedashboard", "/recruitment", "/leavemanagement", "/expenses", "/reports", "/analytics", "/profile", "/surveys", "/workflowautomation", "/chat"];

async function sweep(session, base, vp) {
  run(`agent-browser --session ${session} set viewport ${vp} 844`);
  await new Promise(r => setTimeout(r, 1200));
  const results = [];
  for (const route of ROUTES) {
    run(`agent-browser --session ${session} open "${base}${route}"`);
    await new Promise(r => setTimeout(r, 1600));
    const oneLine = PROBE.split("\n").join(" ");
    const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
    try {
      const j = JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
      results.push({ route, vw: j.vw, docW: j.docW, h1: j.h1, overflow: j.overflow });
    } catch {
      results.push({ route, err: out.slice(0, 40) });
    }
  }
  return results;
}

for (const vp of [768, 900, 1024]) {
  console.log(`\n========== VIEWPORT ${vp} ==========`);
  const ref = await sweep("ref", "https://eon.base44.app", vp);
  const loc = await sweep("loc", "http://127.0.0.1:3200", vp);
  for (let i = 0; i < ref.length; i++) {
    const r = ref[i], l = loc[i];
    if (r.err || l.err) { console.log(`${r.route} | ERR`); continue; }
    const rOver = r.docW > r.vw + 1, lOver = l.docW > l.vw + 1;
    const h1d = JSON.stringify(r.h1) !== JSON.stringify(l.h1) ? ` h1:R${JSON.stringify(r.h1)} L${JSON.stringify(l.h1)}` : "";
    if (rOver || lOver || h1d) {
      console.log(`${r.route} | REF docW ${r.docW}${rOver ? " **OVER**" + JSON.stringify(r.overflow) : ""} | LOC docW ${l.docW}${lOver ? " **OVER**" + JSON.stringify(l.overflow) : ""}${h1d}`);
    }
  }
  console.log("(clean routes omitted)");
}
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc set viewport 1440 900`);
