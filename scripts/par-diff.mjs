#!/usr/bin/env node
// par-diff.mjs — session-4 parity probe: runs the same JS probe in the
// reference (eon.base44.app) and local (localhost:3000) agent-browser
// sessions, then prints a side-by-side diff of the JSON results.
// Usage: bun scripts/par-diff.mjs <path> <probe-file.mjs>
//   <path> e.g. /dashboard (same on both apps)
import { execSync } from "node:child_process";

const [, , path, probeFile] = process.argv;
if (!path || !probeFile) {
  console.error("usage: bun scripts/par-diff.mjs <path> <probe-file.mjs>");
  process.exit(1);
}
const probe = (await import(`file://${process.cwd()}/${probeFile}`)).default;

const run = (session, base) => {
  execSync(`agent-browser --session ${session} open "${base}${path}"`, { stdio: "pipe" });
  const sleep = probe.wait ? probe.wait : 2500;
  execSync(`sleep ${sleep / 1000}`);
  const out = execSync(
    `agent-browser --session ${session} eval ${JSON.stringify(probe.js)}`,
    { stdio: "pipe", maxBuffer: 64 * 1024 * 1024 },
  );
  return JSON.parse(out.toString());
};

const ref = run("ref", "https://eon.base44.app");
const loc = run("loc", "http://localhost:3000");
console.log(JSON.stringify({ path, ref, loc }, null, 2));
