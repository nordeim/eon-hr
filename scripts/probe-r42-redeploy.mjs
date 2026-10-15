#!/usr/bin/env node
// probe-r42-redeploy.mjs — session-43 / parity round 42 redeploy watch.
// Reads REF's four build fingerprints (login JS/CSS + app JS/CSS) and
// compares against the round-41 documented state:
//   login JS index-C-ulo5ek.js · login CSS index-BIWjBcok.css
//   app JS   index-C-IrDy5f.js  · app CSS   index-BGNH4KkS.css
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; }
}

// login-page fingerprints (logged out view — read via a fresh open, no auth loss)
run('agent-browser --session ref open "https://eon.base44.app/login"');
await new Promise(r => setTimeout(r, 3500));
const loginScripts = await evalOn("ref", `(() => ({
  js: [...document.querySelectorAll('script[src]')].map(s => s.src.split('/').pop()).filter(s => s && s.startsWith('index-')),
  css: [...document.querySelectorAll('link[rel=stylesheet]')].map(l => (l.href||'').split('/').pop()).filter(s => s && s.startsWith('index-'))
}))()`);

// back to the authed dashboard for app fingerprints
run('agent-browser --session ref open "https://eon.base44.app/dashboard"');
await new Promise(r => setTimeout(r, 4500));
const appScripts = await evalOn("ref", `(() => ({
  js: [...new Set([...document.querySelectorAll('script[src]')].map(s => s.src.split('/').pop()).filter(s => s && s.startsWith('index-')))],
  css: [...new Set([...document.querySelectorAll('link[rel=stylesheet]')].map(l => (l.href||'').split('/').pop()).filter(s => s && s.startsWith('index-')))]
}))()`);

const R41 = {
  loginJs: "index-C-ulo5ek.js",
  loginCss: "index-BIWjBcok.css",
  appJs: "index-C-IrDy5f.js",
  appCss: "index-BGNH4KkS.css",
};
const pick = (arr, kind) => (arr?.[kind] || []).join(", ");
console.log("LOGIN :", JSON.stringify(loginScripts));
console.log("APP   :", JSON.stringify(appScripts));
console.log(`loginJs  : ${pick(loginScripts, "js")}   ${pick(loginScripts, "js").includes(R41.loginJs) ? "== r41 (QUIET)" : "REDEPLOYED"}`);
console.log(`loginCss : ${pick(loginScripts, "css")}   ${pick(loginScripts, "css").includes(R41.loginCss) ? "== r41 (QUIET)" : "REDEPLOYED"}`);
console.log(`appJs    : ${pick(appScripts, "js")}   ${pick(appScripts, "js").includes(R41.appJs) ? "== r41 (QUIET)" : "REDEPLOYED"}`);
console.log(`appCss   : ${pick(appScripts, "css")}   ${pick(appScripts, "css").includes(R41.appCss) ? "== r41 (QUIET)" : "REDEPLOYED"}`);
