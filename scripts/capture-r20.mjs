#!/usr/bin/env node
// capture-r20.mjs — session-21 pressed-state evidence captures:
// 68 group button PRESSED (zinc-100 — active: beats the blue hover),
// 69 expanded group hover (data-[state=open]:hover: zinc-100),
// 70 active bottom tab bg-blue-50 pill @390,
// + standards refresh (02 dashboard, 11 mobile dashboard).
// LOC pressed states via polyfill v2 (order-preserving) + mouse-down hold.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
function findRef(session, re) { const snap = run(`agent-browser --session ${session} snapshot -i -c`); const m = snap.match(re); return m ? m[1] : null; }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const POLYFILL = `(() => new Promise((resolve) => { if (window.__hoverPolyV2) return resolve('already'); window.__hoverPolyV2 = true; function unwrap(txt) { let out = txt, idx = 0; while (true) { let i = -1; for (const m of ['@media (hover:hover)', '@media (hover: hover)']) { const p = out.indexOf(m, idx); if (p >= 0 && (i < 0 || p < i)) { i = p; } } if (i < 0) break; const b0 = out.indexOf('{', i); let depth = 0, j = b0; for (; j < out.length; j++) { if (out[j] === '{') depth++; else if (out[j] === '}') { depth--; if (depth === 0) break; } } const inner = out.slice(b0 + 1, j); out = out.slice(0, i) + inner + out.slice(j + 1); idx = i + inner.length; } return out; } const links = [...document.querySelectorAll('link[rel=stylesheet]')]; let n = links.length; if (!n) return resolve('no-links'); let replaced = 0; links.forEach((link) => { fetch(link.href).then((r) => r.text()).then((txt) => { if (txt.includes('(hover:hover)') || txt.includes('(hover: hover)')) { const st = document.createElement('style'); st.setAttribute('data-hover-polyfill', 'v2'); st.textContent = unwrap(txt); link.replaceWith(st); replaced++; } }).catch(() => {}).finally(() => { if (--n === 0) resolve('replaced:' + replaced); }); }); }))()`;
const SHOT = "/home/z/my-project/eon-hr/docs/screenshots";
async function ensureLocAuth() {
  const p = run(`agent-browser --session loc eval "location.pathname"`);
  if (p.includes("login")) {
    run(`agent-browser --session loc fill 'input[type=email]' "sepnetflix2023@outlook.com"`);
    run(`agent-browser --session loc fill 'input[type=password]' "$Abcd1234"`);
    run(`agent-browser --session loc click 'button[type=submit]'`);
    await sleep(2500);
  }
}

// 1. group button PRESSED @1440 (mouse held down)
run(`agent-browser --session loc set viewport 1440 900`);
run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
await sleep(3000);
run(`agent-browser --session loc eval ${JSON.stringify(POLYFILL)}`);
await ensureLocAuth();
let pos = JSON.parse(run(`agent-browser --session loc eval "(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim()==='Employees' && x.offsetParent !== null); const r = b.getBoundingClientRect(); return JSON.stringify({x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2)}); })()"`).trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
run(`agent-browser --session loc mouse move ${pos.x} ${pos.y}`);
await sleep(1800);
run(`agent-browser --session loc mouse down`);
await sleep(1400);
run(`agent-browser --session loc screenshot ${SHOT}/68-group-button-pressed-zinc100.png`);
run(`agent-browser --session loc mouse move 5 5`);
await sleep(150);
run(`agent-browser --session loc mouse up`);

// 2. expanded group hover @1440 (data-[state=open]:hover: zinc-100)
const g = findRef("loc", /- button "Employees" \[expanded=false[^\]]*ref=(\w+)/);
run(`agent-browser --session loc click @${g}`);
await sleep(1400);
run(`agent-browser --session loc mouse move ${pos.x} ${pos.y}`);
await sleep(2000);
run(`agent-browser --session loc screenshot ${SHOT}/69-expanded-group-hover-zinc100.png`);
run(`agent-browser --session loc mouse move 5 5`);

// 3. active bottom tab pill @390
run(`agent-browser --session loc set viewport 390 844`);
run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
await sleep(3000);
await ensureLocAuth();
run(`agent-browser --session loc screenshot ${SHOT}/70-bottom-tab-active-pill.png`);

// 4. standards refresh
run(`agent-browser --session loc screenshot ${SHOT}/11-mobile-dashboard.png`);
run(`agent-browser --session loc set viewport 1440 900`);
run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
await sleep(3000);
await ensureLocAuth();
run(`agent-browser --session loc screenshot ${SHOT}/02-dashboard.png`);
console.log("captures done");
