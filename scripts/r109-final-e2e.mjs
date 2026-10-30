#!/usr/bin/env node
// r109-final-e2e.mjs — the FINAL E2E gate (the detached node-spawn
// protocol: the nohup/tee class dies silently between bash calls; only a
// detached node spawn survives). Runs the full Playwright suite ALONE (no
// browser work beside it — the ladder-OOM lesson) against the remediated
// standalone build. Expected: 559/559 (the standing net; the R109 fix
// rides the unit layer per the r100/r102 documented split).
// Usage: node scripts/r109-final-e2e.mjs   (then poll /tmp/r109-e2e.log)
import { spawn, execSync } from "node:child_process";

const repo = "/home/z/my-project/eon-hr";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }

// kill any standing :3200 server BY THE PORT HOLDER (the r107 lesson)
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

const child = spawn("bash", ["-c", `cd ${repo} && env -u DATABASE_URL bun run test:e2e > /tmp/r109-e2e.log 2>&1`], { stdio: "ignore", detached: true });
child.unref();
console.log("E2E gate spawned detached, pid", child.pid, "— poll /tmp/r109-e2e.log (~11 min)");
process.exit(0);
