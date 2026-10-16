#!/usr/bin/env node
// capture-r46.mjs — session-47 screenshots (180-183): the zero-state app
// interiors, REF + zero-tenant LOC pairs at 1440x900:
// 180 the payroll page (the trio root + the stat family at zero),
// 181 the documenttracker stat row (the horizontal p/p family),
// 182 the dashboard (the leave-balances defaults + the quick-action chips),
// 183 the profile identity header (the avatar input zone).
import { execSync } from "node:child_process";
import path from "node:path";
const outDir = path.resolve("docs/screenshots");
async function shot(session, base, name, route) {
  try { execSync(`agent-browser --session ${session} set viewport 1440 900`, { stdio: "pipe", timeout: 30000 }); } catch { }
  try { execSync(`agent-browser --session ${session} open ${base}${route}`, { stdio: "pipe", timeout: 45000 }); } catch { }
  await new Promise(r => setTimeout(r, 2400));
  try {
    execSync(`agent-browser --session ${session} screenshot ${outDir}/${name}`, { stdio: "pipe", timeout: 30000 });
    console.log("OK", name);
  } catch { console.log("FAIL", name); }
}
const ref = "https://eon.base44.app", zero = "http://127.0.0.1:3201";
const PAIRS = [
  ["180", "/payroll"],
  ["181", "/documenttracker"],
  ["182", "/dashboard"],
  ["183", "/profile"],
];
for (const [n, route] of PAIRS) {
  await shot("ref", ref, `${n}-ref-zerostate.png`, route);
  await shot("loc0", zero, `${n}b-loc0-zerostate.png`, route);
}
console.log("done");
