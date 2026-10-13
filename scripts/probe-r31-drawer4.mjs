#!/usr/bin/env node
// probe-r31-drawer4.mjs — verify the drawer panel border difference in the
// SETTLED state (long settle after open; the slide-in runs ~300ms) + the
// desktop sidebar border for comparison.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const PANELBORDER = `(() => {
  const cands = [...document.querySelectorAll('div')].filter(d => {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    return cs.position === 'fixed' && r.width >= 200 && r.width <= 340 && Math.round(r.height) >= 800 && r.x < 20 && cs.backgroundColor !== 'rgba(0, 0, 0, 0.8)' && d.querySelectorAll('button, a').length > 3;
  });
  if (!cands.length) return JSON.stringify({found:false});
  const panel = cands[0];
  const cs = getComputedStyle(panel); const r = panel.getBoundingClientRect();
  return JSON.stringify({found:true, x:Math.round(r.x), w:Math.round(r.width), cls: panel.className.toString().slice(0,110), bt: cs.borderTopWidth, br: cs.borderRightWidth, bb: cs.borderBottomWidth, bl: cs.borderLeftWidth, brc: cs.borderRightColor, bg: cs.backgroundColor});
})()`;

const SIDEBARBORDER = `(() => {
  const aside = document.querySelector('aside');
  const root = aside || document.querySelector('div.min-h-screen > div');
  if (!root) return JSON.stringify({found:false});
  const cs = getComputedStyle(root); const r = root.getBoundingClientRect();
  return JSON.stringify({found:true, tag: root.tagName, x:Math.round(r.x), w:Math.round(r.width), cls: root.className.toString().slice(0,110), bt: cs.borderTopWidth, br: cs.borderRightWidth, bb: cs.borderBottomWidth, bl: cs.borderLeftWidth, brc: cs.borderRightColor, bg: cs.backgroundColor});
})()`;

// mobile drawer, settled
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 390 844`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3500));
  await evalOn(s, `(() => {
    const btns = [...document.querySelectorAll('button')];
    const b = btns.find(e => { const r = e.getBoundingClientRect(); return r.y < 100 && r.x < 60 && r.width > 20 && r.width < 60 && (e.querySelector('svg') || (e.textContent||'').trim() === ''); });
    if (b) b.click();
    return 'clicked';
  })()`, 2600);
  const d = await evalOn(s, PANELBORDER);
  console.log(`DRAWER ${s.toUpperCase()}: ${JSON.stringify(d)}`);
}

// desktop sidebar for comparison
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3200));
  const d = await evalOn(s, SIDEBARBORDER);
  console.log(`DESKTOP-SIDEBAR ${s.toUpperCase()}: ${JSON.stringify(d)}`);
}
