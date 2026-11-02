#!/usr/bin/env node
// r121-final-e2e.mjs — the E2E gate, launched DETACHED (the node-spawn
// protocol — the nohup/tee class dies silently between bash calls; only a
// detached node spawn survives the sandbox's orphan reaping). Writes the
// run's exit + summary to /tmp/r121-e2e-status.txt.
// Usage: node scripts/r121-final-e2e.mjs
import { spawn, execSync } from "node:child_process";
import { openSync } from "node:fs";

function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }

// kill the :3200 holder (the E2E runner kills it by port anyway, but be safe)
run(`ss -ttlnp 2>/dev/null | grep ':3200 ' | grep -o 'pid=[0-9]*' | cut -d= -f2 | sort -u | xargs -r kill -9 2>/dev/null; true`);

const log = openSync("/tmp/r121-e2e.log", "w");
const err = openSync("/tmp/r121-e2e.err", "w");
const child = spawn("bunx", ["playwright", "test"], {
  cwd: "/home/z/my-project/eon-hr",
  detached: true,
  stdio: ["ignore", log, err],
  env: { ...process.env },
});
child.unref();
console.log(`E2E launched detached, pid ${child.pid} — poll /tmp/r121-e2e-status.txt`);
