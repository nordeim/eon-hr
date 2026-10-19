#!/usr/bin/env node
// r60-probe6.mjs — why doesn't the LOC settings Edit render? Dump the
// CompanyTab state: /api/company response + the full button census +
// the card presence.
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r60p6.log 2>&1`],
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
  run(`agent-browser --session ${session} fill "input[type=email]" "sepnetflix2023@outlook.com"`);
  await new Promise(r => setTimeout(r, 350));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 350));
  run(`agent-browser --session ${session} click 'button[type=submit]'`);
  await new Promise(r => setTimeout(r, 5000));
}
await auth("loc", "http://127.0.0.1:3200");
await evalOn("loc", `localStorage.setItem('darkMode','false')`);
run('agent-browser --session loc open "http://127.0.0.1:3200/settings"');
await new Promise(r => setTimeout(r, 6000));

const DUMP = `(() => {
  const api = fetch('/api/auth/me').then(r => r.json()).then(j => 'role=' + (j.data?.user?.role ?? 'none'));
  const btns = [...document.querySelectorAll('main button')].filter(b => b.getBoundingClientRect().height > 0).map(b => (b.textContent||'').trim().slice(0,20));
  const card = !!document.querySelector('main [class*=border-b]');
  const spinner = !!document.querySelector('main .animate-spin');
  const companyInfo = (document.querySelector('main').textContent||'').includes('Company Information');
  return { btns: btns.slice(0, 20), spinner, companyInfo };
})()`;
console.log("LOC settings state:", JSON.stringify(await evalOn("loc", DUMP, 1000)));
const ME = `(() => fetch('/api/auth/me').then(r => r.json()).then(j => JSON.stringify({ role: j.data?.user?.role })))()`;
console.log("auth/me from page:", JSON.stringify(await evalOn("loc", ME)));
const CO = `(() => fetch('/api/company').then(r => r.json()).then(j => JSON.stringify(j).slice(0, 300)))()`;
console.log("company from page:", JSON.stringify(await evalOn("loc", CO)));
process.exit(0);
