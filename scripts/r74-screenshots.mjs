#!/usr/bin/env node
// r74-screenshots.mjs — parity round 73's evidence captures. The round's
// theme: THE PWA INSTALLABILITY END-TO-END PASS (Chrome's own
// zero-errors verdict on both surfaces, pinned executable — the
// candor-ordered candidate measured TRUE before the pin) + THE SW
// CACHE-LIFECYCLE HARDENING (the found-and-fixed audit gap: the
// un-bumped generation freezing the precached shell at r72 bytes for
// every existing client + the unbounded chunk accumulation — the
// generation mechanism + the stable chunk cache + the bound). Both fix
// families live at the head/worker/test layer — NON-VISUAL — so the
// set's byte-stability pair is the round's proof: the mobile drawer
// must still BYTE-MATCH the r73 526 pair on BOTH sides (the TEN-round
// chain new≡526≡509≡492≡474≡456≡438≡418≡402≡366) and the login pair
// must BYTE-MATCH the r73 510 pair on BOTH sides — the 36th deploy was
// laddered NON-VISUAL this round (the fresh probe pair ≡ the r73 510
// REF baseline: 69aa4241…). The set: the LOGIN page pair (the
// post-36th surface), the LIGHT standing route pairs on the patched
// build, the LIGHT mobile drawer pair @390, + the inline mobile-menu
// functional cycle (the standing user emphasis). Numbers continue from
// 527 (the r73 set ended at 526). Mechanism (the r71 lesson carried
// forward): the drawer opens via the accessible-name SNAPSHOT ref
// (mouse-based) — the corrected mechanism that works on both sides.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
// The r69 lesson: spawn the server DETACHED (setsid) — a tool-timeout kill
// takes every non-detached child with it.
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r74.log 2>&1 < /dev/null &`],
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
for (const s of [["ref74s", "https://eon.base44.app"], ["loc74s", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${s[0]} set viewport 1440 900`);
  run(`agent-browser --session ${s[0]} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref74s", "https://eon.base44.app", "ref"], ["loc74s", "http://127.0.0.1:3200", "loc"]];

// ---- 527: the LOGIN page pair @1440x900 (the standing logged-out
//      surface — this round documents the post-36th-deploy surface, the
//      ladder-audited NON-VISUAL state) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `527-login-standing-${suffix}`);
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
await auth("ref74s", "https://eon.base44.app");
await auth("loc74s", "http://127.0.0.1:3200");

async function routePair(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 4600));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 529: the LIGHT dashboard pair (the standing surface) ----
await routePair("/dashboard", "529-dashboard-light");

// ---- 531: the LIGHT payroll pair (the padded-tile + scroll-band page) ----
await routePair("/payroll", "531-payroll-light");

// ---- 533: the LIGHT employees pair (the seeded-grid allowance family) ----
await routePair("/employees", "533-employees-light");

// ---- 535: the LIGHT attendance pair (the admin-superset family) ----
await routePair("/attendance", "535-attendance-light");

// ---- 537: the LIGHT training pair (the mobile-menu cycle's target) ----
await routePair("/training", "537-training-light");

// ---- 539: the LIGHT recruitment pair (the tabs-rhythm family) ----
await routePair("/recruitment", "539-recruitment-light");

// ---- 541: the LIGHT settings pair (the two-column tiles) ----
await routePair("/settings", "541-settings-light");

// ---- 543: the LIGHT mobile drawer pair @390x844 (the standing
//      byte-stability check vs the r73 526 pair — the TEN-round chain).
//      The CORRECTED MECHANISM (the r71 instrument lesson): click via
//      the accessible-name SNAPSHOT ref (mouse-based) — works on both
//      sides; the mouse open avoids the programmatic-open focus ring
//      state; the REF side stays the corrected open-drawer baseline. ----
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
  cap(session, `543-mobile-drawer-light-${suffix}`);
}

// ---- the mobile-menu functional check (the standing user emphasis):
//      the open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc74s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc74s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc74s get url`).trim();
console.log("after training-lms click:", afterNav);
// the auto-close eval — the canonical wrapped IIFE form (the r70 lesson:
// no ambiguous bare-paren forms in template scripts).
const closedAfterNav = run(`agent-browser --session loc74s eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));

// ---- the byte-stability proofs: the 543 pair vs the r73 526 pair,
//      the 527 login pair vs the r73 510 pair, + the route pairs vs
//      the r73 set ----
const md5 = (f) => run(`md5sum ${shots}/${f}.png 2>/dev/null | awk '{print $1}'`).trim();
console.log("\n==== BYTE-STABILITY (543 vs the r73 526 pair) ====");
console.log("loc 543:", md5("543-mobile-drawer-light-loc"), "(r73 526: e3df921135be28f60031af57d58df879)");
console.log("ref 543:", md5("543-mobile-drawer-light-ref"), "(r73 526: bfaa0da55e77277d910bd13c25d4e618)");
console.log("\n==== LOGIN-PAIR STABILITY (527 vs the r73 510 pair) ====");
console.log("loc 527:", md5("527-login-standing-loc"), "(r73 510: bd718ed052ff48124b11b8919c8b9b4d)");
console.log("ref 527:", md5("527-login-standing-ref"), "(r73 510: 69aa4241efa1a2b4994b698fc5cad2a4)");
console.log("\n==== ROUTE-PAIR STABILITY (the r74 set vs the r73 set, both sides) ====");
const routes = [["529-dashboard-light", "512-dashboard-light"], ["531-payroll-light", "514-payroll-light"], ["533-employees-light", "516-employees-light"], ["535-attendance-light", "518-attendance-light"], ["537-training-light", "520-training-light"], ["539-recruitment-light", "522-recruitment-light"], ["541-settings-light", "524-settings-light"]];
for (const [now, was] of routes) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("done");
