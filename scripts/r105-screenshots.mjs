#!/usr/bin/env node
// r105-screenshots.mjs — the remediated-build evidence set (the user's
// standing ask: screenshots of the remediated codebase under the dev
// server). Captured on the :3200 standalone (the remediated build — the
// same artifact E2E drives) at desktop 1440x900: the login, the dashboard,
// the employees, and the recruitment AI tab interior (the CV-flow surface
// this round's fixes live behind).
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const shots = "/home/z/my-project/eon-hr/docs/screenshots";
const S = "r105shots";

run(`agent-browser --session ${S} close 2>/dev/null; true`);
run(`agent-browser --session ${S} set viewport 1440 900`);
run(`agent-browser --session ${S} open http://127.0.0.1:3200/login`);
await new Promise((r) => setTimeout(r, 3500));
run(`agent-browser --session ${S} set viewport 1440 900`);
await new Promise((r) => setTimeout(r, 800));
run(`agent-browser --session ${S} screenshot ${shots}/r105-loc3200-login-desktop.png`);

run(`agent-browser --session ${S} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise((r) => setTimeout(r, 600));
run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
await new Promise((r) => setTimeout(r, 600));
const snap = run(`agent-browser --session ${S} snapshot -i -c`);
const m = snap.match(/- button "[^"]*[Ss]ign in[^"]*" \[ref=(\w+)\]/);
if (m) run(`agent-browser --session ${S} click @${m[1]}`);
await new Promise((r) => setTimeout(r, 6500));

run(`agent-browser --session ${S} open http://127.0.0.1:3200/dashboard`);
await new Promise((r) => setTimeout(r, 5000));
run(`agent-browser --session ${S} screenshot ${shots}/r105-loc3200-dashboard-desktop.png`);

run(`agent-browser --session ${S} open http://127.0.0.1:3200/employees`);
await new Promise((r) => setTimeout(r, 4500));
run(`agent-browser --session ${S} screenshot ${shots}/r105-loc3200-employees-desktop.png`);

run(`agent-browser --session ${S} open http://127.0.0.1:3200/recruitment`);
await new Promise((r) => setTimeout(r, 4500));
run(`agent-browser --session ${S} screenshot ${shots}/r105-loc3200-recruitment-desktop.png`);

// the CV-flow surface (this round's fixes live behind the AI CV Upload tab)
const tab = run(`agent-browser --session ${S} eval "(() => { const t=[...document.querySelectorAll('[role=tab], button')].find(b=>/AI CV Upload/i.test(b.textContent||'')); if(!t) return 'NOTAB'; t.click(); return 'CLICKED'; })()"`).trim();
console.log("AI CV tab:", tab);
await new Promise((r) => setTimeout(r, 2500));
run(`agent-browser --session ${S} screenshot ${shots}/r105-loc3200-recruitment-cvtab.png`);

console.log("screenshots captured");
run(`agent-browser --session ${S} close`);
