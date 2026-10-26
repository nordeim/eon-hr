#!/usr/bin/env node
// r98-analysis-card.mjs — MINIMAL single-session flow: the real
// multi-stream + octal-escape PDF upload → the analysis card screenshot
// (the R98-A/B fixes' live evidence). Snapshot-ref clicks (the §109
// reliable path — the `>> text=` chaining is NOT agent-browser syntax).
import { execSync } from "node:child_process";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 160); } }
const S = "r98card";
const shots = "/home/z/my-project/eon-hr/docs/screenshots";

run(`agent-browser --session ${S} close 2>/dev/null; true`);
run(`agent-browser --session ${S} set viewport 1440 900`);

// auth (fill + single-quoted words — the $-password trap cure)
run(`agent-browser --session ${S} open http://127.0.0.1:3200/login`);
await new Promise((r) => setTimeout(r, 4000));
run(`agent-browser --session ${S} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise((r) => setTimeout(r, 700));
run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
await new Promise((r) => setTimeout(r, 700));
const snap0 = run(`agent-browser --session ${S} snapshot -i -c`);
const m0 = snap0.match(/- button "Sign in" \[ref=(\w+)\]/);
if (m0) run(`agent-browser --session ${S} click @${m0[1]}`);
await new Promise((r) => setTimeout(r, 6000));
const path1 = run(`agent-browser --session ${S} eval "location.pathname"`).trim();
console.log("post-login:", path1);
if (path1.includes("login")) { console.log("AUTH FAILED — aborting"); process.exit(1); }

// the recruitment page
run(`agent-browser --session ${S} open http://127.0.0.1:3200/recruitment`);
await new Promise((r) => setTimeout(r, 6000));

// the AI CV Upload tab — snapshot-ref click (the reliable path)
let snap = run(`agent-browser --session ${S} snapshot -i -c`);
let mt = snap.match(/- tab "AI CV Upload" \[ref=(\w+)\]/);
if (!mt) mt = snap.match(/- tab "[^"]*AI CV[^"]*" \[ref=(\w+)\]/);
if (mt) run(`agent-browser --session ${S} click @${mt[1]}`);
await new Promise((r) => setTimeout(r, 2500));
// the first-click absorption guard: verify the selected state + re-click
const selNow = run(`agent-browser --session ${S} eval "(() => { const t=[...document.querySelectorAll('[role=tab]')].find(t=>/AI CV Upload/i.test(t.textContent||'')); return t?t.getAttribute('aria-selected'):'notab'; })()"`).trim();
if (selNow !== '"true"') {
  snap = run(`agent-browser --session ${S} snapshot -i -c`);
  mt = snap.match(/- tab "AI CV Upload" \[ref=(\w+)\]/);
  if (mt) run(`agent-browser --session ${S} click @${mt[1]}`);
  await new Promise((r) => setTimeout(r, 2000));
}
const panelText = run(`agent-browser --session ${S} eval "(() => { const p=[...document.querySelectorAll('[role=tabpanel]')].find(p=>p.getBoundingClientRect().width>100); return (p?p.innerText:'NOPANEL').slice(0,90); })()"`).trim();
console.log("panel:", panelText.slice(0, 120));
run(`agent-browser --session ${S} screenshot ${shots}/r98-loc-cvtab-rest.png`);

// the job combobox — snapshot-ref click on the visible panel's trigger
snap = run(`agent-browser --session ${S} snapshot -i -c`);
let mc = snap.match(/- combobox "[^"]*" \[ref=(\w+)\]/);
if (!mc) {
  // the placeholder-bearing trigger
  const trig = run(`agent-browser --session ${S} eval "(() => { const b=[...document.querySelectorAll('[role=tabpanel] button[role=combobox]')].find(x=>(x.textContent||'').includes('Choose a job posting')); if(b){ b.click(); return 'CLICKED'; } return 'NOTRIGGER'; })()"`).trim();
  console.log("combo fallback:", trig.slice(0, 60));
} else {
  run(`agent-browser --session ${S} click @${mc[1]}`);
}
await new Promise((r) => setTimeout(r, 2000));
// the option — page-level (the Radix portal) — snapshot-ref
snap = run(`agent-browser --session ${S} snapshot -i -c`);
const mo = snap.match(/- option "System Admin[^\"]*" \[ref=(\w+)\]/);
if (mo) run(`agent-browser --session ${S} click @${mo[1]}`);
else {
  const opt = run(`agent-browser --session ${S} eval "(() => { const o=[...document.querySelectorAll('[role=option]')].find(x=>(x.textContent||'').includes('System Admin')); if(o){ o.click(); return 'CLICKED'; } return 'NOOPT'; })()"`).trim();
  console.log("option fallback:", opt.slice(0, 60));
}
await new Promise((r) => setTimeout(r, 2000));
const active = run(`agent-browser --session ${S} eval "(() => { const p=[...document.querySelectorAll('[role=tabpanel]')].find(p=>p.getBoundingClientRect().width>100); return JSON.stringify({active: (p.innerText||'').includes('Upload Candidate CV'), hasInput: !!p.querySelector('input[type=file]')}); })()"`).trim();
console.log("active:", active.slice(0, 120));
run(`agent-browser --session ${S} screenshot ${shots}/r98-loc-cvtab-active.png`);

// the real multi-stream pdf upload
const up = run(`agent-browser --session ${S} upload 'input[type=file]' /tmp/r98-real-cv.pdf`);
console.log("upload:", up.trim().slice(0, 60));
await new Promise((r) => setTimeout(r, 7000));
const card = run(`agent-browser --session ${S} eval "(() => { const p=[...document.querySelectorAll('[role=tabpanel]')].find(p=>p.getBoundingClientRect().width>100); const t=(p.innerText||''); return JSON.stringify({hasName: t.includes('r98 real cv'), hasScore: /AI Score/i.test(t), hasSkills: /Skills match/i.test(t), tail: t.slice(-160)}); })()"`).trim();
console.log("card:", card.slice(0, 340));
run(`agent-browser --session ${S} screenshot ${shots}/r98-loc-cv-analysis.png`);

// the API row + the cleanup (DB pristine at close)
const apiGet = run(`agent-browser --session ${S} eval "fetch('/api/candidates').then(r=>r.json()).then(j=>{ const c=(j.data?.candidates||[]).filter(x=>x.name==='r98 real cv'); return JSON.stringify({count: c.length, id: c[0]?.id ?? null, score: c[0]?.aiScore ?? null}); })"`);
console.log("api row:", apiGet.trim().slice(0, 160));
const row = (() => { try { return JSON.parse(apiGet.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"')); } catch { return null; } })();
if (row?.id) {
  const del = run(`agent-browser --session ${S} eval "fetch('/api/candidates?id=${row.id}', {method:'DELETE'}).then(r=>r.status)"`);
  console.log("cleanup DELETE:", del.trim().slice(0, 40));
}
run(`agent-browser --session ${S} close`);
