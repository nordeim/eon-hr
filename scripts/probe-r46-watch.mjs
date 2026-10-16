#!/usr/bin/env node
// probe-r46-watch.mjs — session-47 / parity round 46 redeploy watch.
// Compares REF's login + app build fingerprints against the round-45 finals:
//   login JS CcAnCcTT / login CSS BWytzgpi / app JS C-IrDy5f / app CSS BGNH4KkS
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app";

const FPRINT = `(() => {
  const scripts = [...document.querySelectorAll('script[src]')].map(s => s.src.split('/').pop());
  const links = [...document.querySelectorAll('link[rel=stylesheet]')].map(l => l.href.split('/').pop());
  return { scripts, links };
})()`;

const FINAL = { loginJs: "CcAnCcTT", loginCss: "BWytzgpi", appJs: "C-IrDy5f", appCss: "BGNH4KkS" };

// --- login page ---
run(`agent-browser --session ref open "${baseRef}/login"`);
await new Promise(r => setTimeout(r, 2500));
const login = await evalOn("ref", FPRINT);
const loginJs = login.scripts.filter(s => s.startsWith("index-")).join(",");
const loginCss = login.links.filter(l => l.startsWith("index-")).join(",");

// --- dashboard (app build) ---
run(`agent-browser --session ref open "${baseRef}/dashboard"`);
await new Promise(r => setTimeout(r, 2500));
const app = await evalOn("ref", FPRINT);
const appJs = app.scripts.filter(s => s.startsWith("index-")).join(",");
const appCss = app.links.filter(l => l.startsWith("index-")).join(",");

const verdict = {
  loginJs, loginCss, appJs, appCss,
  loginJsChanged: !loginJs.includes(FINAL.loginJs),
  loginCssChanged: !loginCss.includes(FINAL.loginCss),
  appJsChanged: !appJs.includes(FINAL.appJs),
  appCssChanged: !appCss.includes(FINAL.appCss),
};
console.log(JSON.stringify({ FINAL, verdict }, null, 1));
