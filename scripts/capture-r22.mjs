#!/usr/bin/env node
// capture-r22.mjs — session-23 scroll-dimension + dialog-surface evidence:
// 74 loans dialog open (the 672px REF recipe: full field set + Requesting-for
//    card + computed installment)
// 75 loans dialog with amount filled (SAR 100.00 computed display)
// 76 hrreports data table (the 33px uppercase th, header-only at 0 records)
// 77 attendancedashboard summary table (the 37px all-left th + seeded row)
// + standards refresh (02 dashboard, 11 mobile dashboard).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const SHOT = "/home/z/my-project/eon-hr/docs/screenshots";

async function ensureLocAuth() {
  const p = run(`agent-browser --session loc eval "location.pathname"`);
  if (String(p).includes("login")) {
    run("agent-browser --session loc open http://127.0.0.1:3200/login");
    await sleep(2000);
    run("agent-browser --session loc fill 'input[type=email]' 'sepnetflix2023@outlook.com'");
    run("agent-browser --session loc fill 'input[type=password]' '$Abcd1234'");
    const snap = run("agent-browser --session loc snapshot -i -c");
    const m = snap.match(/button "Sign in" \[[^\]]*ref=(\w+)/);
    if (m) run(`agent-browser --session loc click @${m[1]}`);
    await sleep(4000);
  }
}

// 1. loans dialog open (empty state) @1440x900
run("agent-browser --session loc set viewport 1440 900");
run("agent-browser --session loc open http://127.0.0.1:3200/loans");
await sleep(3500);
await ensureLocAuth();
await run(`agent-browser --session loc eval "(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').toLowerCase().includes('new loan')); if (b) b.click(); return 'ok'; })()"`);
await sleep(1500);
run(`agent-browser --session loc screenshot ${SHOT}/74-loans-dialog-672-ref-recipe.png`);
console.log("74 captured");

// 2. loans dialog with the amount filled (computed installment)
await run(`agent-browser --session loc fill "#loan-amount" "1200"`);
await sleep(700);
run(`agent-browser --session loc screenshot ${SHOT}/75-loans-dialog-installment-computed.png`);
console.log("75 captured");
await run(`agent-browser --session loc eval "document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); 'esc'"`);
await sleep(800);

// 3. hrreports data table @1440x900
run("agent-browser --session loc open http://127.0.0.1:3200/hrreports");
await sleep(4000);
run(`agent-browser --session loc screenshot ${SHOT}/76-hrreports-header-only-table.png`);
console.log("76 captured");

// 4. attendancedashboard summary table @1440x900
run("agent-browser --session loc open http://127.0.0.1:3200/attendancedashboard");
await sleep(4000);
run(`agent-browser --session loc screenshot ${SHOT}/77-attendancedashboard-37px-th.png`);
console.log("77 captured");

// 5. standards refresh: 02 dashboard desktop + 11 mobile dashboard
run("agent-browser --session loc open http://127.0.0.1:3200/dashboard");
await sleep(3500);
run(`agent-browser --session loc screenshot ${SHOT}/02-dashboard-desktop.png`);
run("agent-browser --session loc set viewport 390 844");
await sleep(1500);
run(`agent-browser --session loc screenshot ${SHOT}/11-mobile-dashboard.png`);
console.log("02+11 refreshed");
