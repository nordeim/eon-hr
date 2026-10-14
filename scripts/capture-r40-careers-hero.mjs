#!/usr/bin/env node
// capture-r40-careers-hero.mjs — the careers hero mobile pixel-diff pair
// (the round-39 deferred frontier): 390x844 viewport shots of /careers on
// both apps, clipped to the hero (top 620px) to stay above the data grid.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const OUT = "/home/z/my-project/eon-hr/docs/screenshots";

for (const [label, session, base] of [["ref", "ref", baseRef], ["loc", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/careers`);
  await new Promise(r => setTimeout(r, 4000));
  run(`agent-browser --session ${session} screenshot ${OUT}/r40-hero-${label}.png`);
  console.log(`captured r40-hero-${label}.png`);
}

// also measure the hero geometry on both sides for the record
async function evalOn(session, expr) {
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(expr)}`);
  try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; }
}
for (const [label, session] of [["ref", "ref"], ["loc", "loc"]]) {
  const hero = await evalOn(session, `(() => { const input = document.querySelector('input'); const h1 = document.querySelector('h1'); const sub = h1 ? h1.parentElement.querySelector('p') : null; const chips = [...document.querySelectorAll('button, a')].filter(e => { const p = e.parentElement; return p && /flex-wrap/.test((p.className || '')); }); const firstChip = chips[0]; return { inputH: input ? Math.round(input.getBoundingClientRect().height) : null, inputY: input ? Math.round(input.getBoundingClientRect().y) : null, inputFont: input ? getComputedStyle(input).fontSize : null, inputCls: input ? input.className.slice(0, 200) : null, h1Y: h1 ? Math.round(h1.getBoundingClientRect().y) : null, subY: sub ? Math.round(sub.getBoundingClientRect().y) : null, chipCount: chips.length, firstChipY: firstChip ? Math.round(firstChip.getBoundingClientRect().y) : null, docH: document.documentElement.scrollHeight }; })()`);
  console.log(`${label} hero: ` + JSON.stringify(hero));
}
