#!/usr/bin/env node
// r103-final-e2e.mjs — the final E2E gate, ALONE, via the detached node-spawn
// protocol (the standing rule: the final gate runs by itself so a failure is
// never masked by concurrent output; the detached spawn survives the
// between-call process reap).
import { spawn } from "node:child_process";
import { openSync } from "node:fs";

const out = openSync("/tmp/r103-e2e-final.log", "w");
const child = spawn("bunx", ["playwright", "test"], {
  cwd: "/home/z/my-project/eon-hr",
  detached: true,
  stdio: ["ignore", out, out],
  env: { ...process.env, DATABASE_URL: undefined },
});
child.unref();
console.log("final E2E gate spawned pid=" + child.pid + " → /tmp/r103-e2e-final.log");
