// Detached E2E runner — the node-spawn boot protocol (the only form that
// survives the sandbox's between-call process reap; shell setsid/nohup do
// not). Spawns `bun run test:e2e` detached + unref'd, output to the log.
// Usage: bun scripts/run-e2e-detached.mjs [logfile]
import { spawn } from "node:child_process";
import { openSync } from "node:fs";

const log = process.argv[2] ?? "/tmp/r99-e2e-final.log";
const out = openSync(log, "w");
const child = spawn("bun", ["run", "test:e2e"], {
  cwd: "/home/z/my-project/eon-hr",
  detached: true,
  stdio: ["ignore", out, out],
});
child.unref();
console.log("E2E gate detached, pid=" + child.pid + ", log=" + log);
