// Boot the :3200 standalone (the documented node-spawn protocol — survives the bash-reaper).
import { spawn } from "node:child_process";
import { openSync } from "node:fs";
import { mkdirSync } from "node:fs";

mkdirSync("/tmp/r98", { recursive: true });
const out = openSync("/tmp/r98/server3200.log", "a");
const env = {
  ...process.env,
  PORT: "3200",
  NODE_ENV: "production",
  HOSTNAME: "127.0.0.1",
  DATABASE_URL: "file:/home/z/my-project/eon-hr/db/custom.db",
  AUTH_SECRET: "dev-only-secret-0123456789abcdef",
};
const child = spawn("bun", ["/home/z/my-project/eon-hr/.next/standalone/server.js"], {
  cwd: "/home/z/my-project/eon-hr/.next/standalone",
  detached: true,
  stdio: ["ignore", out, out],
  env,
});
child.unref();
console.log("spawned :3200 pid=" + child.pid);
