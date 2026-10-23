#!/usr/bin/env node
// r83-deploy-watch.mjs — session-83 / parity round 82 deploy watch.
// The r81 round (the tablet-band remediation round) read the login side at
// the 53rd (JS By5t4Bdg→CYumVlcN AND CSS dbXqk6oa→-4Ltml9o — the NINTH
// login-CSS movement, a pure dead-code sweep: 5 removed / 0 added, zero
// usages) and the 54th (JS CYumVlcN→index-BdweUDbT, CSS QUIET, the same
// 97493-byte entry — the chunk-graph-rebuild signature). The 53rd was FULLY
// LADDERED NON-VISUAL; the 54th step-1-proven at the close (its fresh login
// pair byte-identical to the 69aa4241… baseline).
// RE-ARMED at the post-55th finals:
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
//     every post-deploy standing read (the r78 stale-cookie lesson).
//   - reset the daemon at the FIRST dead-session read (about:blank +
//     failing evals — the r80 dead-loc degradation mode).
//   - after any verify-r45 ladder run, RE-AUTH the loc session as the
//     seeded user before any subsequent loc-side read (the r81
//     probe-user cookie-contamination trap).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app";
const FINALS = { loginJs: "index-BdweUDbT", loginCss: "index--4Ltml9o", appJs: "C-IrDy5f", appCss: "BGNH4KkS" };
const FP = `(() => {
  const fp = (el) => { const m = (el.getAttribute('href') || el.getAttribute('src') || '').match(/([A-Za-z0-9_-]{6,})\\.(?:css|js)/); return m ? m[1] : null; };
  const css = [...document.querySelectorAll('link[rel=stylesheet]')].map(fp).filter(Boolean);
  const js = [...document.querySelectorAll('script[src]')].map(fp).filter(Boolean);
  return { css, js };
})()`;

// Login side (unauthenticated page — direct open, no auth needed)
run(`agent-browser --session ref83 close 2>/dev/null; true`);
run(`agent-browser --session ref83 set viewport 1440 900`);
run(`agent-browser --session ref83 open ${baseRef}/login`);
await new Promise(r => setTimeout(r, 3000));
const loginFp = await evalOn("ref83", FP);
console.log("REF login fingerprints:", JSON.stringify(loginFp));
const loginJs = (loginFp.js || []).join(",");
const loginCss = (loginFp.css || []).join(",");
const loginQuiet = loginJs.includes(FINALS.loginJs) && loginCss.includes(FINALS.loginCss);
console.log(`  login JS ${loginJs.includes(FINALS.loginJs) ? "QUIET" : "CHANGED"} (${FINALS.loginJs} expected)`);
console.log(`  login CSS ${loginCss.includes(FINALS.loginCss) ? "QUIET" : "CHANGED"} (${FINALS.loginCss} expected)`);

// Login-side DOM census (the standing Turnstile watch — read BEFORE auth)
const census = await evalOn("ref83", `(() => {
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
  run(`agent-browser --session ref83 fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  run(`agent-browser --session ref83 fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ref83 click 'button[type=submit]'`);
  await new Promise(r => setTimeout(r, 6000));
  return await evalOn("ref83", "location.href");
}
let urlNow = await authAttempt();
if (typeof urlNow === "string" && urlNow.includes("/login")) {
  console.log("post-login URL stayed on /login (fill-timing miss) — retrying the careful re-auth");
  urlNow = await authAttempt();
}
console.log("post-login URL:", JSON.stringify(urlNow));
const appFp = await evalOn("ref83", FP);
console.log("REF app fingerprints:", JSON.stringify(appFp));
const appJs = (appFp.js || []).join(",");
const appCss = (appFp.css || []).join(",");
console.log(`  app JS ${appJs.includes(FINALS.appJs) ? "QUIET" : "CHANGED"} (${FINALS.appJs} expected)`);
console.log(`  app CSS ${appCss.includes(FINALS.appCss) ? "QUIET" : "CHANGED"} (${FINALS.appCss} expected)`);
const appQuiet = appJs.includes(FINALS.appJs) && appCss.includes(FINALS.appCss);
console.log("VERDICT:", loginQuiet && appQuiet ? "BOTH SIDES QUIET — the post-55th contract still live (run the 54th's standing ladder)" : "DEPLOY DETECTED — ladder every observed generation");
console.log("LOGIN-VERDICT:", loginQuiet ? "LOGIN QUIET" : `LOGIN DEPLOYED — new fingerprints: JS ${loginJs} / CSS ${loginCss}`);
console.log("APP-VERDICT:", appQuiet ? "APP QUIET" : `APP DEPLOYED — new fingerprints: JS ${appJs} / CSS ${appCss}`);
process.exit(0);
