#!/usr/bin/env node
// r87-crossdiff-capture.mjs — session-87 / parity round 86: the FRESH-EYES
// FRONTIER EXTENDED — the cross-side at-rest pixel-diff protocol (the r86
// instrument class, now STANDING) run over the REMAINING route registry:
// the 52 authed routes NOT covered by the r86 round's ten pairs (login +
// the seven standing + payrollreports + assetmanagement). The r86 round
// proved the class finds long-standing clone-authored visual defects that
// per-side byte chains (each side compares against ITSELF) can never see;
// this pass extends the coverage to the whole 61-route registry.
// Standing capture contracts honored: 1440x900 LIGHT LTR, darkMode=false
// + app_lang removed (the r63 lesson), the badge VISIBLE (the r85 lesson),
// the fill-settle-click auth with the careful retry (the r78 lesson), the
// seeded standalone booted fresh on :3200 with PORT explicit (the r86
// lesson), kill-by-PID the stale server (the r85 standalone-zombie lesson).
// Usage: node scripts/r87-crossdiff-capture.mjs [batch]
//   batch 0 = the first 26 routes, 1 = the second 26 (default: all 52)
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
const done = (route) => fs.existsSync(`${shots}/r87-crossdiff-${route}-ref.png`) && fs.existsSync(`${shots}/r87-crossdiff-${route}-loc.png`);

// The 52 remaining registry routes (the r86 round covered: login, dashboard,
// payroll, employees, attendance, training, recruitment, settings,
// assetmanagement, payrollreports — the nine authed + the login pair).
const ROUTES = [
  "advancedanalytics", "allleaverequests", "analytics", "analyticsdashboard",
  "announcements", "assets", "attendancedashboard", "careers", "chat",
  "communications", "companywall", "compliancedashboard", "documenttracker",
  "dynamicdashboard", "employeedetail", "employeeportal", "employeeselfservice",
  "evaluations", "expenses", "externaljobapplication", "home", "hrassistant",
  "hrassistantchat", "hrletters", "hrreports", "interviewassistant",
  "leavemanagement", "loans", "notificationpreferences", "offboarding",
  "organizationsetup", "organogram", "payrollai", "payrollengine",
  "payrollmodule", "performancemanagement", "profile", "recruitmentkanban",
  "reports", "requestreports", "requestsettings", "securitysettings",
  "shiftcalendar", "shiftswap", "staffrequests", "surveyanalytics", "surveys",
  "taskmanager", "templates", "tenantsetup", "workflowautomation",
  "workflowconfigpage",
];

const batch = process.argv[2] === "0" ? 0 : process.argv[2] === "1" ? 1 : -1;
let todo = ROUTES;
if (batch === 0) todo = ROUTES.slice(0, 26);
if (batch === 1) todo = ROUTES.slice(26);
console.log(`capturing ${todo.length} routes (batch ${batch === -1 ? "all" : batch})`);

// fresh boot of the SEEDED standalone (kill any stale :3200 by PID)
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-crossdiff-r87.log 2>&1 < /dev/null &`],
  { stdio: "ignore", detached: true });
server.unref();
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200");

// auth fresh sessions (skip the close-all — batch runs share the daemon;
// the sessions are reused across batches when already authed). RESUME: if
// both sessions still carry auth (the URL check), skip the re-auth.
const sess = { ref: "ref87x", loc: "loc87x" };
async function alreadyAuthed(session, base) {
  const url = run(`agent-browser --session ${session} get url`).trim();
  return !url.startsWith("ERR") && !url.includes("/login") && url.includes(new URL(base).host);
}
async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
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
  const url = run(`agent-browser --session ${session} get url`).trim();
  if (url.includes("/login")) {
    console.log(session, "fill-timing miss — careful retry");
    run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
    await new Promise(r => setTimeout(r, 500));
    run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
    await new Promise(r => setTimeout(r, 600));
    const snap2 = run(`agent-browser --session ${session} snapshot -i -c`);
    const ref2 = (snap2.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
    if (ref2) run(`agent-browser --session ${session} click @${ref2}`);
    await new Promise(r => setTimeout(r, 4200));
  }
}
if (await alreadyAuthed(sess.ref, "https://eon.base44.app")) console.log("ref session still authed — skip re-auth");
else await auth(sess.ref, "https://eon.base44.app");
if (await alreadyAuthed(sess.loc, "http://127.0.0.1:3200")) console.log("loc session still authed — skip re-auth");
else await auth(sess.loc, "http://127.0.0.1:3200");
console.log("ref url:", run(`agent-browser --session ${sess.ref} get url`).trim());
console.log("loc url:", run(`agent-browser --session ${sess.loc} get url`).trim());

const pairs = [[sess.ref, "https://eon.base44.app", "ref"], [sess.loc, "http://127.0.0.1:3200", "loc"]];

for (const route of todo) {
  if (done(route)) { console.log("pair already captured (resume):", route); continue; }
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}/${route}`);
    await new Promise(r => setTimeout(r, 3500));
    run(`agent-browser --session ${session} screenshot ${shots}/r87-crossdiff-${route}-${suffix}.png`);
  }
  console.log("pair captured:", route);
}
console.log(`ALL ${todo.length} PAIRS CAPTURED — run r87-crossdiff-diff.py next`);
process.exit(0);
