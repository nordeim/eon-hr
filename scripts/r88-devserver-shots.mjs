#!/usr/bin/env node
// r88-devserver-shots.mjs — the user-requested DEV-SERVER screenshots of
// the remediated codebase (bun run dev on :3000), saved under
// docs/screenshots/ as the numbered chain continuation 1347-1357.
//   1347  dev login (logged-out surface)
//   1349  dev dashboard @1440
//   1351  dev shiftswap @1440 (the R88-J tiles)
//   1353  dev chat @1440 (the R88-G always-visible list)
//   1355  dev attendancedashboard @1440 (the R88-E month filter)
//   1357  dev dashboard @390 mobile (the mobile chrome)
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const base = "http://localhost:3000";
const shots = "/home/z/my-project/eon-hr/docs/screenshots";
const S = "r88dev";

run(`agent-browser --session ${S} set viewport 1440 900`);
run(`agent-browser --session ${S} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
run(`agent-browser --session ${S} open ${base}/login`);
await new Promise(r => setTimeout(r, 4500));
run(`agent-browser --session ${S} screenshot ${shots}/1347-dev-login.png`);
console.log("1347 dev login captured");

run(`agent-browser --session ${S} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise(r => setTimeout(r, 500));
run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
await new Promise(r => setTimeout(r, 500));
const snap = run(`agent-browser --session ${S} snapshot -i -c`);
const bref = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
if (bref) run(`agent-browser --session ${S} click @${bref}`);
await new Promise(r => setTimeout(r, 5000));
console.log("dev authed:", run(`agent-browser --session ${S} get url`).trim());

const shots1440 = [
  ["1349-dev-dashboard", "/dashboard"],
  ["1351-dev-shiftswap-tiles", "/shiftswap"],
  ["1353-dev-chat-twopane", "/chat"],
  ["1355-dev-attendancedashboard-monthfilter", "/attendancedashboard"],
];
for (const [name, route] of shots1440) {
  run(`agent-browser --session ${S} set viewport 1440 900`);
  run(`agent-browser --session ${S} open ${base}${route}`);
  await new Promise(r => setTimeout(r, 4500));
  run(`agent-browser --session ${S} screenshot ${shots}/${name}.png`);
  console.log(`${name} captured`);
}

run(`agent-browser --session ${S} set viewport 390 844`);
run(`agent-browser --session ${S} open ${base}/dashboard`);
await new Promise(r => setTimeout(r, 4500));
run(`agent-browser --session ${S} screenshot ${shots}/1357-dev-dashboard-mobile.png`);
console.log("1357 dev mobile dashboard captured");
run(`agent-browser --session ${S} close`);
process.exit(0);
