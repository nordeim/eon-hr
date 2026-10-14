#!/usr/bin/env node
// probe-r40-careers-card2.mjs — the main board's own grid + the job card
// tree (the board renders the 1 open job directly).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 500) }; } }

const baseRef = "https://eon.base44.app";
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open ${baseRef}/careers`);
await new Promise(r => setTimeout(r, 4000));

const card = await evalOn("ref", `(() => {
  const grid = [...document.querySelectorAll('div')].find(d => /grid-cols/.test(d.className) && d.children.length > 0 && d.getBoundingClientRect().y > 300);
  if (!grid) return { found: false };
  const card = grid.children[0];
  const dump = (el, depth) => { const out = []; for (const c of el.children) { const r = c.getBoundingClientRect(); out.push({ d: depth, tag: c.tagName, y: Math.round(r.y), h: Math.round(r.height), w: Math.round(r.width), cls: (c.className && c.className.toString ? c.className.toString() : '').slice(0, 130), t: (c.children.length === 0 ? (c.textContent||'').trim().slice(0, 44) : '') }); if (depth < 3) out.push(...dump(c, depth + 1)); } return out; };
  return { found: true, gridCls: grid.className, cardCls: card.className, tree: dump(card, 0) };
})()`);
if (!card.found) { console.log("NO GRID — h3 says:", JSON.stringify(await evalOn("ref", `(() => { const h3 = [...document.querySelectorAll('h3')].find(h => /open position/i.test(h.textContent||'')); return h3 ? h3.textContent : null; })()`))); }
else {
  console.log(`GRID: ${card.gridCls}`);
  console.log(`CARD: ${card.cardCls}`);
  for (const n of card.tree) console.log(`${' '.repeat(n.d * 2)}${n.tag} y=${n.y} h=${n.h} w=${n.w} ${n.t ? '"' + n.t + '" ' : ''}${n.cls}`);
}
