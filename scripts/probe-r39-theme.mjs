#!/usr/bin/env node
// probe-r39-theme.mjs — session-40 / round 39: REF's login theme-inert
// behavior (the never-probed surface from round 38's frontier list) +
// the after-sign-in theme handoff.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// arm dark mode in localStorage, then reload the login and see if html.dark applies
for (const [label, session, base] of [["REF", "ref", baseRef], ["LOC", "loc", baseLoc]]) {
  console.log(`=== ${label} ===`);
  // 1. login with darkMode armed
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 2500));
  await evalOn(session, `localStorage.setItem('darkMode','true'); 'armed'`);
  run(`agent-browser --session ${session} reload`);
  await new Promise(r => setTimeout(r, 3000));
  const loginDark = await evalOn(session, `(() => ({ htmlDark: document.documentElement.classList.contains('dark'), htmlRtl: document.documentElement.dir === 'rtl', stored: localStorage.getItem('darkMode') }))()`);
  console.log(`login (darkMode=true armed): ${JSON.stringify(loginDark)}`);
  // 2. now sign in (already authenticated? navigate to dashboard) and check the app applies dark
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3500));
  const appDark = await evalOn(session, `(() => ({ path: location.pathname, htmlDark: document.documentElement.classList.contains('dark'), stored: localStorage.getItem('darkMode'), bodyBg: getComputedStyle(document.body).backgroundColor }))()`);
  console.log(`app after login:            ${JSON.stringify(appDark)}`);
  // 3. reset to light for later probes
  await evalOn(session, `localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang'); 'reset'`);
  run(`agent-browser --session ${session} reload`);
  await new Promise(r => setTimeout(r, 2000));
  const reset = await evalOn(session, `(() => ({ htmlDark: document.documentElement.classList.contains('dark'), stored: localStorage.getItem('darkMode'), lang: localStorage.getItem('app_lang') }))()`);
  console.log(`after reset:                ${JSON.stringify(reset)}`);
}
