#!/usr/bin/env node
// r92-deploy-watch.mjs — session-92 / parity round 91 deploy watch.
// The post-61st finals (the session-91 opening read classified the 61st login
// deploy NON-VISUAL — the fresh login pair byte-identical at 69aa4241; the 61st
// changed the login JS only: index-CrrEG27W → index-34zv7ZR0):
//   login JS  index-34zv7ZR0  + login CSS index-BlYK4iZ6
//   app   JS  C-IrDy5f        + app   CSS BGNH4KkS
// Quiet = the 61st still the last observed generation; CHANGED = the 62nd+
// deploy arrived → ladder every observed generation.
// Standing step (the session-89 lesson): the experiment-assignment probe —
// read window.__APP_CONFIG__.PRE_AUTH_EXPERIMENTS + visitor_id BEFORE
// classifying any REF variant read (the theme-variance root cause).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app";
const FINALS = { loginJs: "index-34zv7ZR0", loginCss: "index-BlYK4iZ6", appJs: "C-IrDy5f", appCss: "BGNH4KkS" }; // post-61st finals (the 61st changed the login JS only)
const FP = `(() => {
  const fp = (el) => { const m = (el.getAttribute('href') || el.getAttribute('src') || '').match(/([A-Za-z0-9_-]{6,})\\.(?:css|js)/); return m ? m[1] : null; };
  const css = [...document.querySelectorAll('link[rel=stylesheet]')].map(fp).filter(Boolean);
  const js = [...document.querySelectorAll('script[src]')].map(fp).filter(Boolean);
  return { css, js };
})()`;
const EXPERIMENT_PROBE = `(() => {
  const cfg = window.__APP_CONFIG__ || {};
  const exp = cfg.PRE_AUTH_EXPERIMENTS || cfg.pre_auth_experiments || null;
  return { visitor_id: cfg.VISITOR_ID || cfg.visitor_id || null,
           experiments: exp ? JSON.parse(JSON.stringify(exp)) : null,
           turnstile_login: cfg.TURNSTILE_LOGIN_ENABLED || null };
})()`;

// Login side (unauthenticated page — direct open, no auth needed)
run(`agent-browser --session ref92 close 2>/dev/null; true`);
run(`agent-browser --session ref92 set viewport 1440 900`);
run(`agent-browser --session ref92 open ${baseRef}/login`);
await new Promise(r => setTimeout(r, 3000));
const loginFp = await evalOn("ref92", FP);
console.log("REF login fingerprints:", JSON.stringify(loginFp));
const loginJs = (loginFp.js || []).join(",");
const loginCss = (loginFp.css || []).join(",");
const loginQuiet = loginJs.includes(FINALS.loginJs) && loginCss.includes(FINALS.loginCss);
console.log(`  login JS ${loginJs.includes(FINALS.loginJs) ? "QUIET" : "CHANGED"} (${FINALS.loginJs} expected)`);
console.log(`  login CSS ${loginCss.includes(FINALS.loginCss) ? "QUIET" : "CHANGED"} (${FINALS.loginCss} expected)`);

// THE EXPERIMENT-ASSIGNMENT PROBE (the r89 standing adoption — read BEFORE auth)
const expRead = await evalOn("ref92", EXPERIMENT_PROBE);
console.log("experiment-assignment probe:", JSON.stringify(expRead));

// Login-side DOM census (the standing Turnstile watch — read BEFORE auth)
const census = await evalOn("ref92", `(() => {
  const buttons = [...document.querySelectorAll('button')].map(b => b.textContent.trim()).filter(Boolean);
  const forms = document.forms.length;
  const iframes = document.querySelectorAll('iframe').length;
  const turnstile = document.querySelectorAll('.cf-turnstile, [data-sitekey]').length;
  return { buttons, forms, iframes, turnstile };
})()`);
console.log("login DOM census:", JSON.stringify(census));

// App side: sign in via the agent-browser fill, with the careful re-auth retry.
async function authAttempt() {
  run(`agent-browser --session ref92 fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  run(`agent-browser --session ref92 fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ref92 click 'button[type=submit]'`);
  await new Promise(r => setTimeout(r, 6000));
  return await evalOn("ref92", "location.href");
}
let urlNow = await authAttempt();
if (typeof urlNow === "string" && urlNow.includes("/login")) {
  console.log("post-login URL stayed on /login (fill-timing miss) — retrying the careful re-auth");
  urlNow = await authAttempt();
}
console.log("post-login URL:", JSON.stringify(urlNow));
const appFp = await evalOn("ref92", FP);
console.log("REF app fingerprints:", JSON.stringify(appFp));
const appJs = (appFp.js || []).join(",");
const appCss = (appFp.css || []).join(",");
console.log(`  app JS ${appJs.includes(FINALS.appJs) ? "QUIET" : "CHANGED"} (${FINALS.appJs} expected)`);
console.log(`  app CSS ${appCss.includes(FINALS.appCss) ? "QUIET" : "CHANGED"} (${FINALS.appCss} expected)`);
const appQuiet = appJs.includes(FINALS.appJs) && appCss.includes(FINALS.appCss);
console.log("VERDICT:", loginQuiet && appQuiet ? "BOTH SIDES QUIET — the post-60th contract still live (the standing opening read continues)" : "DEPLOY DETECTED — ladder every observed generation");
console.log("LOGIN-VERDICT:", loginQuiet ? "LOGIN QUIET" : `LOGIN DEPLOYED — new fingerprints: JS ${loginJs} / CSS ${loginCss}`);
console.log("APP-VERDICT:", appQuiet ? "APP QUIET" : `APP DEPLOYED — new fingerprints: JS ${appJs} / CSS ${appCss}`);
process.exit(0);
