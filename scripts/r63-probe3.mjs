#!/usr/bin/env node
// r63-probe3.mjs — the remaining decompositions:
// (A) REF hrreports Group By trigger in DARK (the both-theme pair)
// (B) the profile mobile kicker at 390x844 (VISIBLE) — subtitle p color +
//     kicker svgs on BOTH apps (the census read them hidden at 1440)
// (C) advancedanalytics "May" tooltip persistence (read twice, 6s apart)
// (D) shiftcalendar REF assign button's svg icon name (lucide class)
// (E) taskmanager census re-read (the transient confirm)
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
const wait = (ms) => new Promise(r => setTimeout(r, ms));

// (A) REF Group By in dark
run('agent-browser --session ref open "https://eon.base44.app/hrreports"');
await wait(4200);
await evalOn("ref", `localStorage.setItem('darkMode','true')`);
await wait(1200);
const a = await evalOn("ref", `(() => { const t = [...document.querySelectorAll('main button')].find(b => (b.textContent||'').trim() === '' && /h-9/.test(b.getAttribute('class')||'')); if (!t) return 'none'; return { dp: t.hasAttribute('data-placeholder') ? 'set' : 'absent', c: getComputedStyle(t).color, html: t.innerHTML.replace(/\\s+/g,' ').slice(0,120) }; })()`, 2200);
console.log("(A) REF hrreports Group By DARK:", JSON.stringify(a));
await evalOn("ref", `localStorage.setItem('darkMode','false')`);
await wait(800);

// (B) profile kicker at mobile viewport on both apps
run('agent-browser --session ref set viewport 390 844');
run('agent-browser --session loc set viewport 390 844');
run('agent-browser --session ref open "https://eon.base44.app/profile"');
run('agent-browser --session loc open "http://127.0.0.1:3200/profile"');
await wait(4200);
for (const [side, base] of [["ref", "https://eon.base44.app"], ["loc", "http://127.0.0.1:3200"]]) {
  const b = await evalOn(side, `(() => {
    const k = [...document.querySelectorAll('main div')].find(d => (d.getAttribute('class')||'').includes('md:hidden') && d.querySelector('h1'));
    if (!k) return { kicker: 'none' };
    const h1 = k.querySelector('h1');
    const subs = [...k.querySelectorAll('p, span, div')].filter(e => e.children.length === 0 && (e.textContent||'').trim()).map(e => ({ tg: e.tagName.toLowerCase(), t: (e.textContent||'').replace(/\\s+/g,' ').trim().slice(0,24), c: getComputedStyle(e).color.replace(/, /g,',') }));
    const svgs = [...k.querySelectorAll('svg')].map(s => ({ cls: (s.getAttribute('class')||'').slice(0,50), c: getComputedStyle(s).color.replace(/, /g,',') }));
    return { kicker: (k.getAttribute('class')||'').slice(0,70), h1c: h1 ? getComputedStyle(h1).color.replace(/, /g,',') : null, subs, svgs };
  })()`, 2200);
  console.log(`(B) ${side} profile kicker @390:`, JSON.stringify(b).slice(0, 600));
}
run('agent-browser --session ref set viewport 1440 900');
run('agent-browser --session loc set viewport 1440 900');

// (C) advancedanalytics May persistence (two reads)
run('agent-browser --session ref open "https://eon.base44.app/advancedanalytics"');
await wait(4200);
const c1 = await evalOn("ref", `(() => [...document.querySelectorAll('main p')].map(p => ({ t: (p.textContent||'').replace(/\\s+/g,' ').trim().slice(0,20), c: getComputedStyle(p).color.replace(/, /g,',') })).filter(x => x.t.includes('May')))()`, 2200);
await wait(6000);
const c2 = await evalOn("ref", `(() => [...document.querySelectorAll('main p')].map(p => ({ t: (p.textContent||'').replace(/\\s+/g,' ').trim().slice(0,20), c: getComputedStyle(p).color.replace(/, /g,',') })).filter(x => x.t.includes('May')))()`);
console.log("(C) REF advancedanalytics May read1:", JSON.stringify(c1), "read2:", JSON.stringify(c2));

// (D) shiftcalendar REF assign button svg icon
run('agent-browser --session ref open "https://eon.base44.app/shiftcalendar"');
await wait(4200);
const d = await evalOn("ref", `(() => { const b = [...document.querySelectorAll('main button')].find(x => /text-slate-300/.test(x.getAttribute('class')||'')); if (!b) return 'none'; const s = b.querySelector('svg'); return { btnCls: (b.getAttribute('class')||'').slice(0,90), svgCls: s ? (s.getAttribute('class')||'').slice(0,60) : null, text: (b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,20) }; })()`, 2200);
console.log("(D) shiftcalendar REF assign svg:", JSON.stringify(d));
const dLoc = await evalOn("ref", `(() => { const cells = [...document.querySelectorAll('main td')].slice(0, 40); return cells.filter(td => /min-h-\\[80px\\]|align-top/.test(td.getAttribute('class')||'')).length; })()`);
console.log("    REF calendar cells with min-h/align-top:", JSON.stringify(dLoc));

// (E) taskmanager census re-read (both apps, light)
run('agent-browser --session ref open "https://eon.base44.app/taskmanager"');
run('agent-browser --session loc open "http://127.0.0.1:3200/taskmanager"');
await wait(5200);
const READ = `(() => {
  const out = []; const seen = new Set();
  const push = (tag, color) => { if (!color || color === 'rgba(0, 0, 0, 0)') return; const c = color.replace(/, /g, ','); const key = tag + '|' + c; if (seen.has(key)) return; seen.add(key); out.push({ tg: tag, c }); };
  for (const el of document.querySelectorAll('main h1, main h2, main h3, main h4, main h5, main h6')) push(el.tagName.toLowerCase(), getComputedStyle(el).color);
  for (const el of document.querySelectorAll('main span, main div, main td, main th, main label, main a, main p, main li')) { if (el.children.length > 0) continue; if (!(el.textContent||'').trim()) continue; push(el.tagName.toLowerCase(), getComputedStyle(el).color); }
  for (const el of document.querySelectorAll('main svg')) push(el.closest('button') ? 'button-svg' : 'svg', getComputedStyle(el).color);
  for (const el of document.querySelectorAll('main button')) push('button', getComputedStyle(el).color);
  out.sort((a, b) => (a.tg + a.c).localeCompare(b.tg + b.c));
  return out;
})()`;
const eRef = await evalOn("ref", READ, 2200);
const eLoc = await evalOn("loc", READ, 500);
console.log("(E) taskmanager re-read MATCH:", JSON.stringify(eRef) === JSON.stringify(eLoc));
if (JSON.stringify(eRef) !== JSON.stringify(eLoc)) { console.log("ref:", JSON.stringify(eRef)); console.log("loc:", JSON.stringify(eLoc)); }
process.exit(0);
