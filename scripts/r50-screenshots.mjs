#!/usr/bin/env node
// r50-screenshots.mjs — parity round 49's evidence captures: REF +
// zero-tenant LOC pairs (@1440×900) of the round's surfaces — the
// never-deep-measured routes. Runs in one process tree with the :3201
// server. Numbers continue from 219.
import { execSync, spawn } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3201$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
run(`rm -f ${repo}/db/zero.db ${repo}/db/zero.db-journal`);
run(`cd ${repo} && DATABASE_URL="file:../db/zero.db" npx prisma db push --skip-generate >/dev/null 2>&1`);
run(`cd ${repo} && DATABASE_URL="file:../db/zero.db" npx tsx prisma/seed.ts >/dev/null 2>&1`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/zero.db" AUTH_SECRET=zero-tenant-secret PORT=3201 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc0-shots-r50.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3201/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }

run('agent-browser --session loc0 set viewport 1440 900');
run('agent-browser --session loc0 open http://127.0.0.1:3201/login');
await new Promise(r => setTimeout(r, 2200));
run('agent-browser --session loc0 fill "input[type=email]" "sepnetflix2023@outlook.com"');
await new Promise(r => setTimeout(r, 350));
run("agent-browser --session loc0 fill 'input[type=password]' '$Abcd1234'");
await new Promise(r => setTimeout(r, 350));
const snap = run('agent-browser --session loc0 snapshot -i -c');
const btnRef = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
if (btnRef) run(`agent-browser --session loc0 click @${btnRef}`);
await new Promise(r => setTimeout(r, 4200));
console.log("loc0:", run('agent-browser --session loc0 get url').trim());

const CAPTURES = [
  ["glyphs-shiftswap", "/shiftswap"],
  ["tabs-staffrequests", "/staffrequests"],
  ["slow-payrollmodule", "/payrollmodule"],
  ["cards-payrollengine", "/payrollengine"],
  ["stats-surveyanalytics", "/surveyanalytics"],
  ["switches-notificationpreferences", "/notificationpreferences"],
  ["zero-employeeportal", "/employeeportal"],
  ["cards-requestsettings", "/requestsettings"],
  ["title-hrletters", "/hrletters"],
  ["divs-surveys", "/surveys"],
  ["stats-payrollai", "/payrollai"],
  ["hero-careers", "/careers"],
  ["zero-externaljobapplication", "/externaljobapplication"],
];
const SLOW = new Set(["slow-payrollmodule"]);

let n = 219;
for (const [name, route] of CAPTURES) {
  run(`agent-browser --session ref set viewport 1440 900`);
  run(`agent-browser --session ref open "https://eon.base44.app${route}"`);
  await new Promise(r => setTimeout(r, SLOW.has(name) ? 11000 : 3000));
  run(`agent-browser --session ref screenshot "${shots}/${n}-${name}-ref.png"`);
  run(`agent-browser --session loc0 open "http://127.0.0.1:3201${route}"`);
  await new Promise(r => setTimeout(r, SLOW.has(name) ? 9000 : 2400));
  run(`agent-browser --session loc0 screenshot "${shots}/${n}-${name}-loc.png"`);
  console.log(`${n} ${name}`);
  n++;
}
console.log(`done — ${n - 219} pairs`);
process.exit(0);
