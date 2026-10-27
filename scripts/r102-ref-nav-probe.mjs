#!/usr/bin/env node
// r101-ref-nav-probe.mjs — the fixed-aware follow-up (the §109 cure):
// the drawer read must use getBoundingClientRect().width > 0 (NOT
// offsetParent — Chrome reports null for position:fixed portals), plus
// the /employeedetail mobile render (the standing classification) and
// the hamburger's geometry contract.
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const S = "ref102nav";

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

// (1) the hamburger geometry (the standing contract: 28px lucide-panel-left,
// accessible name "Toggle Sidebar" via the sr-only span)
run(`agent-browser --session ${S} open https://eon.base44.app/`);
await new Promise((r) => setTimeout(r, 5000));
const btn = run(`agent-browser --session ${S} eval "(() => { const b=[...document.querySelectorAll('header button')].find(x=>(x.textContent||'').includes('Toggle Sidebar')||(x.getAttribute('aria-label')||'').includes('Toggle Sidebar')); if(!b) return 'NOBTN'; const r=b.getBoundingClientRect(); return JSON.stringify({w:Math.round(r.width),h:Math.round(r.height),svg:(b.querySelector('svg')?.getAttribute('class')||'').slice(0,40),name:(b.getAttribute('aria-label')||b.textContent||'').trim()}); })()"`);
console.log("hamburger:", btn.trim().slice(0, 200));

// click it, then the FIXED-AWARE drawer read
run(`agent-browser --session ${S} eval "document.querySelector('header button').click()"`);
await new Promise((r) => setTimeout(r, 1800));
const drawer = run(`agent-browser --session ${S} eval "(() => { const cands=[...document.querySelectorAll('[role=dialog], [data-state=open]')]; const d=cands.find(e=>{const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return r.width>200 && r.width<350 && cs.position==='fixed' && r.width>0;}); if(!d) return 'NODRAWER'; const r=d.getBoundingClientRect(); const cs=getComputedStyle(d); const items=[...d.querySelectorAll('a,button')].map(a=>(a.textContent||'').trim()).filter(Boolean); return JSON.stringify({w:Math.round(r.width),h:Math.round(r.height),pos:cs.position,z:cs.zIndex,count:items.length,first:items.slice(0,12)}); })()"`);
console.log("drawer (fixed-aware):", drawer.trim().slice(0, 500));
run(`agent-browser --session ${S} screenshot /home/z/my-project/eon-hr/docs/screenshots/r102-ref-mobilenav-open.png`);

// (2) the /employeedetail mobile render (the standing classification:
// shell chrome renders, main empty)
run(`agent-browser --session ${S} open https://eon.base44.app/employeedetail`);
await new Promise((r) => setTimeout(r, 4500));
const ed = run(`agent-browser --session ${S} eval "(() => { const root=document.getElementById('root'); const main=document.querySelector('main'); return JSON.stringify({rootChildren: root?root.children.length:-1, mainTextLen: (main?.innerText||'').trim().length, bodySample: (document.body.innerText||'').trim().slice(0,60), scrollW: document.documentElement.scrollWidth}); })()"`);
console.log("/employeedetail:", ed.trim().slice(0, 300));

run(`agent-browser --session ${S} close`);
