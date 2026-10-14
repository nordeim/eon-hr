#!/usr/bin/env node
// probe-r41-routesweep.mjs — session-42 / parity round 41 standing route
// sweep: 12 canonical routes, h1 text/font/geometry both sides.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const ROUTES = ["/dashboard", "/employees", "/payroll", "/taskmanager", "/attendance", "/recruitment", "/training", "/documenttracker", "/profile", "/settings", "/staffrequests", "/careers"];

const H1 = `(() => {
  const h1 = document.querySelector('h1');
  if (!h1) return { found: false };
  const r = h1.getBoundingClientRect(); const cs = getComputedStyle(h1);
  return { found: true, t: (h1.textContent||'').trim().slice(0,30), x: Math.round(r.x), y: Math.round(r.y), fs: cs.fontSize, fw: cs.fontWeight };
})()`;

let match = 0;
for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 1800));
  run(`agent-browser --session loc open "${baseLoc}${route}"`);
  await new Promise(r => setTimeout(r, 1400));
  const a = await evalOn("ref", H1);
  const b = await evalOn("loc", H1);
  const same = JSON.stringify(a) === JSON.stringify(b);
  if (same) match++;
  console.log(`${same ? "MATCH " : "DIFF  "} ${route.padEnd(18)} ref=${JSON.stringify(a)} loc=${JSON.stringify(b)}`);
}
console.log(`\n${match}/${ROUTES.length} route sweep MATCH`);
