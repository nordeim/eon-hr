#!/usr/bin/env node
// r49-boot-loc0.mjs — one-call orchestrator: create/refresh the zero
// tenant db (db/zero.db: schema + demo user only), boot the standalone
// server on :3201 against it, revive the loc0 browser session (auth),
// then run a reader against a list of routes. The whole tree dies when
// this call ends, so everything must complete within it.
// Usage: node scripts/r49-boot-loc0.mjs /route1 /route2
import { execSync, spawn } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 160); } }

const routes = process.argv.slice(2);
const repo = "/home/z/my-project/eon-hr";

// 1. zero db: push schema (fresh file each boot — deterministic)
run(`rm -f ${repo}/db/zero.db ${repo}/db/zero.db-journal`);
run(`cd ${repo} && DATABASE_URL="file:../db/zero.db" npx prisma db push --skip-generate 2>&1 | tail -1`);
// seed the demo user only (seed.ts upserts user+company; employees count 0 stays 0)
run(`cd ${repo} && DATABASE_URL="file:../db/zero.db" npx tsx prisma/seed.ts 2>&1 | tail -1`);

// 2. boot server (child of THIS process tree)
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/zero.db" AUTH_SECRET=zero-tenant-secret PORT=3201 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc0-r49.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3201/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN", run("tail -5 /tmp/loc0-r49.log")); process.exit(1); }
console.log("server up");

// 3. revive loc0 session: open login, sign in with the demo creds
run('agent-browser --session loc0 set viewport 1440 900');
run('agent-browser --session loc0 open http://127.0.0.1:3201/login');
await new Promise(r => setTimeout(r, 2200));
run('agent-browser --session loc0 fill "input[type=email]" "sepnetflix2023@outlook.com"');
await new Promise(r => setTimeout(r, 400));
run("agent-browser --session loc0 fill 'input[type=password]' '$Abcd1234'");
await new Promise(r => setTimeout(r, 400));
const snap = run('agent-browser --session loc0 snapshot -i -c');
const btnRef = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
if (btnRef) run(`agent-browser --session loc0 click @${btnRef}`);
await new Promise(r => setTimeout(r, 4500));
const url = run('agent-browser --session loc0 get url');
console.log("loc0 at:", url.trim());

// 4. run the shared reader (scripts/r49-eval.txt — same file the REF
// probes use, so both sides read identically)
import { readFileSync } from "node:fs";
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const READER = readFileSync(new URL("./r49-eval.txt", import.meta.url), "utf8");
for (const route of routes) {
  run(`agent-browser --session loc0 open "http://127.0.0.1:3201${route}"`);
  await new Promise(r => setTimeout(r, 2100));
  const r = await evalOn("loc0", READER);
  console.log(`\n===== ${route} =====`);
  console.log(JSON.stringify(r, null, 1).slice(0, 3000));
}
process.exit(0);
