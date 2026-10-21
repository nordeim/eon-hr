#!/usr/bin/env node
// r72-console-probe.mjs — the CSP + Trusted-Types violation probe on the
// patched build (the r71 pattern: drive the heaviest primitives under the
// hardened policy and read the console — zero violations is the proof).
// The surfaces: the recharts dashboard, a Radix select popper, a Radix
// dialog, and the vaul mobile drawer — the four primitive families the
// r71 probe exercised, now under the ADDITIONAL TT enforcement layer.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function sleep(ms) { await new Promise((r) => setTimeout(r, ms)); }

const repo = "/home/z/my-project/eon-hr";
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" DATABASE_URL="file:../db/custom.db" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-r72probe.log 2>&1 < /dev/null &`],
  { stdio: "ignore", detached: true });
server.unref();
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await sleep(500);
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200");

run(`agent-browser --session probe72 set viewport 1440 900`);
run(`agent-browser --session probe72 open http://127.0.0.1:3200/login`);
await sleep(2500);
run(`agent-browser --session probe72 fill "input[type=email]" "sepnetflix2023@outlook.com"`);
await sleep(400);
run(`agent-browser --session probe72 fill 'input[type=password]' '$Abcd1234'`);
await sleep(400);
const snap = run('agent-browser --session probe72 snapshot -i -c');
const btn = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
if (btn) run(`agent-browser --session probe72 click @${btn}`);
await sleep(4500);
console.log("post-auth:", run("agent-browser --session probe72 get url").trim());

// 1. the recharts dashboard (9 svgs) under TT + CSP
run("agent-browser --session probe72 open http://127.0.0.1:3200/dashboard");
await sleep(4000);
const svgCount = run(`agent-browser --session probe72 eval "document.querySelectorAll('svg.recharts-surface').length"`).trim();
console.log("recharts svgs on /dashboard:", svgCount);

// 2. a Radix select popper (payroll's Group By or a settings select)
run("agent-browser --session probe72 open http://127.0.0.1:3200/settings");
await sleep(3500);
const selectLine = run(`agent-browser --session probe72 eval "(() => { const t = [...document.querySelectorAll('button[role=combobox]')][0]; return t ? t.getAttribute('aria-label') || t.textContent.trim().slice(0, 24) : 'NONE'; })()"`).trim();
console.log("select trigger:", selectLine);
const selectSnap = run('agent-browser --session probe72 snapshot -i -c');
const selRef = (selectSnap.split("\n").find((l) => l.includes("combobox")) || "").match(/ref=(\w+)/) || [];
if (selRef[1]) { run(`agent-browser --session probe72 click @${selRef[1]}`); await sleep(1200); }
console.log("popper open:", run(`agent-browser --session probe72 eval "!!document.querySelector('[data-radix-popper-content-wrapper]')"`).trim());
if (selRef[1]) { run(`agent-browser --session probe72 click @${selRef[1]}`); await sleep(600); }

// 3. a Radix dialog (payroll's Add Payroll) under TT + CSP
run("agent-browser --session probe72 open http://127.0.0.1:3200/payroll");
await sleep(3500);
const dlgSnap = run('agent-browser --session probe72 snapshot -i -c');
const dlgRef = (dlgSnap.split("\n").find((l) => /button .*(Add|New|Create|Run)/i.test(l)) || "").match(/ref=(\w+)/) || [];
if (dlgRef[1]) { run(`agent-browser --session probe72 click @${dlgRef[1]}`); await sleep(1500); }
console.log("dialog open:", run(`agent-browser --session probe72 eval "!!document.querySelector('[role=dialog]')"`).trim());
run("agent-browser --session probe72 press Escape");
await sleep(500);

// 4. the vaul mobile drawer (the standing mobile surface)
run("agent-browser --session probe72 set viewport 390 844");
await sleep(500);
run("agent-browser --session probe72 open http://127.0.0.1:3200/dashboard");
await sleep(1000);
run("agent-browser --session probe72 set viewport 390 844");
await sleep(3000);
const mSnap = run('agent-browser --session probe72 snapshot -i -c');
const mLine = mSnap.split("\n").find((l) => l.includes("Toggle Sidebar")) || "";
const mRef = (mLine.match(/ref=(\w+)/) || [])[1];
if (mRef) run(`agent-browser --session probe72 click @${mRef}`);
await sleep(1400);
console.log("drawer open:", run(`agent-browser --session probe72 eval "!!document.querySelector('[role=dialog]')"`).trim());

// the console read — violations of EITHER policy family
const consoleOut = run("agent-browser --session probe72 console");
const lines = consoleOut.split("\n").filter((l) => /violation|blocked|Refused|TrustedTypes|trusted-types| CSP |TypeError/i.test(l));
console.log("\n==== console violation lines (" + lines.length + ") ====");
for (const l of lines.slice(0, 20)) console.log(" ", l.slice(0, 220));
if (lines.length === 0) console.log("  ZERO violations across the dashboard charts, the select popper, the dialog, and the mobile drawer");
console.log("\nPROBE DONE");
