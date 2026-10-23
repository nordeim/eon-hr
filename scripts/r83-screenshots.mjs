#!/usr/bin/env node
// r83-screenshots.mjs — session 83 / parity round 82: the byte-chain
// evidence set. Numbers continue from 783 (the r82 set ended there).
//   785        the LOGIN standing pair @1440x900 (vs the r82 711 pair)
//   787-799    the seven standing route pairs @1440x900 (vs the r82
//              713-725 set — ALL expected STABLE: the R82-A fix landed
//              in the r82 captures)
//   801        the LIGHT mobile drawer pair @390x844 (vs the r82 727
//              pair — the NINETEEN-round chain)
//   803-815    the mobile-width (390) re-baselines (vs the r82 729-741)
//   817-829    the tablet-width (768x1024) re-baselines (vs the r82
//              743-755 — all expected STABLE now)
//   831-843    the sm-boundary (640x1024) re-baselines (vs the r82
//              757-769 — the FIRST byte-compare of the boundary set)
//   845-857    the xl-boundary (1280x1024) re-baselines (vs the r82
//              771-783)
//   859-871    THE FIRST DARK-MODE pairs @1440x900 (the round's new
//              surface — per-side baselines for the r84+ chain)
//   873-885    THE FIRST RTL pairs @1440x900 (LIGHT + dir=rtl)
//   887        THE DARK mobile drawer pair @390x844
//   889        THE RTL mobile drawer pair @390x844
// + the inline mobile-menu functional cycle (the standing user emphasis).
// Standing captures pin LIGHT+LTR: darkMode=false AND app_lang removed
// (the r82 script pinned darkMode only — the RTL key joins the pin set
// this round).
// Mechanism (the r71 lesson): the drawer opens via the accessible-name
// SNAPSHOT ref.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r83.log 2>&1 < /dev/null &`],
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
for (const s of ["ref83s", "loc83s"]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref83s", "https://eon.base44.app", "ref"], ["loc83s", "http://127.0.0.1:3200", "loc"]];

// ---- 785: the LOGIN page pair @1440x900 (the standing logged-out surface) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `785-login-standing-${suffix}`);
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
await auth("ref83s", "https://eon.base44.app");
await auth("loc83s", "http://127.0.0.1:3200");

async function routePair(route, name, settle = 4600) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${session} set viewport 1440 900`);
    await new Promise(r => setTimeout(r, settle));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 787-799: the seven standing route pairs @1440x900 (LIGHT+LTR) ----
await routePair("/dashboard", "787-dashboard-light");
await routePair("/payroll", "789-payroll-light");
await routePair("/employees", "791-employees-light");
await routePair("/attendance", "793-attendance-light");
await routePair("/training", "795-training-light");
await routePair("/recruitment", "797-recruitment-light");
await routePair("/settings", "799-settings-light");

// ---- 801: the LIGHT mobile drawer pair @390x844 (the standing
//      byte-stability check vs the r82 727 pair — the NINETEEN-round
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
await drawerPair("801-mobile-drawer-light");

// ---- the mobile-menu functional check (the standing user emphasis):
//      the open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc83s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc83s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc83s get url`).trim();
console.log("after training-lms click:", afterNav);
const closedAfterNav = run(`agent-browser --session loc83s eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));

// ---- 803-815: the mobile-width (390x844) re-baselines vs the r82
//      729-741 set — all expected STABLE. ----
async function widthRoutePair(route, name, w) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
    run(`agent-browser --session ${session} set viewport ${w} 1024`);
    await new Promise(r => setTimeout(r, 300));
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${session} set viewport ${w} 1024`);
    await new Promise(r => setTimeout(r, 3000));
    cap(session, `${name}-${suffix}`);
  }
}
await widthRoutePair("/dashboard", "803-m-dashboard-390", 390);
await widthRoutePair("/payroll", "805-m-payroll-390", 390);
await widthRoutePair("/employees", "807-m-employees-390", 390);
await widthRoutePair("/attendance", "809-m-attendance-390", 390);
await widthRoutePair("/training", "811-m-training-390", 390);
await widthRoutePair("/recruitment", "813-m-recruitment-390", 390);
await widthRoutePair("/settings", "815-m-settings-390", 390);

// ---- 817-829: the tablet-width (768x1024) re-baselines vs the r82
//      743-755 set — all expected STABLE now (the attendance drift
//      landed in the r82 captures). ----
await widthRoutePair("/dashboard", "817-t-dashboard-768", 768);
await widthRoutePair("/payroll", "819-t-payroll-768", 768);
await widthRoutePair("/employees", "821-t-employees-768", 768);
await widthRoutePair("/attendance", "823-t-attendance-768", 768);
await widthRoutePair("/training", "825-t-training-768", 768);
await widthRoutePair("/recruitment", "827-t-recruitment-768", 768);
await widthRoutePair("/settings", "829-t-settings-768", 768);

// ---- 831-843: the sm-boundary (640x1024) re-baselines vs the r82
//      757-769 set — the FIRST byte-compare of the boundary baselines. ----
await widthRoutePair("/dashboard", "831-s-dashboard-640", 640);
await widthRoutePair("/payroll", "833-s-payroll-640", 640);
await widthRoutePair("/employees", "835-s-employees-640", 640);
await widthRoutePair("/attendance", "837-s-attendance-640", 640);
await widthRoutePair("/training", "839-s-training-640", 640);
await widthRoutePair("/recruitment", "841-s-recruitment-640", 640);
await widthRoutePair("/settings", "843-s-settings-640", 640);

// ---- 845-857: the xl-boundary (1280x1024) re-baselines vs the r82
//      771-783 set. ----
await widthRoutePair("/dashboard", "845-x-dashboard-1280", 1280);
await widthRoutePair("/payroll", "847-x-payroll-1280", 1280);
await widthRoutePair("/employees", "849-x-employees-1280", 1280);
await widthRoutePair("/attendance", "851-x-attendance-1280", 1280);
await widthRoutePair("/training", "853-x-training-1280", 1280);
await widthRoutePair("/recruitment", "855-x-recruitment-1280", 1280);
await widthRoutePair("/settings", "857-x-settings-1280", 1280);

// ---- 859-871: THE FIRST DARK-MODE pairs @1440x900 (the round's new
//      surface — per-side baselines for the r84+ chain). ----
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
await themeRoutePair("/dashboard", "859-dk-dashboard", DARK);
await themeRoutePair("/payroll", "861-dk-payroll", DARK);
await themeRoutePair("/employees", "863-dk-employees", DARK);
await themeRoutePair("/attendance", "865-dk-attendance", DARK);
await themeRoutePair("/training", "867-dk-training", DARK);
await themeRoutePair("/recruitment", "869-dk-recruitment", DARK);
await themeRoutePair("/settings", "871-dk-settings", DARK);

// ---- 873-885: THE FIRST RTL pairs @1440x900 (LIGHT + dir=rtl). ----
await themeRoutePair("/dashboard", "873-rtl-dashboard", RTL);
await themeRoutePair("/payroll", "875-rtl-payroll", RTL);
await themeRoutePair("/employees", "877-rtl-employees", RTL);
await themeRoutePair("/attendance", "879-rtl-attendance", RTL);
await themeRoutePair("/training", "881-rtl-training", RTL);
await themeRoutePair("/recruitment", "883-rtl-recruitment", RTL);
await themeRoutePair("/settings", "885-rtl-settings", RTL);

// ---- 887: THE DARK mobile drawer pair @390x844 ----
await drawerPair("887-mobile-drawer-dark", DARK);
// ---- 889: THE RTL mobile drawer pair @390x844 ----
await drawerPair("889-mobile-drawer-rtl", RTL);

// sweep the theme state back to the standing LIGHT+LTR
for (const s of ["ref83s", "loc83s"]) {
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
}

// ---- the byte-stability proofs vs the r82 set ----
const md5 = (f) => run(`md5sum ${shots}/${f}.png 2>/dev/null | awk '{print $1}'`).trim();
console.log("\n==== LOGIN-PAIR STABILITY (785 vs the r82 711 pair) ====");
console.log("loc 785:", md5("785-login-standing-loc"), "(r82 711: bd718ed052ff48124b11b8919c8b9b4d)", md5("785-login-standing-loc") === "bd718ed052ff48124b11b8919c8b9b4d" ? "STABLE" : "DRIFT");
console.log("ref 785:", md5("785-login-standing-ref"), "(r82 711: 69aa4241efa1a2b4994b698fc5cad2a4)", md5("785-login-standing-ref") === "69aa4241efa1a2b4994b698fc5cad2a4" ? "STABLE" : "DRIFT");
console.log("\n==== DRAWER-PAIR STABILITY (801 vs the r82 727 pair — the NINETEEN-round chain) ====");
console.log("loc 801:", md5("801-mobile-drawer-light-loc"), "(r82 727: e3df921135be28f60031af57d58df879)", md5("801-mobile-drawer-light-loc") === "e3df921135be28f60031af57d58df879" ? "STABLE" : "DRIFT");
console.log("ref 801:", md5("801-mobile-drawer-light-ref"), "(r82 727: bfaa0da55e77277d910bd13c25d4e618)", md5("801-mobile-drawer-light-ref") === "bfaa0da55e77277d910bd13c25d4e618" ? "STABLE" : "DRIFT");
console.log("\n==== ROUTE-PAIR STABILITY @1440 (vs the r82 set, both sides — ALL expected STABLE) ====");
const routes = [["787-dashboard-light", "713-dashboard-light"], ["789-payroll-light", "715-payroll-light"], ["791-employees-light", "717-employees-light"], ["793-attendance-light", "719-attendance-light"], ["795-training-light", "721-training-light"], ["797-recruitment-light", "723-recruitment-light"], ["799-settings-light", "725-settings-light"]];
for (const [now, was] of routes) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("\n==== MOBILE-WIDTH RE-BASELINES (803-815 vs the r82 729-741 set) ====");
const mob = [["803-m-dashboard-390", "729-m-dashboard-390"], ["805-m-payroll-390", "731-m-payroll-390"], ["807-m-employees-390", "733-m-employees-390"], ["809-m-attendance-390", "735-m-attendance-390"], ["811-m-training-390", "737-m-training-390"], ["813-m-recruitment-390", "739-m-recruitment-390"], ["815-m-settings-390", "741-m-settings-390"]];
for (const [now, was] of mob) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("\n==== TABLET-WIDTH RE-BASELINES (817-829 vs the r82 743-755 set) ====");
const tab = [["817-t-dashboard-768", "743-t-dashboard-768"], ["819-t-payroll-768", "745-t-payroll-768"], ["821-t-employees-768", "747-t-employees-768"], ["823-t-attendance-768", "749-t-attendance-768"], ["825-t-training-768", "751-t-training-768"], ["827-t-recruitment-768", "753-t-recruitment-768"], ["829-t-settings-768", "755-t-settings-768"]];
for (const [now, was] of tab) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("\n==== BOUNDARY-WIDTH RE-BASELINES (831-843 vs the r82 757-769 set — the first boundary byte-compare) ====");
const smB = [["831-s-dashboard-640", "757-s-dashboard-640"], ["833-s-payroll-640", "759-s-payroll-640"], ["835-s-employees-640", "761-s-employees-640"], ["837-s-attendance-640", "763-s-attendance-640"], ["839-s-training-640", "765-s-training-640"], ["841-s-recruitment-640", "767-s-recruitment-640"], ["843-s-settings-640", "769-s-settings-640"]];
for (const [now, was] of smB) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("\n==== XL-BOUNDARY RE-BASELINES (845-857 vs the r82 771-783 set) ====");
const xlB = [["845-x-dashboard-1280", "771-x-dashboard-1280"], ["847-x-payroll-1280", "773-x-payroll-1280"], ["849-x-employees-1280", "775-x-employees-1280"], ["851-x-attendance-1280", "777-x-attendance-1280"], ["853-x-training-1280", "779-x-training-1280"], ["855-x-recruitment-1280", "781-x-recruitment-1280"], ["857-x-settings-1280", "783-x-settings-1280"]];
for (const [now, was] of xlB) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("\n==== THE NEW DARK-MODE + RTL BASELINES (859-889, first capture — recorded for the r84+ chain) ====");
for (const n of ["859-dk-dashboard", "861-dk-payroll", "863-dk-employees", "865-dk-attendance", "867-dk-training", "869-dk-recruitment", "871-dk-settings", "873-rtl-dashboard", "875-rtl-payroll", "877-rtl-employees", "879-rtl-attendance", "881-rtl-training", "883-rtl-recruitment", "885-rtl-settings", "887-mobile-drawer-dark", "889-mobile-drawer-rtl"]) {
  console.log(`${n}: loc ${md5(n + "-loc")} / ref ${md5(n + "-ref")}`);
}
console.log("done");
