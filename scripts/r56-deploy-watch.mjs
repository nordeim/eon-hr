#!/usr/bin/env node
// r56-deploy-watch.mjs — session-56 / parity round 55 deploy watch.
// Compares the REF login + app asset fingerprints against the round-55
// finals: login JS C2ujlke6 / CSS D5oCh2kx (the 20th login deploy),
// app JS C-IrDy5f / CSS BGNH4KkS. Quiet = the r55 contract still live.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app";
const FINALS = { loginJs: "C2ujlke6", loginCss: "D5oCh2kx", appJs: "C-IrDy5f", appCss: "BGNH4KkS" };
const FP = `(() => {
  const fp = (el) => { const m = (el.getAttribute('href') || el.getAttribute('src') || '').match(/([A-Za-z0-9_-]{6,})\\.(?:css|js)/); return m ? m[1] : null; };
  const css = [...document.querySelectorAll('link[rel=stylesheet]')].map(fp).filter(Boolean);
  const js = [...document.querySelectorAll('script[src]')].map(fp).filter(Boolean);
  return { css, js };
})()`;

// Login side (unauthenticated page — direct open, no auth needed)
run(`agent-browser --session ref56 open ${baseRef}/login`);
await new Promise(r => setTimeout(r, 3000));
const loginFp = await evalOn("ref56", FP);
console.log("REF login fingerprints:", JSON.stringify(loginFp));
const loginJs = (loginFp.js || []).find((x) => x.includes(FINALS.loginJs) && x.length >= 8 && x.length <= 12) || (loginFp.js || []).join(",");
const loginCss = (loginFp.css || []).join(",");
const loginQuiet = loginJs.includes(FINALS.loginJs) && loginCss.includes(FINALS.loginCss);
console.log(`  login JS ${loginQuiet ? "QUIET" : "CHANGED"} (${FINALS.loginJs} expected)`);
console.log(`  login CSS ${loginQuiet ? "QUIET" : "CHANGED"} (${FINALS.loginCss} expected)`);

// App side: sign in via the agent-browser fill (the controlled-input-safe
// pattern the r55 census used), then read the authed app's fingerprints.
run(`agent-browser --session ref56 fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
run(`agent-browser --session ref56 fill 'input[type=password]' '$Abcd1234'`);
run(`agent-browser --session ref56 click 'button[type=submit]'`);
await new Promise(r => setTimeout(r, 6000));
const urlNow = await evalOn("ref56", "location.href");
console.log("post-login URL:", JSON.stringify(urlNow));
const appFp = await evalOn("ref56", FP);
console.log("REF app fingerprints:", JSON.stringify(appFp));
const appJs = (appFp.js || []).join(",");
const appCss = (appFp.css || []).join(",");
const appQuiet = appJs.includes(FINALS.appJs) && appCss.includes(FINALS.appCss);
console.log(`  app JS ${appQuiet ? "QUIET" : "CHANGED"} (${FINALS.appJs} expected)`);
console.log(`  app CSS ${appQuiet ? "CHANGED".replace("CHANGED", appCss.includes(FINALS.appCss) ? "QUIET" : "CHANGED") : "CHANGED"} (${FINALS.appCss} expected)`);
console.log("VERDICT:", loginQuiet && appQuiet ? "BOTH SIDES QUIET — no 21st deploy" : "DEPLOY DETECTED — re-audit required");
