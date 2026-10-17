#!/usr/bin/env node
// probe-r50-deep.mjs — session-50 / parity round 49 census: the DEEP
// interior reader (r50-eval.txt) over the weak-coverage routes. REF side
// (the daemon session is already authed). Slow pages get a longer settle.
// Usage: node scripts/probe-r50-deep.mjs /careers /payrollmodule ...
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

function run(cmd) {
  try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); }
  catch (e) { return "ERR:" + String(e).slice(0, 160); }
}
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  const t = out.trim();
  try { return JSON.parse(t); } catch {}
  try {
    return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
  } catch { return { error: out.slice(0, 300) }; }
}

const routes = process.argv.slice(2);
const BASE = "https://eon.base44.app";
const SLOW = new Set(["/payrollmodule", "/dynamicdashboard"]);
const READER = readFileSync(new URL("./r50-eval.txt", import.meta.url), "utf8");

for (const route of routes) {
  run(`agent-browser --session ref open "${BASE}${route}"`);
  const wait = SLOW.has(route) ? 11000 : 3000;
  await new Promise(r => setTimeout(r, wait));
  const r = await evalOn("ref", READER);
  console.log(`\n===== ${route} =====`);
  console.log(JSON.stringify(r, null, 1).slice(0, 4200));
}
