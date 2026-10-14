#!/usr/bin/env node
// probe-r40-careers-interior.mjs — REF's zero-card interior (the full DOM
// + computed values) + the count h3's parent + the org-view structure.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 500) }; } }

const baseRef = "https://eon.base44.app";
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open ${baseRef}/careers`);
await new Promise(r => setTimeout(r, 4000));

// zero-filter via the search input
await evalOn("ref", `(() => { const i = document.querySelector('input'); const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(i, 'zzzzqqqqxxxx'); i.dispatchEvent(new Event('input', { bubbles: true })); return 'typed'; })()`);
await new Promise(r => setTimeout(r, 1500));

const interior = await evalOn("ref", `(() => {
  const card = [...document.querySelectorAll('div')].find(d => /No Open Positions/i.test(d.textContent||'') && d.className.toString().includes('rounded'));
  const h3 = [...document.querySelectorAll('h3')].find(h => /open position/i.test(h.textContent||''));
  const h3parent = h3 ? h3.parentElement : null;
  const r = card.getBoundingClientRect(); const cs = getComputedStyle(card);
  const inner = card.firstElementChild;
  const innerKids = inner ? [...inner.children].map(c => ({ tag: c.tagName, cls: (c.className||'').toString().slice(0, 120), t: (c.textContent||'').slice(0, 40), h: Math.round(c.getBoundingClientRect().height) })) : [];
  return { cardCls: card.className, cardRect: { y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, cardBorder: cs.borderColor + ' ' + cs.borderWidth, cardBg: cs.backgroundColor, cardShadow: cs.boxShadow.slice(0, 70), innerCls: inner ? inner.className : null, innerKids, h3parentCls: h3parent ? h3parent.className : null, h3parentTag: h3parent ? h3parent.tagName : null, h3Y: h3 ? Math.round(h3.getBoundingClientRect().y) : null };
})()`);
console.log("ZERO-CARD INTERIOR:", JSON.stringify(interior, null, 1));

// the org view (click the first chip)
await evalOn("ref", `(() => { const i = document.querySelector('input'); const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(i, ''); i.dispatchEvent(new Event('input', { bubbles: true })); const chips = [...document.querySelectorAll('button')].filter(b => { const p = b.parentElement; return p && /flex-wrap/.test((p.className||'')); }); if (chips.length) chips[0].click(); return 'clicked'; })()`);
await new Promise(r => setTimeout(r, 3000));
const orgview = await evalOn("ref", `(() => {
  const h2 = [...document.querySelectorAll('h2')].find(h => /browse by company/i.test(h.textContent||'') === false);
  const back = [...document.querySelectorAll('a, button')].find(e => /back to all/i.test(e.textContent || ''));
  const h3 = [...document.querySelectorAll('h3')].find(h => /open position/i.test(h.textContent||''));
  const content = [...document.querySelectorAll('div')].find(d => d.className.toString().includes('max-w-6xl') && d.getBoundingClientRect().y > 400);
  const firstKid = content ? content.firstElementChild : null;
  return { path: location.pathname, search: location.search, contentCls: content ? content.className : null, firstKidCls: firstKid ? firstKid.className : null, h2: h2 ? { t: h2.textContent.slice(0, 40), cls: h2.className, y: Math.round(h2.getBoundingClientRect().y) } : null, back: back ? { tag: back.tagName, cls: back.className.slice(0, 200), t: back.textContent.trim().slice(0, 30), y: Math.round(back.getBoundingClientRect().y) } : null, h3: h3 ? { t: h3.textContent, y: Math.round(h3.getBoundingClientRect().y), parentCls: h3.parentElement.className } : null };
})()`);
console.log("ORG VIEW:", JSON.stringify(orgview, null, 1));
