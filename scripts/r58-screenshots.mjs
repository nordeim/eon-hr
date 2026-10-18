#!/usr/bin/env node
// r58-screenshots.mjs — session-58 / parity round 57 captures: the
// CTA-fill recipe family's post-fix state, paired REF vs LOC:
//   259 — the employees toolbar (the view-toggle pair: the dark+sm
//         recipe, LIST first, gap-2)
//   260 — the company wall composer (the dark Post CTA)
//   261 — the profile General tab (the dark Save Changes)
//   262 — the notification preferences page (the blue Save Preferences
//         + the dark checked switches)
//   263 — the assets page (the green gradient Add Asset — the bg-none
//         P1 fix)
//   264 — LOC superset evidence (unpaired — the with-data deletion
//         contract lives in the E2E; this captures the mixed-recipe
//         surfaces REF also carries: the workflowconfigpage blue pair)
// Boots the seeded :3200 standalone inside this process tree.
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const settle = (ms) => new Promise(r => setTimeout(r, ms));
function evalStr(expr) { return JSON.stringify(expr.split("\n").join(" ")); }
async function ev(session, expr) {
  const out = run(`agent-browser --session ${session} eval ${evalStr(expr)}`);
  try { return JSON.parse(JSON.parse(out.trim())); } catch { return "ERR:" + out.slice(0, 200); }
}

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const shotDir = `${repo}/docs/screenshots`;

run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r58s.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await settle(500);
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("seeded server up on :3200");

async function ensureAuthed(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/`);
  await settle(2600);
  const path = await ev(session, "location.pathname");
  if (path === "/login" || path === "ERR") {
    run(`agent-browser --session ${session} open ${base}/login`);
    await settle(2800);
    run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
    await settle(400);
    run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
    await settle(400);
    const snap = run(`agent-browser --session ${session} snapshot -i -c`);
    const btn = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
    if (btn) run(`agent-browser --session ${session} click @${btn}`);
    await settle(4200);
  }
}

function shot(session, file) {
  run(`agent-browser --session ${session} screenshot ${file}`);
  console.log(file.split("/").pop());
}

// ---- 259: the employees toolbar (the view-toggle pair) ----
for (const [session, base, tag] of [["ref", baseRef, "ref"], ["loc", baseLoc, "loc"]]) {
  await ensureAuthed(session, base);
  run(`agent-browser --session ${session} open ${base}/employees`);
  await settle(3400);
  shot(session, `${shotDir}/259-employees-toggle-${tag}.png`);
}

// ---- 260: the company wall composer (the dark Post CTA) ----
for (const [session, base, tag] of [["ref", baseRef, "ref"], ["loc", baseLoc, "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/companywall`);
  await settle(3400);
  shot(session, `${shotDir}/260-wall-post-${tag}.png`);
}

// ---- 261: the profile General tab (the dark Save Changes) ----
for (const [session, base, tag] of [["ref", baseRef, "ref"], ["loc", baseLoc, "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/profile`);
  await settle(3200);
  shot(session, `${shotDir}/261-profile-save-${tag}.png`);
}

// ---- 262: the notification preferences (the blue Save + dark switches) ----
for (const [session, base, tag] of [["ref", baseRef, "ref"], ["loc", baseLoc, "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/notificationpreferences`);
  await settle(3800);
  shot(session, `${shotDir}/262-notif-prefs-${tag}.png`);
}

// ---- 263: the assets page (the green gradient Add Asset) ----
for (const [session, base, tag] of [["ref", baseRef, "ref"], ["loc", baseLoc, "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/assets`);
  await settle(3800);
  shot(session, `${shotDir}/263-assets-cta-${tag}.png`);
}

// ---- 264: LOC-only superset evidence: the mixed-recipe surfaces ----
await ensureAuthed("loc", baseLoc);
run(`agent-browser --session loc open ${baseLoc}/workflowconfigpage`);
await settle(3600);
shot("loc", `${shotDir}/264-wfcp-blue-pair-loc.png`);
run(`agent-browser --session loc open ${baseLoc}/hrassistant`);
await settle(3600);
shot("loc", `${shotDir}/264-hrassistant-send-loc.png`);

run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
console.log("done");
