#!/usr/bin/env node
// r72-deploy-watch.mjs — session-72 / parity round 71 deploy watch.
// Compares the REF login + app asset fingerprints against the post-33RD
// finals (the r71-round watch read the 33RD LOGIN DEPLOY: login JS
// CKnh3tRk→BCr9BMlh, login CSS QUIET BpSyi-cD + the api/frontend-config.js?v=3
// platform preload; the app side QUIET C-IrDy5f/BGNH4KkS; the fresh re-auth
// clean — Turnstile unenforced, the standing login-side watch item; the
// ladder audited the 33rd NON-VISUAL, byte-confirmed by the 476 login pair ≡
// the r70 458 pair).
// Quiet = the post-33rd contract still live.
// NOTE (the r60 lesson, standing): the password fill MUST be single-quoted —
// '$Abcd1234' inside a double-quoted shell string expands the unset
// variable to EMPTY and the re-auth silently fails.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app";
const FINALS = { loginJs: "BCr9BMlh", loginCss: "BpSyi-cD", appJs: "C-IrDy5f", appCss: "BGNH4KkS" };
const FP = `(() => {
  const fp = (el) => { const m = (el.getAttribute('href') || el.getAttribute('src') || '').match(/([A-Za-z0-9_-]{6,})\\.(?:css|js)/); return m ? m[1] : null; };
  const css = [...document.querySelectorAll('link[rel=stylesheet]')].map(fp).filter(Boolean);
  const js = [...document.querySelectorAll('script[src]')].map(fp).filter(Boolean);
  return { css, js };
})()`;

// Login side (unauthenticated page — direct open, no auth needed)
run(`agent-browser --session ref72 open ${baseRef}/login`);
await new Promise(r => setTimeout(r, 3000));
const loginFp = await evalOn("ref72", FP);
console.log("REF login fingerprints:", JSON.stringify(loginFp));
const loginJs = (loginFp.js || []).join(",");
const loginCss = (loginFp.css || []).join(",");
const loginQuiet = loginJs.includes(FINALS.loginJs) && loginCss.includes(FINALS.loginCss);
console.log(`  login JS ${loginJs.includes(FINALS.loginJs) ? "QUIET" : "CHANGED"} (${FINALS.loginJs} expected)`);
console.log(`  login CSS ${loginCss.includes(FINALS.loginCss) ? "QUIET" : "CHANGED"} (${FINALS.loginCss} expected)`);

// App side: sign in via the agent-browser fill (the controlled-input-safe
// pattern the r55 census used), then read the authed app's fingerprints.
run(`agent-browser --session ref72 fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
run(`agent-browser --session ref72 fill 'input[type=password]' '$Abcd1234'`);
run(`agent-browser --session ref72 click 'button[type=submit]'`);
await new Promise(r => setTimeout(r, 6000));
const urlNow = await evalOn("ref72", "location.href");
console.log("post-login URL:", JSON.stringify(urlNow));
const appFp = await evalOn("ref72", FP);
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
