#!/usr/bin/env node
// r86-crossdiff-capture.mjs — session-86 / parity round 85: the FRESH-EYES
// FRONTIER — the cross-side pixel-diff instrument class EXTENDED TO THE
// AT-REST ROUTE PAIRS (the program's first REF<->LOC pixel protocol at
// scale). The r85 round proved the class works (the focused-state pair
// surfaced TWO defects invisible to 20+ rounds of per-side byte chains:
// the platform badge + the logo derivative). This instrument captures
// fresh at-rest pairs (login + the seven standing routes + the two r85
// fix-evidence routes) @1440x900 LIGHT LTR, both sides authed where
// applicable, and saves them as r86-crossdiff-<route>-{ref,loc}.png for
// the PIL grid-diff pass (r86-crossdiff-diff.py).
// Standing capture contracts honored: darkMode=false + app_lang removed
// (the r63 lesson), the badge VISIBLE (the r85 lesson — never dismiss
// mid-script), the fill-settle-click auth (the r78 lesson).
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;

// fresh boot of the SEEDED standalone (kill any stale :3200 by PID —
// the r85 standalone-zombie lesson: Next renames the process)
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-crossdiff-r86.log 2>&1 < /dev/null &`],
  { stdio: "ignore", detached: true });
server.unref();
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200");

run(`agent-browser close --all 2>/dev/null; true`);
for (const s of ["ref86x", "loc86x"]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
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
  const url = run(`agent-browser --session ${session} get url`).trim();
  if (url.includes("/login")) {
    console.log(session, "fill-timing miss — careful retry");
    run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
    await new Promise(r => setTimeout(r, 500));
    run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
    await new Promise(r => setTimeout(r, 600));
    const snap2 = run(`agent-browser --session ${session} snapshot -i -c`);
    const ref2 = (snap2.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
    if (ref2) run(`agent-browser --session ${session} click @${ref2}`);
    await new Promise(r => setTimeout(r, 4200));
  }
}

// auth both sides (the at-rest authed routes need the session cookie)
await auth("ref86x", "https://eon.base44.app");
await auth("loc86x", "http://127.0.0.1:3200");
console.log("ref url:", run(`agent-browser --session ref86x get url`).trim());
console.log("loc url:", run(`agent-browser --session loc86x get url`).trim());

const pairs = [["ref86x", "https://eon.base44.app", "ref"], ["loc86x", "http://127.0.0.1:3200", "loc"]];

async function restCapture(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 3500));
    run(`agent-browser --session ${session} screenshot ${shots}/r86-crossdiff-${name}-${suffix}.png`);
  }
  console.log("pair captured:", name);
}

// the login page (logged-out — fresh sessions WITHOUT auth cookies:
// reopen /login; both sessions are authed so explicitly open the login
// route, which renders the logged-out card when unauthenticated — the
// standing login captures use fresh browser sessions. For the pixel
// diff the login surface is captured with the SAME authed sessions
// hitting /login (the app redirects authed users; the standing probe
// uses fresh sessions). To keep it comparable to the 1001/545 baselines,
// use the dedicated fresh-session pattern for login.)
run(`agent-browser --session ref86L close 2>/dev/null; true`);
run(`agent-browser --session loc86L close 2>/dev/null; true`);
for (const [session, base, suffix] of [["ref86L", "https://eon.base44.app", "ref"], ["loc86L", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3500));
  run(`agent-browser --session ${session} screenshot ${shots}/r86-crossdiff-login-${suffix}.png`);
}
console.log("pair captured: login (fresh sessions)");

// the seven standing routes + the two r85 fix-evidence routes
await restCapture("/dashboard", "dashboard");
await restCapture("/payroll", "payroll");
await restCapture("/employees", "employees");
await restCapture("/attendance", "attendance");
await restCapture("/training", "training");
await restCapture("/recruitment", "recruitment");
await restCapture("/settings", "settings");
await restCapture("/assetmanagement", "assetmanagement");
await restCapture("/payrollreports", "payrollreports");

console.log("ALL PAIRS CAPTURED — run r86-crossdiff-diff.py next");
process.exit(0);
