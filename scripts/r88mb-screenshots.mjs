#!/usr/bin/env node
// r88-screenshots.mjs — the session-88 byte-chain evidence set. Numbers
// continue from 1295 (the r87 chain ended there).
//   1297       the LOGIN standing pair @1440x900 (byte-compare vs the
//              r72 493 baseline, md5 69aa4241 — the 58th holding)
//   1299-1321  the TWELVE remediated-route MOBILE pairs @390x844 (the
//              round's evidence — copied from the r88-mobile re-verify
//              captures, the post-fix state)
//   1323-1345  the TWELVE remediated-route DESKTOP pairs @1440x900 (the
//              regression guard — the desktop band must be unchanged)
// Usage: node scripts/r88-screenshots.mjs
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
const md5 = (p) => crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex");

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
const ROUTES = [
  "reports", "advancedanalytics", "surveyanalytics", "analyticsdashboard",
  "attendancedashboard", "profile", "chat", "shiftcalendar",
  "workflowconfigpage", "shiftswap", "tenantsetup", "companywall",
];

// 1297 — the login standing pair (fresh, logged-out, LIGHT, 1440x900)
run(`agent-browser --session r88chain close 2>/dev/null; true`);
run(`agent-browser --session r88chain set viewport 1440 900`);
run(`agent-browser --session r88chain eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
run(`agent-browser --session r88chain open https://eon.base44.app/login`);
await new Promise(r => setTimeout(r, 3500));
run(`agent-browser --session r88chain screenshot ${shots}/1297-login-standing-ref.png`);
run(`agent-browser --session r88chain open http://127.0.0.1:3200/login`);
await new Promise(r => setTimeout(r, 3500));
run(`agent-browser --session r88chain screenshot ${shots}/1297-login-standing-loc.png`);
const refMd5 = md5(`${shots}/1297-login-standing-ref.png`);
const baseMd5 = md5(`${shots}/493-login-standing-ref.png`);
console.log(`1297 login: ref ${refMd5.slice(0, 8)} vs base ${baseMd5.slice(0, 8)} — ${refMd5 === baseMd5 ? "BYTE-IDENTICAL (the 58th holds)" : "DRIFT (audit before landing)"}`);

// auth for the desktop pairs
run(`agent-browser --session r88chain fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise(r => setTimeout(r, 400));
run(`agent-browser --session r88chain fill 'input[type=password]' '$Abcd1234'`);
await new Promise(r => setTimeout(r, 400));
const snap = run(`agent-browser --session r88chain snapshot -i -c`);
const bref = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
if (bref) run(`agent-browser --session r88chain click @${bref}`);
await new Promise(r => setTimeout(r, 4200));
console.log("loc authed:", run(`agent-browser --session r88chain get url`).trim());

// auth the REF side too (fresh session to keep the chain session clean)
run(`agent-browser --session r88ref set viewport 1440 900`);
run(`agent-browser --session r88ref eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
run(`agent-browser --session r88ref open https://eon.base44.app/login`);
await new Promise(r => setTimeout(r, 3000));
run(`agent-browser --session r88ref fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise(r => setTimeout(r, 400));
run(`agent-browser --session r88ref fill 'input[type=password]' '$Abcd1234'`);
await new Promise(r => setTimeout(r, 400));
const snap2 = run(`agent-browser --session r88ref snapshot -i -c`);
const bref2 = (snap2.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
if (bref2) run(`agent-browser --session r88ref click @${bref2}`);
await new Promise(r => setTimeout(r, 4200));
console.log("ref authed:", run(`agent-browser --session r88ref get url`).trim());

// 1299-1321 — the twelve mobile pairs (copy from the re-verify captures)
let n = 1299;
for (const route of ROUTES) {
  fs.copyFileSync(`${shots}/r88-mobile-${route}-ref.png`, `${shots}/${n}-m-${route}-ref.png`);
  fs.copyFileSync(`${shots}/r88-mobile-${route}-loc.png`, `${shots}/${n}-m-${route}-loc.png`);
  console.log(`${n} mobile pair: ${route}`);
  n += 2;
}

// 1323-1345 — the twelve desktop pairs
n = 1323;
for (const route of ROUTES) {
  for (const [session, base, suffix] of [["r88ref", "https://eon.base44.app", "ref"], ["r88chain", "http://127.0.0.1:3200", "loc"]]) {
    run(`agent-browser --session ${session} set viewport 1440 900`);
    run(`agent-browser --session ${session} open ${base}/${route}`);
    await new Promise(r => setTimeout(r, 3500));
    run(`agent-browser --session ${session} screenshot ${shots}/${n}-d-${route}-${suffix}.png`);
  }
  console.log(`${n} desktop pair: ${route}`);
  n += 2;
}
console.log("CHAIN COMPLETE — numbers 1297-1345");
process.exit(0);
