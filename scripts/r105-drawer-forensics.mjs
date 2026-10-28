#!/usr/bin/env node
// r105-drawer-forensics.mjs — investigate the two r105 nav-pair discrepancies:
//   (1) REF drawer STILL-OPEN after menu navigation (r104 verified AUTO-CLOSED
//       at the 68th state — is this a 69th-deploy behavior change or a stale
//       element read? Check the panel's actual on-screen x, transform, and
//       visibility — a Radix slide-out leaves rect.width=288 while off-screen)
//   (2) item count 16 (REF) vs 15 (LOC) — list every drawer item on both sides
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const shots = "/home/z/my-project/eon-hr/docs/screenshots";

async function forensics(side, base, session) {
  console.log(`\n===== ${side} =====`);
  run(`agent-browser --session ${session} close 2>/dev/null; true`);
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise((r) => setTimeout(r, 3500));
  run(`agent-browser --session ${session} set viewport 390 844`);
  await new Promise((r) => setTimeout(r, 600));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise((r) => setTimeout(r, 600));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise((r) => setTimeout(r, 600));
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const m = snap.match(/- button "[^"]*[Ss]ign in[^"]*" \[ref=(\w+)\]/);
  if (m) run(`agent-browser --session ${session} click @${m[1]}`);
  await new Promise((r) => setTimeout(r, 6500));

  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise((r) => setTimeout(r, 5000));
  run(`agent-browser --session ${session} set viewport 390 844`);
  await new Promise((r) => setTimeout(r, 1500));

  // open the drawer
  run(`agent-browser --session ${session} eval "(() => { const b=[...document.querySelectorAll('header button')].find(x=>(x.getAttribute('aria-label')||'').includes('Toggle Sidebar')||(x.textContent||'').includes('Toggle Sidebar')); if(b) b.click(); })()"`);
  await new Promise((r) => setTimeout(r, 1800));

  // full item list + panel geometry
  const list = run(`agent-browser --session ${session} eval "(() => { const cands=[...document.querySelectorAll('[role=dialog], [data-state=open]')]; const d=cands.find(e=>{const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return r.width>200 && r.width<350 && cs.position==='fixed' && r.width>0;}); if(!d) return 'NODRAWER'; const items=[...d.querySelectorAll('a,button')].map(a=>({t:(a.textContent||'').trim().slice(0,28), tag:a.tagName.toLowerCase(), href:(a.getAttribute('href')||'').slice(0,30)})); return JSON.stringify(items); })()"`);
  console.log(`${side} drawer items:`, list.trim().slice(0, 1200));

  // navigate to Training LMS
  const nav = run(`agent-browser --session ${session} eval "(() => { const cands=[...document.querySelectorAll('[role=dialog], [data-state=open]')]; const d=cands.find(e=>{const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return r.width>200 && r.width<350 && cs.position==='fixed' && r.width>0;}); if(!d) return 'NODRAWER'; const t=[...d.querySelectorAll('a,button')].find(a=>(a.textContent||'').trim()==='Training LMS'); if(!t) return 'NOTRAINING'; t.click(); return 'CLICKED'; })()"`);
  console.log(`${side} nav click:`, nav.trim());
  await new Promise((r) => setTimeout(r, 4000));

  // post-nav drawer state: is the PANEL actually on-screen?
  const post = run(`agent-browser --session ${session} eval "(() => { const panels=[...document.querySelectorAll('[role=dialog]')].filter(e=>{const r=e.getBoundingClientRect(); return r.width>200 && r.width<350;}); return JSON.stringify({path:location.pathname, nPanels:panels.length, panels:panels.map(p=>{const r=p.getBoundingClientRect(); const cs=getComputedStyle(p); return {state:p.getAttribute('data-state'), x:Math.round(r.x), w:Math.round(r.width), transform:cs.transform.slice(0,30), opacity:cs.opacity, visibility:cs.visibility, pointerEvents:cs.pointerEvents, ariaHidden:p.getAttribute('aria-hidden'), inDoc:document.body.contains(p)};})}); })()"`);
  console.log(`${side} post-nav panels:`, post.trim().slice(0, 900));
  run(`agent-browser --session ${session} screenshot ${shots}/r105-${side.toLowerCase()}-postnav-drawerstate.png`);

  // one more wait — Radix unmount after animation
  await new Promise((r) => setTimeout(r, 3000));
  const post2 = run(`agent-browser --session ${session} eval "(() => { const panels=[...document.querySelectorAll('[role=dialog]')].filter(e=>{const r=e.getBoundingClientRect(); return r.width>200 && r.width<350;}); return JSON.stringify({nPanels:panels.length, panels:panels.map(p=>{const r=p.getBoundingClientRect(); return {x:Math.round(r.x), state:p.getAttribute('data-state')};})}); })()"`);
  console.log(`${side} post-nav panels (+7s):`, post2.trim().slice(0, 400));
  run(`agent-browser --session ${session} close`);
}

await forensics("REF", "https://eon.base44.app", "r105foreRef");
await forensics("LOC", "http://127.0.0.1:3000", "r105foreLoc");
