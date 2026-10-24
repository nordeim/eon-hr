#!/usr/bin/env node
// r90-rtl-members-capture.mjs — session-90 / parity round 89: the focused
// cross-side capture of the r89 round's two flagged RTL-specific members:
//   assetmanagement  — the select-chevron position (4 cells)
//   allleaverequests — the header icon spacing (3 cells)
// Same protocol as r89-theme-mobile-capture (390x844, app_lang=ar LIGHT, the
// pre-paint prep on the login page, the stale-viewport re-assert, the
// fill-settle-click auth, the experiment-assignment probe). Fix this round:
// the standalone boots with a >=16-char AUTH_SECRET (the .env empty-dev
// value cannot boot NODE_ENV=production — the r88 empty-grep trap).
// Usage: node scripts/r90-rtl-members-capture.mjs
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
const PREFIX = "r90-rtlm";
const ROUTES = ["assetmanagement", "allleaverequests"];
const PREP = "localStorage.setItem('app_lang','ar'); localStorage.setItem('darkMode','false');";

// fresh boot of the SEEDED standalone (kill any stale :3200 by PID)
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="r90-standalone-dev-secret-32chars" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r90rtl.log 2>&1`],
  { stdio: "ignore" });
server.unref();
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN", run("tail -3 /tmp/loc3200-r90rtl.log")); process.exit(1); }
console.log("seeded standalone up on :3200");

const sess = { ref: "ref90rtl", loc: "loc90rtl" };
async function alreadyAuthed(session, base) {
  const url = run(`agent-browser --session ${session} get url`).trim();
  return !url.startsWith("ERR") && !url.includes("/login") && url.includes(new URL(base).host);
}
async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} eval "${PREP}"`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} eval "${PREP}"`);
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 400));
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const ref = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
  if (ref) run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, 4200));
  const url = run(`agent-browser --session ${session} get url`).trim();
  if (url.includes("/login")) {
    console.log(session, "fill-timing miss — careful retry");
    run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
    await new Promise(r => setTimeout(r, 500));
    run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
    await new Promise(r => setTimeout(r, 600));
    const snap2 = run(`agent-browser --session ${session} snapshot -i -c`);
    const ref2 = (snap2.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
    if (ref2) run(`agent-browser --session ${session} click @${ref2}`);
    await new Promise(r => setTimeout(r, 4200));
  }
}
if (await alreadyAuthed(sess.ref, "https://eon.base44.app")) console.log("ref session still authed — skip re-auth");
else await auth(sess.ref, "https://eon.base44.app");
if (await alreadyAuthed(sess.loc, "http://127.0.0.1:3200")) console.log("loc session still authed — skip re-auth");
else await auth(sess.loc, "http://127.0.0.1:3200");
console.log("ref url:", run(`agent-browser --session ${sess.ref} get url`).trim());
console.log("loc url:", run(`agent-browser --session ${sess.loc} get url`).trim());

// the experiment-assignment probe (the r89 standing adoption)
for (const [session, label] of [[sess.ref, "REF"], [sess.loc, "LOC"]]) {
  const exp = run(`agent-browser --session ${session} eval "JSON.stringify((window.__APP_CONFIG__&&window.__APP_CONFIG__.PRE_AUTH_EXPERIMENTS&&window.__APP_CONFIG__.PRE_AUTH_EXPERIMENTS.assignments)||null)"`).trim();
  console.log(`${label} experiment assignment: ${exp.slice(0, 160)}`);
}
// the dir=rtl validity check (the capture-validity trap — the md5 lesson)
for (const [session, label] of [[sess.ref, "REF"], [sess.loc, "LOC"]]) {
  const dir = run(`agent-browser --session ${session} eval "document.documentElement.dir + '|' + document.documentElement.lang"`).trim();
  console.log(`${label} dir|lang: ${dir}`);
}

const pairs = [[sess.ref, "https://eon.base44.app", "ref"], [sess.loc, "http://127.0.0.1:3200", "loc"]];
for (const route of ROUTES) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} set viewport 390 844`);
    run(`agent-browser --session ${session} open ${base}/${route}`);
    await new Promise(r => setTimeout(r, 3500));
    run(`agent-browser --session ${session} eval "${PREP}"`);
    await new Promise(r => setTimeout(r, 1200));
    run(`agent-browser --session ${session} screenshot ${shots}/${PREFIX}-${route}-${suffix}.png`);
  }
  console.log("pair captured:", route);
}
console.log(`ALL ${ROUTES.length} RTL MEMBER PAIRS CAPTURED — run the diff next (r90-rtl-members-diff.py)`);
process.exit(0);
