#!/usr/bin/env node
// r101-loc-nav-pair.mjs — the clone-side mobile-nav pair (the same
// fixed-aware read as the REF probe): hamburger geometry + drawer
// geometry + the mobile-menu cycle (open → Training LMS → /training +
// the auto-close) on the remediated :3200 build.
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const S = "loc102nav";

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

run(`agent-browser --session ${S} open http://127.0.0.1:3200/dashboard`);
await new Promise((r) => setTimeout(r, 4500));

// the hamburger geometry (the clone keeps the aria-label superset)
const btn = run(`agent-browser --session ${S} eval "(() => { const b=[...document.querySelectorAll('header button')].find(x=>(x.getAttribute('aria-label')||'').includes('Toggle Sidebar')||(x.textContent||'').includes('Toggle Sidebar')); if(!b) return 'NOBTN'; const r=b.getBoundingClientRect(); return JSON.stringify({w:Math.round(r.width),h:Math.round(r.height),svg:(b.querySelector('svg')?.getAttribute('class')||'').slice(0,40),name:(b.getAttribute('aria-label')||b.textContent||'').trim()}); })()"`);
console.log("hamburger:", btn.trim().slice(0, 200));

// open + the fixed-aware drawer read
run(`agent-browser --session ${S} eval "(() => { const b=[...document.querySelectorAll('header button')].find(x=>(x.getAttribute('aria-label')||'').includes('Toggle Sidebar')); if(b) b.click(); })()"`);
await new Promise((r) => setTimeout(r, 1800));
const drawer = run(`agent-browser --session ${S} eval "(() => { const cands=[...document.querySelectorAll('[role=dialog], [data-state=open]')]; const d=cands.find(e=>{const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return r.width>200 && r.width<350 && cs.position==='fixed' && r.width>0;}); if(!d) return 'NODRAWER'; const r=d.getBoundingClientRect(); const cs=getComputedStyle(d); const items=[...d.querySelectorAll('a,button')].map(a=>(a.textContent||'').trim()).filter(Boolean); return JSON.stringify({w:Math.round(r.width),h:Math.round(r.height),pos:cs.position,z:cs.zIndex,role:d.getAttribute('role'),count:items.length,first:items.slice(0,12)}); })()"`);
console.log("drawer (fixed-aware):", drawer.trim().slice(0, 500));
run(`agent-browser --session ${S} screenshot /home/z/my-project/eon-hr/docs/screenshots/r102-loc-mobilenav-open.png`);

// the mobile-menu cycle: click Training LMS in the drawer → /training + auto-close
const snap2 = run(`agent-browser --session ${S} snapshot -i -c`);
const t = snap2.match(/- link "Training LMS" \[ref=(\w+)\]/);
if (t) {
  run(`agent-browser --session ${S} click @${t[1]}`);
  await new Promise((r) => setTimeout(r, 2500));
  const landed = run(`agent-browser --session ${S} eval "location.pathname"`);
  const closed = run(`agent-browser --session ${S} eval "(() => { const d=[...document.querySelectorAll('[role=dialog]')].find(e=>e.getBoundingClientRect().width>0 && getComputedStyle(e).position==='fixed'); return d ? 'STILL-OPEN' : 'AUTO-CLOSED'; })()"`);
  console.log("menu cycle:", landed.trim(), "|", closed.trim());
} else {
  console.log("Training LMS link not found in snapshot");
}
run(`agent-browser --session ${S} screenshot /home/z/my-project/eon-hr/docs/screenshots/r102-loc-training-mobile.png`);
run(`agent-browser --session ${S} close`);
