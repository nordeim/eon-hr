#!/usr/bin/env node
// r105-ref-nav-probe2.mjs — session 105 / parity round 104: the REF-side
// mobile-nav read at the 69TH deploy state, WITH the VERIFIED-VIEWPORT guard
// (the r104 fresh-session viewport drift trap: set viewport on a fresh
// session is lost when the browser relaunches — re-apply + verify
// window.innerWidth after EVERY open; the first attempt read w:0/h:0 at a
// 1280-wide desktop layout).
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const S = "ref105nav2";

const VERIFY = async (ms = 1500) => {
  run(`agent-browser --session ${S} set viewport 390 844`);
  await new Promise((r) => setTimeout(r, ms));
  const v = run(`agent-browser --session ${S} eval "window.innerWidth + 'x' + window.innerHeight"`).trim();
  console.log("  viewport:", v);
  return v.startsWith('"390x');
};

run(`agent-browser --session ${S} close 2>/dev/null; true`);
await VERIFY();
run(`agent-browser --session ${S} open https://eon.base44.app/login`);
await new Promise((r) => setTimeout(r, 3000));
await VERIFY();
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
await VERIFY(2500);
const btn = run(`agent-browser --session ${S} eval "(() => { const b=[...document.querySelectorAll('header button')].find(x=>(x.textContent||'').includes('Toggle Sidebar')||(x.getAttribute('aria-label')||'').includes('Toggle Sidebar')); if(!b) return 'NOBTN'; const r=b.getBoundingClientRect(); return JSON.stringify({w:Math.round(r.width),h:Math.round(r.height),svg:(b.querySelector('svg')?.getAttribute('class')||'').slice(0,40),name:(b.getAttribute('aria-label')||b.textContent||'').trim()}); })()"`);
console.log("REF hamburger (69th state):", btn.trim().slice(0, 200));

// click it, then the FIXED-AWARE drawer read
run(`agent-browser --session ${S} eval "document.querySelector('header button').click()"`);
await new Promise((r) => setTimeout(r, 1800));
const drawer = run(`agent-browser --session ${S} eval "(() => { const cands=[...document.querySelectorAll('[role=dialog], [data-state=open]')]; const d=cands.find(e=>{const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return r.width>200 && r.width<350 && cs.position==='fixed' && r.width>0;}); if(!d) return 'NODRAWER'; const r=d.getBoundingClientRect(); const cs=getComputedStyle(d); const items=[...d.querySelectorAll('a,button')].map(a=>(a.textContent||'').trim()).filter(Boolean); return JSON.stringify({w:Math.round(r.width),h:Math.round(r.height),pos:cs.position,z:cs.zIndex,count:items.length,first:items.slice(0,12)}); })()"`);
console.log("REF drawer (fixed-aware):", drawer.trim().slice(0, 500));
run(`agent-browser --session ${S} screenshot /home/z/my-project/eon-hr/docs/screenshots/r105-ref-mobilenav-open.png`);

// (2) the menu cycle: navigate to Training LMS via the drawer, verify
// AUTO-CLOSE after navigation (the standing PARITY contract)
const nav = run(`agent-browser --session ${S} eval "(() => { const cands=[...document.querySelectorAll('[role=dialog], [data-state=open]')]; const d=cands.find(e=>{const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return r.width>200 && r.width<350 && cs.position==='fixed' && r.width>0;}); if(!d) return 'NODRAWER'; const t=[...d.querySelectorAll('a,button')].find(a=>(a.textContent||'').trim()==='Training LMS'); if(!t) return 'NOTRAINING'; t.click(); return 'CLICKED'; })()"`);
console.log("menu cycle click:", nav.trim().slice(0, 100));
await new Promise((r) => setTimeout(r, 3000));
const cycle = run(`agent-browser --session ${S} eval "(() => { const cands=[...document.querySelectorAll('[role=dialog], [data-state=open]')]; const open=cands.filter(e=>e.getBoundingClientRect().width>0 && getComputedStyle(e).position==='fixed' && e.getBoundingClientRect().width>200); return JSON.stringify({path:location.pathname, drawerStillOpen: open.length>0}); })()"`);
console.log("post-nav drawer state (expect /training + closed):", cycle.trim().slice(0, 200));
run(`agent-browser --session ${S} screenshot /home/z/my-project/eon-hr/docs/screenshots/r105-ref-training-mobile.png`);

// (3) the /employeedetail mobile render (the standing classification:
// shell chrome renders, main empty — the REF's own bug)
run(`agent-browser --session ${S} open https://eon.base44.app/employeedetail`);
await new Promise((r) => setTimeout(r, 4500));
await VERIFY(2500);
const ed = run(`agent-browser --session ${S} eval "(() => { const root=document.getElementById('root'); const main=document.querySelector('main'); return JSON.stringify({rootChildren: root?root.children.length:-1, mainTextLen: (main?.innerText||'').trim().length, bodySample: (document.body.innerText||'').trim().slice(0,60), scrollW: document.documentElement.scrollWidth}); })()"`);
console.log("REF /employeedetail (69th state):", ed.trim().slice(0, 300));

run(`agent-browser --session ${S} close`);
