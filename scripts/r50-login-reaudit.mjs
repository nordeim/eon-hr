#!/usr/bin/env node
// r50-login-reaudit.mjs — one-call: boot the seeded :3200 server, then run
// verify-r45 (the login-surface re-audit) alone — the daemon needs a quiet
// run (under orchestrator load its evals exceed verify-r45's 45s cap).
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 120000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 160); } }

const repo = "/home/z/my-project/eon-hr";
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r50b.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("seeded server up on :3200");
console.log(run("node scripts/verify-r45.mjs", 600000));
process.exit(0);
