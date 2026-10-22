#!/usr/bin/env node
// r75-screenshots.mjs — parity round 74's evidence captures. The round's
// theme: THE AUDIT-ONLY ROUND — both sides of the deploy watch QUIET
// (no 37th deploy: neither surface moved, so nothing to ladder, nothing
// to pin) + THE LIGHTHOUSE FIRST-PARTY AUDIT 100/100/100 on the login
// surface (Chrome's own Performance/Accessibility/Best-Practices
// verdicts on the standing logged-out page) + ZERO DEFECTS FOUND — the
// round's whole work product is the audit verdict, so the set's
// screenshots are the round's PROOF that the byte-stability chain
// continues: the mobile drawer must still BYTE-MATCH the r74 543 pair
// on BOTH sides (the ELEVEN-round chain
// new≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366) and the login pair
// must BYTE-MATCH the r74 527 pair on BOTH sides — the watch was quiet
// on both sides, so the fresh probe pair must stay ≡ the r74 527
// baselines (loc bd718ed0…/ref 69aa4241…). The set: the LOGIN page
// pair (the audit-quiet logged-out surface), the LIGHT standing route
// pairs on the unchanged build, the LIGHT mobile drawer pair @390, +
// the inline mobile-menu functional cycle (the standing user emphasis).
// Numbers continue from 545 (the r74 set ended at 543). Mechanism (the
// r71 lesson carried forward): the drawer opens via the accessible-name
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
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r75.log 2>&1 < /dev/null &`],
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
for (const s of [["ref75s", "https://eon.base44.app"], ["loc75s", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${s[0]} set viewport 1440 900`);
  run(`agent-browser --session ${s[0]} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref75s", "https://eon.base44.app", "ref"], ["loc75s", "http://127.0.0.1:3200", "loc"]];

// ---- 545: the LOGIN page pair @1440x900 (the standing logged-out
//      surface — this round documents the AUDIT-QUIET surface: no 37th
//      deploy on either side, the Lighthouse 100/100/100 first-party
//      audit on this very page, zero defects found) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `545-login-standing-${suffix}`);
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
await auth("ref75s", "https://eon.base44.app");
await auth("loc75s", "http://127.0.0.1:3200");

async function routePair(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 4600));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 547: the LIGHT dashboard pair (the standing surface) ----
await routePair("/dashboard", "547-dashboard-light");

// ---- 549: the LIGHT payroll pair (the padded-tile + scroll-band page) ----
await routePair("/payroll", "549-payroll-light");

// ---- 551: the LIGHT employees pair (the seeded-grid allowance family) ----
await routePair("/employees", "551-employees-light");

// ---- 553: the LIGHT attendance pair (the admin-superset family) ----
await routePair("/attendance", "553-attendance-light");

// ---- 555: the LIGHT training pair (the mobile-menu cycle's target) ----
await routePair("/training", "555-training-light");

// ---- 557: the LIGHT recruitment pair (the tabs-rhythm family) ----
await routePair("/recruitment", "557-recruitment-light");

// ---- 559: the LIGHT settings pair (the two-column tiles) ----
await routePair("/settings", "559-settings-light");

// ---- 561: the LIGHT mobile drawer pair @390x844 (the standing
//      byte-stability check vs the r74 543 pair — the ELEVEN-round
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
  cap(session, `561-mobile-drawer-light-${suffix}`);
}

// ---- the mobile-menu functional check (the standing user emphasis):
//      the open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc75s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc75s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc75s get url`).trim();
console.log("after training-lms click:", afterNav);
// the auto-close eval — the canonical wrapped IIFE form (the r70 lesson:
// no ambiguous bare-paren forms in template scripts).
const closedAfterNav = run(`agent-browser --session loc75s eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));

// ---- the byte-stability proofs: the 561 pair vs the r74 543 pair,
//      the 545 login pair vs the r74 527 pair, + the route pairs vs
//      the r74 set on disk ----
const md5 = (f) => run(`md5sum ${shots}/${f}.png 2>/dev/null | awk '{print $1}'`).trim();
console.log("\n==== BYTE-STABILITY (561 vs the r74 543 pair) ====");
console.log("loc 561:", md5("561-mobile-drawer-light-loc"), "(r74 543: e3df921135be28f60031af57d58df879)", md5("561-mobile-drawer-light-loc") === "e3df921135be28f60031af57d58df879" ? "STABLE" : "DRIFT");
console.log("ref 561:", md5("561-mobile-drawer-light-ref"), "(r74 543: bfaa0da55e77277d910bd13c25d4e618)", md5("561-mobile-drawer-light-ref") === "bfaa0da55e77277d910bd13c25d4e618" ? "STABLE" : "DRIFT");
console.log("\n==== LOGIN-PAIR STABILITY (545 vs the r74 527 pair) ====");
console.log("loc 545:", md5("545-login-standing-loc"), "(r74 527: bd718ed052ff48124b11b8919c8b9b4d)", md5("545-login-standing-loc") === "bd718ed052ff48124b11b8919c8b9b4d" ? "STABLE" : "DRIFT");
console.log("ref 545:", md5("545-login-standing-ref"), "(r74 527: 69aa4241efa1a2b4994b698fc5cad2a4)", md5("545-login-standing-ref") === "69aa4241efa1a2b4994b698fc5cad2a4" ? "STABLE" : "DRIFT");
console.log("\n==== ROUTE-PAIR STABILITY (the r75 set vs the r74 set, both sides) ====");
const routes = [["547-dashboard-light", "529-dashboard-light"], ["549-payroll-light", "531-payroll-light"], ["551-employees-light", "533-employees-light"], ["553-attendance-light", "535-attendance-light"], ["555-training-light", "537-training-light"], ["557-recruitment-light", "539-recruitment-light"], ["559-settings-light", "541-settings-light"]];
for (const [now, was] of routes) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("done");
