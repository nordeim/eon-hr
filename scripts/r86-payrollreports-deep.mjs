#!/usr/bin/env node
// r86-payrollreports-deep.mjs — decompose the payrollreports divergence:
// (A1) the table-header typography (REF 12px uppercase vs LOC 14px
// title-case), (A2) the 24px header-block offset, (A3) the summary-card
// interior (the month selector + stats grid rows), so each member can be
// classified and fixed at the source.
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const DEEP = `(() => {
  const out = {};
  const page = document.querySelector('.min-h-screen');
  out.pagePad = page ? getComputedStyle(page).padding : null;
  const container = [...document.querySelectorAll('div')].find(d => (typeof d.className === 'string' || !d.className) && (d.className || '').toString().includes('max-w-7xl'));
  if (container) { const r = container.getBoundingClientRect(); out.container = { y: Math.round(r.y), cls: container.className.split(/\\s+/).slice(0, 5).join('.') }; }
  const titleBlock = container ? container.firstElementChild : null;
  if (titleBlock) { const r = titleBlock.getBoundingClientRect(); out.titleBlock = { y: Math.round(r.y), h: Math.round(r.height), cls: (typeof titleBlock.className === 'string' ? titleBlock.className : '').split(/\\s+/).slice(0, 6).join('.'), text: (titleBlock.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 70) }; }
  const kicker = [...document.querySelectorAll('*')].filter(e => /Payroll Reporting Suite/i.test(e.textContent || '') && e.children.length === 0)[0];
  if (kicker) { const r = kicker.getBoundingClientRect(); const cs = getComputedStyle(kicker); out.kicker = { y: Math.round(r.y), fs: cs.fontSize, fw: cs.fontWeight, ls: cs.letterSpacing, tt: cs.textTransform, color: cs.color, cls: (typeof kicker.className === 'string' ? kicker.className : '').split(/\\s+/).slice(0, 6).join('.') }; }
  const title = [...document.querySelectorAll('h1,h2,h3,[class*=text-3xl],[class*=text-2xl],[class*=text-4xl]')].filter(e => /^Payroll Reports$/.test((e.textContent || '').trim()))[0];
  if (title) { const r = title.getBoundingClientRect(); const cs = getComputedStyle(title); out.title = { y: Math.round(r.y), fs: cs.fontSize, fw: cs.fontWeight, cls: (typeof title.className === 'string' ? title.className : '').split(/\\s+/).slice(0, 6).join('.') }; }
  const summaryCard = [...document.querySelectorAll('[class*=bg-card]')].filter(c => /Monthly Payroll Summary/i.test(c.textContent || ''))[0];
  if (summaryCard) {
    const rows = [...summaryCard.children].map(ch => { const r = ch.getBoundingClientRect(); return { tag: ch.tagName.toLowerCase(), y: Math.round(r.y), h: Math.round(r.height), cls: (typeof ch.className === 'string' ? ch.className : '').split(/\\s+/).slice(0, 5).join('.'), text: (ch.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40) }; });
    out.summaryRows = rows;
    const th = summaryCard.querySelector('th');
    if (th) { const tr = th.closest('tr'); const r = tr.getBoundingClientRect(); out.thRow = { y: Math.round(r.y), h: Math.round(r.height) }; const cs = getComputedStyle(th); out.thStyle = { fs: cs.fontSize, tt: cs.textTransform, fw: cs.fontWeight, py: cs.paddingTop + '/' + cs.paddingBottom, ta: cs.textAlign }; }
    const monthSel = [...summaryCard.querySelectorAll('button, select, [role=combobox]')].slice(0, 3).map(b => { const r = b.getBoundingClientRect(); return { tag: b.tagName.toLowerCase(), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), text: (b.textContent || '').trim().slice(0, 25) }; });
    out.monthSel = monthSel;
  }
  const statsGrid = summaryCard ? [...summaryCard.querySelectorAll('[class*=grid]')].filter(g => /Total Earnings/i.test(g.textContent || ''))[0] : null;
  if (statsGrid) { const r = statsGrid.getBoundingClientRect(); out.statsGrid = { y: Math.round(r.y), h: Math.round(r.height), cls: (typeof statsGrid.className === 'string' ? statsGrid.className : '').split(/\\s+/).slice(0, 5).join('.') }; }
  return out;
})()`;

run(`agent-browser --session ref86x open https://eon.base44.app/payrollreports`);
run(`agent-browser --session loc86x open http://127.0.0.1:3200/payrollreports`);
await new Promise(r => setTimeout(r, 4000));
const ref = await evalOn("ref86x", DEEP);
const loc = await evalOn("loc86x", DEEP);
console.log("REF:", JSON.stringify(ref, null, 1));
console.log("\nLOC:", JSON.stringify(loc, null, 1));
process.exit(0);
