#!/usr/bin/env node
// r86-ref-drift-recheck.mjs — the 10 REF band/theme drifts (vs the r85
// baselines): re-capture each drifted REF pair once more to classify —
// matching the r86 capture = a stable REF-side change (ladder/classify);
// matching the r85 baseline = the first r86 capture was a transient
// state (a flake); differing from both = non-deterministic rendering.
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`agent-browser close --all 2>/dev/null; true`);
run(`agent-browser --session ref86d set viewport 1440 900`);
run(`agent-browser --session ref86d eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
const DARK = "localStorage.setItem('darkMode','true'); localStorage.removeItem('app_lang');";
const RTL = "localStorage.setItem('darkMode','false'); localStorage.setItem('app_lang','ar');";
// [newName (r86), oldName (r85), route, viewport, setup]
const CASES = [
  ["1177-s-settings-640", "1053-s-settings-640", "/settings", [640, 1024], null],
  ["1183-x-employees-1280", "1071-x-employees-1280", "/employees", [1280, 1024], null],
  ["1185-x-attendance-1280", "1073-x-attendance-1280", "/attendance", [1280, 1024], null],
  ["1187-x-training-1280", "1075-x-training-1280", "/training", [1280, 1024], null],
  ["1191-x-settings-1280", "1079-x-settings-1280", "/settings", [1280, 1024], null],
  ["1193-dk-dashboard", "1081-dk-dashboard", "/dashboard", [1440, 900], DARK],
  ["1199-dk-attendance", "1087-dk-attendance", "/attendance", [1440, 900], DARK],
  ["1207-rtl-dashboard", "1095-rtl-dashboard", "/dashboard", [1440, 900], RTL],
  ["1209-rtl-payroll", "1097-rtl-payroll", "/payroll", [1440, 900], RTL],
  ["1211-rtl-employees", "1099-rtl-employees", "/employees", [1440, 900], RTL],
];
// auth the ref session
run(`agent-browser --session ref86d open https://eon.base44.app/login`);
await new Promise(r => setTimeout(r, 3000));
run(`agent-browser --session ref86d fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise(r => setTimeout(r, 500));
run(`agent-browser --session ref86d fill 'input[type=password]' '$Abcd1234'`);
await new Promise(r => setTimeout(r, 600));
const snap = run(`agent-browser --session ref86d snapshot -i -c`);
const btnRef = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
if (btnRef) run(`agent-browser --session ref86d click @${btnRef}`);
await new Promise(r => setTimeout(r, 4200));
console.log("ref authed:", run(`agent-browser --session ref86d get url`).trim());

const md5 = (f) => run(`md5sum ${shots}/${f}.png 2>/dev/null | awk '{print $1}'`).trim();
for (const [now, was, route, [w, h], setup] of CASES) {
  if (setup) run(`agent-browser --session ref86d eval "${setup}"`);
  else run(`agent-browser --session ref86d eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
  run(`agent-browser --session ref86d set viewport ${w} ${h}`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ref86d open https://eon.base44.app${route}`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ref86d set viewport ${w} ${h}`);
  await new Promise(r => setTimeout(r, 4600));
  run(`agent-browser --session ref86d screenshot ${shots}/r86-recheck-${now}-ref.png`);
  const rc = md5(`r86-recheck-${now}-ref`);
  const n86 = md5(now + "-ref");
  const o85 = md5(was + "-ref");
  const verdict = rc === o85 ? "TRANSIENT (matches r85 — the r86 capture was a flake)" : rc === n86 ? "STABLE-NEW (a real REF-side change at this band)" : "NON-DETERMINISTIC (third value)";
  console.log(`${now}: recheck ${rc.slice(0, 8)} | r86 ${n86.slice(0, 8)} | r85 ${o85.slice(0, 8)} -> ${verdict}`);
}
run(`agent-browser --session ref86d eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
process.exit(0);
