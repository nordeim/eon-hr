#!/usr/bin/env node
// r57-screenshots.mjs — session-57 / parity round 56 captures: the
// affordance-stub family's post-fix state, paired REF vs LOC:
//   254 — the employees Import CSV dialog (the Bulk Import Employees
//         recipe, open on the click)
//   255 — the profile Social Accounts tab (the Connected Accounts form)
//   256 — the profile Preferences tab (the two-card recipe)
//   257 — the settings WhatsApp Configure dialog (open on the click)
//   258 — LOC superset evidence (unpaired — REF cannot reach these
//         states): the import review table + the wall's posted media
// Boots the seeded :3200 standalone inside this process tree.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const settle = (ms) => new Promise(r => setTimeout(r, ms));
function evalStr(expr) { return JSON.stringify(expr.split("\n").join(" ")); }
async function ev(session, expr) {
  const out = run(`agent-browser --session ${session} eval ${evalStr(expr)}`);
  try { return JSON.parse(JSON.parse(out.trim())); } catch { return "ERR:" + out.slice(0, 200); }
}

const repo = "/home/z/my-project/eon-hr";
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const shotDir = `${repo}/docs/screenshots`;

run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r57s.log 2>&1`],
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

// the REAL CDP click on a Radix tab (the r57 lesson: pointer events)
async function clickTab(session, label) {
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const ref = (snap.match(new RegExp(`- tab "[^"]*${label}[^"]*" \\[ref=(\\w+)\\]`)) || [])[1];
  if (ref) run(`agent-browser --session ${session} click @${ref}`);
  await settle(2400);
}

function shot(session, file) {
  run(`agent-browser --session ${session} screenshot ${file}`);
  console.log(file.split("/").pop());
}

// ---- 254: the Import CSV dialog (both sides) ----
for (const [session, base, tag] of [["ref", baseRef, "ref"], ["loc", baseLoc, "loc"]]) {
  await ensureAuthed(session, base);
  run(`agent-browser --session ${session} open ${base}/employees`);
  await settle(3200);
  await ev(session, `(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').includes('Import CSV')); if (b) { b.click(); return 'ok'; } return 'NOTFOUND'; })()`);
  await settle(1600);
  shot(session, `${shotDir}/254-import-dialog-${tag}.png`);
  await ev(session, `(() => { const b = [...document.querySelectorAll('[role=dialog] button')].find(x => x.textContent.trim() === 'Cancel'); if (b) b.click(); return 'ok'; })()`);
  await settle(700);
}

// ---- 255: the profile Social Accounts tab (both sides) ----
for (const [session, base, tag] of [["ref", baseRef, "ref"], ["loc", baseLoc, "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/profile`);
  await settle(3200);
  await clickTab(session, "Social Accounts");
  await settle(900);
  shot(session, `${shotDir}/255-social-tab-${tag}.png`);
}

// ---- 256: the profile Preferences tab (both sides) ----
for (const [session, base, tag] of [["ref", baseRef, "ref"], ["loc", baseLoc, "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/profile`);
  await settle(3200);
  await clickTab(session, "Preferences");
  await settle(900);
  shot(session, `${shotDir}/256-preferences-tab-${tag}.png`);
}

// ---- 257: the WhatsApp Configure dialog (both sides) ----
for (const [session, base, tag] of [["ref", baseRef, "ref"], ["loc", baseLoc, "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/settings`);
  await settle(3400);
  await clickTab(session, "Integrations");
  await settle(1400);
  await ev(session, `(() => { const b = [...document.querySelectorAll('button')].filter(x => (x.textContent || '').trim() === 'Connect')[0]; if (b) { b.click(); return 'ok'; } return 'NOTFOUND'; })()`);
  await settle(2000);
  shot(session, `${shotDir}/257-whatsapp-dialog-${tag}.png`);
  await ev(session, `(() => { const b = [...document.querySelectorAll('[role=dialog] button')].find(x => x.textContent.trim() === 'Cancel'); if (b) b.click(); return 'ok'; })()`);
  await settle(700);
}

// ---- 258: LOC superset evidence (REF cannot reach these states) ----
// (a) the import review table after Process File
run(`agent-browser --session loc open ${baseLoc}/employees`);
await settle(3200);
await ev("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').includes('Import CSV')); if (b) { b.click(); return 'ok'; } return 'NOTFOUND'; })()`);
await settle(1600);
run(`agent-browser --session loc upload '#csv-file' /tmp/test-import2.csv`);
await settle(1200);
await ev("loc", `(() => { const b = [...document.querySelectorAll('[role=dialog] button')].find(x => x.textContent.trim() === 'Process File'); if (b) { b.click(); return 'ok'; } return 'NOTFOUND'; })()`);
await settle(2200);
shot("loc", `${shotDir}/258-import-review-loc.png`);
await ev("loc", `(() => { const b = [...document.querySelectorAll('[role=dialog] button')].find(x => x.textContent.trim() === 'Cancel'); if (b) b.click(); return 'ok'; })()`);
await settle(700);

// (b) the wall's posted media card
run(`agent-browser --session loc open ${baseLoc}/companywall`);
await settle(3200);
run(`agent-browser --session loc upload '#media-upload' /tmp/test-photo.png`);
await settle(900);
await ev("loc", `(() => { const t = document.querySelector('textarea'); if (t) { const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set; setter.call(t, 'e2e screenshot post'); t.dispatchEvent(new Event('input', { bubbles: true })); return 'ok'; } return 'NOTFOUND'; })()`);
await settle(700);
await ev("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').trim() === 'Post'); if (b) { b.click(); return 'ok'; } return 'NOTFOUND'; })()`);
await settle(2600);
shot("loc", `${shotDir}/258-wall-media-loc.png`);

console.log("captures complete");
process.exit(0);
