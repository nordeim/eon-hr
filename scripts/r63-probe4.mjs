#!/usr/bin/env node
// r63-probe4.mjs — final decompositions:
// (A2) REF hrreports Group By in DARK — proper: set darkMode THEN navigate
// (B2) REF profile kicker subtitle in DARK at 390 (the r61-O pair check)
// (C2) REF advancedanalytics' two persistent "May" tooltips — full detail
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
const wait = (ms) => new Promise(r => setTimeout(r, ms));

// (A2) REF Group By in dark — navigate AFTER setting darkMode
await evalOn("ref", `localStorage.setItem('darkMode','true')`);
run('agent-browser --session ref open "https://eon.base44.app/hrreports"');
await wait(4200);
const dk = await evalOn("ref", `(() => { const html = document.documentElement; const t = [...document.querySelectorAll('main button')].find(b => (b.textContent||'').trim() === '' && /h-9/.test(b.getAttribute('class')||'')); if (!t) return { dark: html.classList.contains('dark'), t: 'none' }; return { dark: html.classList.contains('dark'), dp: t.hasAttribute('data-placeholder') ? 'set' : 'absent', c: getComputedStyle(t).color }; })()`, 2200);
console.log("(A2) REF hrreports Group By DARK (proper):", JSON.stringify(dk));
await evalOn("ref", `localStorage.setItem('darkMode','false')`);

// (B2) REF profile kicker subtitle dark @390
run('agent-browser --session ref set viewport 390 844');
await evalOn("ref", `localStorage.setItem('darkMode','true')`);
run('agent-browser --session ref open "https://eon.base44.app/profile"');
await wait(4200);
const bk = await evalOn("ref", `(() => { const k = [...document.querySelectorAll('main div')].find(d => (d.getAttribute('class')||'').includes('md:hidden') && d.querySelector('h1')); if (!k) return 'none'; const h1 = k.querySelector('h1'); const subs = [...k.querySelectorAll('p, span, div')].filter(e => e.children.length === 0 && (e.textContent||'').trim()).map(e => ({ tg: e.tagName.toLowerCase(), t: (e.textContent||'').replace(/\\s+/g,' ').trim().slice(0,24), c: getComputedStyle(e).color.replace(/, /g,',') })); const svgs = [...k.querySelectorAll('svg')].map(s => ({ cls: (s.getAttribute('class')||'').slice(0,50), c: getComputedStyle(s).color.replace(/, /g,',') })); return { dark: document.documentElement.classList.contains('dark'), h1c: h1 ? getComputedStyle(h1).color.replace(/, /g,',') : null, subs, svgs }; })()`, 2200);
console.log("(B2) REF profile kicker DARK @390:", JSON.stringify(bk).slice(0, 500));
await evalOn("ref", `localStorage.setItem('darkMode','false')`);
run('agent-browser --session ref set viewport 1440 900');

// (C2) the two May tooltips on REF advancedanalytics
run('agent-browser --session ref open "https://eon.base44.app/advancedanalytics"');
await wait(4200);
const c = await evalOn("ref", `(() => {
  const ps = [...document.querySelectorAll('main p')].filter(p => (p.textContent||'').includes('May'));
  return ps.map(p => {
    const wrap = p.closest('.recharts-tooltip-wrapper');
    const tip = p.closest('.recharts-default-tooltip');
    const r = wrap ? wrap.getBoundingClientRect() : p.getBoundingClientRect();
    return { tipCls: tip ? (tip.getAttribute('class')||'') : null, wrapCls: wrap ? (wrap.getAttribute('class')||'').slice(0,80) : null, rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, tipText: tip ? (tip.textContent||'').replace(/\\s+/g,' ').trim().slice(0,80) : null, tipKids: tip ? [...tip.children].map(k => ({ tag: k.tagName, cls: (k.getAttribute('class')||'').slice(0,50), t: (k.textContent||'').replace(/\\s+/g,' ').trim().slice(0,30), c: getComputedStyle(k).color.replace(/, /g,',') })) : null };
  });
})()`, 2200);
console.log("(C2) REF advancedanalytics May tooltips:", JSON.stringify(c, null, 1).slice(0, 1400));
process.exit(0);
