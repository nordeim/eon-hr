#!/usr/bin/env node
// r107-spine-measure.mjs — measure the drawer-open interior spine boxes at
// TRUE 390x844 on the LOC build (the s196 doctrine's geometry ledger — the
// input for the born-green e2e spine pin). Reads the same boxes the neo-crm
// walk50 ledger pinned: the sheet, the header, the first heading, the nav,
// the footer, the Close button.
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const S = "loc107spine";
const base = "http://127.0.0.1:3200";

run(`agent-browser --session ${S} close 2>/dev/null; true`);
run(`agent-browser --session ${S} set viewport 390 844`);
run(`agent-browser --session ${S} open ${base}/login`);
await new Promise((r) => setTimeout(r, 3000));
run(`agent-browser --session ${S} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise((r) => setTimeout(r, 500));
run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
await new Promise((r) => setTimeout(r, 500));
const snap = run(`agent-browser --session ${S} snapshot -i -c`);
const m = snap.match(/- button "[^"]*[Ss]ign in[^"]*" \[ref=(\w+)\]/);
if (m) run(`agent-browser --session ${S} click @${m[1]}`);
await new Promise((r) => setTimeout(r, 5000));
run(`agent-browser --session ${S} set viewport 390 844`);
run(`agent-browser --session ${S} open ${base}/dashboard`);
await new Promise((r) => setTimeout(r, 3500));
run(`agent-browser --session ${S} set viewport 390 844`);
await new Promise((r) => setTimeout(r, 1000));
// open the drawer
run(`agent-browser --session ${S} eval "(() => { const b=[...document.querySelectorAll('header button')].find(x=>(x.getAttribute('aria-label')||'').includes('Toggle Sidebar')); if(b) b.click(); })()"`);
await new Promise((r) => setTimeout(r, 1500));

const read = `(() => {
  const cands=[...document.querySelectorAll('[role=dialog], [data-state=open]')];
  const d=cands.find(e=>{const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return r.width>200 && r.width<350 && cs.position==='fixed';});
  if(!d) return 'NODRAWER';
  const box=(el)=>{const r=el.getBoundingClientRect(); return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)].join(',');};
  const out={sheet:box(d)};
  const header=d.querySelector('header') || [...d.children].find(c=>/logo|brand|Eon/i.test(c.textContent||''));
  if (header) out.header=box(header), out.headerTag=header.tagName;
  const h2=d.querySelector('h2');
  if (h2) out.h2=box(h2), out.h2text=(h2.textContent||'').trim().slice(0,30);
  const nav=d.querySelector('nav') || d.querySelector('[role=navigation]');
  if (nav) out.nav=box(nav);
  const links=nav?[...nav.querySelectorAll('a')]:[];
  if (links.length) { out.firstLink=box(links[0]); out.linkCount=links.length; }
  const foot=d.querySelector('footer') || [...d.children].find(c=>c.tagName==='FOOTER');
  if (foot) out.footer=box(foot);
  const sr=d.querySelector('[data-slot=sidebar-group-content]') || d.querySelector('[data-slot=sidebar-content]');
  if (sr) out.scroll=box(sr);
  return JSON.stringify(out);
})()`;
const out = run(`agent-browser --session ${S} eval ${JSON.stringify(read.split("\n").join(" "))}`);
console.log("spine:", out.trim());
run(`agent-browser --session ${S} close 2>/dev/null; true`);
process.exit(0);
