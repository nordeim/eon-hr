#!/usr/bin/env node
// probe-r40-careers-interior2.mjs — the count-h3 row's full interior
// (justify-between — what's on the right?), the org view's wrapper + h2 +
// the back button's full class, and the zero-card's svg icon.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 500) }; } }

const baseRef = "https://eon.base44.app";
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open ${baseRef}/careers`);
await new Promise(r => setTimeout(r, 4000));

// 1. the count h3 row — full interior (with data)
const h3row = await evalOn("ref", `(() => {
  const h3 = [...document.querySelectorAll('h3')].find(h => /open position/i.test(h.textContent||''));
  const row = h3.parentElement;
  return { rowCls: row.className, kids: [...row.children].map(c => { const r = c.getBoundingClientRect(); return { tag: c.tagName, y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), cls: (c.className||'').toString().slice(0, 160), t: (c.textContent||'').trim().slice(0, 30) }; }) };
})()`);
console.log("COUNT H3 ROW (with data):", JSON.stringify(h3row, null, 1));

// 2. the zero-card svg icon (search-filtered zero)
await evalOn("ref", `(() => { const i = document.querySelector('input'); const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(i, 'zzzzqqqqxxxx'); i.dispatchEvent(new Event('input', { bubbles: true })); return 'typed'; })()`);
await new Promise(r => setTimeout(r, 1500));
const icon = await evalOn("ref", `(() => {
  const card = [...document.querySelectorAll('div')].find(d => /No Open Positions/i.test(d.textContent||'') && d.className.toString().includes('rounded'));
  const svg = card.querySelector('svg');
  const p = [...card.querySelectorAll('p')].map(x => ({ t: x.textContent, cls: x.className }));
  return { svgCls: svg ? svg.getAttribute('class') : null, svgW: svg ? Math.round(svg.getBoundingClientRect().width) : null, svgStroke: svg ? getComputedStyle(svg).color : null, svgPath: svg && svg.querySelector('path') ? svg.querySelector('path').getAttribute('d').slice(0, 60) : null, texts: p, cardTextAlign: getComputedStyle(card).textAlign };
})()`);
console.log("ZERO-CARD ICON/TEXT:", JSON.stringify(icon, null, 1));

// 3. the org view — wrapper chain + h2 + back button full class
await evalOn("ref", `(() => { const i = document.querySelector('input'); const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(i, ''); i.dispatchEvent(new Event('input', { bubbles: true })); const chips = [...document.querySelectorAll('button')].filter(b => { const p = b.parentElement; return p && /flex-wrap/.test((p.className||'')); }); if (chips.length) chips[0].click(); return 'clicked'; })()`);
await new Promise(r => setTimeout(r, 3000));
const org = await evalOn("ref", `(() => {
  const back = [...document.querySelectorAll('a, button')].find(e => /back to all/i.test(e.textContent || ''));
  const h2 = [...document.querySelectorAll('h2')].filter(h => h.getBoundingClientRect().y > 300 && h.getBoundingClientRect().y < 600);
  let chain = []; let n = back;
  for (let i = 0; i < 4 && n && n !== document.body; i++) { chain.push({ tag: n.tagName, cls: (n.className||'').toString().slice(0, 110) }); n = n.parentElement; }
  const h3 = [...document.querySelectorAll('h3')].find(h => /open position/i.test(h.textContent||''));
  return { path: location.pathname + location.search, backCls: back.className, backChain: chain, orgH2: h2.map(x => ({ t: x.textContent.slice(0, 36), cls: x.className, y: Math.round(x.getBoundingClientRect().y) })), h3Row: h3 ? { parentCls: h3.parentElement.className, kids: [...h3.parentElement.children].map(c => ({ tag: c.tagName, t: (c.textContent||'').trim().slice(0, 24), w: Math.round(c.getBoundingClientRect().width) })) } : null };
})()`);
console.log("ORG VIEW DETAIL:", JSON.stringify(org, null, 1));
