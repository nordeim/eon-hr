#!/usr/bin/env node
// capture-r42.mjs — session-43 / parity round 42 screenshots (164-167):
// the login redeploy re-audit evidence — the keyboard-focused Sign in
// (the ring-ring token rendering #09090b — the round's core), the form
// interior (the verbatim input strings + the space-y-1.5 field wrappers),
// the mobile band (the responsive pair), and the failed-login Alert (the
// byte-identical re-verification). REF + LOC pairs.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const raw = out.trim(); try { return JSON.parse(raw); } catch { return raw; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const OUT = "/home/z/my-project/eon-hr/docs/screenshots";

async function openBoth(path, vp = [1440, 900]) {
  run(`agent-browser --session ref set viewport ${vp[0]} ${vp[1]}`);
  run(`agent-browser --session ref open ${baseRef}${path}`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session loc set viewport ${vp[0]} ${vp[1]}`);
  run(`agent-browser --session loc open ${baseLoc}${path}`);
  await new Promise(r => setTimeout(r, 2500));
}

// keyboard-focus the Sign in (Tab ×2 from the email input), settle past
// the 200ms transition-all, then capture
async function focusSignin(session) {
  await evalOn(session, `(() => { document.querySelector('input[type=email]').focus(); return 'ok'; })()`);
  run(`agent-browser --session ${session} press Tab`);
  await new Promise(r => setTimeout(r, 200));
  run(`agent-browser --session ${session} press Tab`);
  await new Promise(r => setTimeout(r, 500));
}

// ---------- 164: the keyboard-focused Sign in ring ----------
await openBoth("/login");
await focusSignin("ref");
await focusSignin("loc");
run(`agent-browser --session ref screenshot ${OUT}/164-ref-signin-focus-ring.png`);
run(`agent-browser --session loc screenshot ${OUT}/164b-loc-signin-focus-ring.png`);
console.log("164 captured");

// ---------- 165: the form interior (inputs + field wrappers) ----------
await openBoth("/login");
// click the email input to show the focus ring on the INPUT (the
// focus:ring-slate-400 render) — the settled read
for (const s of ["ref", "loc"]) {
  await evalOn(s, `(() => { document.querySelector('input[type=email]').focus(); return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 400));
}
run(`agent-browser --session ref screenshot ${OUT}/165-ref-login-form-interior.png`);
run(`agent-browser --session loc screenshot ${OUT}/165b-loc-login-form-interior.png`);
console.log("165 captured");

// ---------- 166: the mobile band (the responsive pair) ----------
await openBoth("/login", [390, 844]);
run(`agent-browser --session ref screenshot ${OUT}/166-ref-login-mobile.png`);
run(`agent-browser --session loc screenshot ${OUT}/166b-loc-login-mobile.png`);
console.log("166 captured");

// ---------- 167: the failed-login Alert (the error surface) ----------
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 2800));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'wrong@example.com'`);
  await new Promise(r => setTimeout(r, 350));
  run(`agent-browser --session ${session} fill 'input[type=password]' 'wrongpass'`);
  await new Promise(r => setTimeout(r, 350));
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const line = snap.split("\n").find(l => l.includes('button "Sign in"'));
  const m = line?.match(/ref=(\w+)\]/);
  if (m) run(`agent-browser --session ${session} click @${m[1]}`);
  await new Promise(r => setTimeout(r, 3500));
}
run(`agent-browser --session ref screenshot ${OUT}/167-ref-login-alert.png`);
run(`agent-browser --session loc screenshot ${OUT}/167b-loc-login-alert.png`);
console.log("167 captured");
console.log("capture-r42 complete");
