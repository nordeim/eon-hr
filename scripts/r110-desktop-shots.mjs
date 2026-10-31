import { execSync } from "node:child_process";
function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const shots = "/home/z/my-project/eon-hr/docs/screenshots";
const base = "http://127.0.0.1:3200";
const session = "loc110desk";
run(`agent-browser --session ${session} close 2>/dev/null; true`);
run(`agent-browser --session ${session} set viewport 1440 900`);
run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false')"`);
run(`agent-browser --session ${session} open ${base}/login`);
await new Promise((r) => setTimeout(r, 3500));
run(`agent-browser --session ${session} set viewport 1440 900`);
run(`agent-browser --session ${session} screenshot ${shots}/r110-loc3200-login-desktop.png`);
run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise((r) => setTimeout(r, 600));
run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
await new Promise((r) => setTimeout(r, 600));
const snap = run(`agent-browser --session ${session} snapshot -i -c`);
const m = snap.match(/- button "[^"]*[Ss]ign in[^"]*" \[ref=(\w+)\]/);
if (m) run(`agent-browser --session ${session} click @${m[1]}`);
await new Promise((r) => setTimeout(r, 6500));
for (const [name, path] of [["dashboard", "/dashboard"], ["employees", "/employees"], ["recruitment", "/recruitment"], ["recruitment-cvtab", "/recruitment?tab=cv"], ["loans", "/loans"]]) {
  run(`agent-browser --session ${session} open ${base}${path}`);
  await new Promise((r) => setTimeout(r, 4500));
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} screenshot ${shots}/r110-loc3200-${name}-desktop.png`);
  console.log(`captured ${name}`);
}
run(`agent-browser --session ${session} close 2>/dev/null; true`);
process.exit(0);
