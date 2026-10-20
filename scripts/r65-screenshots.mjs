#!/usr/bin/env node
// r65-screenshots.mjs — parity round 64's evidence captures: the
// geometry-census fix pairs — the four padding-driven stat-tile pages
// (payroll / expenses / surveys / attendance — REF's bg-{c}-100 p-3
// rounded-xl 48×48 tiles), the chat column header (the RESTORED border-b
// under the p-4 wrapper + the px-3 button), the compliance filter row
// (the bordered white box), the hrassistant pane/row geometry, the
// securitysettings checkboxes (REF's 4px rounded-sm), the requestreports
// Back + th family, the recruitment empty-state td + the shiftcalendar
// cells (the UA 1px restoration), and the mobile drawer pair @390 (the
// standing mobile-menu check evidence). REF + seeded LOC pairs, one
// process tree with the :3200 server. LIGHT armed (the round's theme).
// Numbers continue from 326–343 (the r64 set). Fresh sessions (the r63
// stale-viewport lesson).
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-shots-r65.log 2>&1`],
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
await auth("ref65", "https://eon.base44.app");
await auth("loc65", "http://127.0.0.1:3200");
// arm LIGHT on both (the shared localStorage contract) — the round's theme
for (const s of [["ref65", "https://eon.base44.app"], ["loc65", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${s[0]} open ${s[1]}/dashboard`);
  await new Promise(r => setTimeout(r, 2500));
  run(`agent-browser --session ${s[0]} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
const pairs = [["ref65", "https://eon.base44.app", "ref"], ["loc65", "http://127.0.0.1:3200", "loc"]];

async function routePair(route, name) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 4600));
    cap(session, `${name}-${suffix}`);
  }
}

// ---- 344–351: the four padding-driven stat-tile pages ----
await routePair("/payroll", "344-payroll-p3-tiles");
await routePair("/expenses", "346-expenses-p3-tiles");
await routePair("/surveys", "348-surveys-p3-tiles");
await routePair("/attendance", "350-attendance-p3-tiles");

// ---- 352/353: the chat column header (the restored border-b) ----
await routePair("/chat", "352-chat-column-header");

// ---- 354/355: the compliance filter row (the bordered white box) ----
await routePair("/compliancedashboard", "354-compliance-filter-row");

// ---- 356/357: the hrassistant pane + input row geometry ----
await routePair("/hrassistant", "356-hrassistant-geometry");

// ---- 358/359: the securitysettings checkboxes (the 4px rounded-sm) ----
await routePair("/securitysettings", "358-securitysettings-checkboxes");

// ---- 360/361: the requestreports Back button + the th family ----
await routePair("/requestreports", "360-requestreports-back-th");

// ---- 362/363: the recruitment empty-state td (the UA 1px) ----
await routePair("/recruitment", "362-recruitment-empty-td");

// ---- 364/365: the shiftcalendar cells (the UA 1px) ----
await routePair("/shiftcalendar", "364-shiftcalendar-cells");

// ---- 366/367: the mobile drawer pair @390x844 (the standing check) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ${session} set viewport 390 844`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} click 'button[aria-label="Toggle Sidebar"]'`);
  await new Promise(r => setTimeout(r, 1200));
  cap(session, `366-mobile-drawer-${suffix}`);
}
console.log("done");
process.exit(0);
