#!/usr/bin/env node
// r89-theme-mobile-capture.mjs — session-89 / parity round 88: THE FIRST
// CROSS-SIDE DARK/RTL MOBILE-BAND PASS — the r88 close-out's named frontier
// ("the dark/RTL mobile bands — never cross-compared"). The mobile-band
// protocol (r88-mobile-capture) extended to the two theme states the r83
// theme-direction audit opened but never cross-compared:
//   dark = localStorage darkMode="true" (the pre-paint boot contract — set
//          BEFORE navigation, on the login page, per the session-33 lesson)
//   rtl  = localStorage app_lang="ar" (the عربي toggle — dir="rtl" on <html>)
// Standing contracts honored: 390x844 viewport re-asserted EVERY capture
// (the stale-viewport lesson), the badge VISIBLE (r85 — DRIFT-BY-DESIGN),
// the fill-settle-click auth with the careful retry (r78), the seeded
// standalone booted fresh on :3200 (r86 PORT lesson), kill-by-PID the stale
// server (r85 zombie lesson), FOREGROUND instrument + resume-capable
// (the background reaper), batches for daemon hygiene.
// NEW this round: the REF experiment state is PROBED per capture (the
// PRE_AUTH_EXPERIMENTS per-visitor variant system — the decoded theme-
// variance root cause) so variant reads can be classified against the
// assignment, not guessed.
// Usage: node scripts/r89-theme-mobile-capture.mjs <dark|rtl> [batch]
//   batch 0 = first 21, 1 = second 20, 2 = third 20 (default: all 61)
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
const STATE = process.argv[2];
if (!["dark", "rtl"].includes(STATE)) { console.log("usage: r89-theme-mobile-capture.mjs <dark|rtl> [batch]"); process.exit(1); }
const PREFIX = STATE === "dark" ? "r89-darkm" : "r89-rtlm";
// the state's localStorage prep — set on the login page BEFORE nav (pre-paint)
const PREP = STATE === "dark"
  ? "localStorage.setItem('darkMode','true'); localStorage.removeItem('app_lang');"
  : "localStorage.setItem('app_lang','ar'); localStorage.setItem('darkMode','false');";
const done = (route) => fs.existsSync(`${shots}/${PREFIX}-${route}-ref.png`) && fs.existsSync(`${shots}/${PREFIX}-${route}-loc.png`);

const ROUTES = [
  "dashboard", "payroll", "employees", "attendance", "training",
  "recruitment", "settings", "assetmanagement", "payrollreports",
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

const batch = ["0", "1", "2"].includes(process.argv[3]) ? Number(process.argv[3]) : -1;
let todo = ROUTES.filter(r => !done(r));
if (batch === 0) todo = todo.filter(r => ROUTES.indexOf(r) < 21);
if (batch === 1) todo = todo.filter(r => ROUTES.indexOf(r) >= 21 && ROUTES.indexOf(r) < 41);
if (batch === 2) todo = todo.filter(r => ROUTES.indexOf(r) >= 41);
console.log(`[${STATE}] capturing ${todo.length} routes (batch ${batch === -1 ? "all" : batch})`);
if (!todo.length) { console.log("NOTHING TO DO — all pairs captured"); process.exit(0); }

// fresh boot of the SEEDED standalone (kill any stale :3200 by PID)
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-themem-r89.log 2>&1 < /dev/null &`],
  { stdio: "ignore", detached: true });
server.unref();
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200");

// state is applied at AUTH time too (the pre-paint boot: prep on the login
// page, then every navigation renders dark/rtl from the first paint)
const sess = { ref: `ref89${STATE}`, loc: `loc89${STATE}` };
async function alreadyAuthed(session, base) {
  const url = run(`agent-browser --session ${session} get url`).trim();
  return !url.startsWith("ERR") && !url.includes("/login") && url.includes(new URL(base).host);
}
async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} eval "${PREP}"`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} eval "${PREP}"`);
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

// the experiment-state probe (the decoded theme-variance root cause) — read
// once per side per run; variant reads get classified against it
for (const [session, label] of [[sess.ref, "REF"], [sess.loc, "LOC"]]) {
  const exp = run(`agent-browser --session ${session} eval "JSON.stringify((window.__APP_CONFIG__&&window.__APP_CONFIG__.PRE_AUTH_EXPERIMENTS&&window.__APP_CONFIG__.PRE_AUTH_EXPERIMENTS.assignments)||null)"`).trim();
  console.log(`${label} experiment assignment: ${exp.slice(0, 160)}`);
}

const pairs = [[sess.ref, "https://eon.base44.app", "ref"], [sess.loc, "http://127.0.0.1:3200", "loc"]];

for (const route of todo) {
  if (done(route)) { console.log("pair already captured (resume):", route); continue; }
  for (const [session, base, suffix] of pairs) {
    // the stale-viewport lesson: re-assert the mobile viewport EVERY capture
    run(`agent-browser --session ${session} set viewport 390 844`);
    run(`agent-browser --session ${session} open ${base}/${route}`);
    await new Promise(r => setTimeout(r, 3500));
    // the state re-assert (a hard nav can land a fresh localStorage domain
    // state on some platforms — cheap insurance on the theme contract)
    run(`agent-browser --session ${session} eval "${PREP}"`);
    await new Promise(r => setTimeout(r, 1200));
    run(`agent-browser --session ${session} screenshot ${shots}/${PREFIX}-${route}-${suffix}.png`);
  }
  console.log("pair captured:", route);
}
console.log(`ALL ${todo.length} [${STATE}] MOBILE PAIRS CAPTURED — run the diff next`);
process.exit(0);
