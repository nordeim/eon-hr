#!/usr/bin/env node
// r73-screenshots.mjs — parity round 72's evidence captures. The round's
// theme: THE SECURITY-ISOLATION RUNG (the transport-layer ladder's next
// step: COOP + CORP + COEP — the response-header trio, REF measured
// serving none) + THE PWA MANIFEST-LINKAGE COMPLETION (the authed-shell
// gap the r72 census mis-reported — the manifest link hoisted to the
// root layout, every page now carrying it). Both fix families live at
// the header/head layer — NON-VISUAL — so the set's byte-stability pair
// is the round's proof: the mobile drawer must still BYTE-MATCH the r72
// 509 pair on the LOC side (the NINE-round chain
// new≡509≡492≡474≡456≡438≡418≡402≡366) and the REF side must byte-match
// the corrected open-drawer baseline (bfaa0da…) — the 35th deploy was
// laddered NON-VISUAL this round (the login pair ≡ the r72 493 pair:
// 69aa4241… on the REF side). The set: the LOGIN page pair (the
// post-35th surface), the LIGHT standing route pairs on the patched
// build, the LIGHT mobile drawer pair @390, + the inline mobile-menu
// functional cycle (the standing user emphasis). Numbers continue from
// 510 (the r72 set ended at 509). Mechanism (the r71 lesson carried
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
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r73.log 2>&1 < /dev/null &`],
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
for (const s of [["ref73s", "https://eon.base44.app"], ["loc73s", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${s[0]} set viewport 1440 900`);
  run(`agent-browser --session ${s[0]} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref73s", "https://eon.base44.app", "ref"], ["loc73s", "http://127.0.0.1:3200", "loc"]];

// ---- 510/511: the LOGIN page pair @1440x900 (the standing logged-out
//      surface — this round documents the post-35th-deploy surface, the
//      ladder-audited NON-VISUAL state) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `510-login-standing-${suffix}`);
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
await auth("ref73s", "https://eon.base44.app");
await auth("loc73s", "http://127.0.0.1:3200");

async function routePair(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 4600));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 512/513: the LIGHT dashboard pair (the standing surface) ----
await routePair("/dashboard", "512-dashboard-light");

// ---- 514/515: the LIGHT payroll pair (the padded-tile + scroll-band page) ----
await routePair("/payroll", "514-payroll-light");

// ---- 516/517: the LIGHT employees pair (the seeded-grid allowance family) ----
await routePair("/employees", "516-employees-light");

// ---- 518/519: the LIGHT attendance pair (the admin-superset family) ----
await routePair("/attendance", "518-attendance-light");

// ---- 520/521: the LIGHT training pair (the mobile-menu cycle's target) ----
await routePair("/training", "520-training-light");

// ---- 522/523: the LIGHT recruitment pair (the tabs-rhythm family) ----
await routePair("/recruitment", "522-recruitment-light");

// ---- 524/525: the LIGHT settings pair (the two-column tiles) ----
await routePair("/settings", "524-settings-light");

// ---- 526: the LIGHT mobile drawer pair @390x844 (the standing
//      byte-stability check vs the r72 509 pair — the NINE-round chain).
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
  cap(session, `526-mobile-drawer-light-${suffix}`);
}

// ---- the mobile-menu functional check (the standing user emphasis):
//      the open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc73s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc73s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc73s get url`).trim();
console.log("after training-lms click:", afterNav);
// the auto-close eval — the canonical wrapped IIFE form (the r70 lesson:
// no ambiguous bare-paren forms in template scripts).
const closedAfterNav = run(`agent-browser --session loc73s eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));

// ---- the byte-stability proof: the 526 pair vs the r72 509 pair ----
const md5 = (f) => run(`md5sum ${shots}/${f}.png 2>/dev/null | awk '{print $1}'`).trim();
console.log("\n==== BYTE-STABILITY (526 vs the r72 509 pair) ====");
console.log("loc 526:", md5("526-mobile-drawer-light-loc"), "(r72 509: e3df921135be28f60031af57d58df879)");
console.log("ref 526:", md5("526-mobile-drawer-light-ref"), "(r72 509: bfaa0da55e77277d910bd13c25d4e618)");
console.log("\n==== LOGIN-PAIR STABILITY (510 vs the r72 493 pair) ====");
console.log("loc 510:", md5("510-login-standing-loc"), "(r72 493: bd718ed052ff48124b11b8919c8b9b4d)");
console.log("ref 510:", md5("510-login-standing-ref"), "(r72 493: 69aa4241efa1a2b4994b698fc5cad2a4)");
console.log("done");
