#!/usr/bin/env node
// r88-capture.mjs — session-88 / parity round 87: the cross-side at-rest
// pixel-diff capture for THIS round's target routes (the r87 carried-forward
// queue's members): surveyanalytics, attendancedashboard, tenantsetup,
// reports, hrreports, shiftswap, companywall. Standing capture contracts:
// 1440x900 LIGHT LTR, darkMode=false + app_lang removed, the badge VISIBLE,
// the fill-settle-click auth with the careful retry, the seeded standalone
// fresh-booted on :3200. Resume-capable (skips already-captured pairs).
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
const done = (route) => fs.existsSync(`${shots}/r88-crossdiff-${route}-ref.png`) && fs.existsSync(`${shots}/r88-crossdiff-${route}-loc.png`);
const ROUTES = ["surveyanalytics", "attendancedashboard", "tenantsetup", "reports", "hrreports", "shiftswap", "companywall"];

run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-crossdiff-r88.log 2>&1 < /dev/null &`],
  { stdio: "ignore", detached: true });
server.unref();
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200");

const sess = { ref: "ref88x", loc: "loc88x" };
async function alreadyAuthed(session, base) {
  const url = run(`agent-browser --session ${session} get url`).trim();
  return !url.startsWith("ERR") && !url.includes("/login") && url.includes(new URL(base).host);
}
async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
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

const pairs = [[sess.ref, "https://eon.base44.app", "ref"], [sess.loc, "http://127.0.0.1:3200", "loc"]];
for (const route of ROUTES) {
  if (done(route)) { console.log("pair already captured (resume):", route); continue; }
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}/${route}`);
    await new Promise(r => setTimeout(r, 6000));
    run(`agent-browser --session ${session} screenshot ${shots}/r88-crossdiff-${route}-${suffix}.png`);
  }
  console.log("pair captured:", route);
}
console.log(`ALL ${ROUTES.length} PAIRS CAPTURED — run r88-diff.py next`);
process.exit(0);
