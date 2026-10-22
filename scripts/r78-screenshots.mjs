#!/usr/bin/env node
// r78-screenshots.mjs — parity round 77's evidence captures. The round's
// theme: THE MID-CRASH GENERATION LINE — the deploy watch read the login
// side at a NEW generation past the r77-armed post-40th finals (login JS
// index-HY4zt1AJ→…→index-tq_Kql0L AND login CSS index-DS1aCkan→
// index-IXVC2MOA via the intermediate wkqf_TRn — the second login-CSS
// movement since the 35th; the app side QUIET C-IrDy5f/BGNH4KkS) —
// LADDERED NON-VISUAL on the current generation (the fresh login pair
// BYTE-IDENTICAL to the 69aa4241… baseline + standing 5/5 + sweep 12/12
// + verify-r49 13/13 + verify-r45 13/13) with the CSS delta classified
// as a PLATFORM DESIGN-SYSTEM LIBRARY UPDATE (+6 dark-theme tokens: the
// card-title typography + the sky-badge palette; 4 dead utilities swept
// including the 39th's own 11rem grid; 11 new utilities added — zero
// usages on the login surface, PNG-proven). The set's screenshots are
// the round's PROOF that the byte-stability chain continues past the
// whole deploy line: the mobile drawer must still BYTE-MATCH the r77
// 597 pair on BOTH sides (the FOURTEEN-round chain
// new≡597≡579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366) and the
// login pair must BYTE-MATCH the r77 581 pair on BOTH sides (loc
// bd718ed0…/ref 69aa4241…). The set: the LOGIN page pair, the LIGHT
// standing route pairs, the LIGHT mobile drawer pair @390, + the inline
// mobile-menu functional cycle (the standing user emphasis). Numbers
// continue from 599 (the r77 set ended at 597). Mechanism (the r71
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
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r78.log 2>&1 < /dev/null &`],
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
for (const s of [["ref78s", "https://eon.base44.app"], ["loc78s", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${s[0]} set viewport 1440 900`);
  run(`agent-browser --session ${s[0]} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref78s", "https://eon.base44.app", "ref"], ["loc78s", "http://127.0.0.1:3200", "loc"]];

// ---- 599: the LOGIN page pair @1440x900 (the standing logged-out
//      surface — this round documents the deploy-line surface: the login
//      JS+CSS generations both moved past the r77 finals; this pair is
//      the standing-set re-proof past the whole line) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `599-login-standing-${suffix}`);
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
await auth("ref78s", "https://eon.base44.app");
await auth("loc78s", "http://127.0.0.1:3200");

async function routePair(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 4600));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 601: the LIGHT dashboard pair (the standing surface) ----
await routePair("/dashboard", "601-dashboard-light");

// ---- 603: the LIGHT payroll pair (the padded-tile + scroll-band page) ----
await routePair("/payroll", "603-payroll-light");

// ---- 605: the LIGHT employees pair (the seeded-grid allowance family) ----
await routePair("/employees", "605-employees-light");

// ---- 607: the LIGHT attendance pair (the admin-superset family) ----
await routePair("/attendance", "607-attendance-light");

// ---- 609: the LIGHT training pair (the mobile-menu cycle's target) ----
await routePair("/training", "609-training-light");

// ---- 611: the LIGHT recruitment pair (the tabs-rhythm family) ----
await routePair("/recruitment", "611-recruitment-light");

// ---- 613: the LIGHT settings pair (the two-column tiles) ----
await routePair("/settings", "613-settings-light");

// ---- 615: the LIGHT mobile drawer pair @390x844 (the standing
//      byte-stability check vs the r77 597 pair — the FOURTEEN-round
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
  cap(session, `615-mobile-drawer-light-${suffix}`);
}

// ---- the mobile-menu functional check (the standing user emphasis):
//      the open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc78s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc78s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc78s get url`).trim();
console.log("after training-lms click:", afterNav);
// the auto-close eval — the canonical wrapped IIFE form (the r70 lesson:
// no ambiguous bare-paren forms in template scripts).
const closedAfterNav = run(`agent-browser --session loc78s eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));

// ---- the byte-stability proofs: the 615 pair vs the r77 597 pair,
//      the 599 login pair vs the r77 581 pair, + the route pairs vs
//      the r77 set on disk ----
const md5 = (f) => run(`md5sum ${shots}/${f}.png 2>/dev/null | awk '{print $1}'`).trim();
console.log("\n==== BYTE-STABILITY (615 vs the r77 597 pair) ====");
console.log("loc 615:", md5("615-mobile-drawer-light-loc"), "(r77 597: e3df921135be28f60031af57d58df879)", md5("615-mobile-drawer-light-loc") === "e3df921135be28f60031af57d58df879" ? "STABLE" : "DRIFT");
console.log("ref 615:", md5("615-mobile-drawer-light-ref"), "(r77 597: bfaa0da55e77277d910bd13c25d4e618)", md5("615-mobile-drawer-light-ref") === "bfaa0da55e77277d910bd13c25d4e618" ? "STABLE" : "DRIFT");
console.log("\n==== LOGIN-PAIR STABILITY (599 vs the r77 581 pair) ====");
console.log("loc 599:", md5("599-login-standing-loc"), "(r77 581: bd718ed052ff48124b11b8919c8b9b4d)", md5("599-login-standing-loc") === "bd718ed052ff48124b11b8919c8b9b4d" ? "STABLE" : "DRIFT");
console.log("ref 599:", md5("599-login-standing-ref"), "(r77 581: 69aa4241efa1a2b4994b698fc5cad2a4)", md5("599-login-standing-ref") === "69aa4241efa1a2b4994b698fc5cad2a4" ? "STABLE" : "DRIFT");
console.log("\n==== ROUTE-PAIR STABILITY (the r78 set vs the r77 set, both sides) ====");
const routes = [["601-dashboard-light", "583-dashboard-light"], ["603-payroll-light", "585-payroll-light"], ["605-employees-light", "587-employees-light"], ["607-attendance-light", "589-attendance-light"], ["609-training-light", "591-training-light"], ["611-recruitment-light", "593-recruitment-light"], ["613-settings-light", "595-settings-light"]];
for (const [now, was] of routes) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("done");
