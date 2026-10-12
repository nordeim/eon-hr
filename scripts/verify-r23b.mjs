#!/usr/bin/env node
// verify-r23b.mjs — clean user-select verification (JSON-quote-safe compare).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 100); } }
async function evalStr(session, expr) {
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(expr)}`);
  try { return JSON.parse(out.trim()); } catch { return out.trim().slice(0, 60); }
}
let pass = 0, fail = 0;
const routes = [["/dashboard", "none"], ["/employees", "none"], ["/payroll", "none"], ["/attendance", "none"], ["/leavemanagement", "none"], ["/expenses", "none"], ["/loans", "none"], ["/taskmanager", "none"], ["/settings", "auto"], ["/compliancedashboard", "auto"], ["/profile", "auto"]];
for (const [route, want] of routes) {
  run(`agent-browser --session loc open http://127.0.0.1:3200${route}`);
  await new Promise(r => setTimeout(r, 2300));
  const us = await evalStr("loc", `(() => { const h = [...document.querySelectorAll('h1')].find(x => x.offsetParent); return h ? getComputedStyle(h).userSelect : 'no-h1'; })()`);
  const ok = us === want;
  if (ok) pass++; else fail++;
  console.log(`${ok ? "PASS" : "**FAIL**"} ${route} h1=${us} (want ${want})`);
}
run("agent-browser --session loc open http://127.0.0.1:3200/employees");
await new Promise(r => setTimeout(r, 2300));
const inp = await evalStr("loc", `(() => { const i = document.querySelector('input'); return i ? getComputedStyle(i).userSelect : 'no-input'; })()`);
console.log(`${inp === "none" ? "PASS" : "**FAIL**"} employees search input=${inp} (want none)`);
console.log(`\nRESULT: ${pass + (inp === "none" ? 1 : 0)} PASS / ${fail + (inp === "none" ? 0 : 1)} FAIL`);
