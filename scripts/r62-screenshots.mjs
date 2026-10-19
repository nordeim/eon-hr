#!/usr/bin/env node
// r62-screenshots.mjs — parity round 61's evidence captures: the
// dark-mode border-color family — the recruitmentkanban per-stage
// column pair, the attendance action-button trio + stat-card pair, the
// securitysettings checkbox-border pair (the both-theme literal pair),
// the loans empty-state card pair (the unflipping slate-200), the
// shiftcalendar th pair, the assetmanagement thead pair, the compliance
// severity-card + At-Risk pair, the dashboard Customize-button pair
// (the flipping token), the attendance Report-Type card pair, the
// profile cards + role-badge pair. REF + seeded LOC pairs, one process
// tree with the :3200 server. Numbers continue from 294.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-shots-r62.log 2>&1`],
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
// arm dark on both (the shared localStorage contract) — the round's theme
for (const s of ["ref", "loc"]) {
  run(`agent-browser --session ${s} open ${s === "ref" ? "https://eon.base44.app/dashboard" : "http://127.0.0.1:3200/dashboard"}`);
  await new Promise(r => setTimeout(r, 2500));
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','true')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]];

// ---- 294/295: the recruitmentkanban per-stage column pair (dark) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/recruitmentkanban`);
  await new Promise(r => setTimeout(r, 4600));
  run(`agent-browser --session ${session} eval "window.scrollTo(0, 260)"`);
  await new Promise(r => setTimeout(r, 600));
  cap(session, `294-kanban-columns-${suffix}`);
}

// ---- 296/297: the attendance action-button trio + stat cards (dark) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/attendance`);
  await new Promise(r => setTimeout(r, 4600));
  cap(session, `296-attendance-buttons-${suffix}`);
}

// ---- 298/299: the securitysettings checkbox-border pair (dark — #fafafa) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/securitysettings`);
  await new Promise(r => setTimeout(r, 4600));
  run(`agent-browser --session ${session} eval "window.scrollTo(0, 760)"`);
  await new Promise(r => setTimeout(r, 600));
  cap(session, `298-security-checkbox-${suffix}`);
}

// ---- 300/301: the loans empty-state card pair (dark — light-bordered) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/loans`);
  await new Promise(r => setTimeout(r, 4600));
  cap(session, `300-loans-card-${suffix}`);
}

// ---- 302/303: the shiftcalendar th pair (dark — the slate-200 header) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/shiftcalendar`);
  await new Promise(r => setTimeout(r, 5000));
  run(`agent-browser --session ${session} eval "window.scrollTo(0, 560)"`);
  await new Promise(r => setTimeout(r, 700));
  cap(session, `302-shiftcalendar-ths-${suffix}`);
}

// ---- 304/305: the assetmanagement thead pair (dark — slate-200/slate-50) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/assetmanagement`);
  await new Promise(r => setTimeout(r, 4600));
  cap(session, `304-assetmanagement-thead-${suffix}`);
}

// ---- 306/307: the compliance severity cards + At-Risk pair (dark) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/compliancedashboard`);
  await new Promise(r => setTimeout(r, 4600));
  run(`agent-browser --session ${session} eval "window.scrollTo(0, 400)"`);
  await new Promise(r => setTimeout(r, 600));
  cap(session, `306-compliance-severity-atrisk-${suffix}`);
}

// ---- 308/309: the dashboard Customize-button pair (dark — the token flip) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 4600));
  cap(session, `308-dashboard-customize-${suffix}`);
}

// ---- 310/311: the attendance Report-Type card pair (dark — 3-level shape) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/attendance`);
  await new Promise(r => setTimeout(r, 4600));
  run(`agent-browser --session ${session} eval "window.scrollTo(0, 240)"`);
  await new Promise(r => setTimeout(r, 600));
  cap(session, `310-attendance-reportcard-${suffix}`);
}

// ---- 312/313: the profile cards + role-badge pair (dark) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/profile`);
  await new Promise(r => setTimeout(r, 4600));
  cap(session, `312-profile-cards-badge-${suffix}`);
}

// restore light
for (const s of ["loc", "ref"]) run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false')"`);
console.log("done");
process.exit(0);
