#!/usr/bin/env node
// r97-analysis-card.mjs — MINIMAL single-session flow: the real TJ-pdf
// upload → the analysis card screenshot (the R97-A fix's live evidence).
// Generous settles; one session; simple selectors; no snapshot loops.
import { execSync } from "node:child_process";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 160); } }
const S = "r97card";
const shots = "/home/z/my-project/eon-hr/docs/screenshots";

run(`agent-browser --session ${S} close 2>/dev/null; true`);
run(`agent-browser --session ${S} set viewport 1440 900`);

// auth
run(`agent-browser --session ${S} open http://127.0.0.1:3200/login`);
await new Promise((r) => setTimeout(r, 4000));
run(`agent-browser --session ${S} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise((r) => setTimeout(r, 700));
run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
await new Promise((r) => setTimeout(r, 700));
run(`agent-browser --session ${S} click 'button[type=submit]'`);
await new Promise((r) => setTimeout(r, 6000));
const path1 = run(`agent-browser --session ${S} eval "location.pathname"`).trim();
console.log("post-login:", path1);
if (path1.includes("login")) { console.log("AUTH FAILED — aborting"); process.exit(1); }

// the recruitment page
run(`agent-browser --session ${S} open http://127.0.0.1:3200/recruitment`);
await new Promise((r) => setTimeout(r, 6000));

// the AI CV Upload tab — click by text via the accessible role
run(`agent-browser --session ${S} click '[role=tab] >> text=AI CV Upload'`);
await new Promise((r) => setTimeout(r, 2500));
// (the first-click absorption guard: verify + re-click)
const selNow = run(`agent-browser --session ${S} eval "(() => { const t=[...document.querySelectorAll('[role=tab]')].find(t=>/AI CV Upload/i.test(t.textContent||'')); return t?t.getAttribute('aria-selected'):'notab'; })()"`).trim();
if (selNow !== '"true"') {
  run(`agent-browser --session ${S} click '[role=tab] >> text=AI CV Upload'`);
  await new Promise((r) => setTimeout(r, 2000));
}
const panelText = run(`agent-browser --session ${S} eval "(() => { const p=[...document.querySelectorAll('[role=tabpanel]')].find(p=>p.getBoundingClientRect().width>100); return (p?p.innerText:'NOPANEL').slice(0,90); })()"`).trim();
console.log("panel:", panelText.slice(0, 120));
run(`agent-browser --session ${S} screenshot ${shots}/r97-loc-cvtab-rest.png`);

// the job combobox (the visible panel's trigger with the placeholder text)
run(`agent-browser --session ${S} click 'button[role=combobox] >> text=Choose a job posting'`);
await new Promise((r) => setTimeout(r, 2000));
// the option — page-level (the Radix portal)
run(`agent-browser --session ${S} click '[role=option] >> text=System Admin'`);
await new Promise((r) => setTimeout(r, 2000));
const active = run(`agent-browser --session ${S} eval "(() => { const p=[...document.querySelectorAll('[role=tabpanel]')].find(p=>p.getBoundingClientRect().width>100); return JSON.stringify({active: (p.innerText||'').includes('Upload Candidate CV'), hasInput: !!p.querySelector('input[type=file]')}); })()"`).trim();
console.log("active:", active.slice(0, 120));
run(`agent-browser --session ${S} screenshot ${shots}/r97-loc-cvtab-active.png`);

// the real TJ pdf upload
const up = run(`agent-browser --session ${S} upload 'input[type=file]' /tmp/r97-real-cv.pdf`);
console.log("upload:", up.trim().slice(0, 60));
await new Promise((r) => setTimeout(r, 6000));
const card = run(`agent-browser --session ${S} eval "(() => { const p=[...document.querySelectorAll('[role=tabpanel]')].find(p=>p.getBoundingClientRect().width>100); const t=(p.innerText||''); return JSON.stringify({hasName: t.includes('real cv'), hasScore: /AI Score/i.test(t), tail: t.slice(-160)}); })()"`).trim();
console.log("card:", card.slice(0, 300));
run(`agent-browser --session ${S} screenshot ${shots}/r97-loc-cv-analysis.png`);

// cleanup + close
run(`agent-browser --session ${S} eval "fetch('/api/candidates').then(r=>r.json()).then(async j=>{ for(const c of (j.data?.candidates||[])) { if(/real cv/i.test(c.name||'')) await fetch('/api/candidates?id='+c.id,{method:'DELETE'}); } return 'swept'; })()"`);
await new Promise((r) => setTimeout(r, 2500));
run(`agent-browser --session ${S} close`);
console.log("done");
