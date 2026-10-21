#!/usr/bin/env node
// r72-screenshots.mjs — parity round 71's evidence captures. The round's
// theme: THE TRUSTED-TYPES RUNG (the CSP strictness ladder's next step:
// trusted-types default + require-trusted-types-for 'script' + the nonced
// pass-through default-policy bootstrap) + THE PWA/OFFLINE STORY (the
// service worker + the offline fallback — REF measured with ZERO service
// workers). Both fix families live at the script/policy layer — the new
// <head> boots are non-visual — so the set's byte-stability pair is the
// round's proof: the mobile drawer must still BYTE-MATCH the r71 492 pair
// on the LOC side (the EIGHT-round chain new≡492≡474≡456≡438≡418≡402≡366)
// and the REF side must byte-match the corrected open-drawer baseline
// (bfaa0da…) — the 34th deploy was login-JS-only, the app surface quiet.
// The r72 deploy watch detected the 34TH LOGIN DEPLOY (JS
// BCr9BMlh→DOgRuj38) and the full ladder audited it NON-VISUAL — the
// login pair this round documents the post-34th surface. The set: the
// LOGIN page pair, the LIGHT standing route pairs on the patched build,
// the LIGHT mobile drawer pair @390, + the inline mobile-menu functional
// cycle (the standing user emphasis). Numbers continue from 493 (the r71
// set ended at 492). Mechanism (the r71 lesson carried forward): the
// drawer opens via the accessible-name SNAPSHOT ref (mouse-based) — the
// corrected mechanism that works on both sides.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
// The r69 lesson: spawn the server DETACHED (setsid) — a tool-timeout kill
// takes every non-detached child with it.
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r72.log 2>&1 < /dev/null &`],
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
for (const s of [["ref72s", "https://eon.base44.app"], ["loc72s", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${s[0]} set viewport 1440 900`);
  run(`agent-browser --session ${s[0]} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref72s", "https://eon.base44.app", "ref"], ["loc72s", "http://127.0.0.1:3200", "loc"]];

// ---- 493/494: the LOGIN page pair @1440x900 (the standing logged-out
//      surface — this round documents the post-34th-deploy surface, the
//      ladder-audited NON-VISUAL state) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `493-login-standing-${suffix}`);
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
await auth("ref72s", "https://eon.base44.app");
await auth("loc72s", "http://127.0.0.1:3200");

async function routePair(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 4600));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 495/496: the LIGHT dashboard pair (the standing surface) ----
await routePair("/dashboard", "495-dashboard-light");

// ---- 497/498: the LIGHT payroll pair (the padded-tile + scroll-band page) ----
await routePair("/payroll", "497-payroll-light");

// ---- 499/500: the LIGHT employees pair (the seeded-grid allowance family) ----
await routePair("/employees", "499-employees-light");

// ---- 501/502: the LIGHT attendance pair (the admin-superset family) ----
await routePair("/attendance", "501-attendance-light");

// ---- 503/504: the LIGHT training pair (the mobile-menu cycle's target) ----
await routePair("/training", "503-training-light");

// ---- 505/506: the LIGHT recruitment pair (the tabs-rhythm family) ----
await routePair("/recruitment", "505-recruitment-light");

// ---- 507/508: the LIGHT settings pair (the two-column tiles) ----
await routePair("/settings", "507-settings-light");

// ---- 509: the LIGHT mobile drawer pair @390x844 (the standing
//      byte-stability check vs the r71 492 pair — the EIGHT-round chain).
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
  cap(session, `509-mobile-drawer-light-${suffix}`);
}

// ---- the mobile-menu functional check (the standing user emphasis):
//      the open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc72s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc72s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc72s get url`).trim();
console.log("after training-lms click:", afterNav);
// the auto-close eval — the canonical wrapped IIFE form (the r70 lesson:
// no ambiguous bare-paren forms in template scripts).
const closedAfterNav = run(`agent-browser --session loc72s eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));

// ---- the byte-stability proof: the 509 pair vs the r71 492 pair ----
const md5 = (f) => run(`md5sum ${shots}/${f}.png 2>/dev/null | awk '{print $1}'`).trim();
console.log("\n==== BYTE-STABILITY (509 vs the r71 492 pair) ====");
console.log("loc 509:", md5("509-mobile-drawer-light-loc"), "(r71 492: e3df921135be28f60031af57d58df879)");
console.log("ref 509:", md5("509-mobile-drawer-light-ref"), "(r71 492: bfaa0da55e77277d910bd13c25d4e618)");
console.log("done");
