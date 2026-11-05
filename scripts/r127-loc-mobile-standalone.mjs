#!/usr/bin/env node
// r127-loc-mobile-standalone.mjs — the mobile-nav pair as a standalone
// session (the documented trap: the mobile a11y tree needs the viewport
// at the SESSION START — a mid-session 1280→390 switch leaves the stale
// tree). Captures the drawer-open frame + the training cycle, and
// measures the drawer state + the URL after the navigation.
import { execSync } from "node:child_process";

const base = "http://127.0.0.1:3200";
const out = "/home/z/my-project/eon-hr/docs/screenshots";
function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 300); } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const s = "loc127mob";
run(`agent-browser --session ${s} close 2>/dev/null; true`);
run(`agent-browser --session ${s} set viewport 390 844`);
run(`agent-browser --session ${s} open ${base}/login`);
await sleep(3000);
run(`agent-browser --session ${s} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await sleep(600);
run(`agent-browser --session ${s} fill 'input[type=password]' '$Abcd1234'`);
await sleep(600);
const snap = run(`agent-browser --session ${s} snapshot -i -c`);
const m = snap.match(/- button "[^"]*[Ss]ign in[^"]*" \[ref=(\w+)\]/);
if (m) run(`agent-browser --session ${s} click @${m[1]}`);
await sleep(6000);
run(`agent-browser --session ${s} set viewport 390 844`);
await sleep(1500);

// the drawer open
const s1 = run(`agent-browser --session ${s} snapshot -i -c`);
const ham = s1.match(/- button "Toggle Sidebar" \[[^\]]*ref=(\w+)\]/) || s1.match(/- button "[^"]*menu[^"]*" \[[^\]]*ref=(\w+)\]/i);
if (!ham) { console.log("HAMBURGER NOT FOUND — snapshot head:", s1.slice(0, 400)); process.exit(1); }
run(`agent-browser --session ${s} click @${ham[1]}`);
await sleep(1800);
run(`agent-browser --session ${s} screenshot ${out}/r127-loc-mobilenav-open.png`);
console.log("mobile drawer-open captured");

// the training cycle — the tolerant ref pattern (the attribute-carrying nodes)
const s2 = run(`agent-browser --session ${s} snapshot -i -c`);
const tr = s2.match(/- link "Training LMS" \[[^\]]*ref=(\w+)\]/) || s2.match(/- link "Training[^"]*" \[[^\]]*ref=(\w+)\]/) || s2.match(/- link "[^"]*Training[^"]*" \[[^\]]*ref=(\w+)\]/);
if (!tr) { console.log("TRAINING LINK NOT MATCHED — drawer snapshot excerpt:", s2.slice(0, 900)); }
else {
  run(`agent-browser --session ${s} click @${tr[1]}`);
  await sleep(3500);
  run(`agent-browser --session ${s} screenshot ${out}/r127-loc-training-mobile.png`);
  console.log("training cycle captured");
}
const drawerState = run(`agent-browser --session ${s} eval "(function(){const cand=[...document.querySelectorAll('div')].filter(d=>{const cs=getComputedStyle(d);if(cs.display==='none'||cs.visibility==='hidden')return false;const r=d.getBoundingClientRect();return cs.position==='fixed'&&r.width>=250&&r.width<=320&&r.left<50&&r.height>400});if(!cand.length)return 'DRAWER UNMOUNTED (auto-closed)';const d=cand[0];const cs=getComputedStyle(d);return JSON.stringify({w:cs.width,left:Math.round(d.getBoundingClientRect().left),z:cs.zIndex,opacity:cs.opacity,transform:cs.transform})})()"`);
console.log("clone post-training drawer:", drawerState.trim().slice(0, 200));
const url = run(`agent-browser --session ${s} eval "location.pathname"`);
console.log("clone post-training url:", url.trim());
run(`agent-browser --session ${s} close 2>/dev/null; true`);
console.log("done");
