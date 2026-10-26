#!/usr/bin/env node
// r97-loc-nav-pair.mjs — the CLONE side at 390 on :3200: the same mobile-nav
// census (hamburger + drawer interior) for the cross-side compare + the
// employee-detail route census on BOTH sides (the standing REF-broken member).
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const S = "loc97nav";

run(`agent-browser --session ${S} close 2>/dev/null; true`);
run(`agent-browser --session ${S} set viewport 390 844`);
run(`agent-browser --session ${S} open http://127.0.0.1:3200/login`);
await new Promise((r) => setTimeout(r, 3000));
run(`agent-browser --session ${S} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise((r) => setTimeout(r, 500));
run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
await new Promise((r) => setTimeout(r, 500));
const snap = run(`agent-browser --session ${S} snapshot -i -c`);
const m = snap.match(/- button "[^"]*[Ss]ign in[^"]*" \[ref=(\w+)\]/);
if (m) run(`agent-browser --session ${S} click @${m[1]}`);
await new Promise((r) => setTimeout(r, 5000));

run(`agent-browser --session ${S} open http://127.0.0.1:3200/`);
await new Promise((r) => setTimeout(r, 4500));

// the clone's hamburger census
const btns = run(`agent-browser --session ${S} eval "(() => { const bs=[...document.querySelectorAll('header button')].filter(b=>b.offsetParent!==null); return JSON.stringify(bs.slice(0,6).map(b=>({label: b.getAttribute('aria-label')||'', text: (b.textContent||'').trim().slice(0,20), svg: (b.querySelector('svg')?.getAttribute('class')||'').slice(0,40), w: b.offsetWidth}))); })()"`);
console.log("clone top-bar buttons:", btns.trim().slice(0, 500));

// click the toggle (aria-label="Toggle Sidebar")
run(`agent-browser --session ${S} eval "(() => { const b=[...document.querySelectorAll('header button')].find(b=>b.getAttribute('aria-label')==='Toggle Sidebar'); b&&b.click(); return 'ok'; })()"`);
await new Promise((r) => setTimeout(r, 1800));
const drawer = run(`agent-browser --session ${S} eval "(() => { const els=[...document.querySelectorAll('body > div')].filter(e=>{const s=getComputedStyle(e); return s.position==='fixed' && e.offsetWidth>150;}); const d=els.find(e=>e.offsetWidth===288) || els[els.length-1]; if(!d) return 'NODRAWER'; const items=[...d.querySelectorAll('a,button')].map(a=>(a.textContent||'').trim()).filter(Boolean); return JSON.stringify({w: d.offsetWidth, h: d.offsetHeight, count: items.length, first: items.slice(0,14)}); })()"`);
console.log("clone drawer:", drawer.trim().slice(0, 500));
run(`agent-browser --session ${S} screenshot /home/z/my-project/eon-hr/docs/screenshots/r97-loc-mobilenav-open.png`);

// the clone's employee-detail route renders with data?
run(`agent-browser --session ${S} eval "(() => { const b=[...document.querySelectorAll('header button')].find(b=>b.getAttribute('aria-label')==='Toggle Sidebar'); b&&b.click(); return 'closed'; })()"`);
await new Promise((r) => setTimeout(r, 800));
run(`agent-browser --session ${S} open http://127.0.0.1:3200/employee/1`);
await new Promise((r) => setTimeout(r, 4000));
const ed = run(`agent-browser --session ${S} eval "(() => { const root=document.getElementById('root')||document.body; return JSON.stringify({path: location.pathname, rootChildren: root.children.length, textLen: (document.body.innerText||'').trim().length, sample: (document.body.innerText||'').trim().slice(0,60)}); })()"`);
console.log("clone /employee/1:", ed.trim().slice(0, 300));

run(`agent-browser --session ${S} close`);
