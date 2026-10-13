#!/usr/bin/env node
// probe-r32-drawer.mjs — re-verify the round-30 drawer border fix (verify-r30 pattern).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const DRAWER = `(() => {
  const cands = [...document.querySelectorAll('div')].filter(d => {
    const cs = getComputedStyle(d); const r = d.getBoundingClientRect();
    return cs.position === 'fixed' && r.width >= 200 && r.width <= 340 && Math.round(r.height) >= 800 && cs.backgroundColor !== 'rgba(0, 0, 0, 0.8)' && d.querySelectorAll('button, a').length > 3;
  });
  if (!cands.length) return { found: false };
  const cs = getComputedStyle(cands[0]);
  return { found: true, w: Math.round(cands[0].getBoundingClientRect().width), br: cs.borderRightWidth, brc: cs.borderRightColor };
})()`;
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 390 844`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 4000));
  await evalOn(s, `(() => {
    const btns = [...document.querySelectorAll('button')];
    const b = btns.find(e => { const r = e.getBoundingClientRect(); return r.y < 100 && r.x < 60 && r.width > 20 && r.width < 60 && (e.querySelector('svg') || (e.textContent||'').trim() === ''); });
    if (b) b.click();
    return 'ok';
  })()`, 900);
  console.log(`${s}: ${JSON.stringify(await evalOn(s, DRAWER))}`);
  run(`agent-browser --session ${s} press Escape`);
}
