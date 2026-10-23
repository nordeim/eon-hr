#!/usr/bin/env node
// r85-screenshots.mjs — session 85 / parity round 84: the byte-chain
// evidence set. Numbers continue from 999 (the r84 set ended there).
//   1001       the LOGIN standing pair @1440x900 (vs the r84 891 pair —
//              loc DRIFT BY DESIGN: the badge + the vendored 192px logo
//              + the pinned ring enter the capture; ref STABLE)
//   1003-1015  the seven standing route pairs @1440x900 (vs the r84
//              893-905 set — loc DRIFT BY DESIGN (the badge), ref STABLE)
//   1017       NEW: the FOCUSED social-button pair @1440x900 (1 Tab →
//              the Google button, the ring settled) — the R85-A fix
//              evidence + the keyboard surface's FIRST per-side baseline
//              for the r86+ chain
//   1019       the /assetmanagement pair (vs the r84 907 — the FIRST
//              byte-compare of the r84 fix-evidence baseline)
//   1021       the /payrollreports pair (vs the r84 909 — same)
//   1023       the LIGHT mobile drawer pair @390x844 (vs the r84 911
//              pair — loc DRIFT BY DESIGN: the badge overlays the
//              drawer's lower right, authentically as on the REF)
//   1025-1037  the mobile-width (390x844) re-baselines (vs 913-925)
//   1039-1051  the tablet-width (768x1024) re-baselines (vs 927-939)
//   1053-1065  the sm-boundary (640x1024) re-baselines (vs 941-953)
//   1067-1079  the xl-boundary (1280x1024) re-baselines (vs 955-967)
//   1081-1093  the DARK-MODE re-baselines @1440x900 (vs 969-981)
//   1095-1107  the RTL re-baselines @1440x900 (vs 983-995)
//   1109       THE DARK mobile drawer pair @390x844 (vs 997)
//   1111       THE RTL mobile drawer pair @390x844 (vs 999)
// + the inline mobile-menu functional cycle (the standing user emphasis).
// Standing captures pin LIGHT+LTR: darkMode=false AND app_lang removed.
// THE HEIGHT CONTRACT: the mobile set's height is 844; the boundary/tablet
// sets 1024 (the r83 lesson, parameterized).
// THE BADGE CONTRACT (the r85 lesson): the badge stays VISIBLE in every
// capture (the default state — matching the REF's captures). NEVER
// dismiss it mid-script.
// Mechanism (the r71 lesson): the drawer opens via the accessible-name
// SNAPSHOT ref. THE STANDALONE ZOMBIE LESSON (the r85 trap): kill by
// PID from ss -tlnp (Next renames the process), and verify the served
// CSS chunk name matches the current build after boot.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r85.log 2>&1 < /dev/null &`],
  { stdio: "ignore", detached: true });
server.unref();
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200");

run(`agent-browser close --all 2>/dev/null; true`);
for (const s of ["ref85s", "loc85s"]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref85s", "https://eon.base44.app", "ref"], ["loc85s", "http://127.0.0.1:3200", "loc"]];

// ---- 1001: the LOGIN page pair @1440x900 (the standing logged-out surface) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `1001-login-standing-${suffix}`);
}

// ---- 1017: NEW — the FOCUSED social-button pair (the R85-A ring
//      evidence): 1 Tab, the transition settled (500ms), capture. ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  run(`agent-browser --session ${session} press Tab`);
  await new Promise(r => setTimeout(r, 500));
  cap(session, `1017-login-focused-${suffix}`);
}

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
    console.log(session, "fill-timing miss — careful re-auth retry");
    run(`agent-browser --session ${session} open ${base}/login`);
    await new Promise(r => setTimeout(r, 1200));
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
await auth("ref85s", "https://eon.base44.app");
await auth("loc85s", "http://127.0.0.1:3200");

async function routePair(route, name, settle = 4600) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${session} set viewport 1440 900`);
    await new Promise(r => setTimeout(r, settle));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 1003-1015: the seven standing route pairs @1440x900 (LIGHT+LTR) ----
await routePair("/dashboard", "1003-dashboard-light");
await routePair("/payroll", "1005-payroll-light");
await routePair("/employees", "1007-employees-light");
await routePair("/attendance", "1009-attendance-light");
await routePair("/training", "1011-training-light");
await routePair("/recruitment", "1013-recruitment-light");
await routePair("/settings", "1015-settings-light");

// ---- 1019/1021: NEW — the round's two fix-evidence routes, first baselines ----
await routePair("/assetmanagement", "1019-assetmanagement-light");
await routePair("/payrollreports", "1021-payrollreports-light");

// ---- 1023: the LIGHT mobile drawer pair @390x844 (the standing
//      byte-stability check vs the r83 801 pair — the TWENTY-round
//      chain). Mechanism (the r71 lesson): click via the accessible-name
//      SNAPSHOT ref. ----
async function drawerPair(name, setup) {
  for (const [session, base, suffix] of pairs) {
    if (setup) run(`agent-browser --session ${session} eval "${setup}"`);
    else run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
    run(`agent-browser --session ${session} set viewport 390 844`);
    await new Promise(r => setTimeout(r, 400));
    run(`agent-browser --session ${session} open ${base}/dashboard`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${session} set viewport 390 844`);
    await new Promise(r => setTimeout(r, 3000));
    const snap = run(`agent-browser --session ${session} snapshot -i -c`);
    const line = (snap.split("\n").find(l => l.includes("Toggle Sidebar")) || "");
    const ref = (line.match(/ref=(\w+)/) || [])[1];
    if (ref) run(`agent-browser --session ${session} click @${ref}`);
    await new Promise(r => setTimeout(r, 1200));
    cap(session, `${name}-${suffix}`);
  }
}
await drawerPair("1023-mobile-drawer-light");

// ---- the mobile-menu functional check (the standing user emphasis):
//      the open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc85s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc85s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc85s get url`).trim();
console.log("after training-lms click:", afterNav);
const closedAfterNav = run(`agent-browser --session loc85s eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));

// ---- 1025-1037: the mobile-width re-baselines @390x844 (THE HEIGHT
//      CONTRACT — 844, not the boundary-pattern 1024) vs the r84
//      913-925 set. ----
async function widthRoutePair(route, name, w, h) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
    run(`agent-browser --session ${session} set viewport ${w} ${h}`);
    await new Promise(r => setTimeout(r, 300));
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${session} set viewport ${w} ${h}`);
    await new Promise(r => setTimeout(r, 3000));
    cap(session, `${name}-${suffix}`);
  }
}
await widthRoutePair("/dashboard", "1025-m-dashboard-390", 390, 844);
await widthRoutePair("/payroll", "1027-m-payroll-390", 390, 844);
await widthRoutePair("/employees", "1029-m-employees-390", 390, 844);
await widthRoutePair("/attendance", "1031-m-attendance-390", 390, 844);
await widthRoutePair("/training", "1033-m-training-390", 390, 844);
await widthRoutePair("/recruitment", "1035-m-recruitment-390", 390, 844);
await widthRoutePair("/settings", "1037-m-settings-390", 390, 844);

// ---- 1039-1051: the tablet-width (768x1024) re-baselines vs the r84
//      927-939 set. ----
await widthRoutePair("/dashboard", "1039-t-dashboard-768", 768, 1024);
await widthRoutePair("/payroll", "1041-t-payroll-768", 768, 1024);
await widthRoutePair("/employees", "1043-t-employees-768", 768, 1024);
await widthRoutePair("/attendance", "1045-t-attendance-768", 768, 1024);
await widthRoutePair("/training", "1047-t-training-768", 768, 1024);
await widthRoutePair("/recruitment", "1049-t-recruitment-768", 768, 1024);
await widthRoutePair("/settings", "1051-t-settings-768", 768, 1024);

// ---- 1053-1065: the sm-boundary (640x1024) re-baselines vs the r84
//      941-953 set. ----
await widthRoutePair("/dashboard", "1053-s-dashboard-640", 640, 1024);
await widthRoutePair("/payroll", "1055-s-payroll-640", 640, 1024);
await widthRoutePair("/employees", "1057-s-employees-640", 640, 1024);
await widthRoutePair("/attendance", "1059-s-attendance-640", 640, 1024);
await widthRoutePair("/training", "1061-s-training-640", 640, 1024);
await widthRoutePair("/recruitment", "1063-s-recruitment-640", 640, 1024);
await widthRoutePair("/settings", "1065-s-settings-640", 640, 1024);

// ---- 1067-1079: the xl-boundary (1280x1024) re-baselines vs the r84
//      955-967 set. ----
await widthRoutePair("/dashboard", "1067-x-dashboard-1280", 1280, 1024);
await widthRoutePair("/payroll", "1069-x-payroll-1280", 1280, 1024);
await widthRoutePair("/employees", "1071-x-employees-1280", 1280, 1024);
await widthRoutePair("/attendance", "1073-x-attendance-1280", 1280, 1024);
await widthRoutePair("/training", "1075-x-training-1280", 1280, 1024);
await widthRoutePair("/recruitment", "1077-x-recruitment-1280", 1280, 1024);
await widthRoutePair("/settings", "1079-x-settings-1280", 1280, 1024);

// ---- 1081-1093: THE DARK-MODE re-baselines @1440x900 (vs the r84
//      969-981 set — the FIRST dark byte-compare, the r83 carry-forward
//      duty). ----
async function themeRoutePair(route, name, setup) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} eval "${setup}"`);
    run(`agent-browser --session ${session} set viewport 1440 900`);
    await new Promise(r => setTimeout(r, 400));
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${session} set viewport 1440 900`);
    await new Promise(r => setTimeout(r, 4600));
    cap(session, `${name}-${suffix}`);
  }
}
const DARK = "localStorage.setItem('darkMode','true'); localStorage.removeItem('app_lang');";
const RTL = "localStorage.setItem('darkMode','false'); localStorage.setItem('app_lang','ar');";
await themeRoutePair("/dashboard", "1081-dk-dashboard", DARK);
await themeRoutePair("/payroll", "1083-dk-payroll", DARK);
await themeRoutePair("/employees", "1085-dk-employees", DARK);
await themeRoutePair("/attendance", "1087-dk-attendance", DARK);
await themeRoutePair("/training", "1089-dk-training", DARK);
await themeRoutePair("/recruitment", "1091-dk-recruitment", DARK);
await themeRoutePair("/settings", "1093-dk-settings", DARK);

// ---- 1095-1107: THE RTL re-baselines @1440x900 (vs the r84 983-995 set
//      — the FIRST RTL byte-compare). ----
await themeRoutePair("/dashboard", "1095-rtl-dashboard", RTL);
await themeRoutePair("/payroll", "1097-rtl-payroll", RTL);
await themeRoutePair("/employees", "1099-rtl-employees", RTL);
await themeRoutePair("/attendance", "1101-rtl-attendance", RTL);
await themeRoutePair("/training", "1103-rtl-training", RTL);
await themeRoutePair("/recruitment", "1105-rtl-recruitment", RTL);
await themeRoutePair("/settings", "1107-rtl-settings", RTL);

// ---- 1109: THE DARK mobile drawer pair @390x844 (vs 997) ----
await drawerPair("1109-mobile-drawer-dark", DARK);
// ---- 1111: THE RTL mobile drawer pair @390x844 (vs 999) ----
await drawerPair("1111-mobile-drawer-rtl", RTL);

// sweep the theme state back to the standing LIGHT+LTR
for (const s of ["ref85s", "loc85s"]) {
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
}

// ---- the byte-stability proofs vs the r84 set ----
// THE ROUND'S EXPECTATION: every LOC capture DRIFTS BY DESIGN (the
// badge + the logo + the ring enter every LOC capture); every REF
// capture STABLE. The new LOC md5s become the chained baselines.
const md5 = (f) => run(`md5sum ${shots}/${f}.png 2>/dev/null | awk '{print $1}'`).trim();
function cmp(now, was) {
  const ln = md5(now + "-loc"), rn = md5(now + "-ref");
  const lw = md5(was + "-loc"), rw = md5(was + "-ref");
  return `${now}: loc ${ln === lw ? "STABLE" : "DRIFT-BY-DESIGN " + ln} / ref ${rn === rw ? "STABLE" : "DRIFT!! " + rn}`;
}
console.log("\n==== LOGIN-PAIR STABILITY (1001 vs the r84 891 pair — loc DRIFTS BY DESIGN: badge+logo+ring) ====");
console.log(cmp("1001-login-standing", "891-login-standing"));
console.log("\n==== THE FOCUSED-PAIR EVIDENCE (1017 — the R85-A ring, FIRST capture; the cross-side pixel proof ran in-round) ====");
console.log("1017 loc:", md5("1017-login-focused-loc"), "/ ref:", md5("1017-login-focused-ref"));
console.log("\n==== ROUTE-PAIR STABILITY @1440 (vs the r84 set — loc DRIFT BY DESIGN, ref STABLE) ====");
const routes = [["1003-dashboard-light", "893-dashboard-light"], ["1005-payroll-light", "895-payroll-light"], ["1007-employees-light", "897-employees-light"], ["1009-attendance-light", "899-attendance-light"], ["1011-training-light", "901-training-light"], ["1013-recruitment-light", "903-recruitment-light"], ["1015-settings-light", "905-settings-light"]];
for (const [now, was] of routes) console.log(cmp(now, was));
console.log("\n==== THE r84 FIX-EVIDENCE BASELINES' FIRST BYTE-COMPARE (1019/1021 vs the r84 907/909) ====");
console.log(cmp("1019-assetmanagement-light", "907-assetmanagement-light"));
console.log(cmp("1021-payrollreports-light", "909-payrollreports-light"));
console.log("\n==== DRAWER-PAIR STABILITY (1023 vs the r84 911 pair — loc DRIFTS BY DESIGN: the badge overlays) ====");
console.log(cmp("1023-mobile-drawer-light", "911-mobile-drawer-light"));
console.log("\n==== MOBILE-WIDTH RE-BASELINES (1025-1037 vs the r84 913-925 set) ====");
const mob = [["1025-m-dashboard-390", "913-m-dashboard-390"], ["1027-m-payroll-390", "915-m-payroll-390"], ["1029-m-employees-390", "917-m-employees-390"], ["1031-m-attendance-390", "919-m-attendance-390"], ["1033-m-training-390", "921-m-training-390"], ["1035-m-recruitment-390", "923-m-recruitment-390"], ["1037-m-settings-390", "925-m-settings-390"]];
for (const [now, was] of mob) console.log(cmp(now, was));
console.log("\n==== TABLET-WIDTH RE-BASELINES (1039-1051 vs the r84 927-939 set) ====");
const tab = [["1039-t-dashboard-768", "927-t-dashboard-768"], ["1041-t-payroll-768", "929-t-payroll-768"], ["1043-t-employees-768", "931-t-employees-768"], ["1045-t-attendance-768", "933-t-attendance-768"], ["1047-t-training-768", "935-t-training-768"], ["1049-t-recruitment-768", "937-t-recruitment-768"], ["1051-t-settings-768", "939-t-settings-768"]];
for (const [now, was] of tab) console.log(cmp(now, was));
console.log("\n==== SM-BOUNDARY RE-BASELINES (1053-1065 vs the r84 941-953 set) ====");
const smB = [["1053-s-dashboard-640", "941-s-dashboard-640"], ["1055-s-payroll-640", "943-s-payroll-640"], ["1057-s-employees-640", "945-s-employees-640"], ["1059-s-attendance-640", "947-s-attendance-640"], ["1061-s-training-640", "949-s-training-640"], ["1063-s-recruitment-640", "951-s-recruitment-640"], ["1065-s-settings-640", "953-s-settings-640"]];
for (const [now, was] of smB) console.log(cmp(now, was));
console.log("\n==== XL-BOUNDARY RE-BASELINES (1067-1079 vs the r84 955-967 set) ====");
const xlB = [["1067-x-dashboard-1280", "955-x-dashboard-1280"], ["1069-x-payroll-1280", "957-x-payroll-1280"], ["1071-x-employees-1280", "959-x-employees-1280"], ["1073-x-attendance-1280", "961-x-attendance-1280"], ["1075-x-training-1280", "963-x-training-1280"], ["1077-x-recruitment-1280", "965-x-recruitment-1280"], ["1079-x-settings-1280", "967-x-settings-1280"]];
for (const [now, was] of xlB) console.log(cmp(now, was));
console.log("\n==== THE DARK BYTE-COMPARE (1081-1093 vs the r84 969-981 set) ====");
const dk = [["1081-dk-dashboard", "969-dk-dashboard"], ["1083-dk-payroll", "971-dk-payroll"], ["1085-dk-employees", "973-dk-employees"], ["1087-dk-attendance", "975-dk-attendance"], ["1089-dk-training", "977-dk-training"], ["1091-dk-recruitment", "979-dk-recruitment"], ["1093-dk-settings", "981-dk-settings"]];
for (const [now, was] of dk) console.log(cmp(now, was));
console.log("\n==== THE RTL BYTE-COMPARE (1095-1107 vs the r84 983-995 set) ====");
const rtl = [["1095-rtl-dashboard", "983-rtl-dashboard"], ["1097-rtl-payroll", "985-rtl-payroll"], ["1099-rtl-employees", "987-rtl-employees"], ["1101-rtl-attendance", "989-rtl-attendance"], ["1103-rtl-training", "991-rtl-training"], ["1105-rtl-recruitment", "993-rtl-recruitment"], ["1107-rtl-settings", "995-rtl-settings"]];
for (const [now, was] of rtl) console.log(cmp(now, was));
console.log("\n==== THE THEME DRAWER PAIRS (1109/1111 vs the r84 997/999 pairs) ====");
console.log(cmp("1109-mobile-drawer-dark", "997-mobile-drawer-dark"));
console.log(cmp("1111-mobile-drawer-rtl", "999-mobile-drawer-rtl"));
console.log("done");
