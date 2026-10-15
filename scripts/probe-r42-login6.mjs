#!/usr/bin/env node
// probe-r42-login6.mjs — theme-inert re-check + the failed-login Alert
// (the r40 fireable surface) on REF's new login build, both apps.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
function snapRef(session, needle) {
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const lines = snap.split("\n");
  const line = lines.find(l => l.includes(needle));
  const m = line?.match(/ref=(\w+)\]/);
  return m ? m[1] : null;
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// ---------- 1. theme-inert ----------
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  await evalOn(session, `localStorage.setItem('darkMode','true'); 'armed'`);
  run(`agent-browser --session ${session} reload`);
  await new Promise(r => setTimeout(r, 2800));
}
const ti = async (s) => evalOn(s, `(() => ({ htmlDark: document.documentElement.classList.contains('dark'), bg: getComputedStyle(document.body).backgroundColor }))()`);
const refTI = await ti("ref"), locTI = await ti("loc");
console.log(`theme-inert ref=${JSON.stringify(refTI)} loc=${JSON.stringify(locTI)} ${JSON.stringify(refTI) === JSON.stringify(locTI) ? "MATCH" : "DIFF"}`);
for (const s of ["ref", "loc"]) await evalOn(s, `localStorage.setItem('darkMode','false'); 'reset'`);

// ---------- 2. the failed-login Alert (fire a bad login on both) ----------
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'wrong@example.com'`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${session} fill 'input[type=password]' 'wrongpass'`);
  await new Promise(r => setTimeout(r, 400));
  const ref = snapRef(session, "Sign in");
  if (ref) run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, 3500));
}
const alertProbe = async (s) => evalOn(s, `(() => { const el = [...document.querySelectorAll('[role="alert"]')].find(e => e.getBoundingClientRect().width > 0); if (!el) return {found:false}; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { found:true, text:(el.textContent||'').trim().slice(0,60), w:Math.round(r.width), h:Math.round(r.height), bg:cs.backgroundColor, border:cs.borderTopWidth + ' ' + cs.borderTopColor, radius:cs.borderRadius, cls:el.className.slice(0,150) }; })()`);
const refAlert = await alertProbe("ref"), locAlert = await alertProbe("loc");
console.log(`failed-login Alert ref=${JSON.stringify(refAlert)}`);
console.log(`failed-login Alert loc=${JSON.stringify(locAlert)}`);
console.log(JSON.stringify(refAlert) === JSON.stringify(locAlert) ? "MATCH alert" : "DIFF alert");

// ---------- 3. the app-build --ring sanity (dashboard, logged in) ----------
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 4000));
}
const ringVar = async (s) => evalOn(s, `(() => ({ ring: getComputedStyle(document.documentElement).getPropertyValue('--ring').trim() }))()`);
console.log(`app-build --ring: ref=${JSON.stringify(await ringVar("ref"))} loc=${JSON.stringify(await ringVar("loc"))}`);
