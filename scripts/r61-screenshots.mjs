#!/usr/bin/env node
// r61-screenshots.mjs — parity round 60's evidence captures: the
// dark-mode text-color family — the compliance severity-chip pair, the
// at-risk green-check empty pair, the evaluations per-tile colors pair,
// the securitysettings shield recommendations pair, the payroll search
// icon dark pair, the chat Messages-h2 dark pair, the payrollai
// CardHeader pair, the surveyanalytics legend pair, the
// performancemanagement icons (LOC), the hrassistant empty pane (LOC).
// REF + seeded LOC pairs, one process tree with the :3200 server.
// Numbers continue from 276.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-shots-r61.log 2>&1`],
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

function cap(session, name, clipY = null) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}

// ---- 276/277: the compliance severity-chip pair (dark) ----
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/compliancedashboard`);
  await new Promise(r => setTimeout(r, 4200));
  cap(session, `276-compliance-chips-${suffix}`);
}

// ---- 278/279: the at-risk empty state pair (the 48px green-400 check, dark) ----
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} eval "window.scrollTo(0, 620)"`);
  await new Promise(r => setTimeout(r, 600));
  cap(session, `278-compliance-atrisk-empty-${suffix}`);
}

// ---- 280/281: the evaluations per-tile colors pair (dark) ----
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/evaluations`);
  await new Promise(r => setTimeout(r, 4200));
  cap(session, `280-evaluations-tiles-${suffix}`);
}

// ---- 282/283: the securitysettings recommendations pair (the blue shields, dark) ----
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/securitysettings`);
  await new Promise(r => setTimeout(r, 4200));
  run(`agent-browser --session ${session} eval "window.scrollTo(0, 900)"`);
  await new Promise(r => setTimeout(r, 600));
  cap(session, `282-security-shields-${suffix}`);
}

// ---- 284/285: the payroll search-icon + DollarSign empty pair (dark) ----
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/payroll`);
  await new Promise(r => setTimeout(r, 4200));
  cap(session, `284-payroll-search-dollar-${suffix}`);
}

// ---- 286/287: the chat Messages h2 pair (dark) ----
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/chat`);
  await new Promise(r => setTimeout(r, 4200));
  cap(session, `286-chat-h2-${suffix}`);
}

// ---- 288/289: the payrollai CardHeader pair (dark) ----
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/payrollai`);
  await new Promise(r => setTimeout(r, 4200));
  cap(session, `288-payrollai-cardheader-${suffix}`);
}

// ---- 290/291: the surveyanalytics legend pair (dark) ----
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/surveyanalytics`);
  await new Promise(r => setTimeout(r, 5200));
  run(`agent-browser --session ${session} eval "window.scrollTo(0, 930)"`);
  await new Promise(r => setTimeout(r, 800));
  cap(session, `290-surveyanalytics-legend-${suffix}`);
}

// ---- 292: the performancemanagement stat icons (LOC, dark) ----
run(`agent-browser --session loc open http://127.0.0.1:3200/performancemanagement`);
await new Promise(r => setTimeout(r, 4200));
cap("loc", "292-performance-icons-loc");

// ---- 293: the hrassistant empty pane (LOC, dark) ----
run(`agent-browser --session loc open http://127.0.0.1:3200/hrassistant`);
await new Promise(r => setTimeout(r, 4200));
cap("loc", "293-hrassistant-pane-loc");

// restore light on both
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false')"`);

// hash-verify all distinct
const { createHash } = await import("node:crypto");
const { readdirSync, readFileSync } = await import("node:fs");
const newOnes = readdirSync(shots).filter((f) => /^(27[6-9]|28[0-9]|29[0-3])-/.test(f));
const seen = new Set();
for (const f of newOnes) {
  const h = createHash("sha256").update(readFileSync(`${shots}/${f}`)).digest("hex").slice(0, 12);
  if (seen.has(h)) { console.log("DUPLICATE HASH:", f); process.exit(1); }
  seen.add(h);
}
console.log(`hash-verified ${newOnes.length} distinct captures -> ${newOnes.length} files`);
process.exit(0);
