#!/usr/bin/env node
// r64-probe2.mjs — session-64 / parity round 63: the iconed-search-input
// padding read. For every text input in main on each route: the placeholder,
// the computed padding-left, whether an absolute-positioned svg icon sits in
// its wrapper (the iconed-search pattern), and the class-string tail (the
// pl-10 member question). Runs on BOTH sides for the 6 iconed-search routes.
// Usage: node scripts/r64-probe2.mjs
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r64p2.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }

async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 2200));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 350));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 350));
  run(`agent-browser --session ${session} click 'button[type=submit]'`);
  await new Promise(r => setTimeout(r, 5000));
}
await auth("loc", "http://127.0.0.1:3200");
await auth("ref", "https://eon.base44.app");
for (const s of ["loc", "ref"]) await evalOn(s, `localStorage.setItem('darkMode','false')`);

const READ = `(() => {
  const out = [];
  for (const el of document.querySelectorAll('main input[type=text], main input:not([type])')) {
    const cs = getComputedStyle(el);
    const wrapper = el.parentElement;
    const icon = wrapper && wrapper.querySelector(':scope > svg.absolute, :scope > span.absolute');
    out.push({
      ph: el.placeholder || '',
      pl: cs.paddingLeft,
      icon: icon ? 'yes' : 'no',
      clsTail: (el.className || '').replace(/\\s+/g, ' ').split(' ').slice(-6).join(' ')
    });
  }
  return out;
})()`;

const ROUTES = process.argv.slice(2).length > 0 ? process.argv.slice(2) : [
  "/dashboard", "/employees", "/payroll", "/taskmanager", "/leavemanagement",
  "/expenses", "/loans", "/recruitment", "/training", "/compliancedashboard",
  "/evaluations", "/assetmanagement", "/staffrequests", "/companywall", "/chat",
  "/announcements", "/documenttracker", "/offboarding", "/surveys", "/settings",
  "/profile", "/workflowautomation", "/attendance", "/hrreports", "/analytics",
  "/recruitmentkanban", "/interviewassistant", "/notificationpreferences",
  "/securitysettings", "/templates", "/organogram", "/payrollmodule", "/payrollengine",
  "/shiftcalendar", "/hrassistant", "/hrassistantchat", "/payrollai", "/surveyanalytics",
  "/advancedanalytics", "/hrletters", "/requestreports", "/requestsettings",
  "/shiftswap", "/tenantsetup", "/workflowconfigpage", "/communications",
  "/performancemanagement", "/onboardingtemplates", "/careers",
];
for (let i = 0; i < ROUTES.length; i++) {
  const route = ROUTES[i];
  if (i > 0 && i % 6 === 0) { await auth("ref", "https://eon.base44.app"); await evalOn("ref", `localStorage.setItem('darkMode','false')`); }
  run(`agent-browser --session ref open "https://eon.base44.app${route}"`);
  run(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`);
  await new Promise(r => setTimeout(r, 4000));
  const ref = await evalOn("ref", READ, 1500);
  const loc = await evalOn("loc", READ, 400);
  console.log(`\n=== ${route} ===`);
  console.log("REF:", JSON.stringify(ref));
  console.log("LOC:", JSON.stringify(loc));
}
process.exit(0);
