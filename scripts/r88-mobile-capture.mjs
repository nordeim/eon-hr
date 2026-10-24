#!/usr/bin/env node
// r88-mobile-capture.mjs — session-88 / parity round 87: THE MOBILE-BAND
// CROSS-SIDE PASS — the r86/r87 cross-side at-rest pixel-diff protocol run
// at 390x844 (the mobile band) over the full 61-route authed registry.
// The r86 close-out named this frontier: "the first cross-side pass over
// the mobile bands (the 52 routes at 390)". The desktop band (1440x900) is
// full-registry-covered (r87); this pass extends the standing protocol to
// the mobile chrome (73px top bar + bottom tabs; no sidebar).
// Standing capture contracts honored: 390x844 LIGHT LTR, darkMode=false +
// app_lang removed (the r63 lesson), the badge VISIBLE (the r85 lesson —
// never dismiss it; the LOC's superset badge overlays the top bar in every
// capture and is classified DRIFT-BY-DESIGN), the fill-settle-click auth
// with the careful retry (the r78 lesson), the seeded standalone booted
// fresh on :3200 with PORT explicit (the r86 lesson), kill-by-PID the
// stale server (the r85 zombie lesson), FOREGROUND run (the background
// reaper), resume-capable (skip existing pairs).
// Usage: node scripts/r88-mobile-capture.mjs [batch]
//   batch 0 = first 21, 1 = second 20, 2 = third 20 (default: all 61)
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
const done = (route) => fs.existsSync(`${shots}/r88-mobile-${route}-ref.png`) && fs.existsSync(`${shots}/r88-mobile-${route}-loc.png`);

// The full 61-route authed registry (the r87 52 + the 9 standing routes
// the r86 round covered at desktop — all 61 get the mobile-band treatment).
const ROUTES = [
  // the 9 standing (r86-covered at desktop)
  "dashboard", "payroll", "employees", "attendance", "training",
  "recruitment", "settings", "assetmanagement", "payrollreports",
  // the r87 52
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

const batch = ["0", "1", "2"].includes(process.argv[2]) ? Number(process.argv[2]) : -1;
let todo = ROUTES.filter(r => !done(r));
if (batch === 0) todo = todo.filter(r => ROUTES.indexOf(r) < 21);
if (batch === 1) todo = todo.filter(r => ROUTES.indexOf(r) >= 21 && ROUTES.indexOf(r) < 41);
if (batch === 2) todo = todo.filter(r => ROUTES.indexOf(r) >= 41);
console.log(`capturing ${todo.length} routes (batch ${batch === -1 ? "all" : batch})`);
if (!todo.length) { console.log("NOTHING TO DO — all pairs captured"); process.exit(0); }

// fresh boot of the SEEDED standalone (kill any stale :3200 by PID)
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-mobile-r88.log 2>&1 < /dev/null &`],
  { stdio: "ignore", detached: true });
server.unref();
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200");

// auth fresh sessions (resume-aware). Sessions auth at the MOBILE viewport
// this round — the whole pass lives in the mobile band.
const sess = { ref: "ref88m", loc: "loc88m" };
async function alreadyAuthed(session, base) {
  const url = run(`agent-browser --session ${session} get url`).trim();
  return !url.startsWith("ERR") && !url.includes("/login") && url.includes(new URL(base).host);
}
async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 390 844`);
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
    // the stale-viewport lesson: re-assert the mobile viewport EVERY capture
    run(`agent-browser --session ${session} set viewport 390 844`);
    run(`agent-browser --session ${session} open ${base}/${route}`);
    await new Promise(r => setTimeout(r, 3500));
    run(`agent-browser --session ${session} screenshot ${shots}/r88-mobile-${route}-${suffix}.png`);
  }
  console.log("pair captured:", route);
}
console.log(`ALL ${todo.length} MOBILE PAIRS CAPTURED — run r88-mobile-diff.py next`);
process.exit(0);
