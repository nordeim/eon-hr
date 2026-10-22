#!/usr/bin/env node
// r77-screenshots.mjs — parity round 76's evidence captures. The round's
// theme: THE TRIPLE-DEPLOY ROUND — the 39TH login deploy (login JS
// index-CXV35yah→index-BOwtYlPm AND login CSS index-B9rzNd1e→index-DS1aCkan
// — the FIRST login-CSS movement since the 35th) + the 40TH (login JS
// index-BOwtYlPm→index-HY4zt1AJ mid-round, CSS quiet) — both LADDERED
// NON-VISUAL (the fresh login pair BYTE-IDENTICAL to the 69aa4241…
// baseline on the current (40th) generation + standing 5/5 + sweep 12/12 +
// verify-r49 13/13 + verify-r45 13/13; the CSS delta classified: 8 dead
// arbitrary-value utility rules removed (zero usages in the entry bundle
// or the rendered HTML) + 1 new unused grid utility added — a dead-code
// sweep, PNG-proven non-visual). The set's screenshots are the round's
// PROOF that the byte-stability chain continues past BOTH deploys: the
// mobile drawer must still BYTE-MATCH the r76 579 pair on BOTH sides (the
// THIRTEEN-round chain new≡579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366)
// and the login pair must BYTE-MATCH the r76 563 pair on BOTH sides (loc
// bd718ed0…/ref 69aa4241…). The set: the LOGIN page pair, the LIGHT
// standing route pairs, the LIGHT mobile drawer pair @390, + the inline
// mobile-menu functional cycle (the standing user emphasis). Numbers
// continue from 581 (the r76 set ended at 579). Mechanism (the r71
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
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r77.log 2>&1 < /dev/null &`],
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
for (const s of [["ref77s", "https://eon.base44.app"], ["loc77s", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${s[0]} set viewport 1440 900`);
  run(`agent-browser --session ${s[0]} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref77s", "https://eon.base44.app", "ref"], ["loc77s", "http://127.0.0.1:3200", "loc"]];

// ---- 581: the LOGIN page pair @1440x900 (the standing logged-out
//      surface — this round documents the TRIPLE-DEPLOY surface: the
//      39th (JS + CSS) + 40th (JS) login deploys both laddered
//      NON-VISUAL; this pair is the standing-set re-proof past both) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `581-login-standing-${suffix}`);
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
await auth("ref77s", "https://eon.base44.app");
await auth("loc77s", "http://127.0.0.1:3200");

async function routePair(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 4600));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 583: the LIGHT dashboard pair (the standing surface) ----
await routePair("/dashboard", "583-dashboard-light");

// ---- 585: the LIGHT payroll pair (the padded-tile + scroll-band page) ----
await routePair("/payroll", "585-payroll-light");

// ---- 587: the LIGHT employees pair (the seeded-grid allowance family) ----
await routePair("/employees", "587-employees-light");

// ---- 589: the LIGHT attendance pair (the admin-superset family) ----
await routePair("/attendance", "589-attendance-light");

// ---- 591: the LIGHT training pair (the mobile-menu cycle's target) ----
await routePair("/training", "591-training-light");

// ---- 593: the LIGHT recruitment pair (the tabs-rhythm family) ----
await routePair("/recruitment", "593-recruitment-light");

// ---- 595: the LIGHT settings pair (the two-column tiles) ----
await routePair("/settings", "595-settings-light");

// ---- 597: the LIGHT mobile drawer pair @390x844 (the standing
//      byte-stability check vs the r76 579 pair — the THIRTEEN-round
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
  cap(session, `597-mobile-drawer-light-${suffix}`);
}

// ---- the mobile-menu functional check (the standing user emphasis):
//      the open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc77s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc77s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc77s get url`).trim();
console.log("after training-lms click:", afterNav);
// the auto-close eval — the canonical wrapped IIFE form (the r70 lesson:
// no ambiguous bare-paren forms in template scripts).
const closedAfterNav = run(`agent-browser --session loc77s eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));

// ---- the byte-stability proofs: the 597 pair vs the r76 579 pair,
//      the 581 login pair vs the r76 563 pair, + the route pairs vs
//      the r76 set on disk ----
const md5 = (f) => run(`md5sum ${shots}/${f}.png 2>/dev/null | awk '{print $1}'`).trim();
console.log("\n==== BYTE-STABILITY (597 vs the r76 579 pair) ====");
console.log("loc 597:", md5("597-mobile-drawer-light-loc"), "(r76 579: e3df921135be28f60031af57d58df879)", md5("597-mobile-drawer-light-loc") === "e3df921135be28f60031af57d58df879" ? "STABLE" : "DRIFT");
console.log("ref 597:", md5("597-mobile-drawer-light-ref"), "(r76 579: bfaa0da55e77277d910bd13c25d4e618)", md5("597-mobile-drawer-light-ref") === "bfaa0da55e77277d910bd13c25d4e618" ? "STABLE" : "DRIFT");
console.log("\n==== LOGIN-PAIR STABILITY (581 vs the r76 563 pair) ====");
console.log("loc 581:", md5("581-login-standing-loc"), "(r76 563: bd718ed052ff48124b11b8919c8b9b4d)", md5("581-login-standing-loc") === "bd718ed052ff48124b11b8919c8b9b4d" ? "STABLE" : "DRIFT");
console.log("ref 581:", md5("581-login-standing-ref"), "(r76 563: 69aa4241efa1a2b4994b698fc5cad2a4)", md5("581-login-standing-ref") === "69aa4241efa1a2b4994b698fc5cad2a4" ? "STABLE" : "DRIFT");
console.log("\n==== ROUTE-PAIR STABILITY (the r77 set vs the r76 set, both sides) ====");
const routes = [["583-dashboard-light", "565-dashboard-light"], ["585-payroll-light", "567-payroll-light"], ["587-employees-light", "569-employees-light"], ["589-attendance-light", "571-attendance-light"], ["591-training-light", "573-training-light"], ["593-recruitment-light", "575-recruitment-light"], ["595-settings-light", "577-settings-light"]];
for (const [now, was] of routes) {
  console.log(`${now}: loc ${md5(now + "-loc") === md5(was + "-loc") ? "STABLE" : "DRIFT " + md5(now + "-loc") + " vs " + md5(was + "-loc")} / ref ${md5(now + "-ref") === md5(was + "-ref") ? "STABLE" : "DRIFT " + md5(now + "-ref") + " vs " + md5(was + "-ref")}`);
}
console.log("done");
