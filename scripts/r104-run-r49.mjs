#!/usr/bin/env node
// r104-run-r49.mjs — spawn scripts/verify-r49.mjs FULLY DETACHED (the
// between-call process reap trap: a nohup'd child of a bash call dies
// silently between two bash calls; only the detached node-spawn protocol
// survives). Output → /tmp/verify-r49.log.
import { spawn } from "node:child_process";

const repo = "/home/z/my-project/eon-hr";
const out = (await import("node:fs")).openSync("/tmp/verify-r49.log", "w");
const child = spawn("node", [`${repo}/scripts/verify-r49.mjs`], {
  cwd: repo,
  stdio: ["ignore", out, out],
  detached: true,
});
child.unref();
console.log("detached verify-r49 spawned, pid", child.pid);
