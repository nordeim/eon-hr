#!/usr/bin/env node
// r90-boot3200.mjs — boot the seeded standalone on :3200 detached (the
// background-reaper lesson: bash-tool backgrounded servers die with the
// shell; a node spawn survives). Usage: node scripts/r90-boot3200.mjs
import { execSync, spawn } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="r90-standalone-dev-secret-32chars" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r90c.log 2>&1`],
  { stdio: "ignore", detached: true });
server.unref();
let up = false;
for (let i = 0; i < 60; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
console.log(up ? "seeded standalone up on :3200" : "SERVER DOWN — check /tmp/loc3200-r90c.log");
process.exit(up ? 0 : 1);
