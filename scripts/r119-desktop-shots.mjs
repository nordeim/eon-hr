// r119-desktop-shots.mjs — session 118 / parity round 117: the desktop
// screenshot set at the R118-A build (the login, dashboard, employees,
// recruitment, the CV tab — captured with a REAL tab click per the r116
// lesson, loans). Mirrors the r116 evidence chain.
import { execSync } from "node:child_process";
function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const shots = "/home/z/my-project/eon-hr/docs/screenshots";
const base = "http://127.0.0.1:3200";
const session = "loc119desk";
run(`agent-browser --session ${session} close 2>/dev/null; true`);
run(`agent-browser --session ${session} set viewport 1440 900`);
run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false')"`);
run(`agent-browser --session ${session} open ${base}/login`);
await new Promise((r) => setTimeout(r, 3500));
run(`agent-browser --session ${session} set viewport 1440 900`);
run(`agent-browser --session ${session} screenshot ${shots}/r119-loc3200-login-desktop.png`);
run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise((r) => setTimeout(r, 600));
run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
await new Promise((r) => setTimeout(r, 600));
const snap = run(`agent-browser --session ${session} snapshot -i -c`);
const m = snap.match(/- button "[^"]*[Ss]ign in[^"]*" \[ref=(\w+)\]/);
if (m) run(`agent-browser --session ${session} click @${m[1]}`);
await new Promise((r) => setTimeout(r, 6500));
for (const [name, path] of [["dashboard", "/dashboard"], ["employees", "/employees"], ["recruitment", "/recruitment"], ["loans", "/loans"]]) {
  run(`agent-browser --session ${session} open ${base}${path}`);
  await new Promise((r) => setTimeout(r, 4500));
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} screenshot ${shots}/r119-loc3200-${name}-desktop.png`);
  console.log(`captured ${name}`);
}
// the CV tab with a REAL tab click (the r116 lesson: the ?tab=cv param form proved byte-identical to the plain capture)
{
  run(`agent-browser --session ${session} open ${base}/recruitment`);
  await new Promise((r) => setTimeout(r, 4500));
  const s1 = run(`agent-browser --session ${session} snapshot -i -c`);
  const tab = s1.match(/- tab "AI CV Upload" \[ref=(\w+)\]/);
  if (tab) run(`agent-browser --session ${session} click @${tab[1]}`);
  await new Promise((r) => setTimeout(r, 2000));
  run(`agent-browser --session ${session} screenshot ${shots}/r119-loc3200-recruitment-cvtab-desktop.png`);
  console.log("captured recruitment-cvtab (real tab click)");
}
run(`agent-browser --session ${session} close 2>/dev/null; true`);
process.exit(0);
