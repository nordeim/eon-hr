#!/usr/bin/env node
// capture-r31.mjs — session-32 / parity round 31 screenshots:
// the evidence page + the new-route captures (LOC + REF pairs).
import { execSync } from "node:child_process";
const SHOTS = "/home/z/my-project/eon-hr/docs/screenshots";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 120); } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

run(`agent-browser --session loc set viewport 1440 900`);
run(`agent-browser --session ref set viewport 1440 900`);

// 102 — the evidence page: shiftswap (stats + tabs + dialog affordance)
run(`agent-browser --session loc open http://127.0.0.1:3200/shiftswap`);
await sleep(3500);
run(`agent-browser --session loc screenshot ${SHOTS}/102-shiftswap-orphan-restored.png`);

// 103/103b — the shiftswap pair
run(`agent-browser --session ref open https://eon.base44.app/shiftswap`);
await sleep(3500);
run(`agent-browser --session ref screenshot ${SHOTS}/103b-shiftswap-ref.png`);
run(`agent-browser --session loc open http://127.0.0.1:3200/shiftswap`);
await sleep(3000);
run(`agent-browser --session loc screenshot ${SHOTS}/103-shiftswap-loc.png`);

// 104 — tenantsetup wizard
run(`agent-browser --session loc open http://127.0.0.1:3200/tenantsetup`);
await sleep(3000);
run(`agent-browser --session loc screenshot ${SHOTS}/104-tenantsetup-wizard.png`);

// 105 — the careers hero (zero-data)
run(`agent-browser --session loc open http://127.0.0.1:3200/careers`);
await sleep(3000);
run(`agent-browser --session loc screenshot ${SHOTS}/105-careers-hero.png`);

// 106 — payrollai
run(`agent-browser --session loc open http://127.0.0.1:3200/payrollai`);
await sleep(3000);
run(`agent-browser --session loc screenshot ${SHOTS}/106-payrollai.png`);

// 107 — hrassistant single-pane chat
run(`agent-browser --session loc open http://127.0.0.1:3200/hrassistant`);
await sleep(3000);
run(`agent-browser --session loc screenshot ${SHOTS}/107-hrassistant-singlepane.png`);

// 108 — mobile shiftswap (390x844)
run(`agent-browser --session loc set viewport 390 844`);
run(`agent-browser --session loc open http://127.0.0.1:3200/shiftswap`);
await sleep(3200);
run(`agent-browser --session loc screenshot ${SHOTS}/108-shiftswap-mobile.png`);

// 02/11 standards refresh
run(`agent-browser --session loc set viewport 1440 900`);
run(`agent-browser --session loc open http://127.0.0.1:3200/dashboard`);
await sleep(3500);
run(`agent-browser --session loc screenshot ${SHOTS}/02-dashboard-desktop.png`);
run(`agent-browser --session loc set viewport 390 844`);
run(`agent-browser --session loc open http://127.0.0.1:3200/dashboard`);
await sleep(3200);
run(`agent-browser --session loc screenshot ${SHOTS}/11-dashboard-mobile.png`);
console.log("captures done");
