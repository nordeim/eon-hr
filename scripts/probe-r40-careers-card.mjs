#!/usr/bin/env node
// probe-r40-careers-card.mjs — REF's job card complete interior: the
// header's title row (justify-between — badge?), the meta line, the
// content's children with exact classes and texts.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 500) }; } }

const baseRef = "https://eon.base44.app";
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open ${baseRef}/careers`);
await new Promise(r => setTimeout(r, 4000));

// click the first chip that yields a card: try each of the first few chips
const picked = await evalOn("ref", `(() => {
  const chips = [...document.querySelectorAll('button')].filter(b => { const p = b.parentElement; return p && /flex-wrap/.test((p.className||'')); });
  return { count: chips.length, names: chips.slice(0, 6).map(c => c.textContent.trim()) };
})()`);
console.log("CHIPS:", JSON.stringify(picked));

// find a company with jobs: click chip with the most jobs — use the count h3 after each.
// Simpler: click the 2nd chip (BTS) then check; if 0, go back and try the next.
for (const name of picked.names.slice(0, 6)) {
  await evalOn("ref", `(() => { const chips = [...document.querySelectorAll('button')].filter(b => { const p = b.parentElement; return p && /flex-wrap/.test((p.className||'')); }); const t = chips.find(c => c.textContent.trim() === '${name.replace(/'/g, "\\'")}'); if (t) t.click(); return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 2500));
  const h3 = await evalOn("ref", `(() => { const h3 = [...document.querySelectorAll('h3')].find(h => /open position/i.test(h.textContent||'')); const grid = [...document.querySelectorAll('div')].find(d => /grid-cols/.test(d.className) && d.children.length > 0 && d.getBoundingClientRect().y > 300); return { h3: h3 ? h3.textContent : null, gridKids: grid ? grid.children.length : 0 }; })()`);
  console.log(`  ${name}: ${JSON.stringify(h3)}`);
  if (h3.gridKids > 0) {
    const card = await evalOn("ref", `(() => {
      const grid = [...document.querySelectorAll('div')].find(d => /grid-cols/.test(d.className) && d.children.length > 0 && d.getBoundingClientRect().y > 300);
      const card = grid.children[0];
      const dump = (el, depth) => { const out = []; for (const c of el.children) { const r = c.getBoundingClientRect(); out.push({ d: depth, tag: c.tagName, y: Math.round(r.y), h: Math.round(r.height), w: Math.round(r.width), cls: (c.className && c.className.toString ? c.className.toString() : '').slice(0, 130), t: (c.children.length === 0 ? (c.textContent||'').trim().slice(0, 44) : '') }); if (depth < 3) out.push(...dump(c, depth + 1)); } return out; };
      return { cardCls: card.className, tree: dump(card, 0) };
    })()`);
    console.log(`CARD TREE (${name}):`);
    for (const n of card.tree) console.log(`${' '.repeat(n.d * 2)}${n.tag} y=${n.y} h=${n.h} w=${n.w} ${n.t ? '"' + n.t + '" ' : ''}${n.cls}`);
    break;
  }
  // go back to the board
  await evalOn("ref", `(() => { const back = [...document.querySelectorAll('a, button')].find(e => /back to all/i.test(e.textContent || '')); if (back) back.click(); return 'back'; })()`);
  await new Promise(r => setTimeout(r, 2000));
}
