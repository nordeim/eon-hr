#!/usr/bin/env node
// r76-screenshots.mjs — parity round 75's evidence captures. The round's
// theme: THE DOUBLE-DEPLOY ROUND — the 37TH login deploy (login JS
// index-CiBFwtqW→index-BVGv30vf) AND the 38TH (a ~10-minute follow-up:
// index-BVGv30vf→index-CXV35yah, detected mid-round while diffing the
// 37th's bundle) — both LADDERED NON-VISUAL (the fresh login pair
// BYTE-IDENTICAL to the 69aa4241… baseline both times + standing 5/5 +
// sweep 12/12 + verify-r49 13/13 + verify-r45 13/13; the bundle
// forensics: pure chunk-graph rebuilds — ~840 chunk-hash refs churned
// in the dependency map, the entry bundle the same 97529 bytes, zero
// rendered delta). The set's screenshots are the round's PROOF that the
// byte-stability chain continues past BOTH deploys: the mobile drawer
// must still BYTE-MATCH the r75 561 pair on BOTH sides (the TWELVE-round
// chain new≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366) and the login
// pair must BYTE-MATCH the r75 545 pair on BOTH sides (loc
// bd718ed0…/ref 69aa4241…). The set: the LOGIN page pair, the LIGHT
// standing route pairs, the LIGHT mobile drawer pair @390, + the inline
// mobile-menu functional cycle (the standing user emphasis). Numbers
// continue from 563 (the r75 set ended at 561). Mechanism (the r71
// lesson carried forward): the drawer opens via the accessible-name
// SNAPSHOT ref (mouse-based) — the corrected mechanism that works on
// both sides.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
// NOTE: a persistent daemon may already be listening on :3200 (PID file
// /tmp/server-3200.pid, double-fork daemonizer) — the ss-based sweep
// below kills ANY :3200 listener (daemon or stray) and the detached
// respawn that follows is idempotent, so this boot is safe to re-run.
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
// The r69 lesson: spawn the server DETACHED (setsid) — a tool-timeout kill
// takes every non-detached child with it.
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r76.log 2>&1 < /dev/null &`],
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
for (const s of [["ref76s", "https://eon.base44.app"], ["loc76s", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${s[0]} set viewport 1440 900`);
  run(`agent-browser --session ${s[0]} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref76s", "https://eon.base44.app", "ref"], ["loc76s", "http://127.0.0.1:3200", "loc"]];

// ---- 563: the LOGIN page pair @1440x900 (the standing logged-out
//      surface — this round documents the DOUBLE-DEPLOY surface: the
//      37th + 38th login deploys both landed and both laddered
//      NON-VISUAL; this pair is the standing-set re-proof past both) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `563-login-standing-${suffix}`);
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
await auth("ref76s", "https://eon.base44.app");
await auth("loc76s", "http://127.0.0.1:3200");

async function routePair(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 4600));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 565: the LIGHT dashboard pair (the standing surface) ----
await routePair("/dashboard", "565-dashboard-light");

// ---- 567: the LIGHT payroll pair (the padded-tile + scroll-band page) ----
await routePair("/payroll", "567-payroll-light");

// ---- 569: the LIGHT employees pair (the seeded-grid allowance family) ----
await routePair("/employees", "569-employees-light");

// ---- 571: the LIGHT attendance pair (the admin-superset family) ----
await routePair("/attendance", "571-attendance-light");

// ---- 573: the LIGHT training pair (the mobile-menu cycle's target) ----
await routePair("/training", "573-training-light");

// ---- 575: the LIGHT recruitment pair (the tabs-rhythm family) ----
await routePair("/recruitment", "575-recruitment-light");

// ---- 577: the LIGHT settings pair (the two-column tiles) ----
await routePair("/settings", "577-settings-light");

// ---- 579: the LIGHT mobile drawer pair @390x844 (the standing
//      byte-stability check vs the r75 561 pair — the TWELVE-round
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
  cap(session, `579-mobile-drawer-light-${suffix}`);
}

// ---- the mobile-menu functional check (the standing user emphasis):
//      the open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc76s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc76s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc76s get url`).trim();
console.log("after training-lms click:", afterNav);
// the auto-close eval — the canonical wrapped IIFE form (the r70 lesson:
// no ambiguous bare-paren forms in template scripts).
const closedAfterNav = run(`agent-browser --session loc76s eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));

// ---- the byte-stability proofs: the 579 pair vs the r75 561 pair,
//      the 563 login pair vs the r75 545 pair, + the route pairs vs
//      the r75 set on disk ----
const md5 = (f) => run(`md5sum ${shots}/${f}.png 2>/dev/null | awk '{print $1}'`).trim();
console.log("\n==== BYTE-STABILITY (579 vs the r75 561 pair) ====");
console.log("loc 579:", md5("579-mobile-drawer-light-loc"), "(r75 561: e3df921135be28f60031af57d58df879)", md5("579-mobile-drawer-light-loc") === "e3df921135be28f60031af57d58df879" ? "STABLE" : "DRIFT");
console.log("ref 579:", md5("579-mobile-drawer-light-ref"), "(r75 561: bfaa0da55e77277d910bd13c25d4e618)", md5("579-mobile-drawer-light-ref") === "bfaa0da55e77277d910bd13c25d4e618" ? "STABLE" : "DRIFT");
console.log("\n==== LOGIN-PAIR STABILITY (563 vs the r75 545 pair) ====");
console.log("loc 563:", md5("563-login-standing-loc"), "(r75 545: bd718ed052ff48124b11b8919c8b9b4d)", md5("563-login-standing-loc") === "bd718ed052ff48124b11b8919c8b9b4d" ? "STABLE" : "DRIFT");
console.log("ref 563:", md5("563-login-standing-ref"), "(r75 545: 69aa4241efa1a2b4994b698fc5cad2a4)", md5("563-login-standing-ref") === "69aa4241efa1a2b4994b698fc5cad2a4" ? "STABLE" : "DRIFT");
console.log("\n==== ROUTE-PAIR STABILITY (the r76 set vs the r75 set, both sides) ====");
const routes = [["565-dashboard-light", "547-dashboard-light"], ["567-payroll-light", "549-payroll-light"], ["569-employees-light", "551-employees-light"], ["571-attendance-light", "553-attendance-light"], ["573-training-light", "555-training-light"], ["575-recruitment-light", "557-recruitment-light"], ["577-settings-light", "559-settings-light"]];
for (const [now, was] of routes) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("done");
