#!/usr/bin/env node
// r81-screenshots.mjs — parity round 80's evidence captures. The round's
// theme: THE TABLET (md-BOUNDARY) VIEWPORT MATRIX + THE lg-BAND GRID CENSUS
// — THE FIRST REMEDIATION ROUND IN EIGHT (three clone-authored defects
// found in the never-measured 1024-1279 band + the cluster-wrap class,
// all TDD-fixed): R81-A /attendance's stats grid carried xl:grid-cols-5
// where the REF rides lg: (5 columns from 1024 — live-measured on both
// sides), R81-B /payroll's PageHeader row omitted rowBreakpoint="md" (the
// sm default's members vs the REF's md family — visually inert, the DOM
// contract aligned), and R81-C THE CLUSTER UNWRAP (the r81 cluster census:
// 34 pages read on BOTH sides @1024 — the REF is per-page inconsistent:
// payrollmodule + attendancedashboard wrap, staffrequests rides gap-2,
// and FIVE pages ride the BARE UNWRAPPED flex gap-3; the clone's flex-wrap
// default on those five collapsed their header rows at tablet where the
// REF's rows keep their natural min-content and the page overflows).
// POST-FIX LIVE VERIFICATION: at 768 the payroll/taskmanager/documenttracker
// overflows went to BYTE-IDENTICAL (861/861, 847/847, 901/901 — was
// 861/768, 847/768, 901/768), at 390 the attendance overflow went
// BYTE-IDENTICAL (943/943 — was 943/503), and the lg band went 12/12 MATCH.
// THIS SET's PROOFS: the login pair vs the r80 633 pair (loc
// bd718ed0…/ref 69aa4241…), the seven standing route pairs vs the r80
// 635-647 set (the fixes must NOT change the 1440 rendering — the
// cluster never wrapped at 1440, the grid is 5-cols either way at 1440,
// the row is row either way at 1440), the mobile drawer pair vs the r80
// 649 pair (the SEVENTEEN-round chain), the mobile-width re-baselines vs
// the r80 651-663 set (attendance-390-loc EXPECTED to drift by design —
// the unwrap re-authors its overflow; the rest must stay stable), and THE
// FIRST TABLET-WIDTH (768x1024) per-side baselines for the seven standing
// routes (697-709 — the fresh-eyes angle's chained evidence, byte-compared
// from r82 onward). + the inline mobile-menu functional cycle (the
// standing user emphasis). Numbers continue from 665 (the r80 set ended
// at 663). Mechanism (the r71 lesson): the drawer opens via the
// accessible-name SNAPSHOT ref.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r81.log 2>&1 < /dev/null &`],
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
for (const s of ["ref81s", "loc81s"]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref81s", "https://eon.base44.app", "ref"], ["loc81s", "http://127.0.0.1:3200", "loc"]];

// ---- 665: the LOGIN page pair @1440x900 (the standing logged-out surface) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `665-login-standing-${suffix}`);
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
await auth("ref81s", "https://eon.base44.app");
await auth("loc81s", "http://127.0.0.1:3200");

async function routePair(route, name, settle = 4600) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, settle));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 667-679: the LIGHT standing route pairs @1440x900 (the fixes must
//      NOT change this band — the stability proof) ----
await routePair("/dashboard", "667-dashboard-light");
await routePair("/payroll", "669-payroll-light");
await routePair("/employees", "671-employees-light");
await routePair("/attendance", "673-attendance-light");
await routePair("/training", "675-training-light");
await routePair("/recruitment", "677-recruitment-light");
await routePair("/settings", "679-settings-light");

// ---- 681: the LIGHT mobile drawer pair @390x844 (the standing
//      byte-stability check vs the r80 649 pair — the SEVENTEEN-round
//      chain). The CORRECTED MECHANISM (the r71 lesson): click via the
//      accessible-name SNAPSHOT ref. ----
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
  cap(session, `681-mobile-drawer-light-${suffix}`);
}

// ---- the mobile-menu functional check (the standing user emphasis):
//      the open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc81s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc81s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc81s get url`).trim();
console.log("after training-lms click:", afterNav);
const closedAfterNav = run(`agent-browser --session loc81s eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));

// ---- 683-695: the mobile-width (390x844) re-baselines for the seven
//      standing routes — byte-compared vs the r80 651-663 set. The
//      EXPECTATION: 689-attendance-390-loc DRIFTS BY DESIGN (the R81-C
//      unwrap re-authors the attendance mobile overflow toward the REF's
//      own 943 signature — the remediation's mobile proof); every other
//      pair must stay byte-stable on the LOC side (the fixes are inert at
//      390 on the other surfaces: payroll's row is hidden below md,
//      taskmanager's row is hidden below md, documenttracker's cluster
//      fits at 358). ----
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
await mobileRoutePair("/dashboard", "683-m-dashboard-390");
await mobileRoutePair("/payroll", "685-m-payroll-390");
await mobileRoutePair("/employees", "687-m-employees-390");
await mobileRoutePair("/attendance", "689-m-attendance-390");
await mobileRoutePair("/training", "691-m-training-390");
await mobileRoutePair("/recruitment", "693-m-recruitment-390");
await mobileRoutePair("/settings", "695-m-settings-390");

// ---- 697-709: THE FIRST TABLET-WIDTH (768x1024) per-side baselines for
//      the seven standing routes — the round's fresh-eyes angle, the
//      chained evidence byte-compared from r82 onward (the band where the
//      three defects lived; the post-fix tablet surface now renders
//      payroll/taskmanager/documenttracker BYTE-IDENTICAL overflows and
//      attendance's cluster-authored overflow converged 791→1231 toward
//      the REF's 1558 with the remainder data-authored). ----
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
await tabletRoutePair("/dashboard", "697-t-dashboard-768");
await tabletRoutePair("/payroll", "699-t-payroll-768");
await tabletRoutePair("/employees", "701-t-employees-768");
await tabletRoutePair("/attendance", "703-t-attendance-768");
await tabletRoutePair("/training", "705-t-training-768");
await tabletRoutePair("/recruitment", "707-t-recruitment-768");
await tabletRoutePair("/settings", "709-t-settings-768");

// ---- the byte-stability proofs vs the r80 set ----
const md5 = (f) => run(`md5sum ${shots}/${f}.png 2>/dev/null | awk '{print $1}'`).trim();
console.log("\n==== LOGIN-PAIR STABILITY (665 vs the r80 633 pair) ====");
console.log("loc 665:", md5("665-login-standing-loc"), "(r80 633: bd718ed052ff48124b11b8919c8b9b4d)", md5("665-login-standing-loc") === "bd718ed052ff48124b11b8919c8b9b4d" ? "STABLE" : "DRIFT");
console.log("ref 665:", md5("665-login-standing-ref"), "(r80 633: 69aa4241efa1a2b4994b698fc5cad2a4)", md5("665-login-standing-ref") === "69aa4241efa1a2b4994b698fc5cad2a4" ? "STABLE" : "DRIFT");
console.log("\n==== DRAWER-PAIR STABILITY (681 vs the r80 649 pair — the SEVENTEEN-round chain) ====");
console.log("loc 681:", md5("681-mobile-drawer-light-loc"), "(r80 649: e3df921135be28f60031af57d58df879)", md5("681-mobile-drawer-light-loc") === "e3df921135be28f60031af57d58df879" ? "STABLE" : "DRIFT");
console.log("ref 681:", md5("681-mobile-drawer-light-ref"), "(r80 649: bfaa0da55e77277d910bd13c25d4e618)", md5("681-mobile-drawer-light-ref") === "bfaa0da55e77277d910bd13c25d4e618" ? "STABLE" : "DRIFT");
console.log("\n==== ROUTE-PAIR STABILITY @1440 (the r81 set vs the r80 set, both sides — the fixes must be INERT at 1440) ====");
const routes = [["667-dashboard-light", "635-dashboard-light"], ["669-payroll-light", "637-payroll-light"], ["671-employees-light", "639-employees-light"], ["673-attendance-light", "641-attendance-light"], ["675-training-light", "643-training-light"], ["677-recruitment-light", "645-recruitment-light"], ["679-settings-light", "647-settings-light"]];
for (const [now, was] of routes) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("\n==== MOBILE-WIDTH RE-BASELINES (683-695 vs the r80 651-663 set — attendance-390-loc EXPECTED to drift by design) ====");
const mob = [["683-m-dashboard-390", "651-m-dashboard-390"], ["685-m-payroll-390", "653-m-payroll-390"], ["687-m-employees-390", "655-m-employees-390"], ["689-m-attendance-390", "657-m-attendance-390"], ["691-m-training-390", "659-m-training-390"], ["693-m-recruitment-390", "661-m-recruitment-390"], ["695-m-settings-390", "663-m-settings-390"]];
for (const [now, was] of mob) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("\n==== THE NEW tablet-width baselines (697-709, first capture — recorded for the r82+ chain) ====");
for (const n of ["697-t-dashboard-768", "699-t-payroll-768", "701-t-employees-768", "703-t-attendance-768", "705-t-training-768", "707-t-recruitment-768", "709-t-settings-768"]) {
  console.log(`${n}: loc ${md5(n + "-loc")} / ref ${md5(n + "-ref")}`);
}
console.log("done");
