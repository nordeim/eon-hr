#!/usr/bin/env node
// r107-boot-3200.mjs — the :3200 boot (the node-spawn detached protocol —
// the nohup/tee class dies silently between bash calls; only a detached
// node spawn survives). env -u DATABASE_URL on the boot (the guard's boot
// leg — the sandbox exports a false path and every API call would answer
// Prisma Error 14 while the pages render fine).
// Usage: node scripts/r107-boot-3200.mjs
import { spawn, execSync } from "node:child_process";

const repo = "/home/z/my-project/eon-hr";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }

// kill any standing :3200 server — BY THE PORT HOLDER (the r107 lesson:
// the environ-based kill misses processes whose /proc/PID/environ is
// unreadable, and the health check then false-positives against the OLD
// server — every "post-fix" read silently hit the pre-fix build). The
// ss port lookup finds the true holder; the parent spawn is killed too.
function killPort(port) {
  const out = run(`ss -tlnp 2>/dev/null | grep ':${port} ' || true`);
  const pids = [...out.matchAll(/pid=(\d+)/g)].map((m) => m[1]);
  for (const pid of new Set(pids)) {
    const ppid = run(`ps -o ppid= -p ${pid} 2>/dev/null`).trim();
    run(`kill -9 ${pid} 2>/dev/null; true`);
    if (ppid && /^\d+$/.test(ppid)) run(`kill -9 ${ppid} 2>/dev/null; true`);
    console.log(`killed :${port} holder pid ${pid}${ppid ? ` (parent ${ppid})` : ""}`);
  }
  run(`pgrep -f "standalone/server.js" | xargs -r kill -9 2>/dev/null; true`);
}
killPort(3200);

const child = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET=r107-live-secret PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/r107-3200.log 2>&1`],
  { stdio: "ignore", detached: true, env: { ...process.env, DATABASE_URL: undefined } });
child.unref();
console.log("spawned detached :3200 server, pid", child.pid);

let up = false;
for (let i = 0; i < 120; i++) {
  const out = run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health");
  if (!out.startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
console.log(up ? "SERVER UP on :3200" : "SERVER DOWN — check /tmp/r107-3200.log");
process.exit(up ? 0 : 1);
