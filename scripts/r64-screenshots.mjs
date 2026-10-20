#!/usr/bin/env node
// r64-screenshots.mjs — parity round 63's evidence captures: the
// iconed-search padding pairs (payroll pl-10 / payrollmodule,
// documenttracker, assetmanagement pl-9 — typed text clears the left-3
// icon, the collision fixed), the placeholder-text pairs (compliance,
// recruitmentkanban, interviewassistant textarea, tenantsetup — REF's
// live verbatim strings), and the mobile drawer pair @390 (the standing
// mobile-menu check evidence). REF + seeded LOC pairs, one process tree
// with the :3200 server. LIGHT armed (the round's theme). Numbers
// continue from 314–325 (the r63 set). Fresh sessions (the r63
// stale-viewport lesson).
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-shots-r64.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
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
// fresh sessions (the r63 stale-viewport lesson)
run(`agent-browser close --all 2>/dev/null; true`);
await auth("ref64", "https://eon.base44.app");
await auth("loc64", "http://127.0.0.1:3200");
// arm LIGHT on both (the shared localStorage contract) — the round's theme
for (const s of [["ref64", "https://eon.base44.app"], ["loc64", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${s[0]} open ${s[1]}/dashboard`);
  await new Promise(r => setTimeout(r, 2500));
  run(`agent-browser --session ${s[0]} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref64", "https://eon.base44.app", "ref"], ["loc64", "http://127.0.0.1:3200", "loc"]];

// ---- the typed-text padding pairs: text clears the left-3 icon ----
async function typedPair(route, sel, typed, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 4600));
    run(`agent-browser --session ${session} fill '${sel}' '${typed}'`);
    await new Promise(r => setTimeout(r, 400));
    cap(session, `${name}-${suffix}`);
  }
}
// 326/327 payroll (pl-10, 40px)
await typedPair("/payroll", 'input[placeholder="Search employee..."]', "Ahmed Ali", "326-payroll-search-padding");
// 328/329 payrollmodule (pl-9, 36px)
await typedPair("/payrollmodule", 'input[placeholder="Search employees..."]', "Ahmed Ali", "328-payrollmodule-search-padding");
// 330/331 documenttracker (pl-9, 36px)
await typedPair("/documenttracker", 'input[placeholder="Search by employee or document number..."]', "Ahmed Ali", "330-documenttracker-search-padding");
// 332/333 assetmanagement (pl-9, 36px)
await typedPair("/assetmanagement", 'input[placeholder="Search assets..."]', "Ahmed Ali", "332-assetmanagement-search-padding");

// ---- the placeholder-text pairs (untyped — the placeholder shows) ----
async function routePair(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 4600));
    cap(session, `${name}-${suffix}`);
  }
}
// 334/335 compliance ("Search employee...")
await routePair("/compliancedashboard", "334-compliance-placeholder");
// 336/337 recruitmentkanban ("Search applicants...")
await routePair("/recruitmentkanban", "336-kanban-placeholder");
// 338/339 interviewassistant textarea (the verbatim observations string)
await routePair("/interviewassistant", "338-interviewassistant-placeholder");
// 340/341 tenantsetup ("Acme Corporation" / "admin@acme.com")
await routePair("/tenantsetup", "340-tenantsetup-placeholders");

// ---- 342/343: the mobile drawer pair @390x844 (the standing check) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ${session} set viewport 390 844`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} click 'button[aria-label="Toggle Sidebar"]'`);
  await new Promise(r => setTimeout(r, 1200));
  cap(session, `342-mobile-drawer-${suffix}`);
}
console.log("done");
process.exit(0);
