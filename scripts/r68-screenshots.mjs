#!/usr/bin/env node
// r68-screenshots.mjs — parity round 67's evidence captures. The round's
// theme: THE UPGRADED BUILD (Next.js 16.4.0 → 16.4.2, the critical
// security patches) + the 31st-deploy confirmation ladder + the history-
// bug closure. The set: the LIGHT route pairs on the upgraded build
// (r67's set was all-dark — this round's pairs are the light complement,
// the standing verification surface), the LIGHT mobile drawer pair @390
// (the standing byte-stability check vs the r67 418 pair — now ALSO a
// cross-VERSION byte-stability test: 16.4.0-captured 418 vs 16.4.2-
// captured 438), + the inline mobile-menu functional cycle (the
// standing user emphasis). REF + seeded LOC pairs, fresh sessions (the
// r63 stale-viewport lesson). Numbers continue from 422 (the r67 set
// ended at 421).
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-shots-r68.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200");

async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
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
// fresh sessions (the r63 stale-viewport lesson)
run(`agent-browser close --all 2>/dev/null; true`);
await auth("ref68s", "https://eon.base44.app");
await auth("loc68s", "http://127.0.0.1:3200");
// arm LIGHT on both (the round's light-complement theme; the class
// applies pre-paint on the NEXT navigation — the boot script).
for (const s of [["ref68s", "https://eon.base44.app"], ["loc68s", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${s[0]} open ${s[1]}/dashboard`);
  await new Promise(r => setTimeout(r, 2500));
  run(`agent-browser --session ${s[0]} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref68s", "https://eon.base44.app", "ref"], ["loc68s", "http://127.0.0.1:3200", "loc"]];

async function routePair(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 4600));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 422/423: the LIGHT dashboard pair (the upgraded-build standing
//      surface, 1440x900) ----
await routePair("/dashboard", "422-dashboard-light");

// ---- 424/425: the LIGHT payroll pair (the padded-tile + scroll-band
//      page — the R63-A placeholder + R65-A tile families live here) ----
await routePair("/payroll", "424-payroll-light");

// ---- 426/427: the LIGHT hrreports pair (the R63-B Group By page) ----
await routePair("/hrreports", "426-hrreports-light");

// ---- 428/429: the LIGHT settings pair (the two-column tiles) ----
await routePair("/settings", "428-settings-light");

// ---- 430/431: the LIGHT profile pair (the history-detector's page —
//      the back-walk contract's context, the R63-C kicker family) ----
await routePair("/profile", "430-profile-light");

// ---- 432/433: the LIGHT taskmanager pair (the kanban chips) ----
await routePair("/taskmanager", "432-taskmanager-light");

// ---- 434/435: the LIGHT staffrequests pair (the actions-cluster
//      census family) ----
await routePair("/staffrequests", "434-staffrequests-light");

// ---- 436/437: the LIGHT recruitment pair (the tabs rhythm + the
//      AI-score th family) ----
await routePair("/recruitment", "436-recruitment-light");

// ---- 438/439: the LIGHT mobile drawer pair @390x844 (the standing
//      byte-stability check vs the r67 418 pair — cross-round AND
//      cross-version: 418 was captured on 16.4.0, this pair on 16.4.2) ----
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
  cap(session, `438-mobile-drawer-light-${suffix}`);
}

// ---- the mobile-menu functional check (the standing user emphasis):
//      the open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc68s eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
const trainingNav = run(`agent-browser --session loc68s eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
const afterNav = run(`agent-browser --session loc68s get url`).trim();
console.log("after training-lms click:", afterNav);
const closedAfterNav = run(`agent-browser --session loc68s eval "(() => ({ open: !!document.querySelector('[role=dialog]') })()"`).trim();
console.log("drawer auto-closed on navigation:", closedAfterNav.slice(0, 120));
console.log("done");
