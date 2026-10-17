#!/usr/bin/env node
// r49-standing-run.mjs — one-call orchestrator for the standing audits +
// route sweep: kill stale :3200, boot the SEEDED standalone (custom.db),
// auth the "loc" session, run both scripts inside this process tree.
import { execSync, spawn } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 120000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);

const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r50.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN", run("tail -3 /tmp/loc3200-r50.log")); process.exit(1); }
console.log("seeded server up on :3200");

run('agent-browser --session loc set viewport 1440 900');
run('agent-browser --session loc open http://127.0.0.1:3200/login');
await new Promise(r => setTimeout(r, 2200));
run('agent-browser --session loc fill "input[type=email]" "sepnetflix2023@outlook.com"');
await new Promise(r => setTimeout(r, 350));
run("agent-browser --session loc fill 'input[type=password]' '$Abcd1234'");
await new Promise(r => setTimeout(r, 350));
const snap = run('agent-browser --session loc snapshot -i -c');
const btnRef = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
if (btnRef) run(`agent-browser --session loc click @${btnRef}`);
await new Promise(r => setTimeout(r, 4200));
console.log("loc:", run('agent-browser --session loc get url').trim());

console.log("\n########## STANDING AUDITS ##########");
console.log(run("node scripts/probe-r37-standing.mjs"));
console.log("\n########## ROUTE SWEEP ##########");
console.log(run("node scripts/probe-r41-routesweep.mjs"));
console.log("\n########## LOGIN REDEPLOY RE-AUDIT (r45 — the 16th deploy) ##########");
console.log(run("node scripts/verify-r45.mjs"));
process.exit(0);
