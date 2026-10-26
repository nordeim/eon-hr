#!/usr/bin/env node
// r97-ref-nav-probe.mjs — follow-up: (1) the REF's mobile hamburger at 390
// (read the top bar's buttons by role/icon — the label match failed), (2)
// the /employee/1 route (the redirect target + render state).
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const S = "ref97nav";

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

// (1) the dashboard top bar at 390 — every visible button with its label/attrs
run(`agent-browser --session ${S} open https://eon.base44.app/`);
await new Promise((r) => setTimeout(r, 5000));
const btns = run(`agent-browser --session ${S} eval "(() => { const bs=[...document.querySelectorAll('header button, nav button, [class*=sticky] button, [class*=top] button')].filter(b=>b.offsetParent!==null); return JSON.stringify(bs.slice(0,10).map(b=>({label: b.getAttribute('aria-label')||'', text: (b.textContent||'').trim().slice(0,20), svg: (b.querySelector('svg')?.getAttribute('class')||'').slice(0,40), w: b.offsetWidth}))); })()"`);
console.log("top-bar buttons:", btns.trim().slice(0, 600));

// the header census if that came up empty
if (btns.includes("[]")) {
  const hdr = run(`agent-browser --session ${S} eval "(() => { const h=document.querySelector('header'); return h ? h.outerHTML.slice(0,400) : 'NO HEADER'; })()"`);
  console.log("header HTML head:", hdr.trim().slice(0, 400));
}

// click the first icon button (the hamburger is the leftmost top-bar button)
const clicked = run(`agent-browser --session ${S} eval "(() => { const bs=[...document.querySelectorAll('header button')].filter(b=>b.offsetParent!==null); if(!bs.length) return 'NOBTNS'; bs[0].click(); return 'CLICKED first of ' + bs.length + ' w=' + bs[0].offsetWidth; })()"`);
console.log("click:", clicked.trim().slice(0, 100));
await new Promise((r) => setTimeout(r, 1800));
const drawer = run(`agent-browser --session ${S} eval "(() => { const d=[...document.querySelectorAll('[role=dialog]')].find(e=>e.offsetParent!==null); if(!d) return 'NODIALOG'; const items=[...d.querySelectorAll('a,button')].map(a=>(a.textContent||'').trim()).filter(Boolean); return JSON.stringify({count: items.length, first: items.slice(0,14)}); })()"`);
console.log("drawer:", drawer.trim().slice(0, 400));
run(`agent-browser --session ${S} screenshot /home/z/my-project/eon-hr/docs/screenshots/r97-ref-mobilenav-open2.png`);

// (2) the employee detail route — where does it actually go?
run(`agent-browser --session ${S} open https://eon.base44.app/employees`);
await new Promise((r) => setTimeout(r, 4500));
const emp = run(`agent-browser --session ${S} eval "(() => { const rows=[...document.querySelectorAll('a[href*=employee]')]; return JSON.stringify({path: location.pathname, links: rows.slice(0,3).map(a=>a.getAttribute('href'))}); })()"`);
console.log("employee links:", emp.trim().slice(0, 300));

run(`agent-browser --session ${S} close`);
