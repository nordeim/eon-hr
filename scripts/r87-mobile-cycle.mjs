#!/usr/bin/env node
// r87-mobile-cycle.mjs — session-87: the standing mobile-menu functional
// cycle on the remediated build (the user's standing emphasis — open the
// drawer → click Training LMS → verify the /training navigation → verify
// the auto-close; no TW-v4 regression under the round's tab-interior
// rebuild).
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const base = "http://127.0.0.1:3200";
const S = "loc87m";
run(`agent-browser --session ${S} set viewport 390 844`);
run(`agent-browser --session ${S} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
run(`agent-browser --session ${S} open ${base}/login`);
await new Promise(r => setTimeout(r, 2500));
run(`agent-browser --session ${S} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise(r => setTimeout(r, 400));
run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
await new Promise(r => setTimeout(r, 400));
run(`agent-browser --session ${S} click 'button[type=submit]'`);
await new Promise(r => setTimeout(r, 4200));
console.log("authed:", run(`agent-browser --session ${S} get url`).trim());

// open the drawer (the snapshot-ref click — the Toggle Sidebar button)
run(`agent-browser --session ${S} open ${base}/dashboard`);
await new Promise(r => setTimeout(r, 3000));
run(`agent-browser --session ${S} set viewport 390 844`);
await new Promise(r => setTimeout(r, 800));
const snap = run(`agent-browser --session ${S} snapshot -i -c`);
const line = (snap.split("\n").find(l => l.includes("Toggle Sidebar")) || "");
const ref = (line.match(/ref=(\w+)/) || [])[1];
if (ref) run(`agent-browser --session ${S} click @${ref}`);
await new Promise(r => setTimeout(r, 1200));

const drawerState = run(`agent-browser --session ${S} eval "(() => { const d = document.querySelector('[role=dialog]'); return { open: !!d, links: d ? [...d.querySelectorAll('a')].slice(0,4).map(a => a.textContent.trim()) : [] }; })()"`).trim();
console.log("drawer open + first links:", drawerState.slice(0, 220));

const trainingNav = run(`agent-browser --session ${S} eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", trainingNav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
console.log("after click url:", run(`agent-browser --session ${S} get url`).trim());
const closedAfterNav = run(`agent-browser --session ${S} eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim();
console.log("drawer auto-closed:", closedAfterNav.slice(0, 100));
run(`agent-browser --session ${S} close 2>/dev/null; true`);
process.exit(0);
