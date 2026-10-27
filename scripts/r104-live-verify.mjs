// r104-live-verify.mjs — the live post-fix verify on :3200: a real
// XeTeX-shaped CV (the Tanmay_CV.pdf bytes — the 12th writer family) through
// the actual UI (tab → job select → upload) → the analysis card → the API
// row → the cleanup. Screenshots for the evidence chain.
import { execSync, spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const repo = "/home/z/my-project/eon-hr";
function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 300); } }

// fresh session at the mobile-emphasis viewport first for the CV flow (desktop for the flow)
run(`agent-browser --session loc104live close 2>/dev/null; true`);
run(`agent-browser --session loc104live set viewport 1440 900`);
run(`agent-browser --session loc104live open http://127.0.0.1:3200/login`);
await new Promise((r) => setTimeout(r, 3000));
run(`agent-browser --session loc104live fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise((r) => setTimeout(r, 600));
run(`agent-browser --session loc104live fill 'input[type=password]' '$Abcd1234'`);
await new Promise((r) => setTimeout(r, 600));
const snap = run(`agent-browser --session loc104live snapshot -i -c`);
const m = snap.match(/- button "Sign in" \[ref=(\w+)\]/);
if (m) run(`agent-browser --session loc104live click @${m[1]}`);
await new Promise((r) => setTimeout(r, 5000));
console.log("url:", run(`agent-browser --session loc104live get url`).trim());

run(`agent-browser --session loc104live open http://127.0.0.1:3200/recruitment`);
await new Promise((r) => setTimeout(r, 3500));
run(`agent-browser --session loc104live eval "(() => { const t=[...document.querySelectorAll('[role=tab]')].find(x=>/AI CV Upload/i.test(x.textContent||'')); if(t) t.click(); return t ? 'tab-ok' : 'NO-TAB'; })()"`);
await new Promise((r) => setTimeout(r, 1200));
run(`agent-browser --session loc104live screenshot ${repo}/docs/screenshots/r104-cv-tab.png`);

// the combobox + the job select (the conditional file-input render — the r102 lesson)
run(`agent-browser --session loc104live eval "(() => { const c=document.querySelector('[role=combobox]'); if(c) c.click(); return c ? 'combo-ok' : 'NO-COMBO'; })()"`);
await new Promise((r) => setTimeout(r, 900));
run(`agent-browser --session loc104live eval "(() => { const o=[...document.querySelectorAll('[role=option]')].find(x=>/System Admin/i.test(x.textContent||'')); if(o) o.click(); return o ? 'job-ok' : 'NO-JOB'; })()"`);
await new Promise((r) => setTimeout(r, 900));

// upload the real XeTeX CV bytes
const pdf = readFileSync("/home/z/my-project/tmp-r104/tanmay-xetex.pdf");
run(`agent-browser --session loc104live upload 'input[type=file]' /home/z/my-project/tmp-r104/tanmay-xetex.pdf`);
await new Promise((r) => setTimeout(r, 6000));
run(`agent-browser --session loc104live screenshot ${repo}/docs/screenshots/r104-analysis-card.png`);
const card = run(`agent-browser --session loc104live eval "(() => { const p=document.querySelector('[role=tabpanel]'); return JSON.stringify({text: (p?.innerText||'').slice(0,400)}); })()"`);
console.log("card:", card.trim().slice(0, 500));

// the API row
const listRaw = run(`curl -s -b /dev/null http://127.0.0.1:3200/api/candidates`);
console.log("(direct curl needs auth — reading through the page session instead)");
const row = run(`agent-browser --session loc104live eval "fetch('/api/candidates').then(r=>r.json()).then(j=>{const c=(j.data?.candidates||[]).find(x=>x.name && /tanmay/i.test(x.name)); return JSON.stringify({name: c?.name, aiScore: c?.aiScore, skillsMatch: c?.skillsMatch, matched: c?.matchedKeywords?.slice(0,20)});})"`);
console.log("api row:", row.trim().slice(0, 400));
run(`agent-browser --session loc104live close`);
