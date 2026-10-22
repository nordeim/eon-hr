#!/usr/bin/env node
// r79-deploy-watch.mjs — session-79 / parity round 78 deploy watch.
// The r78 round (the quadruple-deploy cadence round) read THREE login
// generations (the 43rd-, 44th-, 45th-line), every one FULLY LADDERED
// NON-VISUAL (fresh login pair BYTE-IDENTICAL to the 69aa4241… baseline
// each time + standing 5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45
// 13/13), with four login-CSS movements classified (the +1204 B platform
// design-system library update staging the sky-badge token family +
// card-title typography, then three dead-code sweeps). RE-ARMED at the
// post-45th finals:
//   login JS  index-t01Y3EV6  + login CSS index-o5aKXf2B
//   app   JS  C-IrDy5f        + app   CSS BGNH4KkS
// Quiet = the post-45th contract still live; CHANGED = the 46th+ deploy
// arrived → the full confirmation ladder (fresh login pair byte-compare
// vs the 69aa4241… REF baseline + standing 5/5 + sweep 12/12 +
// verify-r49 13/13 + verify-r45 13/13) before classification.
// NOTES (standing lessons):
//   - the password fill MUST be single-quoted — '$Abcd1234' inside a
//     double-quoted shell string expands the unset variable to EMPTY and
//     the re-auth silently fails (the r60 lesson).
//   - a fill-timing miss leaves the post-login URL on /login (NOT a
//     Turnstile rollout — check the DOM census before concluding); the
//     careful re-auth (fill → settle → click) retries below.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app";
const FINALS = { loginJs: "index-t01Y3EV6", loginCss: "index-o5aKXf2B", appJs: "C-IrDy5f", appCss: "BGNH4KkS" };
const FP = `(() => {
  const fp = (el) => { const m = (el.getAttribute('href') || el.getAttribute('src') || '').match(/([A-Za-z0-9_-]{6,})\\.(?:css|js)/); return m ? m[1] : null; };
  const css = [...document.querySelectorAll('link[rel=stylesheet]')].map(fp).filter(Boolean);
  const js = [...document.querySelectorAll('script[src]')].map(fp).filter(Boolean);
  return { css, js };
})()`;

// Login side (unauthenticated page — direct open, no auth needed)
run(`agent-browser --session ref79 close 2>/dev/null; true`);
run(`agent-browser --session ref79 set viewport 1440 900`);
run(`agent-browser --session ref79 open ${baseRef}/login`);
await new Promise(r => setTimeout(r, 3000));
const loginFp = await evalOn("ref79", FP);
console.log("REF login fingerprints:", JSON.stringify(loginFp));
const loginJs = (loginFp.js || []).join(",");
const loginCss = (loginFp.css || []).join(",");
const loginQuiet = loginJs.includes(FINALS.loginJs) && loginCss.includes(FINALS.loginCss);
console.log(`  login JS ${loginJs.includes(FINALS.loginJs) ? "QUIET" : "CHANGED"} (${FINALS.loginJs} expected)`);
console.log(`  login CSS ${loginCss.includes(FINALS.loginCss) ? "QUIET" : "CHANGED"} (${FINALS.loginCss} expected)`);

// Login-side DOM census (the standing Turnstile watch — read BEFORE auth)
const census = await evalOn("ref79", `(() => {
  const buttons = [...document.querySelectorAll('button')].map(b => b.textContent.trim()).filter(Boolean);
  const forms = document.forms.length;
  const iframes = document.querySelectorAll('iframe').length;
  const turnstile = document.querySelectorAll('.cf-turnstile, [data-sitekey]').length;
  return { buttons, forms, iframes, turnstile };
})()`);
console.log("login DOM census:", JSON.stringify(census));

// App side: sign in via the agent-browser fill (the controlled-input-safe
// pattern), with the careful re-auth retry (the r78 fill-timing lesson).
async function authAttempt() {
  run(`agent-browser --session ref79 fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  run(`agent-browser --session ref79 fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ref79 click 'button[type=submit]'`);
  await new Promise(r => setTimeout(r, 6000));
  return await evalOn("ref79", "location.href");
}
let urlNow = await authAttempt();
if (typeof urlNow === "string" && urlNow.includes("/login")) {
  console.log("post-login URL stayed on /login (fill-timing miss) — retrying the careful re-auth");
  urlNow = await authAttempt();
}
console.log("post-login URL:", JSON.stringify(urlNow));
const appFp = await evalOn("ref79", FP);
console.log("REF app fingerprints:", JSON.stringify(appFp));
const appJs = (appFp.js || []).join(",");
const appCss = (appFp.css || []).join(",");
console.log(`  app JS ${appJs.includes(FINALS.appJs) ? "QUIET" : "CHANGED"} (${FINALS.appJs} expected)`);
console.log(`  app CSS ${appCss.includes(FINALS.appCss) ? "QUIET" : "CHANGED"} (${FINALS.appCss} expected)`);
const appQuiet = appJs.includes(FINALS.appJs) && appCss.includes(FINALS.appCss);
console.log("VERDICT:", loginQuiet && appQuiet ? "BOTH SIDES QUIET — no new deploy" : "DEPLOY DETECTED — re-audit required");
console.log("LOGIN-VERDICT:", loginQuiet ? "LOGIN QUIET" : `LOGIN DEPLOYED — new fingerprints: JS ${loginJs} / CSS ${loginCss}`);
console.log("APP-VERDICT:", appQuiet ? "APP QUIET" : `APP DEPLOYED — new fingerprints: JS ${appJs} / CSS ${appCss}`);
process.exit(0);
