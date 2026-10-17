#!/usr/bin/env node
// r48-screenshots.mjs — parity round 48's evidence captures: REF +
// zero-tenant LOC pairs (@1440×900) of the round's surfaces. Runs in one
// process tree with the :3201 server. Numbers continue from 193.
import { execSync, spawn } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3201$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
run(`rm -f ${repo}/db/zero.db ${repo}/db/zero.db-journal`);
run(`cd ${repo} && DATABASE_URL="file:../db/zero.db" npx prisma db push --skip-generate >/dev/null 2>&1`);
run(`cd ${repo} && DATABASE_URL="file:../db/zero.db" npx tsx prisma/seed.ts >/dev/null 2>&1`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/zero.db" AUTH_SECRET=zero-tenant-secret PORT=3201 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc0-shots.log 2>&1`],
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

// the round's surfaces: [shortName, route]
const CAPTURES = [
  ["bare-organogram", "/organogram"],
  ["bare-securitysettings", "/securitysettings"],
  ["bare-settings", "/settings"],
  ["bare-interviewassistant-c1", "/interviewassistant"],
  ["bare-hrassistant", "/hrassistant"],
  ["bare-hrassistantchat", "/hrassistantchat"],
  ["bare-evaluations-c6", "/evaluations"],
  ["bare-analytics-c8", "/analytics"],
  ["alwaysrow-hrreports-c5", "/hrreports"],
  ["alwaysrow-requestreports-c7", "/requestreports"],
  ["alwaysrow-assets", "/assets"],
  ["alwaysrow-offboarding", "/offboarding"],
  ["mdrow-taskmanager", "/taskmanager"],
  ["mdrow-leavemanagement", "/leavemanagement"],
  ["shortrow-loans", "/loans"],
  ["c3-payrollreports", "/payrollreports"],
  ["c9-recruitmentkanban", "/recruitmentkanban"],
  ["c4-chat", "/chat"],
  ["c8-attendancedashboard", "/attendancedashboard"],
  ["c8-analyticsdashboard", "/analyticsdashboard"],
  ["c8-surveyanalytics", "/surveyanalytics"],
  ["c8-advancedanalytics", "/advancedanalytics"],
  ["g1-profile", "/profile"],
  ["bare-training", "/training"],
  ["bare-companywall", "/companywall"],
  ["bare-reports", "/reports"],
];

let n = 193;
for (const [name, route] of CAPTURES) {
  run(`agent-browser --session ref set viewport 1440 900`);
  run(`agent-browser --session ref open "https://eon.base44.app${route}"`);
  await new Promise(r => setTimeout(r, 2800));
  run(`agent-browser --session ref screenshot "${shots}/${n}-${name}-ref.png"`);
  run(`agent-browser --session loc0 open "http://127.0.0.1:3201${route}"`);
  await new Promise(r => setTimeout(r, 2300));
  run(`agent-browser --session loc0 screenshot "${shots}/${n}-${name}-loc.png"`);
  console.log(`${n} ${name}`);
  n++;
}
console.log(`done — ${n - 193} pairs`);
process.exit(0);
