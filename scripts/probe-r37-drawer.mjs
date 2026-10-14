#!/usr/bin/env node
// probe-r37-drawer.mjs — clean mobile drawer audit: Escape-close reset,
// open, settle, read the panel (288px @ x=0, #FAFAFA, 1px #e5e5e5).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// find the hamburger by geometry: mobile header, top-left, x<40, y<100
const OPEN = `(() => {
  const btns = [...document.querySelectorAll('button')];
  const b = btns.find(x => { const r = x.getBoundingClientRect(); return r.x < 40 && r.y < 100 && r.width > 20 && r.width < 60; });
  if (!b) return {found:false};
  b.click(); return {found:true, label: b.getAttribute('aria-label')};
})()`;

const PANEL = `(() => {
  const panels = [...document.querySelectorAll('[data-state=open]')].filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 200 && r.width < 350 && cs.backgroundColor !== 'rgba(0, 0, 0, 0.8)'; });
  if (!panels.length) return {found:false};
  const p = panels[0]; const r = p.getBoundingClientRect(); const cs = getComputedStyle(p);
  return {found:true, w:Math.round(r.width), x:Math.round(r.x), h:Math.round(r.height), bg:cs.backgroundColor, brd: cs.borderRightWidth + ' ' + cs.borderRightColor};
})()`;

for (const [label, session, base] of [["REF", "ref", baseRef], ["LOC", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3500));
  // reset: close any open drawer
  run(`agent-browser --session ${session} press Escape`);
  await new Promise(r => setTimeout(r, 1200));
  const opened = await evalOn(session, OPEN);
  await new Promise(r => setTimeout(r, 1400)); // the 500ms enter + settle
  const panel = await evalOn(session, PANEL);
  console.log(`${label}: open=${JSON.stringify(opened)} panel=${JSON.stringify(panel)}`);
  run(`agent-browser --session ${session} press Escape`);
}
