#!/usr/bin/env node
// r80-screenshots.mjs — parity round 79's evidence captures. The round's
// theme: THE SEVENTH-CSS-MOVEMENT GENERATION + THE MOBILE VIEWPORT MATRIX.
// The deploy watch read the login side at a NEW generation past the
// r79-armed post-48th finals (login JS index-DhIwzCCd→index-BSFaMTna AND
// login CSS index-DbFNLHjM→index-8FhcPnw7 — the SEVENTH login-CSS
// movement of the cadence era; the app side QUIET C-IrDy5f/BGNH4KkS) —
// LADDERED NON-VISUAL on this generation (the fresh login pair
// BYTE-IDENTICAL to the 69aa4241… baseline + standing 5/5 + sweep 12/12 +
// verify-r49 13/13 + verify-r45 13/13) with the CSS delta classified as
// DESIGN-SYSTEM STAGING (+983 B net: 1 removed / 9 added — the
// .sm:right-3 swept, the me-1 / max-w-[1312px] / align-[-0.125em] /
// mix-blend-color / two transition-[…] customs /
// supports-[align-items:safe_flex-end] / dark:bg-red-600 /
// motion-reduce:[*]:!translate-x-0 utilities staged; the PRECISE
// full-name sweep found ZERO usages). The round's fresh-eyes instrument —
// THE MOBILE VIEWPORT MATRIX (r80-viewport-matrix + -detail +
// -careers-detail) — proved the 390x844 surface parity-locked across the
// 12-route sweep set (every raw FIND classified: five REF-authored
// overflows + the /careers data-authored divergence, PROVEN by seeding
// the REF's widest chip and reproducing its exact 570/602/overflow
// signature on the LOC; zero clone-authored mobile-width defects).
// THIS SET's PROOFS: the mobile drawer must still BYTE-MATCH the r79 632
// pair on BOTH sides (the SIXTEEN-round chain
// new≡632≡615≡597≡579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366),
// the login pair must BYTE-MATCH the r79 616 pair on BOTH sides (loc
// bd718ed0…/ref 69aa4241…), and the seven standing route pairs must stay
// BYTE-STABLE vs the r79 set. NEW: the FIRST mobile-width (390x844)
// per-side baselines for the seven standing routes (651-663) — the
// fresh-eyes angle's chained evidence, to be re-compared from r81 onward.
// + the inline mobile-menu functional cycle (the standing user emphasis).
// Numbers continue from 633 (the r79 set ended at 632). Mechanism (the
// r71 lesson): the drawer opens via the accessible-name SNAPSHOT ref.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
// NOTE: a persistent daemon may already be listening on :3200 — the
// ss-based sweep below kills ANY :3200 listener and the detached respawn
// that follows is idempotent, so this boot is safe to re-run.
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
// The r69 lesson: spawn the server DETACHED (setsid).
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r80.log 2>&1 < /dev/null &`],
  { stdio: "ignore", detached: true });
server.unref();
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200");

// fresh sessions (the r63 stale-viewport lesson), armed LIGHT
run(`agent-browser close --all 2>/dev/null; true`);
for (const s of ["ref80s", "loc80s"]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref80s", "https://eon.base44.app", "ref"], ["loc80s", "http://127.0.0.1:3200", "loc"]];

// ---- 633: the LOGIN page pair @1440x900 (the standing logged-out
//      surface — this round documents the seventh-CSS-movement surface) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `633-login-standing-${suffix}`);
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
await auth("ref80s", "https://eon.base44.app");
await auth("loc80s", "http://127.0.0.1:3200");

async function routePair(route, name, settle = 4600) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, settle));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 635-647: the LIGHT standing route pairs @1440x900 ----
await routePair("/dashboard", "635-dashboard-light");
await routePair("/payroll", "637-payroll-light");
await routePair("/employees", "639-employees-light");
await routePair("/attendance", "641-attendance-light");
await routePair("/training", "643-training-light");
await routePair("/recruitment", "645-recruitment-light");
await routePair("/settings", "647-settings-light");

// ---- 649: the LIGHT mobile drawer pair @390x844 (the standing
//      byte-stability check vs the r79 632 pair — the SIXTEEN-round
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
  cap(session, `649-mobile-drawer-light-${suffix}`);
}

// ---- the mobile-menu functional check (the standing user emphasis):
//      the open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc80s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc80s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc80s get url`).trim();
console.log("after training-lms click:", afterNav);
const closedAfterNav = run(`agent-browser --session loc80s eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));

// ---- 651-663: THE FIRST mobile-width (390x844) per-side baselines for
//      the seven standing routes — the fresh-eyes angle's chained
//      evidence (byte-compared from r81 onward). The LOC renders its
//      zero-state/seeded content; the REF renders its production content
//      (the documented data-authored deltas — these are PER-SIDE
//      baselines, exactly like every other pair in the program). ----
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
await mobileRoutePair("/dashboard", "651-m-dashboard-390");
await mobileRoutePair("/payroll", "653-m-payroll-390");
await mobileRoutePair("/employees", "655-m-employees-390");
await mobileRoutePair("/attendance", "657-m-attendance-390");
await mobileRoutePair("/training", "659-m-training-390");
await mobileRoutePair("/recruitment", "661-m-recruitment-390");
await mobileRoutePair("/settings", "663-m-settings-390");

// ---- the byte-stability proofs vs the r79 set ----
const md5 = (f) => run(`md5sum ${shots}/${f}.png 2>/dev/null | awk '{print $1}'`).trim();
console.log("\n==== BYTE-STABILITY (649 vs the r79 632 pair) ====");
console.log("loc 649:", md5("649-mobile-drawer-light-loc"), "(r79 632: e3df921135be28f60031af57d58df879)", md5("649-mobile-drawer-light-loc") === "e3df921135be28f60031af57d58df879" ? "STABLE" : "DRIFT");
console.log("ref 649:", md5("649-mobile-drawer-light-ref"), "(r79 632: bfaa0da55e77277d910bd13c25d4e618)", md5("649-mobile-drawer-light-ref") === "bfaa0da55e77277d910bd13c25d4e618" ? "STABLE" : "DRIFT");
console.log("\n==== LOGIN-PAIR STABILITY (633 vs the r79 616 pair) ====");
console.log("loc 633:", md5("633-login-standing-loc"), "(r79 616: bd718ed052ff48124b11b8919c8b9b4d)", md5("633-login-standing-loc") === "bd718ed052ff48124b11b8919c8b9b4d" ? "STABLE" : "DRIFT");
console.log("ref 633:", md5("633-login-standing-ref"), "(r79 616: 69aa4241efa1a2b4994b698fc5cad2a4)", md5("633-login-standing-ref") === "69aa4241efa1a2b4994b698fc5cad2a4" ? "STABLE" : "DRIFT");
console.log("\n==== ROUTE-PAIR STABILITY (the r80 set vs the r79 set, both sides) ====");
const routes = [["635-dashboard-light", "618-dashboard-light"], ["637-payroll-light", "620-payroll-light"], ["639-employees-light", "622-employees-light"], ["641-attendance-light", "624-attendance-light"], ["643-training-light", "626-training-light"], ["645-recruitment-light", "628-recruitment-light"], ["647-settings-light", "630-settings-light"]];
for (const [now, was] of routes) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("\n==== THE NEW mobile-width baselines (651-663, first capture — recorded for the r81+ chain) ====");
for (const n of ["651-m-dashboard-390", "653-m-payroll-390", "655-m-employees-390", "657-m-attendance-390", "659-m-training-390", "661-m-recruitment-390", "663-m-settings-390"]) {
  console.log(`${n}: loc ${md5(n + "-loc")} / ref ${md5(n + "-ref")}`);
}
console.log("done");
