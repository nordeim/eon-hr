#!/usr/bin/env node
// probe-r22-fullsweep.mjs — full 46-route docH comparison REF vs LOC @1440x900.
// Catches every page-height delta (phantom margins, content differences).
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

const ROUTES = ["/dashboard","/employees","/payroll","/payrollmodule","/payrollengine","/taskmanager","/leavemanagement","/allleaverequests","/expenses","/loans","/attendance","/attendancedashboard","/shiftcalendar","/recruitment","/recruitmentkanban","/training","/compliancedashboard","/evaluations","/performancemanagement","/workflowautomation","/workflowconfigpage","/assetmanagement","/offboarding","/documenttracker","/staffrequests","/announcements","/templates","/communications","/companywall","/chat","/surveys","/surveyanalytics","/analytics","/analyticsdashboard","/advancedanalytics","/hrreports","/hrassistantchat","/interviewassistant","/reports","/settings","/profile","/securitysettings","/notificationpreferences","/organogram","/employeeselfservice"];

run("agent-browser --session ref set viewport 1440 900");
run("agent-browser --session loc set viewport 1440 900");
let flagged = 0;
for (const route of ROUTES) {
  run(`agent-browser --session ref open https://eon.base44.app${route}`);
  await new Promise(r => setTimeout(r, 3000));
  const refD = await evalOn("ref", `document.documentElement.scrollHeight`);
  run(`agent-browser --session loc open http://127.0.0.1:3200${route}`);
  await new Promise(r => setTimeout(r, 2800));
  const locD = await evalOn("loc", `document.documentElement.scrollHeight`);
  if (typeof locD === "number" && typeof refD === "number" && locD !== refD) {
    flagged++;
    console.log(`${route.padEnd(26)} REF=${refD} LOC=${locD} delta=${locD - refD > 0 ? "+" + (locD - refD) : locD - refD}`);
  }
}
console.log(`\n${flagged}/${ROUTES.length} routes differ`);
