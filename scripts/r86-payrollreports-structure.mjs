#!/usr/bin/env node
// r86-payrollreports-structure.mjs — precise structural read of the
// payrollreports page on both sides (the cross-side pixel-diff's biggest
// finding: 296 differing cells across the whole content area). Reads the
// section-level structure (h1, cards, stats grid, table headers) with
// exact geometry + computed styles so the divergence can be pinned
// member by member.
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const STRUCT = `(() => {
  const main = document.querySelector('main') || document.body;
  const out = { h1: null, kicker: null, sections: [], tableHeaders: [], cards: [] };
  const h1 = main.querySelector('h1');
  if (h1) { const r = h1.getBoundingClientRect(); const cs = getComputedStyle(h1); out.h1 = { text: h1.textContent.trim().slice(0, 40), x: Math.round(r.x), y: Math.round(r.y), fs: cs.fontSize, fw: cs.fontWeight, ls: cs.letterSpacing, tt: cs.textTransform }; }
  const h2s = [...main.querySelectorAll('h2')].slice(0, 6).map(h => { const r = h.getBoundingClientRect(); return { text: h.textContent.trim().slice(0, 30), y: Math.round(r.y), fs: getComputedStyle(h).fontSize }; });
  out.h2s = h2s;
  const cards = [...main.querySelectorAll('.rounded-xl.border, [class*=bg-card]')].slice(0, 8).map(c => { const r = c.getBoundingClientRect(); return { cls: (typeof c.className === 'string' ? c.className : '').split(/\\s+/).slice(0, 5).join('.'), text: (c.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 50), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; });
  out.cards = cards;
  const ths = [...main.querySelectorAll('th')].slice(0, 12).map(t => ({ text: t.textContent.trim(), tt: getComputedStyle(t).textTransform, fs: getComputedStyle(t).fontSize, fw: getComputedStyle(t).fontWeight, ta: getComputedStyle(t).textAlign }));
  out.tableHeaders = ths;
  const statLabels = [...main.querySelectorAll('p, span, div')].filter(e => /Total (Earnings|Deductions|Net Payroll|Records)/i.test(e.textContent || '') && e.children.length === 0).slice(0, 6).map(e => { const r = e.getBoundingClientRect(); return { text: e.textContent.trim().slice(0, 30), y: Math.round(r.y), fs: getComputedStyle(e).fontSize, fw: getComputedStyle(e).fontWeight }; });
  out.statLabels = statLabels;
  const noRec = [...main.querySelectorAll('*')].filter(e => /No records/i.test(e.textContent || '') && e.children.length === 0).slice(0, 3).map(e => { const r = e.getBoundingClientRect(); return { text: e.textContent.trim().slice(0, 40), y: Math.round(r.y), fs: getComputedStyle(e).fontSize }; });
  out.noRecords = noRec;
  return out;
})()`;

run(`agent-browser --session ref86x open https://eon.base44.app/payrollreports`);
run(`agent-browser --session loc86x open http://127.0.0.1:3200/payrollreports`);
await new Promise(r => setTimeout(r, 4000));
const ref = await evalOn("ref86x", STRUCT);
const loc = await evalOn("loc86x", STRUCT);
console.log("REF:", JSON.stringify(ref, null, 1));
console.log("\nLOC:", JSON.stringify(loc, null, 1));
process.exit(0);
