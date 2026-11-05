#!/usr/bin/env node
// r126-loc-captures.mjs — session 124 / parity round 123: the clone-side
// standing-parity captures at :3200 (the logged-out login pair, the
// dashboard pair with the settle-wait for the REF-mirrored card
// animations, and the mobile-nav pair — the user's named focus). The REF
// pair came in through the AUDIT-A subagent (byte-identical to the r123
// REF captures — the 88th deploy render-stable); this script takes the
// matching clone frames for the pixel diff. Usage: node scripts/r126-loc-captures.mjs
import { execSync } from "node:child_process";

const base = "http://127.0.0.1:3200";
const out = "/home/z/my-project/eon-hr/docs/screenshots";
function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 300); } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const s = "loc126cap";
run(`agent-browser --session ${s} close 2>/dev/null; true`);

// --- 1. the logged-out login pair (1280x800, LIGHT) ---
run(`agent-browser --session ${s} set viewport 1280 800`);
run(`agent-browser --session ${s} open ${base}/login`);
await sleep(4000);
run(`agent-browser --session ${s} set viewport 1280 800`);
run(`agent-browser --session ${s} screenshot ${out}/r126-loc-login.png`);
console.log("login captured");

// --- 2. the dashboard pair (settle-wait — the cards animate in) ---
run(`agent-browser --session ${s} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await sleep(600);
run(`agent-browser --session ${s} fill 'input[type=password]' '$Abcd1234'`);
await sleep(600);
const snap = run(`agent-browser --session ${s} snapshot -i -c`);
const m = snap.match(/- button "[^"]*[Ss]ign in[^"]*" \[ref=(\w+)\]/);
if (m) run(`agent-browser --session ${s} click @${m[1]}`);
await sleep(6000);
run(`agent-browser --session ${s} set viewport 1280 800`);
await sleep(2000);
run(`agent-browser --session ${s} screenshot ${out}/r126-loc-dashboard.png`);
console.log("dashboard captured");

// --- 3. the mobile-nav pair (390x844): drawer open + the training cycle ---
run(`agent-browser --session ${s} set viewport 390 844`);
run(`agent-browser --session ${s} open ${base}/`);
await sleep(4000);
run(`agent-browser --session ${s} set viewport 390 844`);
await sleep(1000);
const s1 = run(`agent-browser --session ${s} snapshot -i -c`);
const ham = s1.match(/- button "Toggle Sidebar" \[ref=(\w+)\]/) || s1.match(/- button "[^"]*menu[^"]*" \[ref=(\w+)\]/i);
if (ham) run(`agent-browser --session ${s} click @${ham[1]}`);
await sleep(1800);
run(`agent-browser --session ${s} screenshot ${out}/r126-loc-mobilenav-open.png`);
console.log("mobile drawer-open captured");

// with the drawer open, click Training LMS → the clone AUTO-CLOSES (the superset)
const s2 = run(`agent-browser --session ${s} snapshot -i -c`);
const tr = s2.match(/- link "Training LMS" \[ref=(\w+)\]/) || s2.match(/- link "[^"]*Training[^"]*" \[ref=(\w+)\]/) || s2.match(/- link "Training[^"]*" \[ref=(\w+)\]/);
if (tr) run(`agent-browser --session ${s} click @${tr[1]}`);
else console.log("WARN: Training link not matched — snapshot head:", s2.slice(0, 400));
await sleep(3500);
run(`agent-browser --session ${s} screenshot ${out}/r126-loc-training-mobile.png`);
const drawerState = run(`agent-browser --session ${s} eval "(function(){const cand=[...document.querySelectorAll('div')].filter(d=>{const cs=getComputedStyle(d);if(cs.display==='none'||cs.visibility==='hidden')return false;const r=d.getBoundingClientRect();return cs.position==='fixed'&&r.width>=250&&r.width<=320&&r.left<50&&r.height>400});if(!cand.length)return 'DRAWER UNMOUNTED (auto-closed)';const d=cand[0];const cs=getComputedStyle(d);return JSON.stringify({w:cs.width,left:Math.round(d.getBoundingClientRect().left),z:cs.zIndex,opacity:cs.opacity,transform:cs.transform})})()"`);
console.log("clone post-training drawer:", drawerState.trim().slice(0, 200));
const url = run(`agent-browser --session ${s} eval "location.pathname"`);
console.log("clone post-training url:", url.trim());

run(`agent-browser --session ${s} close 2>/dev/null; true`);
console.log("done");
