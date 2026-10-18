#!/usr/bin/env node
// r55-screenshots.mjs — parity round 54's evidence captures: the
// auth-boundary navigation family — the post-login ROOT landing (REF's
// `/` serving the dashboard, the clone now matching), the deep-link
// round-trip landing (/settings after the from_url sign-in), the
// logout-carry landing (the /login?from_url=… page), and the authed
// /login stays (the (G) match). REF + seeded LOC pairs, one process
// tree with the :3200 server. Numbers continue from 245.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
const settle = (ms) => new Promise(r => setTimeout(r, ms));

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-shots-r55.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await settle(500);
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }

async function uiSignIn(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await settle(3000);
  await signInHere(session);
  console.log(session, "sign-in →", run(`agent-browser --session ${session} get url`).trim());
}

// signInHere — fill + submit WITHOUT navigating first: the round-trip
// capture must sign in AT the guard's landing URL (the from_url param
// lives there; a fresh /login open wipes it — the first draft's bug)
async function signInHere(session) {
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await settle(400);
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await settle(400);
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const btn = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
  if (btn) run(`agent-browser --session ${session} click @${btn}`);
  await settle(4200);
}

async function userMenuLogout(session) {
  const snap1 = run(`agent-browser --session ${session} snapshot -i -c`);
  const trig = (snap1.match(/- button "sepnetflix2023[^"]*" \[expanded=false, ref=(\w+)\]/) || [])[1];
  if (!trig) return false;
  run(`agent-browser --session ${session} click @${trig}`);
  await settle(1300);
  const snap2 = run(`agent-browser --session ${session} snapshot -i -c`);
  const lo = (snap2.match(/- menuitem "Logout" \[ref=(\w+)\]/) || [])[1];
  if (!lo) return false;
  run(`agent-browser --session ${session} click @${lo}`);
  await settle(2800);
  return true;
}

for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  // ---- 246: the post-login ROOT landing (the (A) contract) ----
  await uiSignIn(session, base);
  run(`agent-browser --session ${session} screenshot ${shots}/246-postlogin-root-landing-${suffix}.png`);
  console.log(`246-postlogin-root-landing-${suffix}.png`);

  // ---- 247: the deep-link round-trip landing on /settings ----
  // (sign out, hit the guarded route, sign back in IN PLACE — the guard's
  // from_url param lives on its landing URL; a fresh /login open wipes it)
  await userMenuLogout(session);
  run(`agent-browser --session ${session} open ${base}/settings`);
  await settle(3200);
  console.log(`  [247] guard landing: ${run(`agent-browser --session ${session} get url`).trim().slice(0, 110)}`);
  await signInHere(session);
  run(`agent-browser --session ${session} screenshot ${shots}/247-roundtrip-settings-landing-${suffix}.png`);
  console.log(`247-roundtrip-settings-landing-${suffix}.png  (url: ${run(`agent-browser --session ${session} get url`).trim()})`);

  // ---- 248: the logout-carry landing (/login?from_url=…/settings) ----
  await userMenuLogout(session);
  run(`agent-browser --session ${session} screenshot ${shots}/248-logout-carry-login-${suffix}.png`);
  console.log(`248-logout-carry-login-${suffix}.png  (url: ${run(`agent-browser --session ${session} get url`).trim().slice(0, 110)})`);

  // ---- 249: the authed /login stays (the (G) match) ----
  await uiSignIn(session, base);
  run(`agent-browser --session ${session} open ${base}/login`);
  await settle(2800);
  run(`agent-browser --session ${session} screenshot ${shots}/249-authed-login-stays-${suffix}.png`);
  console.log(`249-authed-login-stays-${suffix}.png`);
}
console.log("done:", run(`ls ${shots} | wc -l`).trim(), "files");
process.exit(0);
