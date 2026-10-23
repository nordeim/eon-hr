#!/usr/bin/env node
// r85-deploy-watch.mjs — session-85 / parity round 84 deploy watch.
// The r83 round (the theme-direction audit round) read BOTH SIDES QUIET at
// the opening AND the close — the 55th login deploy held through a SECOND
// consecutive single-generation round (login JS index-BdweUDbT + CSS
// index--4Ltml9o; the app side C-IrDy5f/BGNH4KkS; no 56th deploy).
// RE-ARMED at the post-55th finals (unchanged from r83 — the 55th is still
// the last observed generation):
//   login JS  index-BdweUDbT  + login CSS index--4Ltml9o
//   app   JS  C-IrDy5f        + app   CSS BGNH4KkS
// Quiet = the post-55th contract still live (the 55th-or-newer FULL standing
// ladder is THIS session's opening read regardless); CHANGED = the 56th+
// deploy arrived → ladder every observed generation.
// NOTES (standing lessons):
//   - the password fill MUST be single-quoted — '$Abcd1234' inside a
//     double-quoted shell string expands the unset variable to EMPTY and
//     the re-auth silently fails (the r60 lesson).
//   - a fill-timing miss leaves the post-login URL on /login (NOT a
//     Turnstile rollout — check the DOM census before concluding); the
//     careful re-auth (fill → settle → click) retries below.
//   - a deploy INVALIDATES the warm ref session cookie — re-auth before
//     EVERY post-deploy standing read AND before every standing/sweep run
//     (the r78 stale-cookie lesson + the r83 protocol addition: the ref
//     session's cookie expires BETWEEN rounds too — the r83 0/5+0/12
//     all-DIFF lesson).
//   - reset the daemon at the FIRST dead-session read (about:blank +
//     failing evals — the r80 dead-loc degradation mode).
//   - after any verify-r45 ladder run, RE-AUTH the loc session as the
//     seeded user before any subsequent loc-side read (the r81
//     probe-user cookie-contamination trap).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app";
const FINALS = { loginJs: "index-BgH6kzLl", loginCss: "index--4Ltml9o", appJs: "C-IrDy5f", appCss: "BGNH4KkS" }; // RE-ARMED at the post-56TH finals (the 56th landed at the r85 round-end: JS BdweUDbT->Cixyggh5, step-1-proven non-visual)
const FP = `(() => {
  const fp = (el) => { const m = (el.getAttribute('href') || el.getAttribute('src') || '').match(/([A-Za-z0-9_-]{6,})\\.(?:css|js)/); return m ? m[1] : null; };
  const css = [...document.querySelectorAll('link[rel=stylesheet]')].map(fp).filter(Boolean);
  const js = [...document.querySelectorAll('script[src]')].map(fp).filter(Boolean);
  return { css, js };
})()`;

// Login side (unauthenticated page — direct open, no auth needed)
run(`agent-browser --session ref85 close 2>/dev/null; true`);
run(`agent-browser --session ref85 set viewport 1440 900`);
run(`agent-browser --session ref85 open ${baseRef}/login`);
await new Promise(r => setTimeout(r, 3000));
const loginFp = await evalOn("ref85", FP);
console.log("REF login fingerprints:", JSON.stringify(loginFp));
const loginJs = (loginFp.js || []).join(",");
const loginCss = (loginFp.css || []).join(",");
const loginQuiet = loginJs.includes(FINALS.loginJs) && loginCss.includes(FINALS.loginCss);
console.log(`  login JS ${loginJs.includes(FINALS.loginJs) ? "QUIET" : "CHANGED"} (${FINALS.loginJs} expected)`);
console.log(`  login CSS ${loginCss.includes(FINALS.loginCss) ? "QUIET" : "CHANGED"} (${FINALS.loginCss} expected)`);

// Login-side DOM census (the standing Turnstile watch — read BEFORE auth)
const census = await evalOn("ref85", `(() => {
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
  run(`agent-browser --session ref85 fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  run(`agent-browser --session ref85 fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ref85 click 'button[type=submit]'`);
  await new Promise(r => setTimeout(r, 6000));
  return await evalOn("ref85", "location.href");
}
let urlNow = await authAttempt();
if (typeof urlNow === "string" && urlNow.includes("/login")) {
  console.log("post-login URL stayed on /login (fill-timing miss) — retrying the careful re-auth");
  urlNow = await authAttempt();
}
console.log("post-login URL:", JSON.stringify(urlNow));
const appFp = await evalOn("ref85", FP);
console.log("REF app fingerprints:", JSON.stringify(appFp));
const appJs = (appFp.js || []).join(",");
const appCss = (appFp.css || []).join(",");
console.log(`  app JS ${appJs.includes(FINALS.appJs) ? "QUIET" : "CHANGED"} (${FINALS.appJs} expected)`);
console.log(`  app CSS ${appCss.includes(FINALS.appCss) ? "QUIET" : "CHANGED"} (${FINALS.appCss} expected)`);
const appQuiet = appJs.includes(FINALS.appJs) && appCss.includes(FINALS.appCss);
console.log("VERDICT:", loginQuiet && appQuiet ? "BOTH SIDES QUIET — the post-55th contract still live (run the full standing ladder as the opening read)" : "DEPLOY DETECTED — ladder every observed generation");
console.log("LOGIN-VERDICT:", loginQuiet ? "LOGIN QUIET" : `LOGIN DEPLOYED — new fingerprints: JS ${loginJs} / CSS ${loginCss}`);
console.log("APP-VERDICT:", appQuiet ? "APP QUIET" : `APP DEPLOYED — new fingerprints: JS ${appJs} / CSS ${appCss}`);
process.exit(0);
