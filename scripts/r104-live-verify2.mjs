#!/usr/bin/env node
// r104-live-verify2.mjs — the live post-fix verify on :3200, round 2: REAL
// clicks (the r100 synthetic-click inertness lesson — a synthetic
// element.click() does not switch the controlled Radix tabs/combobox; the
// snapshot-ref clicks do). A real XeTeX-shaped CV (the Tanmay_CV.pdf bytes
// — the 12th writer family) through the actual UI → the analysis card →
// the API row → the cleanup.
import { execSync } from "node:child_process";

const repo = "/home/z/my-project/eon-hr";
function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 300); } }
const S = "loc104live";

run(`agent-browser --session ${S} close 2>/dev/null; true`);
run(`agent-browser --session ${S} set viewport 1440 900`);
run(`agent-browser --session ${S} open http://127.0.0.1:3200/login`);
await new Promise((r) => setTimeout(r, 3000));
run(`agent-browser --session ${S} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise((r) => setTimeout(r, 600));
run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
await new Promise((r) => setTimeout(r, 600));
let snap = run(`agent-browser --session ${S} snapshot -i -c`);
let m = snap.match(/- button "Sign in" \[ref=(\w+)\]/);
if (m) run(`agent-browser --session ${S} click @${m[1]}`);
await new Promise((r) => setTimeout(r, 5000));
console.log("url:", run(`agent-browser --session ${S} get url`).trim());

run(`agent-browser --session ${S} open http://127.0.0.1:3200/recruitment`);
await new Promise((r) => setTimeout(r, 4000));
// REAL click: the AI CV Upload tab (snapshot-ref)
snap = run(`agent-browser --session ${S} snapshot -i -c`);
m = snap.match(/- tab "AI CV Upload" \[ref=(\w+)\]/);
console.log("tab ref:", m ? m[1] : "NOT-FOUND");
if (m) { run(`agent-browser --session ${S} click @${m[1]}`); await new Promise((r) => setTimeout(r, 1500)); }
run(`agent-browser --session ${S} screenshot ${repo}/docs/screenshots/r104-cv-tab.png`);

// REAL click: the combobox, then the System Admin option (the conditional
// file-input render — the r102 lesson)
snap = run(`agent-browser --session ${S} snapshot -i -c`);
m = snap.match(/- combobox[^[]*\[ref=(\w+)\]/);
console.log("combo ref:", m ? m[1] : "NOT-FOUND");
if (m) {
  run(`agent-browser --session ${S} click @${m[1]}`);
  await new Promise((r) => setTimeout(r, 1000));
  snap = run(`agent-browser --session ${S} snapshot -i -c`);
  const o = snap.match(/- option "System Admin[^"]*" \[ref=(\w+)\]/);
  console.log("option ref:", o ? o[1] : "NOT-FOUND");
  if (o) { run(`agent-browser --session ${S} click @${o[1]}`); await new Promise((r) => setTimeout(r, 1000)); }
}

// the upload (the real XeTeX CV bytes)
const up = run(`agent-browser --session ${S} upload 'input[type=file]' /home/z/my-project/tmp-r104/tanmay-xetex.pdf`);
console.log("upload:", up.trim().slice(0, 120));
await new Promise((r) => setTimeout(r, 7000));
run(`agent-browser --session ${S} screenshot ${repo}/docs/screenshots/r104-analysis-card.png`);
const card = run(`agent-browser --session ${S} eval "(() => { const p=document.querySelector('[role=tabpanel]'); return JSON.stringify({len: (p?.innerText||'').length, text: (p?.innerText||'').slice(0,500)}); })()"`);
console.log("card:", card.trim().slice(0, 700));

// the API row through the page session
const row = run(`agent-browser --session ${S} eval "fetch('/api/candidates').then(r=>r.json()).then(j=>{const c=(j.data?.candidates||[]).find(x=>x.name && /tanmay/i.test(x.name)); return JSON.stringify({count: (j.data?.candidates||[]).length, name: c?.name, aiScore: c?.aiScore, skillsMatch: c?.skillsMatch, matched: c?.matchedKeywords});})"`);
console.log("api row:", row.trim().slice(0, 500));
run(`agent-browser --session ${S} close`);
