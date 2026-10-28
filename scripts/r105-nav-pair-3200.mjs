#!/usr/bin/env node
// r105-nav-pair.mjs — session 105 / parity round 104: the CROSS-SIDE
// mobile-nav pair (the standing emphasis — the user's named focus every
// round). Identical fixed-aware reads on BOTH sides at 390x844:
//   (1) hamburger geometry (28x28 lucide-panel-left "Toggle Sidebar")
//   (2) drawer geometry (288x844 fixed z-50, 16 items)
//   (3) the menu cycle: open → Training LMS → /training + AUTO-CLOSED
//       (the canonical r104 check: [role=dialog] with rect.width>0)
// Includes the VERIFIED-VIEWPORT guard (the r104 fresh-session viewport
// drift trap) on every navigation.
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const shots = "/home/z/my-project/eon-hr/docs/screenshots";

async function navPair(side, base, session) {
  console.log(`\n===== ${side} (${base}) =====`);
  run(`agent-browser --session ${session} close 2>/dev/null; true`);
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise((r) => setTimeout(r, 3500));
  run(`agent-browser --session ${session} set viewport 390 844`);
  await new Promise((r) => setTimeout(r, 800));
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
  // VERIFIED-VIEWPORT guard
  run(`agent-browser --session ${session} set viewport 390 844`);
  await new Promise((r) => setTimeout(r, 1500));
  const vw = run(`agent-browser --session ${session} eval "window.innerWidth + 'x' + window.innerHeight + ' @ ' + location.pathname"`).trim();
  console.log("viewport:", vw);

  // (1) hamburger
  const btn = run(`agent-browser --session ${session} eval "(() => { const b=[...document.querySelectorAll('header button')].find(x=>(x.getAttribute('aria-label')||'').includes('Toggle Sidebar')||(x.textContent||'').includes('Toggle Sidebar')); if(!b) return 'NOBTN'; const r=b.getBoundingClientRect(); return JSON.stringify({w:Math.round(r.width),h:Math.round(r.height),svg:(b.querySelector('svg')?.getAttribute('class')||'').slice(0,40)}); })()"`);
  console.log(`${side} hamburger:`, btn.trim().slice(0, 200));

  // (2) open + drawer read
  run(`agent-browser --session ${session} eval "(() => { const b=[...document.querySelectorAll('header button')].find(x=>(x.getAttribute('aria-label')||'').includes('Toggle Sidebar')||(x.textContent||'').includes('Toggle Sidebar')); if(b) b.click(); })()"`);
  await new Promise((r) => setTimeout(r, 1800));
  const drawer = run(`agent-browser --session ${session} eval "(() => { const cands=[...document.querySelectorAll('[role=dialog], [data-state=open]')]; const d=cands.find(e=>{const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return r.width>200 && r.width<350 && cs.position==='fixed' && r.width>0;}); if(!d) return 'NODRAWER'; const r=d.getBoundingClientRect(); const cs=getComputedStyle(d); const items=[...d.querySelectorAll('a,button')].map(a=>(a.textContent||'').trim()).filter(Boolean); return JSON.stringify({w:Math.round(r.width),h:Math.round(r.height),pos:cs.position,z:cs.zIndex,count:items.length}); })()"`);
  console.log(`${side} drawer:`, drawer.trim().slice(0, 300));
  run(`agent-browser --session ${session} screenshot ${shots}/r105-${side.toLowerCase()}-mobilenav-open.png`);

  // (3) menu cycle (the canonical r104 auto-close check)
  const snap2 = run(`agent-browser --session ${session} snapshot -i -c`);
  const t = snap2.match(/- link "Training LMS" \[ref=(\w+)\]/);
  if (t) {
    run(`agent-browser --session ${session} click @${t[1]}`);
    await new Promise((r) => setTimeout(r, 3000));
    const landed = run(`agent-browser --session ${session} eval "location.pathname"`).trim();
    const closed = run(`agent-browser --session ${session} eval "(() => { const d=[...document.querySelectorAll('[role=dialog]')].find(e=>e.getBoundingClientRect().width>0 && getComputedStyle(e).position==='fixed'); return d ? 'STILL-OPEN' : 'AUTO-CLOSED'; })()"`).trim();
    console.log(`${side} menu cycle:`, landed, "|", closed);
  } else {
    console.log(`${side}: Training LMS link not found in snapshot`);
  }
  run(`agent-browser --session ${session} screenshot ${shots}/r105-${side.toLowerCase()}-training-mobile.png`);
  run(`agent-browser --session ${session} close`);
}

await navPair("REF", "https://eon.base44.app", "r105ref");
await navPair("LOC", "http://127.0.0.1:3200", "r105loc");
