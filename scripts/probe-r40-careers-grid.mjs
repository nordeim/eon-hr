#!/usr/bin/env node
// probe-r40-careers-grid.mjs — REF's with-data grid + job-card recipe,
// the org view's full child structure (the h2→h3 gap), and the org-zero
// card message.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 500) }; } }

const baseRef = "https://eon.base44.app";
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open ${baseRef}/careers`);
await new Promise(r => setTimeout(r, 4000));

// 1. with-data grid + first job card (pick a company with 1 job: click chip "Abdel")
await evalOn("ref", `(() => { const chips = [...document.querySelectorAll('button')].filter(b => { const p = b.parentElement; return p && /flex-wrap/.test((p.className||'')); }); const abdel = chips.find(c => c.textContent.trim() === 'Abdel'); if (abdel) abdel.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 3000));
const org = await evalOn("ref", `(() => {
  const content = [...document.querySelectorAll('div')].filter(d => d.className.toString().includes('max-w-6xl') && d.getBoundingClientRect().y > 300);
  const c = content[content.length - 1];
  if (!c) return { found: false };
  const kids = [...c.children].map(k => { const r = k.getBoundingClientRect(); return { tag: k.tagName, y: Math.round(r.y), h: Math.round(r.height), cls: (k.className||'').toString().slice(0, 120), t: (k.children.length === 0 ? (k.textContent||'').slice(0, 40) : '') }; });
  return { found: true, contentCls: c.className, kids };
})()`);
console.log("ORG VIEW CHILDREN:", JSON.stringify(org, null, 1));

// org-zero card (if Abdel has 0 open) — the card text
const orgZero = await evalOn("ref", `(() => {
  const card = [...document.querySelectorAll('div')].find(d => /No Open Positions|No jobs|Check back/i.test(d.textContent||'') && d.className.toString().includes('rounded') && d.getBoundingClientRect().y > 300);
  const h3 = [...document.querySelectorAll('h3')].find(h => /open position/i.test(h.textContent||''));
  return { h3: h3 ? h3.textContent : null, cardCls: card ? card.className : null, cardText: card ? (card.querySelector('p') ? card.querySelector('p').textContent : null) : null, cardHasIcon: card ? !!card.querySelector('svg') : null };
})()`);
console.log("ORG-ZERO CARD:", JSON.stringify(orgZero, null, 1));

// 2. a company WITH a job — the grid + card recipe. Click the first chip that yields cards.
await evalOn("ref", `(() => { history.length; location.href = '/Careers'; return 'nav'; })()`);
await new Promise(r => setTimeout(r, 3500));
const withData = await evalOn("ref", `(() => {
  const grid = [...document.querySelectorAll('div')].find(d => /grid-cols/.test(d.className) && d.children.length > 0 && d.getBoundingClientRect().y > 300);
  if (!grid) return { found: false };
  const card = grid.children[0];
  const hdr = card.querySelector(':scope > div:first-child');
  const content = card.querySelector(':scope > div:last-child');
  return { found: true, gridCls: grid.className, gridKidCount: grid.children.length, cardCls: card.className, cardH: Math.round(card.getBoundingClientRect().height), hdrCls: hdr ? hdr.className : null, hdrTitleCls: hdr && hdr.children[0] ? hdr.children[0].className : null, contentCls: content ? content.className : null, metaLine: content ? (content.querySelector('p') ? content.querySelector('p').className.slice(0, 140) : null) : null };
})()`);
console.log("WITH-DATA GRID/CARD:", JSON.stringify(withData, null, 1));
