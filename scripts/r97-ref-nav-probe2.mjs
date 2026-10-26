#!/usr/bin/env node
// r97-ref-nav-probe2.mjs — decode the REF's mobile drawer mechanism (the
// click fired but no role=dialog — read the DOM's fixed overlays directly)
// + the employee-detail route census.
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const S = "ref97nav2";

run(`agent-browser --session ${S} close 2>/dev/null; true`);
run(`agent-browser --session ${S} set viewport 390 844`);
run(`agent-browser --session ${S} open https://eon.base44.app/login`);
await new Promise((r) => setTimeout(r, 3000));
run(`agent-browser --session ${S} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise((r) => setTimeout(r, 500));
run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
await new Promise((r) => setTimeout(r, 500));
const snap = run(`agent-browser --session ${S} snapshot -i -c`);
const m = snap.match(/- button "[^"]*[Ss]ign in[^"]*" \[ref=(\w+)\]/);
if (m) run(`agent-browser --session ${S} click @${m[1]}`);
await new Promise((r) => setTimeout(r, 6000));

run(`agent-browser --session ${S} open https://eon.base44.app/`);
await new Promise((r) => setTimeout(r, 5000));

// click the toggle, then census EVERY fixed/overlay element
run(`agent-browser --session ${S} eval "(() => { const bs=[...document.querySelectorAll('header button')].filter(b=>b.offsetParent!==null); bs[0].click(); return 'clicked'; })()"`);
await new Promise((r) => setTimeout(r, 2000));
const overlays = run(`agent-browser --session ${S} eval "(() => { const els=[...document.querySelectorAll('body > div')].filter(e=>{const s=getComputedStyle(e); return (s.position==='fixed'||s.position==='absolute') && e.offsetWidth>100;}); return JSON.stringify(els.map(e=>({cls: (e.className||'').toString().slice(0,80), w: e.offsetWidth, h: e.offsetHeight, dialogs: e.querySelectorAll('[role=dialog],nav,a,button').length}))); })()"`);
console.log("fixed overlays after click:", overlays.trim().slice(0, 700));

// any element with a sidebar-ish class now visible?
const side = run(`agent-browser --session ${S} eval "(() => { const cands=[...document.querySelectorAll('div,aside,nav')].filter(e=>{const r=e.getBoundingClientRect(); return r.width>150 && r.height>400 && r.left>=-10 && r.left<60 && e.offsetParent!==null;}); return JSON.stringify(cands.slice(0,3).map(e=>({tag: e.tagName, cls: (e.className||'').toString().slice(0,90), w: Math.round(e.getBoundingClientRect().width), links: e.querySelectorAll('a').length}))); })()"`);
console.log("left-panel candidates:", side.trim().slice(0, 600));

run(`agent-browser --session ${S} screenshot /home/z/my-project/eon-hr/docs/screenshots/r97-ref-mobilenav-open3.png`);

// the employee detail: what do the row links look like on the REF?
const empRows = run(`agent-browser --session ${S} eval "(() => { const t=document.querySelector('table'); if(!t) return 'NOTABLE'; const rows=[...t.querySelectorAll('tbody tr')].slice(0,2); return JSON.stringify(rows.map(r=>({html: r.outerHTML.slice(0,180)}))); })()"`);
console.log("employee rows:", empRows.trim().slice(0, 500));

run(`agent-browser --session ${S} close`);
