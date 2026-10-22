#!/usr/bin/env node
// r79-screenshots.mjs — parity round 78's evidence captures. The round's
// theme: THE FIFTH-CSS-MOVEMENT GENERATION — the deploy watch read the
// login side at a NEW generation past the r78-armed post-45th finals
// (login JS index-t01Y3EV6→index-Cyrjqt_z AND login CSS
// index-o5aKXf2B→index-C36NwD0S — the FIFTH login-CSS movement of the
// cadence era; the app side QUIET C-IrDy5f/BGNH4KkS) — LADDERED
// NON-VISUAL on the current generation (the fresh login pair
// BYTE-IDENTICAL to the 69aa4241… baseline + standing 5/5 + sweep 12/12
// + verify-r49 13/13 + verify-r45 13/13) with the CSS delta classified
// as DESIGN-SYSTEM STAGING (+326 B net: 0 removed / 2 added — the dead
// .bg-[#f1f3f4] + .shadow-[0_1px_3px_rgba(15,23,42,0.12)] utilities,
// zero usages, PNG-proven). The round also ships the program's FIRST
// ACCESSIBILITY CENSUS (61 routes — the WCAG-AA declarative-signal
// walk; every finding classified REF-authored parity, zero clone-
// authored defects). The set's screenshots are the round's PROOF that
// the byte-stability chain continues past the fifth CSS movement: the
// mobile drawer must still BYTE-MATCH the r78 615 pair on BOTH sides
// (the FIFTEEN-round chain
// new≡615≡597≡579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366) and
// the login pair must BYTE-MATCH the r78 599 pair on BOTH sides (loc
// bd718ed0…/ref 69aa4241…). The set: the LOGIN page pair, the LIGHT
// standing route pairs, the LIGHT mobile drawer pair @390, + the inline
// mobile-menu functional cycle (the standing user emphasis). Numbers
// continue from 616 (the r78 set ended at 615). Mechanism (the r71
// lesson carried forward): the drawer opens via the accessible-name
// SNAPSHOT ref (mouse-based) — the corrected mechanism that works on
// both sides.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
// NOTE: a persistent daemon may already be listening on :3200 — the
// ss-based sweep below kills ANY :3200 listener (daemon or stray) and the
// detached respawn that follows is idempotent, so this boot is safe to
// re-run.
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
// The r69 lesson: spawn the server DETACHED (setsid) — a tool-timeout kill
// takes every non-detached child with it.
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r79.log 2>&1 < /dev/null &`],
  { stdio: "ignore", detached: true });
server.unref();
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200");

// fresh sessions (the r63 stale-viewport lesson), armed LIGHT (the class
// applies pre-paint on the NEXT navigation — the boot script).
run(`agent-browser close --all 2>/dev/null; true`);
for (const s of [["ref79s", "https://eon.base44.app"], ["loc79s", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${s[0]} set viewport 1440 900`);
  run(`agent-browser --session ${s[0]} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref79s", "https://eon.base44.app", "ref"], ["loc79s", "http://127.0.0.1:3200", "loc"]];

// ---- 616: the LOGIN page pair @1440x900 (the standing logged-out
//      surface — this round documents the fifth-CSS-movement surface:
//      the login JS+CSS generations both moved past the r78 finals;
//      this pair is the standing-set re-proof past the whole line) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `616-login-standing-${suffix}`);
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
await auth("ref79s", "https://eon.base44.app");
await auth("loc79s", "http://127.0.0.1:3200");

async function routePair(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 4600));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 618: the LIGHT dashboard pair (the standing surface) ----
await routePair("/dashboard", "618-dashboard-light");

// ---- 620: the LIGHT payroll pair (the padded-tile + scroll-band page) ----
await routePair("/payroll", "620-payroll-light");

// ---- 622: the LIGHT employees pair (the seeded-grid allowance family) ----
await routePair("/employees", "622-employees-light");

// ---- 624: the LIGHT attendance pair (the admin-superset family) ----
await routePair("/attendance", "624-attendance-light");

// ---- 626: the LIGHT training pair (the mobile-menu cycle's target) ----
await routePair("/training", "626-training-light");

// ---- 628: the LIGHT recruitment pair (the tabs-rhythm family) ----
await routePair("/recruitment", "628-recruitment-light");

// ---- 630: the LIGHT settings pair (the two-column tiles) ----
await routePair("/settings", "630-settings-light");

// ---- 632: the LIGHT mobile drawer pair @390x844 (the standing
//      byte-stability check vs the r78 615 pair — the FIFTEEN-round
//      chain). The CORRECTED MECHANISM (the r71 instrument lesson):
//      click via the accessible-name SNAPSHOT ref (mouse-based) — works
//      on both sides; the mouse open avoids the programmatic-open focus
//      ring state; the REF side stays the corrected open-drawer
//      baseline. ----
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
  cap(session, `632-mobile-drawer-light-${suffix}`);
}

// ---- the mobile-menu functional check (the standing user emphasis):
//      the open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc79s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc79s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc79s get url`).trim();
console.log("after training-lms click:", afterNav);
// the auto-close eval — the canonical wrapped IIFE form (the r70 lesson:
// no ambiguous bare-paren forms in template scripts).
const closedAfterNav = run(`agent-browser --session loc79s eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));

// ---- the byte-stability proofs: the 632 pair vs the r78 615 pair,
//      the 616 login pair vs the r78 599 pair, + the route pairs vs
//      the r78 set on disk ----
const md5 = (f) => run(`md5sum ${shots}/${f}.png 2>/dev/null | awk '{print $1}'`).trim();
console.log("\n==== BYTE-STABILITY (632 vs the r78 615 pair) ====");
console.log("loc 632:", md5("632-mobile-drawer-light-loc"), "(r78 615: e3df921135be28f60031af57d58df879)", md5("632-mobile-drawer-light-loc") === "e3df921135be28f60031af57d58df879" ? "STABLE" : "DRIFT");
console.log("ref 632:", md5("632-mobile-drawer-light-ref"), "(r78 615: bfaa0da55e77277d910bd13c25d4e618)", md5("632-mobile-drawer-light-ref") === "bfaa0da55e77277d910bd13c25d4e618" ? "STABLE" : "DRIFT");
console.log("\n==== LOGIN-PAIR STABILITY (616 vs the r78 599 pair) ====");
console.log("loc 616:", md5("616-login-standing-loc"), "(r78 599: bd718ed052ff48124b11b8919c8b9b4d)", md5("616-login-standing-loc") === "bd718ed052ff48124b11b8919c8b9b4d" ? "STABLE" : "DRIFT");
console.log("ref 616:", md5("616-login-standing-ref"), "(r78 599: 69aa4241efa1a2b4994b698fc5cad2a4)", md5("616-login-standing-ref") === "69aa4241efa1a2b4994b698fc5cad2a4" ? "STABLE" : "DRIFT");
console.log("\n==== ROUTE-PAIR STABILITY (the r79 set vs the r78 set, both sides) ====");
const routes = [["618-dashboard-light", "601-dashboard-light"], ["620-payroll-light", "603-payroll-light"], ["622-employees-light", "605-employees-light"], ["624-attendance-light", "607-attendance-light"], ["626-training-light", "609-training-light"], ["628-recruitment-light", "611-recruitment-light"], ["630-settings-light", "613-settings-light"]];
for (const [now, was] of routes) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("done");
