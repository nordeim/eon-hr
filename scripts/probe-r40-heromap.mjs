#!/usr/bin/env node
// probe-r40-heromap.mjs — element map of the careers hero region (y<560)
// on both apps at 390x844: every visible element's tag/classes/geometry.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 500) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const MAP = `(() => {
  const out = [];
  const walk = (el, depth) => {
    for (const c of el.children) {
      const r = c.getBoundingClientRect();
      if (r.height > 0 && r.y < 560 && r.y > -10) {
        out.push({ d: depth, tag: c.tagName, y: Math.round(r.y), h: Math.round(r.height), w: Math.round(r.width), cls: (c.className && c.className.toString ? c.className.toString() : '').slice(0, 110), t: (c.children.length === 0 ? (c.textContent||'').trim().slice(0, 30) : '') });
      }
      if (depth < 5) walk(c, depth + 1);
    }
  };
  const main = document.querySelector('main');
  const sc = [...main.children].find(c => (c.className||'').includes('overflow-auto'));
  walk(sc || main, 0);
  return out.slice(0, 40);
})()`;

for (const [label, session, base] of [["REF", "ref", baseRef], ["LOC", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/careers`);
  await new Promise(r => setTimeout(r, 4000));
  console.log(`\n===== ${label} HERO MAP =====`);
  const m = await evalOn(session, MAP);
  for (const e of m) console.log(`${' '.repeat(e.d*2)}${e.tag} y=${e.y} h=${e.h} w=${e.w} ${e.t ? '"' + e.t + '" ' : ''}${e.cls}`);
}
