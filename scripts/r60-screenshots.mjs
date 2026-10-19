#!/usr/bin/env node
// r60-screenshots.mjs — parity round 59's evidence captures: the
// dark-mode fill family — the dark-mode checkbox pair (REF vs the clone
// post-fix), the dark compliance notify tints, the employees grid
// default + the flat payrollengine emerald (LOC evidence), and the
// settings inline Company edit form. REF + seeded LOC pairs, one
// process tree with the :3200 server. Numbers continue from 270.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-shots-r60.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200");

async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 400));
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const ref = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
  if (ref) run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, 4200));
  console.log(session, "->", run(`agent-browser --session ${session} get url`).trim());
}
await auth("ref", "https://eon.base44.app");
await auth("loc", "http://127.0.0.1:3200");
// arm dark on both (the shared localStorage contract)
for (const s of ["ref", "loc"]) {
  run(`agent-browser --session ${s} open https://eon.base44.app/dashboard`);
  await new Promise(r => setTimeout(r, 2500));
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','true')"`);
}

// ---- 270: the dark-mode checkbox pair (securitysettings) ----
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/securitysettings`);
  await new Promise(r => setTimeout(r, 5200));
  run(`agent-browser --session ${session} screenshot ${shots}/270-dark-checkbox-${suffix}.png`);
}
console.log("270 pair done");

// ---- 271: the dark compliance notify tints ----
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/compliancedashboard`);
  await new Promise(r => setTimeout(r, 5200));
  run(`agent-browser --session ${session} screenshot ${shots}/271-dark-compliance-notify-${suffix}.png`);
}
console.log("271 pair done");

// ---- 272: the dark employees grid default (the toggle pair) ----
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/employees`);
  await new Promise(r => setTimeout(r, 5200));
  run(`agent-browser --session ${session} screenshot ${shots}/272-dark-employees-grid-${suffix}.png`);
}
console.log("272 pair done");

// ---- 273: the flat emerald Generate Payroll (light, LOC + REF pair) ----
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false')"`);
  run(`agent-browser --session ${session} open ${base}/payrollengine`);
  await new Promise(r => setTimeout(r, 5200));
  run(`agent-browser --session ${session} screenshot ${shots}/273-payrollengine-emerald-${suffix}.png`);
}
console.log("273 pair done");

// ---- 274: the settings inline Company edit form (LOC evidence, post-press) ----
run(`agent-browser --session loc open http://127.0.0.1:3200/settings`);
await new Promise(r => setTimeout(r, 5200));
run(`agent-browser --session loc eval "(() => { const b = [...document.querySelectorAll('main button')].find(x => (x.textContent||'').trim() === 'Edit'); if (b) b.click(); return 'ok'; })()"`);
await new Promise(r => setTimeout(r, 2200));
run(`agent-browser --session loc screenshot ${shots}/274-settings-inline-edit-loc.png`);
console.log("274 done");

// ---- 275: REF's inline form for the pair comparison ----
run(`agent-browser --session ref open https://eon.base44.app/settings`);
await new Promise(r => setTimeout(r, 5200));
run(`agent-browser --session ref eval "(() => { const b = [...document.querySelectorAll('main button')].find(x => (x.textContent||'').trim() === 'Edit'); if (b) b.click(); return 'ok'; })()"`);
await new Promise(r => setTimeout(r, 2200));
run(`agent-browser --session ref screenshot ${shots}/275-settings-inline-edit-ref.png`);
console.log("275 done");

// restore light
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false')"`);
process.exit(0);
