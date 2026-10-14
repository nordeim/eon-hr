#!/usr/bin/env node
// probe-r40-login3.mjs — the login input recipes (sliced reads to avoid the
// eval-pipe truncation) + the sign-in focused ring + the theme-inert check.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 500) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const INPUT_A = `(() => {
  const email = document.querySelector('input[type=email]');
  const cs = getComputedStyle(email);
  return { clsA: email.className.slice(0, 150), clsB: email.className.slice(150, 300), h: Math.round(email.getBoundingClientRect().height), size: cs.fontSize, bg: cs.backgroundColor, color: cs.color };
})()`;
const INPUT_B = `(() => {
  const email = document.querySelector('input[type=email]');
  const cs = getComputedStyle(email);
  const ph = getComputedStyle(email, '::placeholder');
  const lbl = email.previousElementSibling;
  return { phColor: ph.color, phSize: ph.fontSize, shadow: cs.boxShadow.slice(0, 90), radius: cs.borderRadius, border: cs.borderColor + ' ' + cs.borderWidth, lbl: lbl ? { tag: lbl.tagName, cls: lbl.className } : null };
})()`;
const SIGNIN_FOCUS = `(() => {
  const sign = [...document.querySelectorAll('button')].find(b => /^sign in$/i.test((b.textContent||'').trim()));
  sign.focus();
  const cs = getComputedStyle(sign);
  const r = { focusedShadow: cs.boxShadow.slice(0, 120) };
  sign.blur();
  return r;
})()`;
// theme-inert re-check after the redeploy
const THEME = `(() => ({ htmlDark: document.documentElement.classList.contains('dark'), stored: localStorage.getItem('darkMode'), dir: document.documentElement.dir }))()`;

for (const [label, session, base] of [["REF", "ref", baseRef], ["LOC", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  // arm dark + rtl, reload, verify theme-inert
  await evalOn(session, `localStorage.setItem('darkMode','true'); localStorage.setItem('app_lang','ar'); 'armed'`);
  run(`agent-browser --session ${session} reload`);
  await new Promise(r => setTimeout(r, 2500));
  const theme = await evalOn(session, THEME);
  // reset storage (leave the apps clean)
  await evalOn(session, `localStorage.setItem('darkMode','false'); localStorage.setItem('app_lang','en'); 'reset'`);
  console.log(`\n===== ${label} =====`);
  console.log("theme :", JSON.stringify(theme));
  console.log("inpA  :", JSON.stringify(await evalOn(session, INPUT_A)));
  console.log("inpB  :", JSON.stringify(await evalOn(session, INPUT_B)));
  console.log("sgnFcs:", JSON.stringify(await evalOn(session, SIGNIN_FOCUS)));
}
