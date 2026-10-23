#!/usr/bin/env node
// r83-theme-mobile.mjs — session-83 / parity round 82: the mobile-drawer
// cycle in the two theme states (the standing user emphasis — the mobile
// navigation menu). The drawer cycle is standing-green in LIGHT+LTR; the
// dark + RTL states were NEVER exercised. Walks the 390x844 drawer on
// BOTH sides per state: open → census (bg, direction, links) → the
// Training LMS click → navigation → auto-close.
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const MODES = [["dark", "localStorage.setItem('darkMode','true'); localStorage.removeItem('app_lang');"], ["rtl-light", "localStorage.setItem('darkMode','false'); localStorage.setItem('app_lang','ar');"]];
const DRAWER = `(() => {
  const d = document.querySelector('[role=dialog]');
  if (!d) return { open: false };
  const r = d.getBoundingClientRect(); const cs = getComputedStyle(d);
  return { open: true, x: Math.round(r.x), w: Math.round(r.width), bg: cs.backgroundColor, dir: document.documentElement.getAttribute('dir') || 'ltr', links: [...d.querySelectorAll('a')].slice(0, 5).map(a => (a.textContent || '').trim().slice(0, 18)) };
})()`;

for (const [label, setup] of MODES) {
  console.log(`\n########## MOBILE DRAWER [${label}] ##########`);
  for (const [name, session, base] of [["REF", "ref", "https://eon.base44.app"], ["LOC", "loc", "http://127.0.0.1:3200"]]) {
    run(`agent-browser --session ${session} eval "${setup}"`);
    run(`agent-browser --session ${session} set viewport 390 844`);
    run(`agent-browser --session ${session} open ${base}/dashboard`);
    await new Promise(r => setTimeout(r, 2500));
    const snap = run(`agent-browser --session ${session} snapshot -i -c`);
    const line = (snap.split("\n").find(l => l.includes("Toggle Sidebar")) || "");
    const ref = (line.match(/ref=(\w+)/) || [])[1];
    if (ref) run(`agent-browser --session ${session} click @${ref}`);
    await new Promise(r => setTimeout(r, 1400));
    const drawer = await evalOn(session, DRAWER);
    console.log(`${name} drawer [${label}]:`, JSON.stringify(drawer));
  }
}
// the standing functional cycle on the LOC (dark): open → Training LMS → nav → auto-close
console.log("\n########## LOC FUNCTIONAL CYCLE [dark] ##########");
run(`agent-browser --session loc eval "localStorage.setItem('darkMode','true'); localStorage.removeItem('app_lang');"`);
run(`agent-browser --session loc set viewport 390 844`);
run(`agent-browser --session loc open http://127.0.0.1:3200/dashboard`);
await new Promise(r => setTimeout(r, 2500));
const snap = run(`agent-browser --session loc snapshot -i -c`);
const line = (snap.split("\n").find(l => l.includes("Toggle Sidebar")) || "");
const ref = (line.match(/ref=(\w+)/) || [])[1];
if (ref) run(`agent-browser --session loc click @${ref}`);
await new Promise(r => setTimeout(r, 1400));
const nav = run(`agent-browser --session loc eval "(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'NO-DIALOG'; const a = [...d.querySelectorAll('a')].find(x => /training lms/i.test(x.textContent||'')); if (a) { a.click(); return 'CLICKED:' + a.getAttribute('href'); } return 'NO-LINK'; })()"`).trim();
console.log("training-lms nav:", nav.slice(0, 120));
await new Promise(r => setTimeout(r, 3000));
console.log("after click:", run(`agent-browser --session loc get url`).trim());
console.log("drawer auto-closed:", run(`agent-browser --session loc eval "(() => ({ open: !!document.querySelector('[role=dialog]') }))()"`).trim().slice(0, 80));
// sweep
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
console.log("\ntheme state swept back to LIGHT+LTR");
process.exit(0);
