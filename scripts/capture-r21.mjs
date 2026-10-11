#!/usr/bin/env node
// capture-r21.mjs — session-22 motion-dimension evidence captures:
// 71 mobile drawer OPEN (288px sheet + overlay, the slide-in target state),
// 72 user dropdown open (enter animation evidence — settled frame),
// 73 attendance select open (animated select content),
// + standards refresh (02 dashboard, 11 mobile dashboard).
// Screenshots capture the settled states; the mid-flight frames live in the
// session log (frame-sampled animation evidence).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const SHOT = "/home/z/my-project/eon-hr/docs/screenshots";
async function ensureLocAuth() {
  const p = run(`agent-browser --session loc eval "location.pathname"`);
  if (String(p).includes("login")) {
    run(`agent-browser --session loc open "http://127.0.0.1:3200/login"`);
    await sleep(2000);
    run(`agent-browser --session loc fill 'input[type=email]' "sepnetflix2023@outlook.com"`);
    run(`agent-browser --session loc fill 'input[type=password]' "$Abcd1234"`);
    const snap = run(`agent-browser --session loc snapshot -i -c`);
    const m = snap.match(/button "Sign in" \[[^\]]*ref=(\w+)/);
    if (m) run(`agent-browser --session loc click @${m[1]}`);
    await sleep(4000);
  }
}

// 1. mobile drawer OPEN @390×844
run(`agent-browser --session loc set viewport 390 844`);
run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
await sleep(3000);
await ensureLocAuth();
run(`agent-browser --session loc eval "(() => { const b = [...document.querySelectorAll('button')].find(x => (x.getAttribute('aria-label')||'') === 'Toggle Sidebar'); if (b) b.click(); return 'opened'; })()"`);
await sleep(900); // slide completes (~500ms) — settled frame
run(`agent-browser --session loc screenshot ${SHOT}/71-mobile-drawer-open-slide.png`);
console.log("71 captured");
// close via Escape
run(`agent-browser --session loc eval "document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))"`);
await sleep(700);

// 2. user dropdown open @1440 (settled frame after the enter animation)
run(`agent-browser --session loc set viewport 1440 900`);
run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
await sleep(2800);
await ensureLocAuth();
const snap2 = run(`agent-browser --session loc snapshot -i -c`);
const um = snap2.match(/button "sepnetflix2023[^"]*" \[[^\]]*ref=(\w+)/);
if (um) {
  run(`agent-browser --session loc click @${um[1]}`);
  await sleep(600); // enter completes at 150ms — settled frame
  run(`agent-browser --session loc screenshot ${SHOT}/72-user-dropdown-animated-open.png`);
  console.log("72 captured");
  run(`agent-browser --session loc eval "document.body.click()"`);
  await sleep(500);
}

// 3. attendance select open @1440 (settled frame)
run(`agent-browser --session loc open "http://127.0.0.1:3200/attendancedashboard"`);
await sleep(2800);
await ensureLocAuth();
run(`agent-browser --session loc eval "(() => { const t = document.querySelector('[role=combobox]'); if (t) t.click(); return 'clicked'; })()"`);
await sleep(600);
run(`agent-browser --session loc screenshot ${SHOT}/73-select-animated-open.png`);
console.log("73 captured");
run(`agent-browser --session loc eval "document.body.click()"`);
await sleep(400);

// 4. standards refresh: 02 dashboard @1440, 11 mobile dashboard @390
run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
await sleep(3000);
await ensureLocAuth();
run(`agent-browser --session loc screenshot ${SHOT}/02-dashboard.png`);
console.log("02 refreshed");
run(`agent-browser --session loc set viewport 390 844`);
await sleep(1500);
run(`agent-browser --session loc screenshot ${SHOT}/11-mobile-dashboard.png`);
console.log("11 refreshed");
console.log("CAPTURE-R21-DONE");
