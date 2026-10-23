#!/usr/bin/env node
// r82-screenshots.mjs — session 82 / parity round 81: the byte-chain
// evidence set. Numbers continue from 709 (the r81 set ended there).
//   711        the LOGIN standing pair @1440x900 (vs the r81 665 pair)
//   713-725    the seven standing route pairs @1440x900 (vs the r81
//              667-679 set — the attendance pair DRIFTS BY DESIGN: the
//              R82-A row fix re-authors the 1440 rendering to the REF's
//              312px two-line hero + the 1558 overflow)
//   727        the LIGHT mobile drawer pair @390x844 (vs the r81 681 pair
//              — the EIGHTEEN-round chain)
//   729-741    the mobile-width (390) re-baselines (vs the r81 683-695 —
//              all expected STABLE: the fix is inert at 390, 943/943
//              proven live)
//   743-755    the tablet-width (768x1024) re-baselines (vs the r81
//              697-709 — the attendance pair DRIFTS BY DESIGN toward the
//              REF's 1558; every other pair must stay stable)
//   757-769    THE FIRST sm-BOUNDARY (640x1024) per-side baselines
//   771-783    THE FIRST xl-BOUNDARY (1280x1024) per-side baselines
//              (the round's fresh-eyes angle — the chained evidence for
//              r83+)
// + the inline mobile-menu functional cycle (the standing user emphasis).
// Mechanism (the r71 lesson): the drawer opens via the accessible-name
// SNAPSHOT ref.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r82.log 2>&1 < /dev/null &`],
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
for (const s of ["ref82s", "loc82s"]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref82s", "https://eon.base44.app", "ref"], ["loc82s", "http://127.0.0.1:3200", "loc"]];

// ---- 711: the LOGIN page pair @1440x900 (the standing logged-out surface) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `711-login-standing-${suffix}`);
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
  console.log(session, "->", run(`agent-browser --session ${session} get url`).trim());
}
await auth("ref82s", "https://eon.base44.app");
await auth("loc82s", "http://127.0.0.1:3200");

async function routePair(route, name, settle = 4600) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${session} set viewport 1440 900`);
    await new Promise(r => setTimeout(r, settle));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 713-725: the seven standing route pairs @1440x900 ----
await routePair("/dashboard", "713-dashboard-light");
await routePair("/payroll", "715-payroll-light");
await routePair("/employees", "717-employees-light");
await routePair("/attendance", "719-attendance-light");
await routePair("/training", "721-training-light");
await routePair("/recruitment", "723-recruitment-light");
await routePair("/settings", "725-settings-light");

// ---- 727: the LIGHT mobile drawer pair @390x844 (the standing
//      byte-stability check vs the r81 681 pair — the EIGHTEEN-round
//      chain). Mechanism (the r71 lesson): click via the accessible-name
//      SNAPSHOT ref. ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false')"`);
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
  cap(session, `727-mobile-drawer-light-${suffix}`);
}

// ---- the mobile-menu functional check (the standing user emphasis):
//      the open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc82s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc82s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc82s get url`).trim();
console.log("after training-lms click:", afterNav);
const closedAfterNav = run(`agent-browser --session loc82s eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));

// ---- 729-741: the mobile-width (390x844) re-baselines for the seven
//      standing routes — byte-compared vs the r81 683-695 set. The
//      EXPECTATION: ALL SEVEN STABLE (the R82-A row fix is inert at 390 —
//      the row is flex-col below md; the 943/943 overflow proven live
//      this round). ----
async function mobileRoutePair(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false')"`);
    run(`agent-browser --session ${session} set viewport 390 844`);
    await new Promise(r => setTimeout(r, 300));
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${session} set viewport 390 844`);
    await new Promise(r => setTimeout(r, 3000));
    cap(session, `${name}-${suffix}`);
  }
}
await mobileRoutePair("/dashboard", "729-m-dashboard-390");
await mobileRoutePair("/payroll", "731-m-payroll-390");
await mobileRoutePair("/employees", "733-m-employees-390");
await mobileRoutePair("/attendance", "735-m-attendance-390");
await mobileRoutePair("/training", "737-m-training-390");
await mobileRoutePair("/recruitment", "739-m-recruitment-390");
await mobileRoutePair("/settings", "741-m-settings-390");

// ---- 743-755: the tablet-width (768x1024) re-baselines vs the r81
//      697-709 set — the attendance pair DRIFTS BY DESIGN (the R82-A fix
//      re-authors the tablet rendering: the row no longer wraps, the page
//      now overflows 1558 byte-identical with the REF; the r81 capture
//      read the wrapped 1231); every other pair must stay byte-stable. ----
async function tabletRoutePair(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false')"`);
    run(`agent-browser --session ${session} set viewport 768 1024`);
    await new Promise(r => setTimeout(r, 300));
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${session} set viewport 768 1024`);
    await new Promise(r => setTimeout(r, 3000));
    cap(session, `${name}-${suffix}`);
  }
}
await tabletRoutePair("/dashboard", "743-t-dashboard-768");
await tabletRoutePair("/payroll", "745-t-payroll-768");
await tabletRoutePair("/employees", "747-t-employees-768");
await tabletRoutePair("/attendance", "749-t-attendance-768");
await tabletRoutePair("/training", "751-t-training-768");
await tabletRoutePair("/recruitment", "753-t-recruitment-768");
await tabletRoutePair("/settings", "755-t-settings-768");

// ---- 757-769: THE FIRST sm-BOUNDARY (640x1024) per-side baselines (the
//      round's fresh-eyes angle — the chained evidence for r83+). ----
async function boundaryRoutePair(route, name, w) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false')"`);
    run(`agent-browser --session ${session} set viewport ${w} 1024`);
    await new Promise(r => setTimeout(r, 300));
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${session} set viewport ${w} 1024`);
    await new Promise(r => setTimeout(r, 3000));
    cap(session, `${name}-${suffix}`);
  }
}
await boundaryRoutePair("/dashboard", "757-s-dashboard-640", 640);
await boundaryRoutePair("/payroll", "759-s-payroll-640", 640);
await boundaryRoutePair("/employees", "761-s-employees-640", 640);
await boundaryRoutePair("/attendance", "763-s-attendance-640", 640);
await boundaryRoutePair("/training", "765-s-training-640", 640);
await boundaryRoutePair("/recruitment", "767-s-recruitment-640", 640);
await boundaryRoutePair("/settings", "769-s-settings-640", 640);

// ---- 771-783: THE FIRST xl-BOUNDARY (1280x1024) per-side baselines. ----
await boundaryRoutePair("/dashboard", "771-x-dashboard-1280", 1280);
await boundaryRoutePair("/payroll", "773-x-payroll-1280", 1280);
await boundaryRoutePair("/employees", "775-x-employees-1280", 1280);
await boundaryRoutePair("/attendance", "777-x-attendance-1280", 1280);
await boundaryRoutePair("/training", "779-x-training-1280", 1280);
await boundaryRoutePair("/recruitment", "781-x-recruitment-1280", 1280);
await boundaryRoutePair("/settings", "783-x-settings-1280", 1280);

// ---- the byte-stability proofs vs the r81 set ----
const md5 = (f) => run(`md5sum ${shots}/${f}.png 2>/dev/null | awk '{print $1}'`).trim();
console.log("\n==== LOGIN-PAIR STABILITY (711 vs the r81 665 pair) ====");
console.log("loc 711:", md5("711-login-standing-loc"), "(r81 665: bd718ed052ff48124b11b8919c8b9b4d)", md5("711-login-standing-loc") === "bd718ed052ff48124b11b8919c8b9b4d" ? "STABLE" : "DRIFT");
console.log("ref 711:", md5("711-login-standing-ref"), "(r81 665: 69aa4241efa1a2b4994b698fc5cad2a4)", md5("711-login-standing-ref") === "69aa4241efa1a2b4994b698fc5cad2a4" ? "STABLE" : "DRIFT");
console.log("\n==== DRAWER-PAIR STABILITY (727 vs the r81 681 pair — the EIGHTEEN-round chain) ====");
console.log("loc 727:", md5("727-mobile-drawer-light-loc"), "(r81 681: e3df921135be28f60031af57d58df879)", md5("727-mobile-drawer-light-loc") === "e3df921135be28f60031af57d58df879" ? "STABLE" : "DRIFT");
console.log("ref 727:", md5("727-mobile-drawer-light-ref"), "(r81 681: bfaa0da55e77277d910bd13c25d4e618)", md5("727-mobile-drawer-light-ref") === "bfaa0da55e77277d910bd13c25d4e618" ? "STABLE" : "DRIFT");
console.log("\n==== ROUTE-PAIR STABILITY @1440 (the r82 set vs the r81 set, both sides — attendance EXPECTED to drift by design) ====");
const routes = [["713-dashboard-light", "667-dashboard-light"], ["715-payroll-light", "669-payroll-light"], ["717-employees-light", "671-employees-light"], ["719-attendance-light", "673-attendance-light"], ["721-training-light", "675-training-light"], ["723-recruitment-light", "677-recruitment-light"], ["725-settings-light", "679-settings-light"]];
for (const [now, was] of routes) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("\n==== MOBILE-WIDTH RE-BASELINES (729-741 vs the r81 683-695 set — all expected STABLE) ====");
const mob = [["729-m-dashboard-390", "683-m-dashboard-390"], ["731-m-payroll-390", "685-m-payroll-390"], ["733-m-employees-390", "687-m-employees-390"], ["735-m-attendance-390", "689-m-attendance-390"], ["737-m-training-390", "691-m-training-390"], ["739-m-recruitment-390", "693-m-recruitment-390"], ["741-m-settings-390", "695-m-settings-390"]];
for (const [now, was] of mob) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("\n==== TABLET-WIDTH RE-BASELINES (743-755 vs the r81 697-709 set — attendance EXPECTED to drift by design) ====");
const tab = [["743-t-dashboard-768", "697-t-dashboard-768"], ["745-t-payroll-768", "699-t-payroll-768"], ["747-t-employees-768", "701-t-employees-768"], ["749-t-attendance-768", "703-t-attendance-768"], ["751-t-training-768", "705-t-training-768"], ["753-t-recruitment-768", "707-t-recruitment-768"], ["755-t-settings-768", "709-t-settings-768"]];
for (const [now, was] of tab) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("\n==== THE NEW boundary-width baselines (757-783, first capture — recorded for the r83+ chain) ====");
for (const n of ["757-s-dashboard-640", "759-s-payroll-640", "761-s-employees-640", "763-s-attendance-640", "765-s-training-640", "767-s-recruitment-640", "769-s-settings-640", "771-x-dashboard-1280", "773-x-payroll-1280", "775-x-employees-1280", "777-x-attendance-1280", "779-x-training-1280", "781-x-recruitment-1280", "783-x-settings-1280"]) {
  console.log(`${n}: loc ${md5(n + "-loc")} / ref ${md5(n + "-ref")}`);
}
console.log("done");
