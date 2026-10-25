#!/usr/bin/env node
// r93-ladder-rest.mjs — session-93 / parity round 92: ladder steps 2+3 + the
// app-side fingerprint read. Step 1 already GREEN (the login pair byte-identical
// to the standing 69aa4241… baseline via r93-login-pair.mjs). This script:
//   - auths the ref + loc sessions (the fill-settle-click pattern)
//   - reads the REF's authed APP asset fingerprints (vs the recorded C-IrDy5f / BGNH4KkS)
//   - runs probe-r37-standing (expect 5/5) + probe-r41-routesweep (expect 12/12)
// Usage: node scripts/r93-ladder-rest.mjs   (the :3200 standalone must be up)
import { execSync } from "node:child_process";

function run(cmd, t = 120000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise((r) => setTimeout(r, 3000));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise((r) => setTimeout(r, 400));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise((r) => setTimeout(r, 600));
  run(`agent-browser --session ${session} click 'button[type=submit]'`);
  await new Promise((r) => setTimeout(r, 5000));
  return run(`agent-browser --session ${session} get url`).trim();
}

const refUrl = await auth("ref", "https://eon.base44.app");
console.log("ref session:", refUrl);
const locUrl = await auth("loc", "http://127.0.0.1:3200");
console.log("loc session:", locUrl);
if (locUrl.includes("/login")) { console.log("LOC AUTH FAILED"); process.exit(1); }

// the app-side fingerprints on the authed REF dashboard
const fp = run(`agent-browser --session ref eval "[...document.querySelectorAll('script[src],link[href]')].map(e => (e.src || e.href)).filter(u => /static|chunk|_next/.test(u)).join('\\\\n')"`);
console.log("REF app assets (authed):");
console.log(fp.trim().split("\n").filter((l) => /index-|C-|BGN/.test(l)).slice(0, 8).join("\n") || fp.trim().slice(0, 400));

console.log("\n########## STANDING AUDITS (expect 5/5) ##########");
console.log(run("node scripts/probe-r37-standing.mjs"));
console.log("\n########## ROUTE SWEEP (expect 12/12) ##########");
console.log(run("node scripts/probe-r41-routesweep.mjs"));
process.exit(0);
