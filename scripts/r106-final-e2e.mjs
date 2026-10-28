#!/usr/bin/env node
// r106-final-e2e.mjs — spawn the FULL E2E gate FULLY DETACHED (the
// final-gate-runs-ALONE rule + the between-call process reap trap: only
// the detached node-spawn protocol survives between bash calls). The
// rebuild already ran (the §110 rule — the last build is the GREEN tree).
// Output → /tmp/r106-final-e2e.log.
import { spawn } from "node:child_process";
import fs from "node:fs";

const repo = "/home/z/my-project/eon-hr";
const out = fs.openSync("/tmp/r106-final-e2e.log", "w");
const child = spawn("bunx", ["playwright", "test"], { cwd: repo, stdio: ["ignore", out, out], detached: true });
child.unref();
console.log("detached final E2E gate spawned, pid", child.pid);
