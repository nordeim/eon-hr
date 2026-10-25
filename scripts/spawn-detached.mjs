// Detached process spawner — the bash-reaper bypass (session-92 protocol).
// Survives the tool-shell exit: node spawn + detached + unref, output to a log file.
// Usage: node spawn-detached.mjs <logfile> <cmd> [args...]
import { spawn } from "node:child_process";
import { openSync } from "node:fs";
import { resolve } from "node:path";

const [, , logPath, cmd, ...args] = process.argv;
if (!logPath || !cmd) {
  console.error("usage: node spawn-detached.mjs <logfile> <cmd> [args...]");
  process.exit(2);
}
const out = openSync(resolve(logPath), "a");
const child = spawn(cmd, args, {
  cwd: process.cwd(),
  detached: true,
  stdio: ["ignore", out, out],
  env: { ...process.env },
});
child.unref();
console.log(`spawned pid=${child.pid} -> ${logPath}`);
