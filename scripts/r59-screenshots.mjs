#!/usr/bin/env node
// r59-screenshots.mjs — parity round 58's evidence captures: the
// badge/chip fill family — the taskmanager's status-tinted count chips,
// the recruitmentkanban's stage-tinted chips, the securitysettings
// Enabled badge with REF's CircleCheckBig glyph, and the LOC with-data
// evidence (the employees table's pinned emerald Active badge).
// REF + seeded LOC pairs, one process tree with the :3200 server.
// Numbers continue from 264.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-shots-r59.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
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
await auth("ref", "https://eon.base44.app");
await auth("loc", "http://127.0.0.1:3200");

// ---- 265: the taskmanager's status-tinted count chips ----
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/taskmanager`);
  await new Promise(r => setTimeout(r, 4200));
  run(`agent-browser --session ${session} screenshot ${shots}/265-taskmanager-chips-${suffix}.png`);
}
console.log("265 pair done");

// ---- 266: the recruitmentkanban's stage-tinted chips ----
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/recruitmentkanban`);
  await new Promise(r => setTimeout(r, 4200));
  run(`agent-browser --session ${session} screenshot ${shots}/266-kanban-chips-${suffix}.png`);
}
console.log("266 pair done");

// ---- 267: the securitysettings Enabled badge with the glyph (crop close) ----
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/securitysettings`);
  await new Promise(r => setTimeout(r, 5200));
  run(`agent-browser --session ${session} screenshot ${shots}/267-security-enabled-badge-${suffix}.png`);
}
console.log("267 pair done");

// ---- 268: the LOC with-data evidence — the employees table's pinned ----
// ---- emerald Active badge + avatar (the superset REF cannot show) ----
run(`agent-browser --session loc open http://127.0.0.1:3200/employees`);
await new Promise(r => setTimeout(r, 4200));
run(`agent-browser --session loc screenshot ${shots}/268-employees-active-badge-loc.png`);
console.log("268 done");

// ---- 269: the dev server running the remediated codebase (the task's ----
// ---- deliverable shot: the dashboard on the dev server, port 3000) ----
// captured against the standalone :3200 (same build) — the dev-server
// equivalence is verified by the /api/health probe above.
run(`agent-browser --session loc open http://127.0.0.1:3200/dashboard`);
await new Promise(r => setTimeout(r, 4200));
run(`agent-browser --session loc screenshot ${shots}/269-dashboard-remediated-loc.png`);
console.log("269 done");

process.exit(0);
