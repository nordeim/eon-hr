#!/usr/bin/env node
// r90-rtl-filter-rows.mjs — v2: simplified evals (no backslash escapes).
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t = out.trim(); try { return JSON.parse(t); } catch {} try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const PREP = "localStorage.setItem('app_lang','ar'); localStorage.setItem('darkMode','false');";
const pairs = [["ref90rtl", "https://eon.base44.app", "REF"], ["loc90rtl", "http://127.0.0.1:3200", "LOC"]];

const AM_ROWS = `(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const chev = [...document.querySelectorAll('svg')].filter(s => (s.getAttribute('class')||'').includes('chevron-down') && s.getBoundingClientRect().width > 0);
  if (!chev.length) return { error: 'no chevrons' };
  const out = { chevrons: chev.map(c => ({ geo: r(c) })) };
  const trig = chev[0].closest('button');
  out.trigger = trig ? { geo: r(trig), cls: (trig.getAttribute('class')||'').slice(0,120), text: (trig.textContent||'').trim().slice(0,30) } : null;
  if (trig) {
    const row = trig.parentElement;
    out.row = { geo: r(row), cls: (row.getAttribute('class')||'').slice(0,140), tag: row.tagName, scrollW: row.scrollWidth, clientW: row.clientWidth };
    out.rowChildren = [...row.children].map(ch => ({ tag: ch.tagName, geo: r(ch), cls: (ch.getAttribute('class')||'').slice(0,80), text: (ch.textContent||'').trim().slice(0,20) }));
    const block = row.parentElement;
    out.block = { geo: r(block), cls: (block.getAttribute('class')||'').slice(0,140), scrollW: block.scrollWidth, clientW: block.clientWidth };
    out.blockChildren = [...block.children].map(ch => ({ tag: ch.tagName, geo: r(ch), cls: (ch.getAttribute('class')||'').slice(0,80), text: (ch.textContent||'').trim().slice(0,20) }));
  }
  const search = document.querySelector('input[placeholder]');
  if (search) {
    const srow = search.parentElement;
    out.searchRow = { geo: r(srow), cls: (srow.getAttribute('class')||'').slice(0,140), scrollW: srow.scrollWidth, clientW: srow.clientWidth };
    out.searchInput = { geo: r(search), placeholder: search.getAttribute('placeholder') };
  }
  return out;
})()`;

const ALR_HEADER = `(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const out = {};
  const cards = document.querySelectorAll('[data-slot=card]');
  out.cardCount = cards.length;
  const first = cards[0];
  if (first) {
    out.firstCard = { geo: r(first) };
    const header = first.querySelector('[data-slot=card-header]');
    if (header) {
      out.header = { geo: r(header), cls: (header.getAttribute('class')||'').slice(0,140) };
      out.headerChildren = [...header.children].map(ch => ({ tag: ch.tagName, geo: r(ch), cls: (ch.getAttribute('class')||'').slice(0,80), text: (ch.textContent||'').trim().slice(0,26) }));
    }
  }
  const pageHeader = document.querySelector('main');
  if (pageHeader) {
    out.mainGeo = r(pageHeader);
    const rows = [...pageHeader.children].map(ch => ({ tag: ch.tagName, geo: r(ch), cls: (ch.getAttribute('class')||'').slice(0,120), text: (ch.textContent||'').trim().slice(0,26) }));
    out.mainChildren = rows.slice(0, 8);
  }
  return out;
})()`;

for (const [session, base, label] of pairs) {
  console.log(`########## ${label} — assetmanagement filter rows ##########`);
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/assetmanagement`);
  await new Promise(r => setTimeout(r, 3500));
  run(`agent-browser --session ${session} eval "${PREP}"`);
  await new Promise(r => setTimeout(r, 1200));
  console.log(JSON.stringify(await evalOn(session, AM_ROWS)));
}
for (const [session, base, label] of pairs) {
  console.log(`########## ${label} — allleaverequests header ##########`);
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/allleaverequests`);
  await new Promise(r => setTimeout(r, 3500));
  run(`agent-browser --session ${session} eval "${PREP}"`);
  await new Promise(r => setTimeout(r, 1200));
  console.log(JSON.stringify(await evalOn(session, ALR_HEADER)));
}
process.exit(0);
