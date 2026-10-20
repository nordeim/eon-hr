#!/usr/bin/env node
// r66-screenshots.mjs — parity round 65's evidence captures: the
// margin/gap-census fix pairs — the PageCanvas scroll-band pages
// (dashboard/payroll/taskmanager — the -80px band routes), the
// svg-authored empty states (payroll + companywall's House +
// hrassistantchat's MessageSquare), the tileFixed unspaced row
// (advancedanalytics), the employees alwaysRow header + gap-6 grid, the
// recruitment tabs rhythm, the actions-cluster truth (staffrequests
// gap-2 + expenses raw button), the payrollengine space-y-1 groups, the
// tenantsetup circle + ml-auto Continue, the surveyanalytics single-grid,
// the performancemanagement tabs rhythm + bare gap-6 grid, the shiftswap
// card-only wrapper, the recruitmentkanban flat root, the evaluations
// space-y-3 line, the hrassistant empty pane, and the mobile drawer pair
// @390 (the standing mobile-menu check evidence). REF + seeded LOC pairs,
// one process tree with the :3200 server. LIGHT armed (the round's
// theme). Numbers continue from 368 (the r65 set ended at 367).
// Fresh sessions (the r63 stale-viewport lesson).
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-shots-r66.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200");

async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 400));
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const ref = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
  if (ref) run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, 4200));
  console.log(session, "->", run(`agent-browser --session ${session} get url`).trim());
}
// fresh sessions (the r63 stale-viewport lesson)
run(`agent-browser close --all 2>/dev/null; true`);
await auth("ref66", "https://eon.base44.app");
await auth("loc66", "http://127.0.0.1:3200");
// arm LIGHT on both (the shared localStorage contract) — the round's theme
for (const s of [["ref66", "https://eon.base44.app"], ["loc66", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${s[0]} open ${s[1]}/dashboard`);
  await new Promise(r => setTimeout(r, 2500));
  run(`agent-browser --session ${s[0]} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref66", "https://eon.base44.app", "ref"], ["loc66", "http://127.0.0.1:3200", "loc"]];

async function routePair(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 4600));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 368–371: the scroll-band pages (dashboard + payroll) + the
//      svg-authored payroll empty state ----
await routePair("/dashboard", "368-dashboard-scroll-band");
await routePair("/payroll", "370-payroll-empty-icon");

// ---- 372/373: the tileFixed unspaced row (advancedanalytics) ----
await routePair("/advancedanalytics", "372-advancedanalytics-tilefixed-row");

// ---- 374/375: the employees alwaysRow header + the gap-6 grid ----
await routePair("/employees", "374-employees-row-grid");

// ---- 376/377: the recruitment tabs rhythm ----
await routePair("/recruitment", "376-recruitment-tabs");

// ---- 378–381: the actions-cluster truth (staffrequests gap-2 +
//      expenses raw button) ----
await routePair("/staffrequests", "378-staffrequests-actions");
await routePair("/expenses", "380-expenses-actions");

// ---- 382–385: the companywall group + House empty state; the
//      payrollengine space-y-1 groups ----
await routePair("/companywall", "382-companywall-group");
await routePair("/payrollengine", "384-payrollengine-groups");

// ---- 386/387: the tenantsetup circle + ml-auto Continue ----
await routePair("/tenantsetup", "386-tenantsetup-circle");

// ---- 388/389: the surveyanalytics single grid ----
await routePair("/surveyanalytics", "388-surveyanalytics-grid");

// ---- 390/391: the performancemanagement tabs rhythm + bare grid ----
await routePair("/performancemanagement", "390-performancemanagement-tabs");

// ---- 392–395: the shiftswap card-only wrapper + the evaluations line ----
await routePair("/shiftswap", "392-shiftswap-card-wrapper");
await routePair("/evaluations", "394-evaluations-line");

// ---- 396/397: the recruitmentkanban flat root ----
await routePair("/recruitmentkanban", "396-kanban-flat-root");

// ---- 398–401: the hrassistant empty pane + the hrassistantchat icon ----
await routePair("/hrassistant", "398-hrassistant-empty-pane");
await routePair("/hrassistantchat", "400-hrassistantchat-icon");

// ---- 402/403: the mobile drawer pair @390x844 (the standing check) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ${session} set viewport 390 844`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} click 'button[aria-label="Toggle Sidebar"]'`);
  await new Promise(r => setTimeout(r, 1200));
  cap(session, `402-mobile-drawer-${suffix}`);
}
console.log("done");
