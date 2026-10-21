#!/usr/bin/env node
// r69-screenshots.mjs — parity round 68's evidence captures. The round's
// theme: THE 32ND LOGIN DEPLOY (login JS 8hcVVGz2→CKnh3tRk + the NEW
// platform frontend-config.js; the app side quiet — the ladder re-audited
// NON-VISUAL) + THE HTTP-LAYER PARITY SET (the 5 security headers — the
// first fix family below the DOM layer). The set: the LOGIN page pair on
// the 32nd-deploy REF (the round's direct surface — captured logged-out,
// fresh sessions, BEFORE the auth), the LIGHT route pairs on the
// header-patched build, the LIGHT mobile drawer pair @390 (the standing
// byte-stability check vs the r68 438 pair — the FIVE-round chain
// 458≡438≡418≡402≡366 if both sides hold), + the inline mobile-menu
// functional cycle (the standing user emphasis). Numbers continue from
// 440 (the r68 set ended at 439).
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-shots-r69.log 2>&1`],
  { stdio: "ignore" });
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
for (const s of [["ref69s", "https://eon.base44.app"], ["loc69s", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${s[0]} set viewport 1440 900`);
  run(`agent-browser --session ${s[0]} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref69s", "https://eon.base44.app", "ref"], ["loc69s", "http://127.0.0.1:3200", "loc"]];

// ---- 440/441: the LOGIN page pair @1440x900 — the 32nd-deploy surface
//      (captured logged-out, BEFORE the auth: the login JS changed
//      8hcVVGz2→CKnh3tRk + the frontend-config.js preload; the DOM recon
//      read it structurally unchanged) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  cap(session, `440-login-32nd-${suffix}`);
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
await auth("ref69s", "https://eon.base44.app");
await auth("loc69s", "http://127.0.0.1:3200");

async function routePair(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 4600));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 442/443: the LIGHT dashboard pair (the standing surface) ----
await routePair("/dashboard", "442-dashboard-light");

// ---- 444/445: the LIGHT payroll pair (the padded-tile + scroll-band page) ----
await routePair("/payroll", "444-payroll-light");

// ---- 446/447: the LIGHT employees pair (the seeded-grid allowance family) ----
await routePair("/employees", "446-employees-light");

// ---- 448/449: the LIGHT attendance pair (the admin-superset family) ----
await routePair("/attendance", "448-attendance-light");

// ---- 450/451: the LIGHT training pair (the mobile-menu cycle's target) ----
await routePair("/training", "450-training-light");

// ---- 452/453: the LIGHT recruitment pair (the tabs-rhythm family) ----
await routePair("/recruitment", "452-recruitment-light");

// ---- 454/455: the LIGHT settings pair (the two-column tiles) ----
await routePair("/settings", "454-settings-light");

// ---- 456/457: the LIGHT mobile drawer pair @390x844 (the standing
//      byte-stability check vs the r68 438 pair — the FIVE-round chain) ----
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
  cap(session, `456-mobile-drawer-light-${suffix}`);
}

// ---- the mobile-menu functional check (the standing user emphasis):
//      the open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc69s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc69s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc69s get url`).trim();
console.log("after training-lms click:", afterNav);
const closedAfterNav = run(`agent-browser --session loc69s eval "(() => ({ open: !!document.querySelector('[role=dialog]') })()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));
console.log("done");
