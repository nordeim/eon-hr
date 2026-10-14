#!/usr/bin/env node
// probe-r40-careers-card3.mjs — the job card's deepest interior: the
// title-row left block (logo + title), the 4 meta rows' icons/texts, the
// badge's full class, the button's full class.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 500) }; } }

const baseRef = "https://eon.base44.app";
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open ${baseRef}/careers`);
await new Promise(r => setTimeout(r, 4000));

const deep = await evalOn("ref", `(() => {
  const grid = [...document.querySelectorAll('div')].find(d => /grid-cols/.test(d.className) && d.children.length > 0 && d.getBoundingClientRect().y > 300);
  if (!grid) return { found: false };
  const card = grid.children[0];
  const left = card.querySelector('.items-start.justify-between > div:first-child');
  const badge = card.querySelector('.items-start.justify-between > div:last-child');
  const metaRows = [...card.querySelectorAll('.space-y-2 > div')];
  const btn = [...card.querySelectorAll('button')].pop();
  const dump = (el, depth) => { const out = []; for (const c of el.children) { const r = c.getBoundingClientRect(); out.push({ d: depth, tag: c.tagName, h: Math.round(r.height), w: Math.round(r.width), cls: (c.className && c.className.toString ? c.className.toString() : '').slice(0, 150), t: (c.children.length === 0 ? (c.textContent||'').trim().slice(0, 50) : ''), svg: c.tagName === 'svg' ? (c.getAttribute('class') || '') : null }); if (depth < 3) out.push(...dump(c, depth + 1)); } return out; };
  return { found: true, leftTree: dump(left, 0), badgeCls: badge.className, badgeText: badge.textContent.trim(), metaRows: metaRows.map(m => ({ iconCls: m.querySelector('svg') ? m.querySelector('svg').getAttribute('class') : null, text: m.textContent.trim().slice(0, 60) })), btnCls: btn.className, btnText: btn.textContent.trim(), btnW: Math.round(btn.getBoundingClientRect().width) };
})()`);
console.log(JSON.stringify(deep, null, 1).slice(0, 4000));
