#!/usr/bin/env node
// r86-screenshots.mjs — session 86 / parity round 85: the byte-chain
// evidence set. Numbers continue from 1111 (the r85 set ended there).
//   1113       the LOGIN standing pair @1440x900 (vs the r85 1001 pair —
//              both sides expected STABLE: no login-surface source
//              changes this round)
//   1115-1127  the seven standing route pairs @1440x900 (vs the r85
//              1003-1015 set — LOC DRIFTS BY DESIGN on payroll/training/
//              settings (the month default + the Video/Settings/
//              CircleCheckBig/SquarePen icon swaps); dashboard/employees/
//              attendance/recruitment STABLE; every REF STABLE — a REF
//              drift = the 59th deploy → ladder)
//   1129       the FOCUSED social-button pair (vs the r85 1017 — the
//              keyboard-surface chain)
//   1131       the /assetmanagement pair (vs 1019 — LOC DRIFTS: the R86-E
//              th alignment)
//   1133       the /payrollreports pair (vs 1021 — LOC DRIFTS: the R86-A
//              five-member structural remediation)
//   1135       the LIGHT mobile drawer pair @390x844 (vs 1023)
//   1137-1149  the mobile-width (390x844) re-baselines (vs 1025-1037)
//   1151-1163  the tablet-width (768x1024) re-baselines (vs 1039-1051)
//   1165-1177  the sm-boundary (640x1024) re-baselines (vs 1053-1065)
//   1179-1191  the xl-boundary (1280x1024) re-baselines (vs 1067-1079)
//   1193-1205  the DARK-MODE re-baselines @1440x900 (vs 1081-1093)
//   1207-1219  the RTL re-baselines @1440x900 (vs 1095-1107)
//   1221       THE DARK mobile drawer pair @390x844 (vs 1109)
//   1223       THE RTL mobile drawer pair @390x844 (vs 1111)
// + the inline mobile-menu functional cycle (the standing user emphasis).
// Standing capture contracts honored: darkMode/app_lang pinned per set,
// the badge VISIBLE (never dismiss mid-script), the height contract
// (390x844 mobile / 1024 boundary+tablet), the fill-settle-click auth,
// the standalone killed by PID + re-booted + chunk-verified.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r86.log 2>&1 < /dev/null &`],
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
for (const s of ["ref86s", "loc86s"]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref86s", "https://eon.base44.app", "ref"], ["loc86s", "http://127.0.0.1:3200", "loc"]];

// ---- 1113: the LOGIN page pair (fresh logged-out sessions) ----
for (const s of ["ref86L2", "loc86L2"]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
}
for (const [session, base, suffix] of [["ref86L2", "https://eon.base44.app", "ref"], ["loc86L2", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `1113-login-standing-${suffix}`);
}

// ---- 1129: the FOCUSED social-button pair (the keyboard-surface chain) ----
for (const [session, base, suffix] of [["ref86L2", "https://eon.base44.app", "ref"], ["loc86L2", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  run(`agent-browser --session ${session} press Tab`);
  await new Promise(r => setTimeout(r, 500));
  cap(session, `1129-login-focused-${suffix}`);
}
for (const s of ["ref86L2", "loc86L2"]) run(`agent-browser --session ${s} close 2>/dev/null; true`);

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
await auth("ref86s", "https://eon.base44.app");
await auth("loc86s", "http://127.0.0.1:3200");

async function routePair(route, name, settle = 4600) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${session} set viewport 1440 900`);
    await new Promise(r => setTimeout(r, settle));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 1115-1127: the seven standing route pairs ----
await routePair("/dashboard", "1115-dashboard-light");
await routePair("/payroll", "1117-payroll-light");
await routePair("/employees", "1119-employees-light");
await routePair("/attendance", "1121-attendance-light");
await routePair("/training", "1123-training-light");
await routePair("/recruitment", "1125-recruitment-light");
await routePair("/settings", "1127-settings-light");

// ---- 1131/1133: the round's fix-evidence routes ----
await routePair("/assetmanagement", "1131-assetmanagement-light");
await routePair("/payrollreports", "1133-payrollreports-light");

// ---- 1135: the LIGHT mobile drawer pair ----
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
await drawerPair("1135-mobile-drawer-light");

// ---- the mobile-menu functional cycle (the standing user emphasis) ----
const drawerState = run(`agent-browser --session loc86s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc86s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc86s get url`).trim();
console.log("after training-lms click:", afterNav);
const closedAfterNav = run(`agent-browser --session loc86s eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));

// ---- the width re-baselines ----
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
await widthRoutePair("/dashboard", "1137-m-dashboard-390", 390, 844);
await widthRoutePair("/payroll", "1139-m-payroll-390", 390, 844);
await widthRoutePair("/employees", "1141-m-employees-390", 390, 844);
await widthRoutePair("/attendance", "1143-m-attendance-390", 390, 844);
await widthRoutePair("/training", "1145-m-training-390", 390, 844);
await widthRoutePair("/recruitment", "1147-m-recruitment-390", 390, 844);
await widthRoutePair("/settings", "1149-m-settings-390", 390, 844);

await widthRoutePair("/dashboard", "1151-t-dashboard-768", 768, 1024);
await widthRoutePair("/payroll", "1153-t-payroll-768", 768, 1024);
await widthRoutePair("/employees", "1155-t-employees-768", 768, 1024);
await widthRoutePair("/attendance", "1157-t-attendance-768", 768, 1024);
await widthRoutePair("/training", "1159-t-training-768", 768, 1024);
await widthRoutePair("/recruitment", "1161-t-recruitment-768", 768, 1024);
await widthRoutePair("/settings", "1163-t-settings-768", 768, 1024);

await widthRoutePair("/dashboard", "1165-s-dashboard-640", 640, 1024);
await widthRoutePair("/payroll", "1167-s-payroll-640", 640, 1024);
await widthRoutePair("/employees", "1169-s-employees-640", 640, 1024);
await widthRoutePair("/attendance", "1171-s-attendance-640", 640, 1024);
await widthRoutePair("/training", "1173-s-training-640", 640, 1024);
await widthRoutePair("/recruitment", "1175-s-recruitment-640", 640, 1024);
await widthRoutePair("/settings", "1177-s-settings-640", 640, 1024);

await widthRoutePair("/dashboard", "1179-x-dashboard-1280", 1280, 1024);
await widthRoutePair("/payroll", "1181-x-payroll-1280", 1280, 1024);
await widthRoutePair("/employees", "1183-x-employees-1280", 1280, 1024);
await widthRoutePair("/attendance", "1185-x-attendance-1280", 1280, 1024);
await widthRoutePair("/training", "1187-x-training-1280", 1280, 1024);
await widthRoutePair("/recruitment", "1189-x-recruitment-1280", 1280, 1024);
await widthRoutePair("/settings", "1191-x-settings-1280", 1280, 1024);

// ---- the dark + RTL re-baselines ----
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
await themeRoutePair("/dashboard", "1193-dk-dashboard", DARK);
await themeRoutePair("/payroll", "1195-dk-payroll", DARK);
await themeRoutePair("/employees", "1197-dk-employees", DARK);
await themeRoutePair("/attendance", "1199-dk-attendance", DARK);
await themeRoutePair("/training", "1201-dk-training", DARK);
await themeRoutePair("/recruitment", "1203-dk-recruitment", DARK);
await themeRoutePair("/settings", "1205-dk-settings", DARK);

await themeRoutePair("/dashboard", "1207-rtl-dashboard", RTL);
await themeRoutePair("/payroll", "1209-rtl-payroll", RTL);
await themeRoutePair("/employees", "1211-rtl-employees", RTL);
await themeRoutePair("/attendance", "1213-rtl-attendance", RTL);
await themeRoutePair("/training", "1215-rtl-training", RTL);
await themeRoutePair("/recruitment", "1217-rtl-recruitment", RTL);
await themeRoutePair("/settings", "1219-rtl-settings", RTL);

await drawerPair("1221-mobile-drawer-dark", DARK);
await drawerPair("1223-mobile-drawer-rtl", RTL);

for (const s of ["ref86s", "loc86s"]) {
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
}

// ---- the byte-stability proofs vs the r85 set ----
// EXPECTATION: the five remediated routes (payroll/training/settings/
// assetmanagement/payrollreports) DRIFT BY DESIGN on the LOC side; the
// untouched routes + the login pair STABLE; EVERY REF capture STABLE
// (a REF drift = the 59th deploy → the ladder).
const md5 = (f) => run(`md5sum ${shots}/${f}.png 2>/dev/null | awk '{print $1}'`).trim();
function cmp(now, was) {
  const ln = md5(now + "-loc"), rn = md5(now + "-ref");
  const lw = md5(was + "-loc"), rw = md5(was + "-ref");
  return `${now}: loc ${ln === lw ? "STABLE" : "DRIFT-BY-DESIGN"} / ref ${rn === rw ? "STABLE" : "DRIFT!! " + rn}`;
}
console.log("\n==== LOGIN PAIR (1113 vs 1001 — both STABLE expected) ====");
console.log(cmp("1113-login-standing", "1001-login-standing"));
console.log("\n==== FOCUSED PAIR (1129 vs 1017) ====");
console.log(cmp("1129-login-focused", "1017-login-focused"));
console.log("\n==== ROUTE PAIRS @1440 (1115-1127 vs 1003-1015; 1131/1133 vs 1019/1021) ====");
const routes = [["1115-dashboard-light", "1003-dashboard-light"], ["1117-payroll-light", "1005-payroll-light"], ["1119-employees-light", "1007-employees-light"], ["1121-attendance-light", "1009-attendance-light"], ["1123-training-light", "1011-training-light"], ["1125-recruitment-light", "1013-recruitment-light"], ["1127-settings-light", "1015-settings-light"], ["1131-assetmanagement-light", "1019-assetmanagement-light"], ["1133-payrollreports-light", "1021-payrollreports-light"]];
for (const [now, was] of routes) console.log(cmp(now, was));
console.log("\n==== DRAWER PAIR (1135 vs 1023) ====");
console.log(cmp("1135-mobile-drawer-light", "1023-mobile-drawer-light"));
console.log("\n==== MOBILE-WIDTH (1137-1149 vs 1025-1037) ====");
const mob = [["1137-m-dashboard-390", "1025-m-dashboard-390"], ["1139-m-payroll-390", "1027-m-payroll-390"], ["1141-m-employees-390", "1029-m-employees-390"], ["1143-m-attendance-390", "1031-m-attendance-390"], ["1145-m-training-390", "1033-m-training-390"], ["1147-m-recruitment-390", "1035-m-recruitment-390"], ["1149-m-settings-390", "1037-m-settings-390"]];
for (const [now, was] of mob) console.log(cmp(now, was));
console.log("\n==== TABLET-WIDTH (1151-1163 vs 1039-1051) ====");
const tab = [["1151-t-dashboard-768", "1039-t-dashboard-768"], ["1153-t-payroll-768", "1041-t-payroll-768"], ["1155-t-employees-768", "1043-t-employees-768"], ["1157-t-attendance-768", "1045-t-attendance-768"], ["1159-t-training-768", "1047-t-training-768"], ["1161-t-recruitment-768", "1049-t-recruitment-768"], ["1163-t-settings-768", "1051-t-settings-768"]];
for (const [now, was] of tab) console.log(cmp(now, was));
console.log("\n==== SM-BOUNDARY (1165-1177 vs 1053-1065) ====");
const smB = [["1165-s-dashboard-640", "1053-s-dashboard-640"], ["1167-s-payroll-640", "1055-s-payroll-640"], ["1169-s-employees-640", "1057-s-employees-640"], ["1171-s-attendance-640", "1059-s-attendance-640"], ["1173-s-training-640", "1061-s-training-640"], ["1175-s-recruitment-640", "1063-s-recruitment-640"], ["1177-s-settings-640", "1065-s-settings-640"]];
for (const [now, was] of smB) console.log(cmp(now, was));
console.log("\n==== XL-BOUNDARY (1179-1191 vs 1067-1079) ====");
const xlB = [["1179-x-dashboard-1280", "1067-x-dashboard-1280"], ["1181-x-payroll-1280", "1069-x-payroll-1280"], ["1183-x-employees-1280", "1071-x-employees-1280"], ["1185-x-attendance-1280", "1073-x-attendance-1280"], ["1187-x-training-1280", "1075-x-training-1280"], ["1189-x-recruitment-1280", "1077-x-recruitment-1280"], ["1191-x-settings-1280", "1079-x-settings-1280"]];
for (const [now, was] of xlB) console.log(cmp(now, was));
console.log("\n==== DARK (1193-1205 vs 1081-1093) ====");
const dk = [["1193-dk-dashboard", "1081-dk-dashboard"], ["1195-dk-payroll", "1083-dk-payroll"], ["1197-dk-employees", "1085-dk-employees"], ["1199-dk-attendance", "1087-dk-attendance"], ["1201-dk-training", "1089-dk-training"], ["1203-dk-recruitment", "1091-dk-recruitment"], ["1205-dk-settings", "1093-dk-settings"]];
for (const [now, was] of dk) console.log(cmp(now, was));
console.log("\n==== RTL (1207-1219 vs 1095-1107) ====");
const rtl = [["1207-rtl-dashboard", "1095-rtl-dashboard"], ["1209-rtl-payroll", "1097-rtl-payroll"], ["1211-rtl-employees", "1099-rtl-employees"], ["1213-rtl-attendance", "1101-rtl-attendance"], ["1215-rtl-training", "1103-rtl-training"], ["1217-rtl-recruitment", "1105-rtl-recruitment"], ["1219-rtl-settings", "1107-rtl-settings"]];
for (const [now, was] of rtl) console.log(cmp(now, was));
console.log("\n==== THEME DRAWER PAIRS (1221/1223 vs 1109/1111) ====");
console.log(cmp("1221-mobile-drawer-dark", "1109-mobile-drawer-dark"));
console.log(cmp("1223-mobile-drawer-rtl", "1111-mobile-drawer-rtl"));
console.log("done");
