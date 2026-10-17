#!/usr/bin/env node
// r50-boot-loc0.mjs — one-call orchestrator: refresh the zero-tenant db
// (db/zero.db: schema + demo user only), boot the standalone server on
// :3201 against it, revive the loc0 browser session (auth), then run the
// deep reader (r50-eval.txt) over the routes. The whole tree dies when
// this call ends, so everything must complete within it.
// Usage: node scripts/r50-boot-loc0.mjs /route1 /route2
import { execSync, spawn } from "node:child_process";
import { readFileSync } from "node:fs";

function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 160); } }

const routes = process.argv.slice(2);
const repo = "/home/z/my-project/eon-hr";

run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3201$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
run(`rm -f ${repo}/db/zero.db ${repo}/db/zero.db-journal`);
run(`cd ${repo} && DATABASE_URL="file:../db/zero.db" npx prisma db push --skip-generate 2>&1 | tail -1`);
run(`cd ${repo} && DATABASE_URL="file:../db/zero.db" npx tsx prisma/seed.ts 2>&1 | tail -1`);

const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/zero.db" AUTH_SECRET=zero-tenant-secret PORT=3201 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc0-r50.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3201/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN", run("tail -5 /tmp/loc0-r50.log")); process.exit(1); }
console.log("server up");

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
console.log("loc0 at:", run('agent-browser --session loc0 get url').trim());

async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t = out.trim(); try { return JSON.parse(t); } catch {} try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const READER = readFileSync(new URL("./r50-eval.txt", import.meta.url), "utf8");
const SLOW = new Set(["/payrollmodule", "/dynamicdashboard"]);
for (const route of routes) {
  run(`agent-browser --session loc0 open "http://127.0.0.1:3201${route}"`);
  await new Promise(r => setTimeout(r, SLOW.has(route) ? 9000 : 2200));
  const r = await evalOn("loc0", READER);
  console.log(`\n===== ${route} =====`);
  console.log(JSON.stringify(r, null, 1).slice(0, 4200));
}
process.exit(0);
