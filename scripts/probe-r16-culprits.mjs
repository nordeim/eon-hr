#!/usr/bin/env node
// probe-r16-culprits.mjs — find the exact overflowing elements on LOC
// /analytics and /employees at 768 (where REF fits / clone should fit), and
// verify the /hrreports + /compliance + /workflowautomation h1 deltas.
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 100);
  }
}

const OVERFLOW = `(() => {
  const out = { docW: document.documentElement.scrollWidth, vw: window.innerWidth, list: [] };
  const all = [...document.querySelectorAll("main *")];
  for (const e of all) {
    const r = e.getBoundingClientRect();
    if (r.right > out.vw + 1 && r.width > 8 && r.height > 8) {
      let clamped = false;
      let p = e.parentElement;
      while (p) { const pcs = getComputedStyle(p); if (/(auto|hidden|scroll|clip)/.test(pcs.overflowX)) { clamped = true; break; } p = p.parentElement; }
      if (!clamped) out.list.push({ tag: e.tagName.toLowerCase(), cls: String(e.className).slice(0, 56), w: Math.round(r.width), right: Math.round(r.right), t: (e.textContent || "").trim().slice(0, 20) });
    }
  }
  out.list = out.list.slice(0, 6);
  return JSON.stringify(out);
})()`;

const H1PROBE = `(() => {
  const h1 = [...document.querySelectorAll("h1")].find(h => h.offsetParent !== null);
  if (!h1) return JSON.stringify({});
  const r = h1.getBoundingClientRect();
  const cs = getComputedStyle(h1);
  const range = document.createRange();
  const lines = [];
  for (const child of h1.childNodes) {
    if (child.nodeType === 3) {
      range.selectNodeContents(child);
      const rects = range.getClientRects();
      for (const rect of rects) lines.push(Math.round(rect.height));
    }
  }
  return JSON.stringify({ t: h1.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y), lh: cs.lineHeight, lines: lines.slice(0, 3), parentCls: String(h1.parentElement.className).slice(0, 40) });
})()`;

async function evalOn(session, base, route, probe, vp) {
  run(`agent-browser --session ${session} set viewport ${vp} 844`);
  run(`agent-browser --session ${session} open "${base}${route}"`);
  await new Promise(r => setTimeout(r, 2000));
  const oneLine = probe.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
  } catch {
    return { parseErr: out.slice(0, 80) };
  }
}

console.log("== /analytics @768 overflow culprits (LOC) ==");
console.log(JSON.stringify(await evalOn("loc", "http://127.0.0.1:3200", "/analytics", OVERFLOW, 768), null, 1));
console.log("== /employees @768 overflow culprits (LOC) ==");
console.log(JSON.stringify(await evalOn("loc", "http://127.0.0.1:3200", "/employees", OVERFLOW, 768), null, 1));

for (const route of ["/hrreports", "/compliancedashboard", "/workflowautomation"]) {
  for (const vp of [900, 1024]) {
    const ref = await evalOn("ref", "https://eon.base44.app", route, H1PROBE, vp);
    const loc = await evalOn("loc", "http://127.0.0.1:3200", route, H1PROBE, vp);
    console.log(`\n== ${route} @${vp} ==`);
    console.log("REF:", JSON.stringify(ref));
    console.log("LOC:", JSON.stringify(loc));
  }
}
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc set viewport 1440 900`);
