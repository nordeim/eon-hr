#!/usr/bin/env node
// r107-app-census.mjs — session 107 / parity round 106: the app-side asset
// census at the standing deploy state. Logs into the REF, reads /dashboard
// asset fingerprints, compares against the r42 baseline (C-IrDy5f /
// BGNH4KkS). The login probe already read the 70th-state login assets
// unchanged; this leg confirms the app side matches.
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app";
const session = "ref107";
const FP = `(() => {
  const fp = (el) => { const m = (el.getAttribute('href') || el.getAttribute('src') || '').match(/([A-Za-z0-9_-]{6,})\\.(?:css|js)/); return m ? m[1] : null; };
  const css = [...document.querySelectorAll('link[rel=stylesheet]')].map(fp).filter(Boolean);
  const js = [...document.querySelectorAll('script[src]')].map(fp).filter(Boolean);
  return { css, js };
})()`;

// login at the desktop viewport
run(`agent-browser --session ${session} close 2>/dev/null; true`);
run(`agent-browser --session ${session} set viewport 1440 900`);
run(`agent-browser --session ${session} open ${baseRef}/login`);
await new Promise(r => setTimeout(r, 3500));
run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise(r => setTimeout(r, 600));
run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
await new Promise(r => setTimeout(r, 600));
const snap = run(`agent-browser --session ${session} snapshot -i -c`);
const m = snap.match(/- button "[^"]*[Ss]ign in[^"]*" \[ref=(\w+)\]/);
if (m) run(`agent-browser --session ${session} click @${m[1]}`);
await new Promise(r => setTimeout(r, 6500));

// dashboard census (VERIFIED viewport)
run(`agent-browser --session ${session} set viewport 1440 900`);
run(`agent-browser --session ${session} open ${baseRef}/dashboard`);
await new Promise(r => setTimeout(r, 5000));
const vw = run(`agent-browser --session ${session} eval "window.innerWidth + 'x' + window.innerHeight + ' @ ' + location.pathname"`).trim();
console.log("viewport:", vw);
const fp = await evalOn(session, FP);
console.log("REF app-side assets:", JSON.stringify(fp));
const flat = [...(fp.css || []), ...(fp.js || [])];
const quiet = flat.some(x => x.includes("C-IrDy5f")) && flat.some(x => x.includes("BGNH4KkS"));
console.log(quiet ? "APP SIDE QUIET — the r42 baseline holds (no 71st deploy, consistent with the login probe)" : "APP SIDE MOVED — audit the app delta member by member");
run(`agent-browser --session ${session} close 2>/dev/null; true`);
process.exit(0);
