#!/usr/bin/env node
// r88-recipes5.mjs — the final probe set: reports interiors, the
// attendancedashboard chart2 geometry + legend, the date-range input.
import { execSync } from "node:child_process";
function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }
async function open(session, base, route, ms = 5000) {
  run(`agent-browser --session ${session} open ${base}/${route}`);
  await new Promise(r => setTimeout(r, ms));
}
const SIDES = [["REF", "ref88x", "https://eon.base44.app"], ["LOC", "loc88x", "http://127.0.0.1:3200"]];

// ---- reports ----
for (const [name, s, base] of SIDES) {
  await open(s, base, "reports");
  const tab = await evalOn(s, `(() => {
    const tabs = [...document.querySelectorAll('[role=tab]')].slice(0,3).map(b => {
      const r = b.getBoundingClientRect();
      const cs = getComputedStyle(b);
      const svgs = b.querySelectorAll('svg').length;
      return { txt: b.textContent.trim().slice(0,14), cls: (b.getAttribute('class')||'').slice(0,120), x: Math.round(r.x), w: Math.round(r.width), bg: cs.backgroundColor, color: cs.color, fw: cs.fontWeight, svgN: svgs };
    });
    return tabs;
  })()`);
  console.log(`[rep-tabs ${name}]`, JSON.stringify(tab));
  const hdr = await evalOn(s, `(() => {
    const card = document.querySelector('[class*=rounded-xl][class*=border]');
    const header = [...card.children].find(c => (c.getAttribute('class')||'').includes('p-6'));
    return [...header.children].map(c => { const r = c.getBoundingClientRect(); return { tag: c.tagName, cls: (c.getAttribute('class')||'').slice(0,80), y: Math.round(r.y), h: Math.round(r.height), txt: (c.textContent||'').trim().slice(0,35) }; });
  })()`);
  console.log(`[rep-hdr ${name}]`, JSON.stringify(hdr));
  const btnrow = await evalOn(s, `(() => {
    const btns = [...document.querySelectorAll('button')].filter(b => (b.textContent||'').trim() === 'CSV' || (b.textContent||'').trim() === 'PDF');
    return btns.slice(0,4).map(b => { const r = b.getBoundingClientRect(); return { txt: b.textContent.trim(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), svgCls: b.querySelector('svg') ? (b.querySelector('svg').getAttribute('class')||'') : null, cls: (b.getAttribute('class')||'').slice(0,100) }; });
  })()`);
  console.log(`[rep-btns ${name}]`, JSON.stringify(btnrow));
  const filters = await evalOn(s, `(() => {
    const cards = [...document.querySelectorAll('[class*=rounded-xl][class*=border]')];
    const fc = cards.find(c => (c.textContent||'').includes('Report Filters'));
    if (!fc) return null;
    const body = [...fc.children].find(c => c.getAttribute('class') && c.getAttribute('class').includes('p-6') === false || true);
    const grid = fc.querySelector('[class*=grid]');
    return { gridCls: grid ? (grid.getAttribute('class')||'') : null, cells: grid ? [...grid.children].map(c => { const r = c.getBoundingClientRect(); return { cls: (c.getAttribute('class')||'').slice(0,50), y: Math.round(r.y), h: Math.round(r.height), txt: (c.textContent||'').trim().slice(0,22) }; }) : null };
  })()`);
  console.log(`[rep-filters ${name}]`, JSON.stringify(filters));
}

// ---- attendancedashboard: chart2 + legend + X ticks ----
for (const [name, s, base] of SIDES) {
  await open(s, base, "attendancedashboard");
  const c2 = await evalOn(s, `(() => {
    const svgs = [...document.querySelectorAll('svg.recharts-surface')].filter(v => Math.round(v.getBoundingClientRect().width) === 498);
    const clockIn = svgs.find(v => v.getBoundingClientRect().x > 800);
    if (!clockIn) return null;
    const lines = [...clockIn.querySelectorAll('.recharts-cartesian-grid line')].map(l => ({ x1: l.getAttribute('x1'), y1: l.getAttribute('y1'), x2: l.getAttribute('x2'), y2: l.getAttribute('y2') }));
    const axis = [...clockIn.querySelectorAll('.recharts-cartesian-axis-line')].map(l => ({ x1: l.getAttribute('x1'), y1: l.getAttribute('y1'), x2: l.getAttribute('x2'), y2: l.getAttribute('y2') }));
    const vb = clockIn.getAttribute('viewBox');
    const bars = clockIn.querySelectorAll('.recharts-bar-rectangle').length;
    return { vb: vb, lines: lines, axis: axis, bars: bars };
  })()`);
  console.log(`[att-clockin ${name}]`, JSON.stringify(c2));
  const legend = await evalOn(s, `(() => {
    const li = document.querySelector('.recharts-legend-item');
    if (!li) return null;
    const r = li.getBoundingClientRect();
    const txt = li.querySelector('.recharts-legend-item-text');
    const cs = txt ? getComputedStyle(txt) : null;
    return { itemX: Math.round(r.x), itemW: Math.round(r.width), fs: cs ? cs.fontSize : null, txt: txt ? txt.textContent : null, liCls: (li.getAttribute('class')||'').slice(0,60) };
  })()`);
  console.log(`[att-legend ${name}]`, JSON.stringify(legend));
  const xt = await evalOn(s, `(() => {
    const svgs = [...document.querySelectorAll('svg.recharts-surface')].filter(v => Math.round(v.getBoundingClientRect().width) === 498 && v.getBoundingClientRect().x < 800);
    const main = svgs[0];
    const ytexts = [...main.querySelectorAll('[class*=yAxis] text, g[class*=yAxis] text')].map(t => t.textContent.trim());
    const all = [...main.querySelectorAll('text')].map(t => t.textContent.trim());
    return { y: ytexts, all: all };
  })()`);
  console.log(`[att-xt ${name}]`, JSON.stringify(xt));
  const dr = await evalOn(s, `(() => {
    const inp = [...document.querySelectorAll('input')].find(i => { const r = i.getBoundingClientRect(); return Math.round(r.x) === 885; });
    if (!inp) return null;
    const r = inp.getBoundingClientRect();
    return { type: inp.type, val: inp.value, cls: (inp.getAttribute('class')||'').slice(0,110), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), readOnly: inp.readOnly, svgs: inp.parentElement.querySelectorAll('svg').length, svgCls: inp.parentElement.querySelector('svg') ? (inp.parentElement.querySelector('svg').getAttribute('class')||'') : null };
  })()`);
  console.log(`[att-daterange ${name}]`, JSON.stringify(dr));
}
process.exit(0);
