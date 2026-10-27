#!/usr/bin/env node
// r100-debug-tab2.mjs — console errors + the alternative click paths
import { execSync } from "node:child_process";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 160); } }
const S = "r100dbg6";

run(`agent-browser --session ${S} close 2>/dev/null; true`);
run(`agent-browser --session ${S} set viewport 1440 900`);
run(`agent-browser --session ${S} open http://127.0.0.1:3200/login`);
await new Promise((r) => setTimeout(r, 4000));
run(`agent-browser --session ${S} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise((r) => setTimeout(r, 600));
run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
await new Promise((r) => setTimeout(r, 600));
const s0 = run(`agent-browser --session ${S} snapshot -i -c`);
const m0 = s0.match(/- button "Sign in" \[ref=(\w+)\]/);
if (m0) run(`agent-browser --session ${S} click @${m0[1]}`);
await new Promise((r) => setTimeout(r, 6000));

run(`agent-browser --session ${S} open http://127.0.0.1:3200/recruitment`);
await new Promise((r) => setTimeout(r, 8000));

// any console errors so far?
const cons = run(`agent-browser --session ${S} console`);
console.log("console tail:", cons.trim().slice(-400));

// the fresh-snapshot ref click (after the long settle)
let snap = run(`agent-browser --session ${S} snapshot -i -c`);
let mt = snap.match(/- tab "\s*AI CV Upload\s*" \[ref=(\w+)\]/);
console.log("fresh tab ref:", mt ? mt[1] : "NULL");
if (mt) {
  run(`agent-browser --session ${S} click @${mt[1]}`);
  await new Promise((r) => setTimeout(r, 2500));
}
const st1 = run(`agent-browser --session ${S} eval "(() => { const t=[...document.querySelectorAll('[role=tab]')].find(t=>/AI CV/i.test(t.textContent||'')); return t ? t.getAttribute('aria-selected') : 'notab'; })()"`);
console.log("after ref click:", st1.trim());

// the CSS-selector click (agent-browser supports selector clicks)
run(`agent-browser --session ${S} click '[role=tab]:has-text(\"AI CV Upload\")'`);
await new Promise((r) => setTimeout(r, 2500));
const st2 = run(`agent-browser --session ${S} eval "(() => { const t=[...document.querySelectorAll('[role=tab]')].find(t=>/AI CV/i.test(t.textContent||'')); return t ? t.getAttribute('aria-selected') : 'notab'; })()"`);
console.log("after selector click:", st2.trim());

// the keyboard path: focus the tablist, arrow to the tab, Enter
run(`agent-browser --session ${S} eval "(() => { const t=[...document.querySelectorAll('[role=tab]')].find(t=>/AI CV/i.test(t.textContent||'')); if(t){ t.focus(); return 'FOCUSED'; } return 'NOTAB'; })()"`);
await new Promise((r) => setTimeout(r, 500));
run(`agent-browser --session ${S} press Enter`);
await new Promise((r) => setTimeout(r, 1500));
const st3 = run(`agent-browser --session ${S} eval "(() => { const t=[...document.querySelectorAll('[role=tab]')].find(t=>/AI CV/i.test(t.textContent||'')); return t ? t.getAttribute('aria-selected') : 'notab'; })()"`);
console.log("after keyboard:", st3.trim());

const cons2 = run(`agent-browser --session ${S} console`);
console.log("console tail 2:", cons2.trim().slice(-400));
run(`agent-browser --session ${S} close`);
