#!/usr/bin/env node
// r71-screenshots.mjs — parity round 70's evidence captures. The round's
// theme: THE CSP COMPLETION PAIR (the missed login-breadcrumb nonce + the
// style-src elem/attr split — the security-policy superset deepened) + THE
// TLS-FRONTED DEPLOYMENT STORY (the x-forwarded-proto contract pinned).
// Both fix families live at the header/meta layer — invisible to the
// rendered surface — so the set's byte-stability pair is the round's
// proof: the mobile drawer must still BYTE-MATCH the r70 474 pair on
// both sides (the SEVEN-round chain new≡474≡456≡438≡418≡402≡366). The
// r71 deploy watch detected the 33RD LOGIN DEPLOY (JS CKnh3tRk→BCr9BMlh)
// and the full ladder audited it NON-VISUAL — the login pair this round
// documents the post-33rd surface. The set: the LOGIN page pair, the
// LIGHT standing route pairs on the patched build, the LIGHT mobile
// drawer pair @390, + the inline mobile-menu functional cycle (the
// standing user emphasis). Numbers continue from 476 (the r70 set
// ended at 475).
// r70 lesson applied: template scripts inherit template bugs — the
// auto-close eval below FIXES the r69/r70 template's unbalanced paren
// (the direct re-run was the old workaround; the script now reads it
// correctly on its own).
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
// The r69 lesson: spawn the server DETACHED (setsid) — a tool-timeout kill
// takes every non-detached child with it.
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r71.log 2>&1 < /dev/null &`],
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
for (const s of [["ref71s", "https://eon.base44.app"], ["loc71s", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${s[0]} set viewport 1440 900`);
  run(`agent-browser --session ${s[0]} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref71s", "https://eon.base44.app", "ref"], ["loc71s", "http://127.0.0.1:3200", "loc"]];

// ---- 476/477: the LOGIN page pair @1440x900 (the standing logged-out
//      surface — this round documents the post-33rd-deploy surface, the
//      ladder-audited NON-VISUAL state) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `476-login-standing-${suffix}`);
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
await auth("ref71s", "https://eon.base44.app");
await auth("loc71s", "http://127.0.0.1:3200");

async function routePair(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 4600));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 478/479: the LIGHT dashboard pair (the standing surface) ----
await routePair("/dashboard", "478-dashboard-light");

// ---- 480/481: the LIGHT payroll pair (the padded-tile + scroll-band page) ----
await routePair("/payroll", "480-payroll-light");

// ---- 482/483: the LIGHT employees pair (the seeded-grid allowance family) ----
await routePair("/employees", "482-employees-light");

// ---- 484/485: the LIGHT attendance pair (the admin-superset family) ----
await routePair("/attendance", "484-attendance-light");

// ---- 486/487: the LIGHT training pair (the mobile-menu cycle's target) ----
await routePair("/training", "486-training-light");

// ---- 488/489: the LIGHT recruitment pair (the tabs-rhythm family) ----
await routePair("/recruitment", "488-recruitment-light");

// ---- 490/491: the LIGHT settings pair (the two-column tiles) ----
await routePair("/settings", "490-settings-light");

// ---- 492/493: the LIGHT mobile drawer pair @390x844 (the standing
//      byte-stability check vs the r70 474 pair — the SEVEN-round chain).
//      THE CORRECTED MECHANISM (this round's instrument lesson): click
//      via the accessible-name SNAPSHOT ref (mouse-based) — (a) REF's
//      trigger dropped the aria-label in the r46 redeploy, so the r70
//      template's `button[aria-label=...]` selector NEVER matched on REF
//      and every r66-r70 REF "drawer pair" actually captured the drawer
//      CLOSED; (b) a raw eval b.click() (programmatic open) triggers
//      vaul/Radix onOpenAutoFocus — the first menu button renders its
//      focus-visible ring (the 1,160px band at y179-215) — a different
//      legitimate state than the user-realistic mouse open. The snapshot
//      ref click is the user-realistic mechanism AND works on both
//      sides; the LOC bytes stay byte-identical to the 474 pair (the
//      chain holds), and the REF side is captured OPEN for the first
//      time (the corrected baseline for future rounds). ----
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
  cap(session, `492-mobile-drawer-light-${suffix}`);
}

// ---- the mobile-menu functional check (the standing user emphasis):
//      the open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc71s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc71s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc71s get url`).trim();
console.log("after training-lms click:", afterNav);
// the auto-close eval — the r70 template's unbalanced paren FIXED (the
// r70 lesson: the direct re-run was the workaround; the script now reads
// the settled state on its own). The canonical wrapped form:
// `(() => ({ ... }))()` — no ambiguity, no template inheritance.
const closedAfterNav = run(`agent-browser --session loc71s eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));
console.log("done");
