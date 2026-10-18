#!/usr/bin/env node
// r56-probe7.mjs — session-56 reconnaissance round 7: the read-only family
// scope sweep — count bg-slate-50 elements + disabled inputs per route on
// both sides (1440×900) to find every surface where REF renders the
// read-only recipe the clone misses.
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const settle = (ms) => new Promise(r => setTimeout(r, ms));
function evalStr(expr) { return JSON.stringify(expr.split("\n").join(" ")); }
async function ev(session, expr) {
  const out = run(`agent-browser --session ${session} eval ${evalStr(expr)}`);
  try { return JSON.parse(JSON.parse(out.trim())); } catch { return "ERR:" + out.slice(0, 200); }
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const ROUTES = ["dashboard","employees","payroll","taskmanager","attendance","recruitment","training","documenttracker","profile","settings","staffrequests","leave","expenses","loans","compliance","notifications","assets","hrreports"];

const COUNT = `JSON.stringify((() => {
  const slate = [...document.querySelectorAll('main [class*=bg-slate-50]')].length;
  const dis = [...document.querySelectorAll('main input[disabled], main textarea[disabled], main select[disabled]')].length;
  return { slate, dis };
})())`;

async function readCounts(session, base, path) {
  run(`agent-browser --session ${session} open ${base}/${path}`);
  await settle(2200);
  return ev(session, COUNT);
}

console.log("route           REF{slate,dis}  LOC{slate,dis}");
for (const r of ROUTES) {
  const ref = await readCounts("ref56", baseRef, r);
  const loc = await readCounts("loc", baseLoc, r);
  const flag = JSON.stringify(ref) === JSON.stringify(loc) ? "" : "  <-- DIVERGES";
  console.log(`/${r.padEnd(14)} ${JSON.stringify(ref).padEnd(14)} ${JSON.stringify(loc)}${flag}`);
}
process.exit(0);
