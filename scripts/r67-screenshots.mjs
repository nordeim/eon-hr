#!/usr/bin/env node
// r67-screenshots.mjs — parity round 66's evidence captures: the
// dark-mode re-census verification pairs (the round's theme = DARK — the
// geometry + spacing axes computed-verified theme-invariant, the byte-
// identical light/dark allowance tuples). The set: the dark dashboard +
// payroll (the scroll-band pages), the dark payroll padded tiles + the
// svg-authored empty state, the dark advancedanalytics tileFixed row, the
// dark recruitment tabs rhythm, the dark tenantsetup circle + ml-auto,
// the dark employees row + grid (the standing allowance route, dark), the
// LIGHT mobile drawer pair @390 (the standing byte-stability check vs the
// r66 402 pair), and the DARK mobile drawer pair (the new dark-surface
// evidence). REF + seeded LOC pairs, fresh sessions (the r63 stale-viewport
// lesson). Numbers continue from 404 (the r66 set ended at 403).
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-shots-r67.log 2>&1`],
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
await auth("ref67", "https://eon.base44.app");
await auth("loc67", "http://127.0.0.1:3200");
// arm DARK on both (the shared localStorage contract) — the round's theme.
// The class applies pre-paint on the NEXT navigation (the boot script).
for (const s of [["ref67", "https://eon.base44.app"], ["loc67", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${s[0]} open ${s[1]}/dashboard`);
  await new Promise(r => setTimeout(r, 2500));
  run(`agent-browser --session ${s[0]} eval "localStorage.setItem('darkMode','true')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref67", "https://eon.base44.app", "ref"], ["loc67", "http://127.0.0.1:3200", "loc"]];

async function routePair(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 4600));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 404–407: the DARK dashboard + payroll (the scroll-band pages +
//      the dark shell) ----
await routePair("/dashboard", "404-dashboard-dark");
await routePair("/payroll", "406-payroll-dark");

// ---- 408/409: the DARK advancedanalytics tileFixed row ----
await routePair("/advancedanalytics", "408-advancedanalytics-dark");

// ---- 410/411: the DARK recruitment tabs rhythm ----
await routePair("/recruitment", "410-recruitment-tabs-dark");

// ---- 412/413: the DARK tenantsetup circle + ml-auto ----
await routePair("/tenantsetup", "412-tenantsetup-dark");

// ---- 414/415: the DARK employees row + grid (the standing allowance
//      route, dark evidence) ----
await routePair("/employees", "414-employees-dark");

// ---- 416/417: the DARK surveyanalytics single grid ----
await routePair("/surveyanalytics", "416-surveyanalytics-dark");

// ---- 418/419: the LIGHT mobile drawer pair @390x844 (the standing
//      byte-stability check vs the r66 402 pair — LIGHT armed) ----
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
  cap(session, `418-mobile-drawer-light-${suffix}`);
}

// ---- the mobile-menu functional check (the standing user emphasis):
//      open → navigate → close cycle on the LOC side ----
const drawerState = run(`agent-browser --session loc67 eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("mobile drawer state (open + first links):", drawerState.slice(0, 300));
run(`agent-browser --session loc67 click 'button[aria-label="Toggle Sidebar"]'`);
await new Promise(r => setTimeout(r, 800));
const drawerClosed = run(`agent-browser --session loc67 eval "(() => ({ open: !!document.querySelector('[role=dialog]') })()"`).trim();
console.log("mobile drawer after toggle-back:", drawerClosed.slice(0, 120));

// ---- 420/421: the DARK mobile drawer pair @390x844 (the new
//      dark-surface evidence) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','true')"`);
  run(`agent-browser --session ${session} set viewport 390 844`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ${session} set viewport 390 844`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} click 'button[aria-label="Toggle Sidebar"]'`);
  await new Promise(r => setTimeout(r, 1200));
  cap(session, `420-mobile-drawer-dark-${suffix}`);
}
console.log("done");
