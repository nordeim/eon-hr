#!/usr/bin/env node
// probe-r40-careers-zero.mjs — REF's zero-filtered board shape (nonsense
// search) + the horizontal-overflow culprit element + the full board
// structure below the chips (count h3 + grid) for the wrapper re-audit.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 500) }; } }

const baseRef = "https://eon.base44.app";

run(`agent-browser --session ref set viewport 390 844`);
run(`agent-browser --session ref open ${baseRef}/careers`);
await new Promise(r => setTimeout(r, 4000));

// 1. overflow culprit: widest element in the scroller
const culprit = await evalOn("ref", `(() => {
  const wide = [];
  const sc = [...document.querySelectorAll('main > div')].find(c => (c.className||'').includes('overflow-auto')) || document.body;
  for (const el of sc.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width > 400) wide.push({ tag: el.tagName, w: Math.round(r.width), cls: (el.className||'').toString().slice(0, 120), t: (el.children.length===0 ? (el.textContent||'').slice(0,50) : '') });
  }
  wide.sort((a,b) => b.w - a.w);
  return { scrollerW: Math.round(sc.getBoundingClientRect().width), scrollerScrollW: sc.scrollWidth, docScrollW: document.documentElement.scrollWidth, top: wide.slice(0, 5) };
})()`);
console.log("OVERFLOW CULPRIT:", JSON.stringify(culprit, null, 1));

// 2. full board structure (desktop so the layout is canonical)
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open ${baseRef}/careers`);
await new Promise(r => setTimeout(r, 4000));
const board = await evalOn("ref", `(() => {
  const content = [...document.querySelectorAll('div')].find(d => /max-w-6xl/.test(d.className) && d.getBoundingClientRect().y > 400);
  if (!content) return { found: false };
  const kids = [...content.children].map(c => { const r = c.getBoundingClientRect(); return { tag: c.tagName, y: Math.round(r.y), h: Math.round(r.height), cls: (c.className||'').toString().slice(0, 130), t: (c.children.length===0 ? (c.textContent||'').slice(0,40) : (c.querySelector('h2,h3') ? c.querySelector('h2,h3').textContent.slice(0,40) : '')) }; });
  return { found: true, contentCls: content.className, kids };
})()`);
console.log("BOARD STRUCTURE:", JSON.stringify(board, null, 1).slice(0, 3000));

// 3. zero-filtered board: type a nonsense search
await evalOn("ref", `(() => { const i = document.querySelector('input'); const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(i, 'zzzzqqqqxxxx'); i.dispatchEvent(new Event('input', { bubbles: true })); return 'typed'; })()`);
await new Promise(r => setTimeout(r, 1500));
const zero = await evalOn("ref", `(() => {
  const content = [...document.querySelectorAll('div')].find(d => /max-w-6xl/.test(d.className) && d.getBoundingClientRect().y > 400);
  const h2 = [...document.querySelectorAll('h2')].find(h => /browse by company/i.test(h.textContent||''));
  const h3 = [...document.querySelectorAll('h3')].find(h => /open position/i.test(h.textContent||''));
  const card = [...document.querySelectorAll('div')].find(d => /No Open Positions|no jobs|no results/i.test(d.textContent||'') && d.className.toString().includes('rounded'));
  const chips = [...document.querySelectorAll('button')].filter(b => { const p = b.parentElement; return p && /flex-wrap/.test((p.className||'')); });
  return { contentCls: content ? content.className : null, h2: h2 ? { t: h2.textContent, cls: h2.className } : null, h3: h3 ? { t: h3.textContent, cls: h3.className } : null, zeroCard: card ? { cls: card.className.slice(0, 160), inner: card.firstElementChild ? card.firstElementChild.className : null } : null, chipCount: chips.length, docH: document.documentElement.scrollHeight };
})()`);
console.log("ZERO-FILTERED BOARD:", JSON.stringify(zero, null, 1));
