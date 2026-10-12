#!/usr/bin/env node
// probe-r23-cursor6.mjs — the 46-route user-select classification sweep:
// read the page h1's computed userSelect (h1 = page content, never chrome) on
// REF and LOC per route + the chrome element dump (header + sidebar footer).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; }
}

const ROUTES = ["/dashboard", "/employees", "/payroll", "/payrollengine", "/payrollmodule", "/attendance", "/attendancedashboard", "/leavemanagement", "/allleaverequests", "/expenses", "/loans", "/taskmanager", "/recruitment", "/recruitmentkanban", "/training", "/announcements", "/communications", "/companywall", "/chat", "/hrassistantchat", "/interviewassistant", "/evaluations", "/hrletters", "/hrreports", "/surveys", "/surveyanalytics", "/performancemanagement", "/offboarding", "/organogram", "/shiftcalendar", "/staffrequests", "/documenttracker", "/assetmanagement", "/compliancedashboard", "/reports", "/analytics", "/analyticsdashboard", "/advancedanalytics", "/templates", "/workflowautomation", "/workflowconfigpage", "/settings", "/profile", "/notificationpreferences", "/securitysettings", "/employeeselfservice"];

const READ = `(() => {
  const h1 = [...document.querySelectorAll('h1')].find(h => h.offsetParent);
  if (!h1) return JSON.stringify({ us: 'no-h1' });
  const btn = [...document.querySelectorAll('main button, main [role=tab]')].find(b => b.offsetParent);
  return JSON.stringify({ h1us: getComputedStyle(h1).userSelect, btn: btn ? getComputedStyle(btn).userSelect : '-' });
})()`;

console.log("── 46-ROUTE user-select sweep (REF h1/btn vs LOC h1/btn) ──");
const refNone = [], refAuto = [], diffs = [];
for (const route of ROUTES) {
  run(`agent-browser --session ref open https://eon.base44.app${route}`);
  await new Promise(r => setTimeout(r, 2600));
  const r1 = await evalOn("ref", READ);
  run(`agent-browser --session loc open http://127.0.0.1:3200${route}`);
  await new Promise(r => setTimeout(r, 2300));
  const l1 = await evalOn("loc", READ);
  const refUs = r1.h1us, locUs = l1.h1us;
  if (refUs === 'none') refNone.push(route); else refAuto.push(route + '(' + refUs + ')');
  const btnDiff = r1.btn !== l1.btn ? ' btn:' + r1.btn + '/' + l1.btn : '';
  if (refUs !== locUs || btnDiff) diffs.push(route + ' h1:' + refUs + '/' + locUs + btnDiff);
}
console.log("REF none-wrapped (" + refNone.length + "): " + refNone.join(' '));
console.log("REF auto/no-wrap (" + refAuto.length + "): " + refAuto.join(' '));
console.log("\nREF-vs-LOC DIFFS: " + (diffs.length ? '' : 'NONE — LOC matches REF on every route'));
for (const d of diffs) console.log('  ' + d);
console.log("\nSWEEP-DONE");
