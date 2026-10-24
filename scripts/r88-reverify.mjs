#!/usr/bin/env node
// r88-reverify.mjs — the post-fix mobile-band pixel re-verify: re-capture
// the twelve remediated routes cross-side at 390x844 (fresh pairs; the
// r88-mobile-* captures for those routes are overwritten), then diff.
// Also re-runs the mobile-menu cycle on the remediated build (the
// standing user emphasis).
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
const ROUTES = [
  "reports", "advancedanalytics", "surveyanalytics", "analyticsdashboard",
  "attendancedashboard", "profile", "chat", "shiftcalendar",
  "workflowconfigpage", "shiftswap", "tenantsetup", "companywall",
];

// clear the stale pairs so the resume check re-captures them
for (const r of ROUTES) {
  for (const s of ["ref", "loc"]) {
    const p = `${shots}/r88-mobile-${r}-${s}.png`;
    if (fs.existsSync(p)) fs.renameSync(p, `${shots}/r88-mobile-pre-${r}-${s}.png`);
  }
}

// fresh boot of the SEEDED standalone on :3200
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-r88v.log 2>&1 < /dev/null &`],
  { stdio: "ignore", detached: true });
server.unref();
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200");

async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
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
}
await auth("ref88r", "https://eon.base44.app");
await auth("loc88r", "http://127.0.0.1:3200");
console.log("ref:", run(`agent-browser --session ref88r get url`).trim());
console.log("loc:", run(`agent-browser --session loc88r get url`).trim());

const pairs = [["ref88r", "https://eon.base44.app", "ref"], ["loc88r", "http://127.0.0.1:3200", "loc"]];
for (const route of ROUTES) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} set viewport 390 844`);
    run(`agent-browser --session ${session} open ${base}/${route}`);
    await new Promise(r => setTimeout(r, 3500));
    run(`agent-browser --session ${session} screenshot ${shots}/r88-mobile-${route}-${suffix}.png`);
  }
  console.log("re-captured:", route);
}
console.log("ALL RE-CAPTURED — running the diff");
console.log(run(`python3 ${repo}/scripts/r88-mobile-diff.py ${ROUTES.join(" ")}`));

// the mobile-menu cycle re-verify on the remediated build
console.log("\n==== THE MOBILE-MENU CYCLE (the standing user emphasis) ====");
run(`agent-browser --session loc88r set viewport 390 844`);
run(`agent-browser --session loc88r open http://127.0.0.1:3200/dashboard`);
await new Promise(r => setTimeout(r, 3000));
const snap = run(`agent-browser --session loc88r snapshot -i -c`);
const line = (snap.split("\n").find(l => l.includes("Toggle Sidebar")) || "");
const bref = (line.match(/ref=(\w+)/) || [])[1];
if (bref) run(`agent-browser --session loc88r click @${bref}`);
await new Promise(r => setTimeout(r, 1200));
const drawerState = run(`agent-browser --session loc88r eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim();
console.log("drawer open:", drawerState.slice(0, 60));
const nav = run(`agent-browser --session loc88r eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training nav:", nav.slice(0, 80));
await new Promise(r => setTimeout(r, 3000));
console.log("after click url:", run(`agent-browser --session loc88r get url`).trim());
console.log("drawer auto-closed:", run(`agent-browser --session loc88r eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim().slice(0, 60));
process.exit(0);
