#!/usr/bin/env node
// r70-screenshots.mjs — parity round 69's evidence captures. The round's
// theme: THE SEO-SURFACE PARITY PAIR (the sitemap + the robots Sitemap
// directive — the last uncensused member of the r25 SEO layer) + THE CSP
// NONCE PIPELINE (the first security-policy superset — REF serves none).
// Both fix families live at the header/meta layer — invisible to the
// rendered surface — so the set's byte-stability pair is the round's
// proof: the mobile drawer must still BYTE-MATCH the r69 456 pair on
// both sides (the SIX-round chain new≡456≡438≡418≡402≡366) — the deploy
// watch read BOTH SIDES QUIET (no 33rd deploy), and the sitemap/CSP
// changes touch zero rendered bytes. The set: the LOGIN page pair (the
// standing logged-out surface), the LIGHT standing route pairs on the
// patched build, the LIGHT mobile drawer pair @390, + the inline
// mobile-menu functional cycle (the standing user emphasis). Numbers
// continue from 458 (the r69 set ended at 457).
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
// The r69 lesson: spawn the server DETACHED (setsid) — a tool-timeout kill
// takes every non-detached child with it.
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r70.log 2>&1 < /dev/null &`],
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
for (const s of [["ref70s", "https://eon.base44.app"], ["loc70s", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${s[0]} set viewport 1440 900`);
  run(`agent-browser --session ${s[0]} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref70s", "https://eon.base44.app", "ref"], ["loc70s", "http://127.0.0.1:3200", "loc"]];

// ---- 458/459: the LOGIN page pair @1440x900 (the standing logged-out
//      surface — the watch read both sides quiet this round) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `458-login-standing-${suffix}`);
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
await auth("ref70s", "https://eon.base44.app");
await auth("loc70s", "http://127.0.0.1:3200");

async function routePair(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 4600));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 460/461: the LIGHT dashboard pair (the standing surface) ----
await routePair("/dashboard", "460-dashboard-light");

// ---- 462/463: the LIGHT payroll pair (the padded-tile + scroll-band page) ----
await routePair("/payroll", "462-payroll-light");

// ---- 464/465: the LIGHT employees pair (the seeded-grid allowance family) ----
await routePair("/employees", "464-employees-light");

// ---- 466/467: the LIGHT attendance pair (the admin-superset family) ----
await routePair("/attendance", "466-attendance-light");

// ---- 468/469: the LIGHT training pair (the mobile-menu cycle's target) ----
await routePair("/training", "468-training-light");

// ---- 470/471: the LIGHT recruitment pair (the tabs-rhythm family) ----
await routePair("/recruitment", "470-recruitment-light");

// ---- 472/473: the LIGHT settings pair (the two-column tiles) ----
await routePair("/settings", "472-settings-light");

// ---- 474/475: the LIGHT mobile drawer pair @390x844 (the standing
//      byte-stability check vs the r69 456 pair — the SIX-round chain) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false')"`);
  run(`agent-browser --session ${session} set viewport 390 844`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ${session} set viewport 390 844`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} click 'button[aria-label="Toggle Sidebar"]'`);
  await new Promise(r => setTimeout(r, 1200));
  cap(session, `474-mobile-drawer-light-${suffix}`);
}

// ---- the mobile-menu functional check (the standing user emphasis):
//      the open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc70s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc70s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc70s get url`).trim();
console.log("after training-lms click:", afterNav);
const closedAfterNav = run(`agent-browser --session loc70s eval "(() => ({ open: !!document.querySelector('[role=dialog]') })()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));
console.log("done");
