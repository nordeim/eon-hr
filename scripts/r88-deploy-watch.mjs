#!/usr/bin/env node
// r88-deploy-watch.mjs — session-88 / parity round 87 deploy watch.
// RE-ARMED at the post-58th finals (unchanged from r87 — the 58th is still
// the last observed generation):
//   login JS  index-DzlN4LV0  + login CSS index-BD8HgQNX
//   app   JS  C-IrDy5f        + app   CSS BGNH4KkS
// Quiet = the post-58th contract still live (the 58th-or-newer FULL standing
// ladder is THIS session's opening read regardless); CHANGED = the 59th+
// deploy arrived → ladder every observed generation.
// Standing lessons carried: single-quoted password; careful fill→settle→click
// re-auth; ref cookie expires BETWEEN rounds (re-auth before every standing
// read); reset the daemon at the first dead-session read.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app";
const FINALS = { loginJs: "index-DzlN4LV0", loginCss: "index-BD8HgQNX", appJs: "C-IrDy5f", appCss: "BGNH4KkS" }; // post-58th finals
const FP = `(() => {
  const fp = (el) => { const m = (el.getAttribute('href') || el.getAttribute('src') || '').match(/([A-Za-z0-9_-]{6,})\\.(?:css|js)/); return m ? m[1] : null; };
  const css = [...document.querySelectorAll('link[rel=stylesheet]')].map(fp).filter(Boolean);
  const js = [...document.querySelectorAll('script[src]')].map(fp).filter(Boolean);
  return { css, js };
})()`;

// Login side (unauthenticated page — direct open, no auth needed)
run(`agent-browser --session ref88 close 2>/dev/null; true`);
run(`agent-browser --session ref88 set viewport 1440 900`);
run(`agent-browser --session ref88 open ${baseRef}/login`);
await new Promise(r => setTimeout(r, 3000));
const loginFp = await evalOn("ref88", FP);
console.log("REF login fingerprints:", JSON.stringify(loginFp));
const loginJs = (loginFp.js || []).join(",");
const loginCss = (loginFp.css || []).join(",");
const loginQuiet = loginJs.includes(FINALS.loginJs) && loginCss.includes(FINALS.loginCss);
console.log(`  login JS ${loginJs.includes(FINALS.loginJs) ? "QUIET" : "CHANGED"} (${FINALS.loginJs} expected)`);
console.log(`  login CSS ${loginCss.includes(FINALS.loginCss) ? "QUIET" : "CHANGED"} (${FINALS.loginCss} expected)`);

// Login-side DOM census (the standing Turnstile watch — read BEFORE auth)
const census = await evalOn("ref88", `(() => {
  const buttons = [...document.querySelectorAll('button')].map(b => b.textContent.trim()).filter(Boolean);
  const forms = document.forms.length;
  const iframes = document.querySelectorAll('iframe').length;
  const turnstile = document.querySelectorAll('.cf-turnstile, [data-sitekey]').length;
  return { buttons, forms, iframes, turnstile };
})()`);
console.log("login DOM census:", JSON.stringify(census));

// App side: sign in via the agent-browser fill, with the careful re-auth retry.
async function authAttempt() {
  run(`agent-browser --session ref88 fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  run(`agent-browser --session ref88 fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ref88 click 'button[type=submit]'`);
  await new Promise(r => setTimeout(r, 6000));
  return await evalOn("ref88", "location.href");
}
let urlNow = await authAttempt();
if (typeof urlNow === "string" && urlNow.includes("/login")) {
  console.log("post-login URL stayed on /login (fill-timing miss) — retrying the careful re-auth");
  urlNow = await authAttempt();
}
console.log("post-login URL:", JSON.stringify(urlNow));
const appFp = await evalOn("ref88", FP);
console.log("REF app fingerprints:", JSON.stringify(appFp));
const appJs = (appFp.js || []).join(",");
const appCss = (appFp.css || []).join(",");
console.log(`  app JS ${appJs.includes(FINALS.appJs) ? "QUIET" : "CHANGED"} (${FINALS.appJs} expected)`);
console.log(`  app CSS ${appCss.includes(FINALS.appCss) ? "QUIET" : "CHANGED"} (${FINALS.appCss} expected)`);
const appQuiet = appJs.includes(FINALS.appJs) && appCss.includes(FINALS.appCss);
console.log("VERDICT:", loginQuiet && appQuiet ? "BOTH SIDES QUIET — the post-58th contract still live (run the full standing ladder as the opening read)" : "DEPLOY DETECTED — ladder every observed generation");
console.log("LOGIN-VERDICT:", loginQuiet ? "LOGIN QUIET" : `LOGIN DEPLOYED — new fingerprints: JS ${loginJs} / CSS ${loginCss}`);
console.log("APP-VERDICT:", appQuiet ? "APP QUIET" : `APP DEPLOYED — new fingerprints: JS ${appJs} / CSS ${appCss}`);
process.exit(0);
