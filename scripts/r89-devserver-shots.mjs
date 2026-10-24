#!/usr/bin/env node
// r89-devserver-shots.mjs — the user-requested DEV-SERVER screenshots of
// the remediated codebase (bun run dev on :3000), the numbered chain
// continuation 1403-1413:
//   1403  dev login (logged-out)
//   1405  dev attendancedashboard @390 mobile (the R89-A Export wrap)
//   1407  dev attendancedashboard @1440 (the chart ticks + wrapper)
//   1409  dev hrassistantchat @390 (the R89-D fixed-height grid)
//   1411  dev profile @390 (the R89-E hoisted kicker)
//   1413  dev dashboard @390 mobile dark (the round's band)
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const base = "http://localhost:3000";
const shots = "/home/z/my-project/eon-hr/docs/screenshots";
const S = "r89dev";

run(`agent-browser --session ${S} set viewport 1440 900`);
run(`agent-browser --session ${S} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
run(`agent-browser --session ${S} open ${base}/login`);
await new Promise(r => setTimeout(r, 4500));
run(`agent-browser --session ${S} screenshot ${shots}/1403-dev-login.png`);
console.log("1403 dev login captured");

run(`agent-browser --session ${S} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise(r => setTimeout(r, 500));
run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
await new Promise(r => setTimeout(r, 500));
const snap = run(`agent-browser --session ${S} snapshot -i -c`);
const bref = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
if (bref) run(`agent-browser --session ${S} click @${bref}`);
await new Promise(r => setTimeout(r, 5000));
console.log("dev authed:", run(`agent-browser --session ${S} get url`).trim());

// 1405: attendancedashboard @390 (the R89-A Export wrap + the chart)
run(`agent-browser --session ${S} set viewport 390 844`);
run(`agent-browser --session ${S} open ${base}/attendancedashboard`);
await new Promise(r => setTimeout(r, 5000));
run(`agent-browser --session ${S} screenshot ${shots}/1405-dev-attendancedashboard-exportwrap.png`);
console.log("1405 dev attendancedashboard @390 captured");

// 1407: attendancedashboard @1440 (the chart ticks + wrapper)
run(`agent-browser --session ${S} set viewport 1440 900`);
run(`agent-browser --session ${S} open ${base}/attendancedashboard`);
await new Promise(r => setTimeout(r, 5000));
run(`agent-browser --session ${S} screenshot ${shots}/1407-dev-attendancedashboard-desktop.png`);
console.log("1407 dev attendancedashboard @1440 captured");

// 1409: hrassistantchat @390 (the R89-D grid)
run(`agent-browser --session ${S} set viewport 390 844`);
run(`agent-browser --session ${S} open ${base}/hrassistantchat`);
await new Promise(r => setTimeout(r, 5000));
run(`agent-browser --session ${S} screenshot ${shots}/1409-dev-hrassistantchat-grid.png`);
console.log("1409 dev hrassistantchat @390 captured");

// 1411: profile @390 (the R89-E kicker)
run(`agent-browser --session ${S} open ${base}/profile`);
await new Promise(r => setTimeout(r, 4500));
run(`agent-browser --session ${S} screenshot ${shots}/1411-dev-profile-kicker.png`);
console.log("1411 dev profile @390 captured");

// 1413: dashboard @390 dark (the round's band)
run(`agent-browser --session ${S} eval "localStorage.setItem('darkMode','true')"`);
run(`agent-browser --session ${S} open ${base}/dashboard`);
await new Promise(r => setTimeout(r, 4500));
run(`agent-browser --session ${S} screenshot ${shots}/1413-dev-dashboard-darkmobile.png`);
console.log("1413 dev dashboard dark @390 captured");

run(`agent-browser --session ${S} close`);
console.log("DEV-SERVER SET COMPLETE: 1403-1413");
process.exit(0);
