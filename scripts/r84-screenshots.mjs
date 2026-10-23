#!/usr/bin/env node
// r84-screenshots.mjs — session 84 / parity round 83: the byte-chain
// evidence set. Numbers continue from 889 (the r83 set ended there).
//   891        the LOGIN standing pair @1440x900 (vs the r83 785 pair)
//   893-905    the seven standing route pairs @1440x900 (vs the r83
//              787-799 set — ALL expected STABLE: the round's two fixes
//              touch /assetmanagement + /payrollreports, NOT the seven)
//   907        NEW: the /assetmanagement pair @1440x900 — the R84-A fix
//              evidence (the Export button's 112px geometry) + the route's
//              FIRST per-side baseline for the r85+ chain
//   909        NEW: the /payrollreports pair @1440x900 — the R84-B fix
//              evidence (the PDF button now opens the print dialog) + the
//              route's FIRST per-side baseline
//   911        the LIGHT mobile drawer pair @390x844 (vs the r83 801
//              pair — the TWENTY-round chain)
//   913-925    the mobile-width (390x844) re-baselines (vs the r83
//              803-815 — the payroll-ref pair compares against the r83
//              re-baselined capture, the post-tenant-emptying state)
//   927-939    the tablet-width (768x1024) re-baselines (vs 817-829)
//   941-953    the sm-boundary (640x1024) re-baselines (vs 831-843)
//   955-967    the xl-boundary (1280x1024) re-baselines (vs 845-857)
//   969-981    THE DARK-MODE re-baselines @1440x900 (vs the r83 859-871
//              — the FIRST byte-compare of the dark set, the r83
//              carry-forward duty)
//   983-995    THE RTL re-baselines @1440x900 (vs the r83 873-885 — the
//              FIRST RTL byte-compare)
//   997        THE DARK mobile drawer pair @390x844 (vs 887)
//   999        THE RTL mobile drawer pair @390x844 (vs 889)
// + the inline mobile-menu functional cycle (the standing user emphasis).
// Standing captures pin LIGHT+LTR: darkMode=false AND app_lang removed.
// THE HEIGHT CONTRACT (the r83 in-round lesson, applied IN THE SCRIPT this
// time): the mobile set's height is 844, NOT the boundary-pattern 1024 —
// the height is part of the baseline contract (the r83 script's
// widthRoutePair carried the 1024 bug; the r83 PNGs were re-captured
// separately — this script parameterizes the height per set).
// Mechanism (the r71 lesson): the drawer opens via the accessible-name
// SNAPSHOT ref.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r84.log 2>&1 < /dev/null &`],
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
for (const s of ["ref84s", "loc84s"]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref84s", "https://eon.base44.app", "ref"], ["loc84s", "http://127.0.0.1:3200", "loc"]];

// ---- 891: the LOGIN page pair @1440x900 (the standing logged-out surface) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `891-login-standing-${suffix}`);
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
await auth("ref84s", "https://eon.base44.app");
await auth("loc84s", "http://127.0.0.1:3200");

async function routePair(route, name, settle = 4600) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${session} set viewport 1440 900`);
    await new Promise(r => setTimeout(r, settle));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 893-905: the seven standing route pairs @1440x900 (LIGHT+LTR) ----
await routePair("/dashboard", "893-dashboard-light");
await routePair("/payroll", "895-payroll-light");
await routePair("/employees", "897-employees-light");
await routePair("/attendance", "899-attendance-light");
await routePair("/training", "901-training-light");
await routePair("/recruitment", "903-recruitment-light");
await routePair("/settings", "905-settings-light");

// ---- 907/909: NEW — the round's two fix-evidence routes, first baselines ----
await routePair("/assetmanagement", "907-assetmanagement-light");
await routePair("/payrollreports", "909-payrollreports-light");

// ---- 911: the LIGHT mobile drawer pair @390x844 (the standing
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
await drawerPair("911-mobile-drawer-light");

// ---- the mobile-menu functional check (the standing user emphasis):
//      the open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc84s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc84s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc84s get url`).trim();
console.log("after training-lms click:", afterNav);
const closedAfterNav = run(`agent-browser --session loc84s eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));

// ---- 913-925: the mobile-width re-baselines @390x844 (THE HEIGHT
//      CONTRACT — 844, not the boundary-pattern 1024) vs the r83
//      803-815 set. ----
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
await widthRoutePair("/dashboard", "913-m-dashboard-390", 390, 844);
await widthRoutePair("/payroll", "915-m-payroll-390", 390, 844);
await widthRoutePair("/employees", "917-m-employees-390", 390, 844);
await widthRoutePair("/attendance", "919-m-attendance-390", 390, 844);
await widthRoutePair("/training", "921-m-training-390", 390, 844);
await widthRoutePair("/recruitment", "923-m-recruitment-390", 390, 844);
await widthRoutePair("/settings", "925-m-settings-390", 390, 844);

// ---- 927-939: the tablet-width (768x1024) re-baselines vs the r83
//      817-829 set. ----
await widthRoutePair("/dashboard", "927-t-dashboard-768", 768, 1024);
await widthRoutePair("/payroll", "929-t-payroll-768", 768, 1024);
await widthRoutePair("/employees", "931-t-employees-768", 768, 1024);
await widthRoutePair("/attendance", "933-t-attendance-768", 768, 1024);
await widthRoutePair("/training", "935-t-training-768", 768, 1024);
await widthRoutePair("/recruitment", "937-t-recruitment-768", 768, 1024);
await widthRoutePair("/settings", "939-t-settings-768", 768, 1024);

// ---- 941-953: the sm-boundary (640x1024) re-baselines vs the r83
//      831-843 set. ----
await widthRoutePair("/dashboard", "941-s-dashboard-640", 640, 1024);
await widthRoutePair("/payroll", "943-s-payroll-640", 640, 1024);
await widthRoutePair("/employees", "945-s-employees-640", 640, 1024);
await widthRoutePair("/attendance", "947-s-attendance-640", 640, 1024);
await widthRoutePair("/training", "949-s-training-640", 640, 1024);
await widthRoutePair("/recruitment", "951-s-recruitment-640", 640, 1024);
await widthRoutePair("/settings", "953-s-settings-640", 640, 1024);

// ---- 955-967: the xl-boundary (1280x1024) re-baselines vs the r83
//      845-857 set. ----
await widthRoutePair("/dashboard", "955-x-dashboard-1280", 1280, 1024);
await widthRoutePair("/payroll", "957-x-payroll-1280", 1280, 1024);
await widthRoutePair("/employees", "959-x-employees-1280", 1280, 1024);
await widthRoutePair("/attendance", "961-x-attendance-1280", 1280, 1024);
await widthRoutePair("/training", "963-x-training-1280", 1280, 1024);
await widthRoutePair("/recruitment", "965-x-recruitment-1280", 1280, 1024);
await widthRoutePair("/settings", "967-x-settings-1280", 1280, 1024);

// ---- 969-981: THE DARK-MODE re-baselines @1440x900 (vs the r83
//      859-871 set — the FIRST dark byte-compare, the r83 carry-forward
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
await themeRoutePair("/dashboard", "969-dk-dashboard", DARK);
await themeRoutePair("/payroll", "971-dk-payroll", DARK);
await themeRoutePair("/employees", "973-dk-employees", DARK);
await themeRoutePair("/attendance", "975-dk-attendance", DARK);
await themeRoutePair("/training", "977-dk-training", DARK);
await themeRoutePair("/recruitment", "979-dk-recruitment", DARK);
await themeRoutePair("/settings", "981-dk-settings", DARK);

// ---- 983-995: THE RTL re-baselines @1440x900 (vs the r83 873-885 set
//      — the FIRST RTL byte-compare). ----
await themeRoutePair("/dashboard", "983-rtl-dashboard", RTL);
await themeRoutePair("/payroll", "985-rtl-payroll", RTL);
await themeRoutePair("/employees", "987-rtl-employees", RTL);
await themeRoutePair("/attendance", "989-rtl-attendance", RTL);
await themeRoutePair("/training", "991-rtl-training", RTL);
await themeRoutePair("/recruitment", "993-rtl-recruitment", RTL);
await themeRoutePair("/settings", "995-rtl-settings", RTL);

// ---- 997: THE DARK mobile drawer pair @390x844 (vs 887) ----
await drawerPair("997-mobile-drawer-dark", DARK);
// ---- 999: THE RTL mobile drawer pair @390x844 (vs 889) ----
await drawerPair("999-mobile-drawer-rtl", RTL);

// sweep the theme state back to the standing LIGHT+LTR
for (const s of ["ref84s", "loc84s"]) {
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
}

// ---- the byte-stability proofs vs the r83 set ----
const md5 = (f) => run(`md5sum ${shots}/${f}.png 2>/dev/null | awk '{print $1}'`).trim();
console.log("\n==== LOGIN-PAIR STABILITY (891 vs the r83 785 pair) ====");
console.log("loc 891:", md5("891-login-standing-loc"), "(r83 785: bd718ed052ff48124b11b8919c8b9b4d)", md5("891-login-standing-loc") === "bd718ed052ff48124b11b8919c8b9b4d" ? "STABLE" : "DRIFT");
console.log("ref 891:", md5("891-login-standing-ref"), "(r83 785: 69aa4241efa1a2b4994b698fc5cad2a4)", md5("891-login-standing-ref") === "69aa4241efa1a2b4994b698fc5cad2a4" ? "STABLE" : "DRIFT");
console.log("\n==== DRAWER-PAIR STABILITY (911 vs the r83 801 pair — the TWENTY-round chain) ====");
console.log("loc 911:", md5("911-mobile-drawer-light-loc"), "(r83 801: e3df921135be28f60031af57d58df879)", md5("911-mobile-drawer-light-loc") === "e3df921135be28f60031af57d58df879" ? "STABLE" : "DRIFT");
console.log("ref 911:", md5("911-mobile-drawer-light-ref"), "(r83 801: bfaa0da55e77277d910bd13c25d4e618)", md5("911-mobile-drawer-light-ref") === "bfaa0da55e77277d910bd13c25d4e618" ? "STABLE" : "DRIFT");
console.log("\n==== ROUTE-PAIR STABILITY @1440 (vs the r83 set, both sides — ALL expected STABLE: the fixes touch other routes) ====");
const routes = [["893-dashboard-light", "787-dashboard-light"], ["895-payroll-light", "789-payroll-light"], ["897-employees-light", "791-employees-light"], ["899-attendance-light", "793-attendance-light"], ["901-training-light", "795-training-light"], ["903-recruitment-light", "797-recruitment-light"], ["905-settings-light", "799-settings-light"]];
for (const [now, was] of routes) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("\n==== THE NEW FIX-EVIDENCE BASELINES (907/909 — first capture, recorded for the r85+ chain) ====");
for (const n of ["907-assetmanagement-light", "909-payrollreports-light"]) {
  console.log(`${n}: loc ${md5(n + "-loc")} / ref ${md5(n + "-ref")}`);
}
console.log("\n==== MOBILE-WIDTH RE-BASELINES (913-925 vs the r83 803-815 set) ====");
const mob = [["913-m-dashboard-390", "803-m-dashboard-390"], ["915-m-payroll-390", "805-m-payroll-390"], ["917-m-employees-390", "807-m-employees-390"], ["919-m-attendance-390", "809-m-attendance-390"], ["921-m-training-390", "811-m-training-390"], ["923-m-recruitment-390", "813-m-recruitment-390"], ["925-m-settings-390", "815-m-settings-390"]];
for (const [now, was] of mob) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("\n==== TABLET-WIDTH RE-BASELINES (927-939 vs the r83 817-829 set) ====");
const tab = [["927-t-dashboard-768", "817-t-dashboard-768"], ["929-t-payroll-768", "819-t-payroll-768"], ["931-t-employees-768", "821-t-employees-768"], ["933-t-attendance-768", "823-t-attendance-768"], ["935-t-training-768", "825-t-training-768"], ["937-t-recruitment-768", "827-t-recruitment-768"], ["939-t-settings-768", "829-t-settings-768"]];
for (const [now, was] of tab) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("\n==== SM-BOUNDARY RE-BASELINES (941-953 vs the r83 831-843 set) ====");
const smB = [["941-s-dashboard-640", "831-s-dashboard-640"], ["943-s-payroll-640", "833-s-payroll-640"], ["945-s-employees-640", "835-s-employees-640"], ["947-s-attendance-640", "837-s-attendance-640"], ["949-s-training-640", "839-s-training-640"], ["951-s-recruitment-640", "841-s-recruitment-640"], ["953-s-settings-640", "843-s-settings-640"]];
for (const [now, was] of smB) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("\n==== XL-BOUNDARY RE-BASELINES (955-967 vs the r83 845-857 set) ====");
const xlB = [["955-x-dashboard-1280", "845-x-dashboard-1280"], ["957-x-payroll-1280", "847-x-payroll-1280"], ["959-x-employees-1280", "849-x-employees-1280"], ["961-x-attendance-1280", "851-x-attendance-1280"], ["963-x-training-1280", "853-x-training-1280"], ["965-x-recruitment-1280", "855-x-recruitment-1280"], ["967-x-settings-1280", "857-x-settings-1280"]];
for (const [now, was] of xlB) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("\n==== THE FIRST DARK-MODE BYTE-COMPARE (969-981 vs the r83 859-871 set — the r83 carry-forward duty) ====");
const dk = [["969-dk-dashboard", "859-dk-dashboard"], ["971-dk-payroll", "861-dk-payroll"], ["973-dk-employees", "863-dk-employees"], ["975-dk-attendance", "865-dk-attendance"], ["977-dk-training", "867-dk-training"], ["979-dk-recruitment", "869-dk-recruitment"], ["981-dk-settings", "871-dk-settings"]];
for (const [now, was] of dk) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("\n==== THE FIRST RTL BYTE-COMPARE (983-995 vs the r83 873-885 set) ====");
const rtl = [["983-rtl-dashboard", "873-rtl-dashboard"], ["985-rtl-payroll", "875-rtl-payroll"], ["987-rtl-employees", "877-rtl-employees"], ["989-rtl-attendance", "879-rtl-attendance"], ["991-rtl-training", "881-rtl-training"], ["993-rtl-recruitment", "883-rtl-recruitment"], ["995-rtl-settings", "885-rtl-settings"]];
for (const [now, was] of rtl) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("\n==== THE THEME DRAWER PAIRS (997/999 vs the r83 887/889 pairs) ====");
console.log("loc 997:", md5("997-mobile-drawer-dark-loc") === md5("887-mobile-drawer-dark-loc") ? "STABLE" : "DRIFT", "/ ref:", md5("997-mobile-drawer-dark-ref") === md5("887-mobile-drawer-dark-ref") ? "STABLE" : "DRIFT");
console.log("loc 999:", md5("999-mobile-drawer-rtl-loc") === md5("889-mobile-drawer-rtl-loc") ? "STABLE" : "DRIFT", "/ ref:", md5("999-mobile-drawer-rtl-ref") === md5("889-mobile-drawer-rtl-ref") ? "STABLE" : "DRIFT");
console.log("done");
