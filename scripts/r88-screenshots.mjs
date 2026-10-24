#!/usr/bin/env node
// r88-screenshots.mjs — session-88 / parity round 87: the byte-chain
// evidence set. Numbers continue from 1295 (the r87 set ended there —
// the post-renumber 1237-1295 window).
//   1297        the LOGIN standing pair @1440x900 (vs the r87 1237)
//   1299-1311   the seven standing route pairs (vs the r87 1239-1251)
//   1313-1325   the SEVEN remediated-route pairs (the r88 re-baselines:
//               surveyanalytics/attendancedashboard/tenantsetup/reports/
//               hrreports/shiftswap/companywall — this round's fix set)
//   1327-1339   the DARK-mode pairs for the seven standing routes (the
//               THEME-VARIANCE RE-COMPARE vs the r87 1281-1293 set)
//   1341        the DARK mobile drawer pair @390x844 (vs the r87 1295)
// + the inline mobile-menu functional cycle (the standing user emphasis).
// Standing capture contracts honored: darkMode/app_lang pinned per set,
// the badge VISIBLE, the height contract (390x844 mobile), the
// fill-settle-click auth, the standalone re-booted on the FINAL build,
// the longer settle for the client-fetching routes (the hrreports
// loading-state lesson — 6s).
import { execSync, spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
const md5 = (p) => fs.existsSync(p) ? crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex").slice(0, 12) : "MISSING";

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r88.log 2>&1 < /dev/null &`],
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
function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref88c", "https://eon.base44.app", "ref"], ["loc88c", "http://127.0.0.1:3200", "loc"]];

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

// ---- 1297: the LOGIN pair (fresh logged-out sessions) ----
for (const s of ["ref88L", "loc88L"]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
}
for (const [session, base, suffix] of [["ref88L", "https://eon.base44.app", "ref"], ["loc88L", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `1297-login-standing-${suffix}`);
}
for (const s of ["ref88L", "loc88L"]) run(`agent-browser --session ${s} close 2>/dev/null; true`);

await auth("ref88c", "https://eon.base44.app");
await auth("loc88c", "http://127.0.0.1:3200");

// ---- 1299-1311: the seven standing pairs ----
await routePair("/dashboard", "1299-dashboard-light");
await routePair("/payroll", "1301-payroll-light");
await routePair("/employees", "1303-employees-light");
await routePair("/attendance", "1305-attendance-light");
await routePair("/training", "1307-training-light");
await routePair("/recruitment", "1309-recruitment-light");
await routePair("/settings", "1311-settings-light");

// ---- 1313-1325: the seven remediated-route pairs (the r88 re-baselines) ----
const REMEDIATED = [
  ["surveyanalytics", "1313"], ["attendancedashboard", "1315"],
  ["tenantsetup", "1317"], ["reports", "1319"], ["hrreports", "1321"],
  ["shiftswap", "1323"], ["companywall", "1325"],
];
for (const [route, n] of REMEDIATED) await routePair(`/${route}`, `${n}-${route}-light`, 6000);

// ---- 1327-1339: the DARK pairs (the theme-variance re-compare) ----
for (const s of ["ref88c", "loc88c"]) {
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','true')"`);
}
const DK = [["dashboard", "1327"], ["payroll", "1329"], ["employees", "1331"], ["attendance", "1333"], ["training", "1335"], ["recruitment", "1337"], ["settings", "1339"]];
for (const [route, n] of DK) await routePair(`/${route}`, `${n}-dk-${route}`, 3800);

// ---- 1341: the DARK drawer pair @390x844 ----
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
await drawerPair("1341-mobile-drawer-dark");

// ---- the mobile-menu functional cycle (the standing user emphasis) ----
console.log("\n==== MOBILE-MENU CYCLE ====");
run(`agent-browser --session loc88c set viewport 390 844`);
run(`agent-browser --session loc88c eval "localStorage.setItem('darkMode','false')"`);
run(`agent-browser --session loc88c open http://127.0.0.1:3200/dashboard`);
await new Promise(r => setTimeout(r, 2400));
const snapM = run(`agent-browser --session loc88c snapshot -i -c`);
const burger = (snapM.match(/- button "Toggle Sidebar" \[ref=(\w+)\]/) || [])[1];
if (burger) run(`agent-browser --session loc88c click @${burger}`);
// the r88 lesson: 1400ms races the drawer's nav-list render — the ref
// goes stale and the click misses (the chain read RED; the manual run
// with the full settle proves the cycle GREEN — the r87 case-bug
// precedent, now the timing-race class). 2600ms settles it.
await new Promise(r => setTimeout(r, 2600));
const snapM2 = run(`agent-browser --session loc88c snapshot -i -c`);
const lms = (snapM2.match(/- link "Training LMS" \[ref=(\w+)\]/) || [])[1];
if (lms) run(`agent-browser --session loc88c click @${lms}`);
await new Promise(r => setTimeout(r, 2600));
const urlNow = run(`agent-browser --session loc88c get url`).trim();
const drawerGone = !run(`agent-browser --session loc88c snapshot -i -c`).includes("Training LMS");
console.log("post-click URL:", urlNow);
console.log("drawer auto-closed:", drawerGone);
console.log(urlNow.includes("/training") && drawerGone ? "MOBILE-MENU CYCLE GREEN" : "MOBILE-MENU CYCLE RED");

// ---- the comparison table ----
const cmp = (nowName, oldName) => {
  const ref = md5(`${shots}/${nowName}-ref.png`) === md5(`${shots}/${oldName}-ref.png`) ? "STABLE" : "DRIFT";
  const loc = md5(`${shots}/${nowName}-loc.png`) === md5(`${shots}/${oldName}-loc.png`) ? "STABLE" : "DRIFT";
  return `${nowName}: ref=${ref} loc=${loc}`;
};
console.log("\n==== BYTE-CHAIN COMPARISONS (vs the r87 set) ====");
console.log(cmp("1297-login-standing", "1237-login-standing"));
const STAND = [["1299-dashboard-light", "1239-dashboard-light"], ["1301-payroll-light", "1241-payroll-light"], ["1303-employees-light", "1243-employees-light"], ["1305-attendance-light", "1245-attendance-light"], ["1307-training-light", "1247-training-light"], ["1309-recruitment-light", "1249-recruitment-light"], ["1311-settings-light", "1251-settings-light"]];
for (const [n, o] of STAND) console.log(cmp(n, o));
console.log("\n==== THE THEME-VARIANCE RE-COMPARE (vs the r87 1281-1293 dark set) ====");
const DKC = [["1327-dk-dashboard", "1281-dk-dashboard"], ["1329-dk-payroll", "1283-dk-payroll"], ["1331-dk-employees", "1285-dk-employees"], ["1333-dk-attendance", "1287-dk-attendance"], ["1335-dk-training", "1289-dk-training"], ["1337-dk-recruitment", "1291-dk-recruitment"], ["1339-dk-settings", "1293-dk-settings"]];
for (const [n, o] of DKC) console.log(cmp(n, o));
console.log("\n==== THE DARK DRAWER PAIR (vs the r87 1295) ====");
console.log(cmp("1341-mobile-drawer-dark", "1295-mobile-drawer-dark"));
process.exit(0);
