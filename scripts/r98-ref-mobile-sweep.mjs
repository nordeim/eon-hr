#!/usr/bin/env node
// r98-ref-mobile-sweep.mjs — the REF-side frontier: (1) auth into the REF
// (single-quote password — the $-expansion trap), (2) the mobile-render
// sweep of the documented REF-broken set at 390x844 (hrreports,
// interviewassistant, employeeselfservice, employeedetail — any route that
// STARTED rendering becomes a parity target), (3) the mobile-nav open/read
// (the standing emphasis), (4) the recruitment route's mobile render (the
// r96 retirement re-check). Batched into ONE session per the
// thread-exhaustion lesson.
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const S = "ref98mob";

run(`agent-browser --session ${S} close 2>/dev/null; true`);
run(`agent-browser --session ${S} set viewport 390 844`);

// (1) auth — the auth-r22 pattern: single-quoted fills + snapshot-ref click
run(`agent-browser --session ${S} open https://eon.base44.app/login`);
await new Promise((r) => setTimeout(r, 3000));
run(`agent-browser --session ${S} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise((r) => setTimeout(r, 500));
run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
await new Promise((r) => setTimeout(r, 500));
// the flake guard: the password field must hold 9 chars
const plen = run(`agent-browser --session ${S} eval "document.querySelector('input[type=password]').value.length"`).trim().replace(/^"|"$/g, "");
if (plen !== "9") {
  console.log(`password fill came up ${plen} chars — refilling`);
  run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise((r) => setTimeout(r, 500));
}
const snap = run(`agent-browser --session ${S} snapshot -i -c`);
const m = snap.match(/- button "[^"]*[Ss]ign in[^"]*" \[ref=(\w+)\]/);
if (m) run(`agent-browser --session ${S} click @${m[1]}`);
else console.log("NO SIGN-IN REF — snapshot head:", snap.slice(0, 200));
await new Promise((r) => setTimeout(r, 6000));

// where did we land?
const landed = run(`agent-browser --session ${S} eval "location.pathname + ' | ' + (document.querySelector('h1,h2')?.textContent||'').trim().slice(0,50)"`);
console.log("post-login:", landed.trim().slice(0, 200));

// (2) the broken-set mobile sweep — read #root child count + a text probe
const ROUTES = ["/hrreports", "/interviewassistant", "/employeeselfservice", "/employee/1", "/recruitment"];
for (const r of ROUTES) {
  run(`agent-browser --session ${S} open https://eon.base44.app${r}`);
  await new Promise((res) => setTimeout(res, 4500));
  const probe = run(`agent-browser --session ${S} eval "(() => { const root=document.getElementById('root'); const body=document.body.innerText||''; return JSON.stringify({rootChildren: root?root.children.length:-1, hasH1: !!document.querySelector('h1,h2'), textLen: body.trim().length, sample: body.trim().slice(0,60), scrollW: document.documentElement.scrollWidth}); })()"`);
  let j = {};
  try { j = JSON.parse(probe.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"')); } catch { j = { raw: probe.slice(0, 150) }; }
  console.log(`${r.padEnd(24)} rootChildren=${j.rootChildren} hasH1=${j.hasH1} textLen=${j.textLen} scrollW=${j.scrollW} :: ${String(j.sample||'').slice(0,50)}`);
}

// (3) the mobile-nav open/read on /dashboard
run(`agent-browser --session ${S} open https://eon.base44.app/dashboard`);
await new Promise((res) => setTimeout(res, 4500));
const menuBtn = run(`agent-browser --session ${S} eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>/menu|toggle sidebar/i.test(x.getAttribute('aria-label')||'')); if(!b) return 'NOBTN'; b.click(); return 'CLICKED:'+(b.getAttribute('aria-label')||''); })()"`);
console.log("mobile menu:", menuBtn.trim().slice(0, 100));
await new Promise((res) => setTimeout(res, 1500));
const drawer = run(`agent-browser --session ${S} eval "(() => { const d=[...document.querySelectorAll('[role=dialog], .fixed.inset-y-0')].find(e=>e.offsetParent!==null); if(!d) return 'NODRAWER'; const links=[...d.querySelectorAll('a,button')].map(a=>(a.textContent||'').trim()).filter(Boolean); return JSON.stringify({count: links.length, items: links.slice(0,16)}); })()"`);
console.log("drawer:", drawer.trim().slice(0, 400));
const shot = run(`agent-browser --session ${S} screenshot /home/z/my-project/eon-hr/docs/screenshots/r97-ref-mobilenav-open.png`);
console.log(shot.trim().slice(0, 60));

run(`agent-browser --session ${S} close`);
