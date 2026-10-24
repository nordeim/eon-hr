#!/usr/bin/env node
// r87-screenshots.mjs — session-87 / parity round 86: the byte-chain
// evidence set. Numbers continue from 1223 (the r86 set ended there).
// MERGE NOTE (the parallel-session reconciliation, updated twice): at the
// merge landings the generated files were RENUMBERED cumulatively +12
// (1225-1283 -> 1229-1287 at merge #1 clearing the companion pass's
// 1225/1227, then -> 1237-1295 at merge #2 clearing the tab-interior
// pass's published 1229-1235 payrollreports evidence). The tracked
// evidence and all doc references use 1237-1295; do NOT re-run this
// script as-is without bumping its base number first.
//   1225       the LOGIN standing pair @1440x900 (vs the r86 1113 — both
//              sides expected STABLE: no login-surface source changes)
//   1227-1239  the seven standing route pairs @1440x900 (vs the r86
//              1115-1127 — every side expected STABLE: this round's
//              fourteen fixes touch none of these routes at 1440)
//   1241-1267  the FOURTEEN remediated-route pairs @1440x900 (the r87
//              RE-BASELINES — the full-registry cross-diff round's
//              fixes: assets/organogram/payrollmodule/chat/offboarding/
//              employeeportal/interviewassistant/payrollai/reports/
//              tenantsetup/payrollengine/loans/dynamicdashboard/
//              attendancedashboard)
//   1269-1281  the DARK-mode pairs @1440x900 for the seven standing
//              routes (THE THEME-VARIANCE RE-COMPARE — the r86 finding:
//              the REF's dark sidebar flips zinc/navy across sessions;
//              this set re-compares vs the r86 1193-1205 baselines:
//              stays = a stable REF change; flips again = the
//              non-deterministic theming confirmed)
//   1283       the DARK mobile drawer pair @390x844 (vs 1221)
// + the inline mobile-menu functional cycle (the standing user emphasis).
// Standing capture contracts honored: darkMode/app_lang pinned per set,
// the badge VISIBLE, the height contract (390x844 mobile), the
// fill-settle-click auth, the standalone re-booted on the FINAL build.
import { execSync, spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
const md5 = (p) => crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex").slice(0, 12);

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r87.log 2>&1 < /dev/null &`],
  { stdio: "ignore", detached: true });
server.unref();
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200 (final build)");

run(`agent-browser close --all 2>/dev/null; true`);
for (const s of ["ref87s", "loc87s"]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
}
function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref87s", "https://eon.base44.app", "ref"], ["loc87s", "http://127.0.0.1:3200", "loc"]];

async function auth(session, base) {
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
    run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
    await new Promise(r => setTimeout(r, 600));
    run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
    await new Promise(r => setTimeout(r, 600));
    const snap2 = run(`agent-browser --session ${session} snapshot -i -c`);
    const ref2 = (snap2.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
    if (ref2) run(`agent-browser --session ${session} click @${ref2}`);
    await new Promise(r => setTimeout(r, 4200));
  }
  console.log(session, "->", run(`agent-browser --session ${session} get url`).trim());
}

async function routePair(route, name, settle = 4200) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${session} set viewport 1440 900`);
    await new Promise(r => setTimeout(r, settle));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 1225: the LOGIN pair (fresh logged-out sessions) ----
for (const s of ["ref87L", "loc87L"]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
}
for (const [session, base, suffix] of [["ref87L", "https://eon.base44.app", "ref"], ["loc87L", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `1225-login-standing-${suffix}`);
}
for (const s of ["ref87L", "loc87L"]) run(`agent-browser --session ${s} close 2>/dev/null; true`);

await auth("ref87s", "https://eon.base44.app");
await auth("loc87s", "http://127.0.0.1:3200");

// ---- 1227-1239: the seven standing pairs ----
await routePair("/dashboard", "1227-dashboard-light");
await routePair("/payroll", "1229-payroll-light");
await routePair("/employees", "1231-employees-light");
await routePair("/attendance", "1233-attendance-light");
await routePair("/training", "1235-training-light");
await routePair("/recruitment", "1237-recruitment-light");
await routePair("/settings", "1239-settings-light");

// ---- 1241-1267: the fourteen remediated-route pairs (the r87 re-baselines) ----
const REMEDIATED = [
  ["assets", "1241"], ["organogram", "1243"], ["payrollmodule", "1245"],
  ["chat", "1247"], ["offboarding", "1249"], ["employeeportal", "1251"],
  ["interviewassistant", "1253"], ["payrollai", "1255"], ["reports", "1257"],
  ["tenantsetup", "1259"], ["payrollengine", "1261"], ["loans", "1263"],
  ["dynamicdashboard", "1265"], ["attendancedashboard", "1267"],
];
for (const [route, n] of REMEDIATED) await routePair(`/${route}`, `${n}-${route}-light`, 3800);

// ---- 1269-1281: the DARK pairs (the theme-variance re-compare) ----
for (const s of ["ref87s", "loc87s"]) {
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','true')"`);
}
const DK = [["dashboard", "1269"], ["payroll", "1271"], ["employees", "1273"], ["attendance", "1275"], ["training", "1277"], ["recruitment", "1279"], ["settings", "1281"]];
for (const [route, n] of DK) await routePair(`/${route}`, `${n}-dk-${route}`, 3800);

// ---- 1283: the DARK drawer pair @390x844 ----
async function drawerPair(name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} set viewport 390 844`);
    await new Promise(r => setTimeout(r, 600));
    run(`agent-browser --session ${session} open ${base}/dashboard`);
    await new Promise(r => setTimeout(r, 2200));
    const snap = run(`agent-browser --session ${session} snapshot -i -c`);
    const btn = (snap.match(/- button "Toggle Sidebar" \[ref=(\w+)\]/) || [])[1];
    if (btn) run(`agent-browser --session ${session} click @${btn}`);
    await new Promise(r => setTimeout(r, 1400));
    cap(session, `${name}-${suffix}`);
    const close = (run(`agent-browser --session ${session} snapshot -i -c`).match(/- button "Close sidebar" \[ref=(\w+)\]/) || [])[1];
    if (close) run(`agent-browser --session ${session} click @${close}`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${session} set viewport 1440 900`);
  }
}
await drawerPair("1283-mobile-drawer-dark");

// ---- the mobile-menu functional cycle (the standing user emphasis) ----
console.log("\n==== MOBILE-MENU CYCLE ====");
run(`agent-browser --session loc87s set viewport 390 844`);
run(`agent-browser --session loc87s open http://127.0.0.1:3200/dashboard`);
await new Promise(r => setTimeout(r, 2400));
const snapM = run(`agent-browser --session loc87s snapshot -i -c`);
const burger = (snapM.match(/- button "Toggle Sidebar" \[ref=(\w+)\]/) || [])[1];
if (burger) run(`agent-browser --session loc87s click @${burger}`);
await new Promise(r => setTimeout(r, 1400));
const snapM2 = run(`agent-browser --session loc87s snapshot -i -c`);
const lms = (snapM2.match(/- link "Training LMS" \[ref=(\w+)\]/) || [])[1];
if (lms) run(`agent-browser --session loc87s click @${lms}`);
await new Promise(r => setTimeout(r, 2600));
const urlNow = run(`agent-browser --session loc87s get url`).trim();
const drawerGone = !run(`agent-browser --session loc87s snapshot -i -c`).includes("Training LMS");
console.log("post-click URL:", urlNow);
console.log("drawer auto-closed:", drawerGone);
console.log(urlNow.includes("/training") && drawerGone ? "MOBILE-MENU CYCLE GREEN" : "MOBILE-MENU CYCLE RED");
run(`agent-browser --session loc87s close 2>/dev/null; true`);

// ---- the comparison table ----
const cmp = (nowName, oldName) => {
  const ref = md5(`${shots}/${nowName}-ref.png`) === md5(`${shots}/${oldName}-ref.png`) ? "STABLE" : "DRIFT";
  const loc = md5(`${shots}/${nowName}-loc.png`) === md5(`${shots}/${oldName}-loc.png`) ? "STABLE" : "DRIFT";
  return `${nowName}: ref=${ref} loc=${loc}`;
};
console.log("\n==== BYTE-CHAIN COMPARISONS (vs the r86 set) ====");
console.log(cmp("1225-login-standing", "1113-login-standing"));
const STAND = [["1227-dashboard-light", "1115-dashboard-light"], ["1229-payroll-light", "1117-payroll-light"], ["1231-employees-light", "1119-employees-light"], ["1233-attendance-light", "1121-attendance-light"], ["1235-training-light", "1123-training-light"], ["1237-recruitment-light", "1125-recruitment-light"], ["1239-settings-light", "1127-settings-light"]];
for (const [n, o] of STAND) console.log(cmp(n, o));
console.log("\n==== THE THEME-VARIANCE RE-COMPARE (vs the r86 1193-1205 dark baselines) ====");
const DKC = [["1269-dk-dashboard", "1193-dk-dashboard"], ["1271-dk-payroll", "1195-dk-payroll"], ["1273-dk-employees", "1197-dk-employees"], ["1275-dk-attendance", "1199-dk-attendance"], ["1277-dk-training", "1201-dk-training"], ["1279-dk-recruitment", "1203-dk-recruitment"], ["1281-dk-settings", "1205-dk-settings"]];
for (const [n, o] of DKC) console.log(cmp(n, o));
console.log("\n==== THE DARK DRAWER PAIR (vs 1221) ====");
console.log(cmp("1283-mobile-drawer-dark", "1221-mobile-drawer-dark"));
process.exit(0);
