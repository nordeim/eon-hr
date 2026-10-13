#!/usr/bin/env node
// capture-r32.mjs — session-33 / parity round 32 screenshots:
// the dark-theme + RTL + swipe-to-open evidence set (LOC + REF pairs).
import { execSync } from "node:child_process";
const SHOTS = "/home/z/my-project/eon-hr/docs/screenshots";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 120); } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const dark = (s) => run(`agent-browser --session ${s} eval "(() => { localStorage.setItem('darkMode','true'); return 'ok'; })()"`);
const light = (s) => run(`agent-browser --session ${s} eval "(() => { localStorage.removeItem('darkMode'); return 'ok'; })()"`);

// 109/109b — the dark dashboard pair (desktop 1440x900)
run(`agent-browser --session loc set viewport 1440 900`);
run(`agent-browser --session ref set viewport 1440 900`);
dark("ref"); dark("loc");
run(`agent-browser --session ref open https://eon.base44.app/dashboard`);
await sleep(3500);
run(`agent-browser --session ref screenshot ${SHOTS}/109b-ref-dark-dashboard.png`);
run(`agent-browser --session loc open http://127.0.0.1:3200/dashboard`);
await sleep(3500);
run(`agent-browser --session loc screenshot ${SHOTS}/109-loc-dark-dashboard.png`);

// 110 — the dark /settings tabs (the token flips + the white pill list)
run(`agent-browser --session loc open http://127.0.0.1:3200/settings`);
await sleep(3000);
run(`agent-browser --session loc screenshot ${SHOTS}/110-loc-dark-settings-tabs.png`);

// 111 — the dark mobile chrome + drawer (390x844)
run(`agent-browser --session loc set viewport 390 844`);
run(`agent-browser --session loc open http://127.0.0.1:3200/dashboard`);
await sleep(3000);
run(`agent-browser --session loc eval "(() => { const b = [...document.querySelectorAll('button')].find(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.y < 100 && r.x < 60 && b.querySelector('svg'); }); if (b) b.click(); return 'ok'; })()"`);
await sleep(1200);
run(`agent-browser --session loc screenshot ${SHOTS}/111-loc-dark-mobile-drawer.png`);
run(`agent-browser --session loc press Escape`);

// 112 — the RTL pair (desktop, light): the mirrored layout
light("loc");
run(`agent-browser --session loc set viewport 1440 900`);
run(`agent-browser --session loc eval "(() => { localStorage.setItem('app_lang','ar'); return 'ok'; })()"`);
run(`agent-browser --session loc open http://127.0.0.1:3200/dashboard`);
await sleep(3500);
run(`agent-browser --session loc screenshot ${SHOTS}/112-loc-rtl-dashboard.png`);

// 113 — back to LTR light (the reset evidence + regression re-check)
run(`agent-browser --session loc eval "(() => { localStorage.removeItem('app_lang'); return 'ok'; })()"`);
run(`agent-browser --session loc open http://127.0.0.1:3200/dashboard`);
await sleep(3000);
run(`agent-browser --session loc screenshot ${SHOTS}/113-loc-light-restored.png`);

// reset REF to clean light/LTR for future audits
light("ref");
run(`agent-browser --session ref eval "(() => { localStorage.removeItem('app_lang'); return 'ok'; })()"`);
console.log("captures done");
