#!/usr/bin/env node
// capture-r19.mjs — session-20 hover-parity evidence captures:
// 63 sidebar leaf hover (zinc-100 + #18181B), 64 bell hover (#F5F5F5 +
// slate-600 icon), 65 import-csv hover (blue-50), 66 menu item hover
// (accent + #171717 incl. the red-Logout flip), 67 hamburger hover @390,
// + standards refresh (02 dashboard, 12 mobile drawer, 37 employees).
// LOC hovers via the polyfill (real CDP mouse moves).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
function findRef(session, re) { const snap = run(`agent-browser --session ${session} snapshot -i -c`); const m = snap.match(re); return m ? m[1] : null; }
const POLYFILL = `(() => { if (document.getElementById('hover-probe-polyfill')) return 'already'; const chunks = []; function scan(rules) { for (const r of rules) { if (r.media && r.media.mediaText === '(hover: hover)') { for (const inner of r.cssRules) chunks.push(inner.cssText); } if (r.cssRules) scan(r.cssRules); } } for (const ss of document.styleSheets) { try { scan(ss.cssRules); } catch(e){} } const st = document.createElement('style'); st.id = 'hover-probe-polyfill'; st.textContent = '@layer utilities { ' + chunks.join(' ') + ' }'; document.head.appendChild(st); return 'ok'; })()`;
const SHOT = "docs/screenshots";
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// 1. sidebar leaf hover @1440
run(`agent-browser --session loc set viewport 1440 900`);
run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
await sleep(3000);
run(`agent-browser --session loc eval ${JSON.stringify(POLYFILL)}`);
const tl = findRef("loc", /- link "Training LMS" \[[^\]]*ref=(\w+)/);
run(`agent-browser --session loc hover @${tl}`);
await sleep(2200);
run(`agent-browser --session loc screenshot ${SHOT}/63-sidebar-leaf-hover-zinc100.png`);

// 2. bell hover @1440
const bell = findRef("loc", /- button "Notifications" \[[^\]]*ref=(\w+)/);
run(`agent-browser --session loc hover @${bell}`);
await sleep(2200);
run(`agent-browser --session loc screenshot ${SHOT}/64-bell-hover-accent.png`);

// 3. import csv hover @1440
run(`agent-browser --session loc open "http://127.0.0.1:3200/employees"`);
await sleep(3000);
run(`agent-browser --session loc eval ${JSON.stringify(POLYFILL)}`);
const csv = findRef("loc", /- button "Import CSV" \[[^\]]*ref=(\w+)/);
run(`agent-browser --session loc hover @${csv}`);
await sleep(2200);
run(`agent-browser --session loc screenshot ${SHOT}/65-import-csv-hover-blue50.png`);

// 4. menu item hover @1440
run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
await sleep(3000);
run(`agent-browser --session loc eval ${JSON.stringify(POLYFILL)}`);
const ub = findRef("loc", /- button "sepnetflix2023 sepnetflix2023@outlook\.com" \[[^\]]*ref=(\w+)/);
run(`agent-browser --session loc click @${ub}`);
await sleep(1600);
const mi = findRef("loc", /- menuitem "My Profile" \[[^\]]*ref=(\w+)/);
run(`agent-browser --session loc hover @${mi}`);
await sleep(2200);
run(`agent-browser --session loc screenshot ${SHOT}/66-menu-item-hover-accent.png`);
run(`agent-browser --session loc press Escape`);

// 5. hamburger hover @390
run(`agent-browser --session loc set viewport 390 844`);
run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
await sleep(3000);
run(`agent-browser --session loc eval ${JSON.stringify(POLYFILL)}`);
const ham = findRef("loc", /- button "Toggle Sidebar" \[[^\]]*ref=(\w+)/);
run(`agent-browser --session loc hover @${ham}`);
await sleep(2200);
run(`agent-browser --session loc screenshot ${SHOT}/67-hamburger-hover-mobile.png`);

// 6. standards refresh
run(`agent-browser --session loc set viewport 1440 900`);
run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
await sleep(3000);
run(`agent-browser --session loc screenshot ${SHOT}/02-dashboard.png`);
run(`agent-browser --session loc open "http://127.0.0.1:3200/reports"`);
await sleep(3000);
run(`agent-browser --session loc screenshot ${SHOT}/37-reports.png`);
run(`agent-browser --session loc set viewport 390 844`);
run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
await sleep(3000);
run(`agent-browser --session loc screenshot ${SHOT}/11-mobile-dashboard.png`);
console.log("captures done");
