#!/usr/bin/env node
// probe-r22-dochother.mjs — measure docH on the 8 tab pages + 4 controls on
// both apps: any +24 delta = the v4 trailing space-y margin (phantom gap).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    let raw = out.trim();
    try { const once = JSON.parse(raw); if (typeof once === "string") raw = once; } catch {}
    return JSON.parse(raw);
  } catch { return { error: out.slice(0, 200) }; }
}

const ROUTES = ["/settings", "/evaluations", "/attendance", "/compliancedashboard", "/profile", "/recruitment", "/performancemanagement", "/reports", "/dashboard", "/employees", "/loans", "/training"];

for (const route of ROUTES) {
  const r = await evalOn("ref", `(() => { return JSON.stringify({ p: location.pathname }); })()`, 0).catch(() => null);
  run(`agent-browser --session ref open https://eon.base44.app${route}`);
  await new Promise(r2 => setTimeout(r2, 3200));
  const refD = await evalOn("ref", `document.documentElement.scrollHeight`);
  run(`agent-browser --session loc open http://127.0.0.1:3200${route}`);
  await new Promise(r2 => setTimeout(r2, 3000));
  const locD = await evalOn("loc", `document.documentElement.scrollHeight`);
  const d = (typeof locD === "number" && typeof refD === "number") ? locD - refD : "?";
  console.log(`${route.padEnd(24)} REF=${refD} LOC=${locD} delta=${d > 0 ? "+" + d : d}`);
}
