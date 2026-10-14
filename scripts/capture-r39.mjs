#!/usr/bin/env node
// capture-r39.mjs — session-40 / parity round 39 screenshots (148-155):
// the restructured shell (desktop + mobile), the input family (loans
// dialog), the careers board + org view, tenantsetup mobile, the login
// re-audit. Pairs: <n>-ref-*.png / <n>b-loc-*.png.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const OUT = "docs/screenshots";

async function pair(n, name, path, { viewport = [1440, 900], act = null, fullPage = false } = {}) {
  for (const [label, session, base] of [["ref", "ref", baseRef], ["loc", "loc", baseLoc]]) {
    run(`agent-browser --session ${session} set viewport ${viewport[0]} ${viewport[1]}`);
    run(`agent-browser --session ${session} open ${base}${path}`);
    await sleep(3500);
    if (act) await act(session);
    const fp = fullPage ? " --full-page" : "";
    run(`agent-browser --session ${session} screenshot ${OUT}/${n}-${label}-${name}.png${fp}`);
    console.log(`${n}-${label}-${name}.png`);
  }
}

await pair(148, "dashboard-shell", "/dashboard");
await pair(149, "dashboard-mobile", "/dashboard", { viewport: [390, 844] });
await pair(150, "loans-dialog", "/loans", {
  run: async (s) => {
    run(`agent-browser --session ${s} eval "(() => { const b = [...document.querySelectorAll('button')].find(b => /new loan/i.test(b.textContent || '')); if (b) b.click(); return 'ok'; })()"`);
    await sleep(1600);
  },
});
await pair(151, "careers-board", "/careers", { fullPage: false });
await pair(153, "tenantsetup-mobile", "/tenantsetup", { viewport: [390, 844] });
await pair(154, "login-desktop", "/login");
await pair(155, "login-mobile", "/login", { viewport: [390, 844] });
console.log("done (152 = careers org view, captured separately)");
