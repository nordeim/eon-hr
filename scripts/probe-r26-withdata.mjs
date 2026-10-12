#!/usr/bin/env node
// probe-r26-withdata.mjs — session-27 / parity round 26: the with-data
// re-check (standing audit). Does REF render any data rows now? Four surfaces:
// employees / payroll / leavemanagement / taskmanager.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const ROUTES = ["/employees", "/payroll", "/leavemanagement", "/taskmanager"];
const READER = `(() => { const rows = document.querySelectorAll('table tbody tr').length; const cards = document.querySelectorAll('[data-slot=card], .card').length; const empties = [...document.querySelectorAll('p,div,span')].filter(e => e.children.length === 0 && /no |not |empty|yet|found/i.test(e.textContent||'')).length; return JSON.stringify({rows, cards, empties}); })()`;

const baseRef = "https://eon.base44.app";
run(`agent-browser --session ref set viewport 1440 900`);
for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 3000));
  const r1 = await evalOn("ref", READER);
  console.log(`REF ${route.padEnd(20)} ${JSON.stringify(r1)}`);
}
