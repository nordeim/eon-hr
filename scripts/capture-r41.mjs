#!/usr/bin/env node
// capture-r41.mjs — session-42 / parity round 41 screenshots (160-163):
// the footer family with the keyboard-focus rings (the round's core),
// the user menu open (the 182px plain-div items), the employees filter
// row (the fixed search + the buttonface select), and the dark-mode moon
// (the conditional single sun glyph). REF + LOC pairs.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const raw = out.trim(); try { return JSON.parse(raw); } catch { return raw; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const OUT = "/home/z/my-project/eon-hr/docs/screenshots";

async function openBoth(path, vp = [1440, 900]) {
  run(`agent-browser --session ref set viewport ${vp[0]} ${vp[1]}`);
  run(`agent-browser --session ref open ${baseRef}${path}`);
  await new Promise(r => setTimeout(r, 2800));
  run(`agent-browser --session loc set viewport ${vp[0]} ${vp[1]}`);
  run(`agent-browser --session loc open ${baseLoc}${path}`);
  await new Promise(r => setTimeout(r, 2400));
}

// focus the bell via Tab on a session (returns when the footer cluster is
// keyboard-focused: the bell (LOC, by label) or عربي (REF, no labels))
async function tabToFooter(session) {
  await evalOn(session, `document.activeElement && document.activeElement.blur(); 'ok'`);
  for (let i = 0; i < 26; i++) {
    run(`agent-browser --session ${session} press Tab`);
    await new Promise(r => setTimeout(r, 170));
    const hit = await evalOn(session, `(() => { const el = document.activeElement; if (!el || el === document.body) return false; const r = el.getBoundingClientRect(); return r.y > 780 && r.x < 300; })()`);
    if (hit) return true;
  }
  return false;
}

// ---------- 160: the footer family with the focus rings ----------
await openBoth("/dashboard");
await tabToFooter("ref");
await tabToFooter("loc");
// scroll the shell so the footer cluster sits mid-frame
await evalOn("ref", `document.querySelector('div.flex-1.overflow-auto, main')?.scrollTo(0, 400); 'ok'`);
await evalOn("loc", `document.querySelector('div.flex-1.overflow-auto, main')?.scrollTo(0, 400); 'ok'`);
await new Promise(r => setTimeout(r, 700));
run(`agent-browser --session ref screenshot ${OUT}/160-ref-footer-focus.png`);
run(`agent-browser --session loc screenshot ${OUT}/160b-loc-footer-focus.png`);
console.log("160 captured (footer focus rings)");

// ---------- 161: the user menu open (the plain-div 182px items) ----------
async function openMenu(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 2600));
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const m = snap.match(/- button "sepnetflix2023[^"]*" \[[^\]]*ref=(\w+)\]/);
  if (m) run(`agent-browser --session ${session} click @${m[1]}`);
  await new Promise(r => setTimeout(r, 1300));
}
await openMenu("ref", baseRef);
await openMenu("loc", baseLoc);
run(`agent-browser --session ref screenshot ${OUT}/161-ref-usermenu.png`);
run(`agent-browser --session loc screenshot ${OUT}/161b-loc-usermenu.png`);
// close both menus
run(`agent-browser --session ref press Escape`);
run(`agent-browser --session loc press Escape`);
console.log("161 captured (user menu items)");

// ---------- 162: the employees filter row ----------
await openBoth("/employees");
await evalOn("ref", `document.querySelector('div.flex-1.overflow-auto, main')?.scrollTo(0, 0); 'ok'`);
await evalOn("loc", `document.querySelector('div.flex-1.overflow-auto, main')?.scrollTo(0, 0); 'ok'`);
await new Promise(r => setTimeout(r, 500));
run(`agent-browser --session ref screenshot ${OUT}/162-ref-employees-row.png`);
run(`agent-browser --session loc screenshot ${OUT}/162b-loc-employees-row.png`);
console.log("162 captured (employees filter row)");

// ---------- 163: the dark-mode moon (the conditional sun glyph) ----------
async function darkShot(session, base, suffix) {
  await evalOn(session, `localStorage.setItem('darkMode','true'); 'set'`);
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 2800));
  run(`agent-browser --session ${session} screenshot ${OUT}/${suffix}`);
  await evalOn(session, `localStorage.setItem('darkMode','false'); 'reset'`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 1800));
}
await darkShot("ref", baseRef, "163-ref-dark-moon.png");
await darkShot("loc", baseLoc, "163b-loc-dark-moon.png");
console.log("163 captured (dark-mode conditional glyph)");

console.log("done: 8 screenshots (160-163)");
