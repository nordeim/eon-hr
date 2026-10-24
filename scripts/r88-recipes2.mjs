#!/usr/bin/env node
// r88-recipes2.mjs — the refined probes (split small; the argv-length trap).
import { execSync } from "node:child_process";
function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }
async function open(session, base, route) {
  run(`agent-browser --session ${session} open ${base}/${route}`);
  await new Promise(r => setTimeout(r, 3000));
}
const SIDES = [["REF", "ref88x", "https://eon.base44.app"], ["LOC", "loc88x", "http://127.0.0.1:3200"]];

// ---- tenantsetup: the WIZARD card (has the form) ----
for (const [name, s, base] of SIDES) {
  await open(s, base, "tenantsetup");
  const r = await evalOn(s, `(() => {
    const form = document.querySelector('form');
    const card = form.closest('[class*=rounded-xl]');
    const header = [...card.children].find(c => !c.contains(form));
    const kids = [...header.children].map(c => { const r = c.getBoundingClientRect(); const cs = getComputedStyle(c); return { tag: c.tagName, cls: (c.getAttribute('class')||'').slice(0,90), y: Math.round(r.y), h: Math.round(r.height), fs: cs.fontSize, lh: cs.lineHeight, txt: (c.textContent||'').trim().slice(0,25) }; });
    return { hdrCls: (header.getAttribute('class')||'').slice(0,110), hdrH: Math.round(header.getBoundingClientRect().height), kids: kids };
  })()`);
  console.log(`[tenant ${name}]`, JSON.stringify(r));
}

// ---- attendancedashboard: the header (small probes) ----
for (const [name, s, base] of SIDES) {
  await open(s, base, "attendancedashboard");
  const hdr = await evalOn(s, `(() => {
    const h = document.querySelector('h1');
    const hdr = h.closest('[class*=flex-col],[class*=justify-between]');
    return { hdrCls: (hdr.getAttribute('class')||'').slice(0,110), hdrY: Math.round(hdr.getBoundingClientRect().y), hdrH: Math.round(hdr.getBoundingClientRect().height) };
  })()`);
  console.log(`[att-hdr ${name}]`, JSON.stringify(hdr));
  const rows = await evalOn(s, `(() => {
    const h = document.querySelector('h1');
    const hdr = h.closest('[class*=flex-col],[class*=justify-between]');
    return [...hdr.children].map(c => { const r = c.getBoundingClientRect(); return { cls: (c.getAttribute('class')||'').slice(0,85), y: Math.round(r.y), h: Math.round(r.height), w: Math.round(r.width), txt: (c.textContent||'').trim().slice(0,36) }; });
  })()`);
  console.log(`[att-rows ${name}]`, JSON.stringify(rows));
  const filters = await evalOn(s, `(() => {
    const sel = document.querySelector('button[role=combobox]');
    if (!sel) return null;
    const r = sel.getBoundingClientRect();
    const wrap = sel.parentElement;
    return { selX: Math.round(r.x), selY: Math.round(r.y), selW: Math.round(r.width), selH: Math.round(r.height), wrapCls: (wrap.getAttribute('class')||'').slice(0,80), wrapY: Math.round(wrap.getBoundingClientRect().y) };
  })()`);
  console.log(`[att-filters ${name}]`, JSON.stringify(filters));
  const chart = await evalOn(s, `(() => {
    const svg = document.querySelector('svg.recharts-surface');
    const xt = [...svg.querySelectorAll('text')].map(t => t.textContent.trim());
    const grid = svg.querySelectorAll('.recharts-cartesian-grid line').length;
    const legend = [...svg.parentElement.querySelectorAll('.recharts-legend-item-text')].map(t => t.textContent.trim());
    return { texts: xt.slice(0, 30), grid: grid, legend: legend };
  })()`);
  console.log(`[att-chart ${name}]`, JSON.stringify(chart));
  const table = await evalOn(s, `(() => {
    const t = document.querySelector('table');
    if (!t) return null;
    const ths = [...t.querySelectorAll('th')].map(th => { const r = th.getBoundingClientRect(); return { txt: th.textContent.trim().slice(0,12), x: Math.round(r.x), w: Math.round(r.w || r.width), cls: (th.getAttribute('class')||'').slice(0,55) }; });
    return { tableCls: (t.getAttribute('class')||'').slice(0,55), ths: ths, y: Math.round(t.getBoundingClientRect().y) };
  })()`);
  console.log(`[att-table ${name}]`, JSON.stringify(table));
}

// ---- companywall: the p-6 children ----
for (const [name, s, base] of SIDES) {
  await open(s, base, "companywall");
  const r = await evalOn(s, `(() => {
    const ta = document.querySelector('textarea');
    const p6 = ta.closest('.p-6');
    return [...p6.children].map(c => { const r = c.getBoundingClientRect(); return { tag: c.tagName, cls: (c.getAttribute('class')||'').slice(0,75), y: Math.round(r.y), h: Math.round(r.height), txt: (c.textContent||'').trim().slice(0,30) }; });
  })()`);
  console.log(`[wall ${name}]`, JSON.stringify(r));
  const row = await evalOn(s, `(() => {
    const ta = document.querySelector('textarea');
    const p6 = ta.closest('.p-6');
    const row = [...p6.querySelectorAll('div')].filter(d => d.textContent.includes('Post') || d.querySelector('button')).pop();
    return { html: row ? row.outerHTML.replace(/\\s+/g,' ').slice(0, 500) : null };
  })()`);
  console.log(`[wall-row ${name}]`, JSON.stringify(row));
}

// ---- hrreports: the chart geometry ----
for (const [name, s, base] of SIDES) {
  await open(s, base, "hrreports");
  const r = await evalOn(s, `(() => {
    const svg = document.querySelector('svg.recharts-surface');
    const lines = [...svg.querySelectorAll('.recharts-cartesian-grid line')].map(l => ({ x1: l.getAttribute('x1'), y1: l.getAttribute('y1'), x2: l.getAttribute('x2'), y2: l.getAttribute('y2') }));
    const axis = [...svg.querySelectorAll('.recharts-cartesian-axis-line')].map(l => ({ x1: l.getAttribute('x1'), y1: l.getAttribute('y1'), x2: l.getAttribute('x2'), y2: l.getAttribute('y2') }));
    const texts = [...svg.querySelectorAll('text')].map(t => t.textContent.trim());
    const vb = svg.getAttribute('viewBox');
    const chartCls = [...svg.children].map(c => String(c.getAttribute('class')||c.tagName).slice(0,40));
    return { vb: vb, lines: lines, axis: axis, texts: texts, kids: chartCls };
  })()`);
  console.log(`[hr-chart ${name}]`, JSON.stringify(r));
}
process.exit(0);
