#!/usr/bin/env node
// r92-screenshots.mjs — the session-92 evidence chain (continues from 1483):
// the remediated dev-server dialog captures on :3200 at 1440x900.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const base = "http://127.0.0.1:3200";
const shots = "/home/z/my-project/eon-hr/docs/screenshots";
const S = "r92s";

run(`agent-browser --session ${S} close 2>/dev/null; true`);
run(`agent-browser --session ${S} set viewport 1440 900`);
run(`agent-browser --session ${S} open ${base}/login`);
await sleep(2500);
run(`agent-browser --session ${S} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await sleep(400);
run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
await sleep(600);
run(`agent-browser --session ${S} click 'button[type=submit]'`);
await sleep(4000);

let n = 1485;
async function shot(name) {
  run(`agent-browser --session ${S} screenshot ${shots}/${n}-${name}.png`);
  console.log(`${n}-${name}.png`);
  n += 2;
}
async function openDialog(route, label) {
  run(`agent-browser --session ${S} open ${base}/${route}`);
  await sleep(3500);
  run(`agent-browser --session ${S} eval "(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim().startsWith('${label}') && x.offsetParent !== null); if (b) b.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); return !!b; })()"`);
  await sleep(1200);
}

// 1485: the dashboard (the standing opener)
run(`agent-browser --session ${S} open ${base}/dashboard`);
await sleep(2500);
await shot("dev-dashboard");

// 1487: the workflowautomation Create Automated Workflow dialog (R92-D)
await openDialog("workflowautomation", "Create Workflow");
await shot("dev-workflow-dialog");

// 1489: the workflow dialog with the trigger select OPEN (the six events)
run(`agent-browser --session ${S} eval "(() => { const dr = [...document.querySelectorAll('[role=dialog]')].pop(); const t = [...dr.querySelectorAll('button[role=combobox]')][0]; if (t) t.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); return true; })()"`);
await sleep(1000);
await shot("dev-workflow-triggers");

// 1491: the leave Create Leave Request dialog (R92-E)
await openDialog("allleaverequests", "New Leave Request");
await shot("dev-leave-dialog");

// 1493: the documenttracker Add Document dialog (R92-F)
await openDialog("documenttracker", "Add Document");
await shot("dev-document-dialog");

// 1495: the payroll Add Payroll Record dialog (R92-G)
await openDialog("payroll", "Add Payroll");
await shot("dev-payroll-dialog");

// 1497: the taskmanager Create Task dialog (R92-H)
await openDialog("taskmanager", "New Task");
await shot("dev-task-dialog");

// 1499: the performancemanagement Set New Goal dialog (R92-I)
await openDialog("performancemanagement", "Set New Goal");
await shot("dev-goal-dialog");

// 1501: the evaluations Create Performance Review dialog (R92-J)
await openDialog("evaluations", "New Review");
await shot("dev-review-dialog");

// 1503: the offboarding Start Offboarding Process dialog (R92-K)
await openDialog("offboarding", "New Offboarding");
await shot("dev-offboarding-dialog");

// 1505: the payrollmodule Add Payslip dialog (R92-M)
await openDialog("payrollmodule", "Add Payslip");
await shot("dev-payslip-dialog");

// 1507: the requestsettings limit selects (R92-A/B/C) with the category popper open
run(`agent-browser --session ${S} open ${base}/requestsettings`);
await sleep(3500);
run(`agent-browser --session ${S} eval "(() => { const t = [...document.querySelectorAll('button[role=combobox]')].find(x => x.textContent.trim() === 'Finance'); if (t) t.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); return true; })()"`);
await sleep(1000);
await shot("dev-requestsettings-category");

// mobile (390x844): the sheet on the new category select + the leave dialog
run(`agent-browser --session ${S} set viewport 390 844`);
run(`agent-browser --session ${S} open ${base}/requestsettings`);
await sleep(4000);
run(`agent-browser --session ${S} eval "(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Finance' && x.offsetParent !== null); if (b) b.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); return true; })()"`);
await sleep(1400);
await shot("dev-mobile-sheet");

run(`agent-browser --session ${S} close 2>/dev/null; true`);
console.log("done — evidence chain 1485-" + (n - 2));
process.exit(0);
