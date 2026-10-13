#!/usr/bin/env node
// probe-r31-kicker.mjs — investigate the /assets and /employeeselfservice
// kicker differences: full h1 census (y, font, size) on mobile + desktop,
// both apps.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const H1S = `(() => {
  const out = [];
  for (const h of [...document.querySelectorAll('h1, h2, h3')]) {
    const r = h.getBoundingClientRect();
    if (r.width === 0) continue;
    const cs = getComputedStyle(h);
    out.push({ tag: h.tagName, t: h.textContent.trim().slice(0,30), y: Math.round(r.y), fs: cs.fontSize, fw: cs.fontWeight, x: Math.round(r.x) });
  }
  return JSON.stringify(out.slice(0, 8));
})()`;

for (const [vw, label] of [[390, "MOBILE"], [1440, "DESKTOP"]]) {
  for (const route of ["/assets", "/employeeselfservice", "/aiassistant"]) {
    console.log(`\n=== ${label} ${route} ===`);
    for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
      run(`agent-browser --session ${s} set viewport ${vw} 844`);
      run(`agent-browser --session ${s} open "${base}${route}"`);
      await new Promise(r => setTimeout(r, 3200));
      const d = await evalOn(s, H1S);
      console.log(`${s.toUpperCase()}: ${JSON.stringify(d)}`);
    }
  }
}
