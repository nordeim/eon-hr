#!/usr/bin/env node
// r100-debug-tab.mjs — why doesn't the AI CV Upload tab click switch panels?
import { execSync } from "node:child_process";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 160); } }
const S = "r100dbg5";

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
await new Promise((r) => setTimeout(r, 6000));

const snap = run(`agent-browser --session ${S} snapshot -i -c`);
const mt = snap.match(/- tab "\s*AI CV Upload\s*" \[ref=(\w+)\]/);
console.log("tab ref:", mt ? mt[1] : "NULL");
if (mt) run(`agent-browser --session ${S} click @${mt[1]}`);
await new Promise((r) => setTimeout(r, 3000));

const state = run(`agent-browser --session ${S} eval "(() => { const NL = String.fromCharCode(10); const tabs = [...document.querySelectorAll('[role=tab]')].map(t => ({ t: (t.textContent || '').trim().slice(0, 25), sel: t.getAttribute('aria-selected'), vis: t.getBoundingClientRect().width > 0 })); const panels = [...document.querySelectorAll('[role=tabpanel]')].map(p => ({ sel: p.getAttribute('data-state'), vis: p.getBoundingClientRect().width > 0, txt: (p.innerText || '').slice(0, 70).split(NL).join('|') })); return JSON.stringify({ tabs, panels }); })()"`);
console.log(state.trim().slice(0, 1000));
run(`agent-browser --session ${S} screenshot /tmp/r100dbg.png`);
run(`agent-browser --session ${S} close`);
