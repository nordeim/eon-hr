#!/usr/bin/env node
// r88-recipes3.mjs — the verification + remaining probes.
import { execSync } from "node:child_process";
function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }
async function open(session, base, route, ms = 4500) {
  run(`agent-browser --session ${session} open ${base}/${route}`);
  await new Promise(r => setTimeout(r, ms));
}
const SIDES = [["REF", "ref88x", "https://eon.base44.app"], ["LOC", "loc88x", "http://127.0.0.1:3200"]];

// ---- 1. attendancedashboard chart re-verify (longer settle) ----
for (const [name, s, base] of SIDES) {
  await open(s, base, "attendancedashboard", 6000);
  const chart = await evalOn(s, `(() => {
    const svg = document.querySelector('svg.recharts-surface');
    const xt = [...svg.querySelectorAll('text')].map(t => t.textContent.trim());
    const grid = svg.querySelectorAll('.recharts-cartesian-grid line').length;
    const legend = [...svg.parentElement.querySelectorAll('.recharts-legend-item-text')].map(t => t.textContent.trim());
    const bars = svg.querySelectorAll('.recharts-bar-rectangle').length;
    return { texts: xt.slice(0, 30), grid: grid, legend: legend, bars: bars };
  })()`);
  console.log(`[att-chart2 ${name}]`, JSON.stringify(chart));
  // the header area element map (the h1's parent chain up to the space-y-8 main)
  const hdr = await evalOn(s, `(() => {
    const h1 = document.querySelector('h1');
    let hdr = h1.parentElement;
    for (let i = 0; i < 4 && hdr; i++) {
      const cls = hdr.getAttribute('class') || '';
      if (cls.includes('space-y-8') || cls.includes('max-w')) break;
      hdr = hdr.parentElement;
    }
    const t = hdr.firstElementChild;
    const rows = [...t.children].map(c => { const r = c.getBoundingClientRect(); return { cls: (c.getAttribute('class')||'').slice(0,75), y: Math.round(r.y), h: Math.round(r.height), txt: (c.textContent||'').trim().slice(0,30) }; });
    return { hdrCls: (t.getAttribute('class')||'').slice(0,100), hdrH: Math.round(t.getBoundingClientRect().height), rows: rows };
  })()`);
  console.log(`[att-hdr2 ${name}]`, JSON.stringify(hdr));
  // the table tbody + colgroup
  const tb = await evalOn(s, `(() => {
    const t = document.querySelector('table');
    if (!t) return null;
    const cg = t.querySelector('colgroup');
    const tb = t.querySelector('tbody');
    const tr = tb ? tb.querySelector('tr') : null;
    return { colgroup: cg ? [...cg.children].map(c => c.getAttribute('style') || c.getAttribute('class')) : null, tbodyRows: tb ? tb.children.length : 0, tbodyTxt: tb ? (tb.textContent||'').trim().slice(0,50) : null, trH: tr ? Math.round(tr.getBoundingClientRect().height) : null };
  })()`);
  console.log(`[att-tb ${name}]`, JSON.stringify(tb));
}

// ---- 2. shiftswap: all 4 stat tiles ----
for (const [name, s, base] of SIDES) {
  await open(s, base, "shiftswap");
  const r = await evalOn(s, `(() => {
    const cards = [...document.querySelectorAll('.grid > div')].filter(c => c.querySelector('p,span'));
    return cards.slice(0, 4).map(c => {
      const tile = c.querySelector('[class*=w-10]');
      const svg = tile ? tile.querySelector('svg') : null;
      return { tileCls: tile ? (tile.getAttribute('class')||'') : null, iconCls: svg ? (svg.getAttribute('class')||'') : null, label: (c.textContent||'').replace(/[0-9]/g,'').trim().slice(0,20) };
    });
  })()`);
  console.log(`[swap ${name}]`, JSON.stringify(r));
}

// ---- 3. companywall: the composer inner column ----
for (const [name, s, base] of SIDES) {
  await open(s, base, "companywall");
  const r = await evalOn(s, `(() => {
    const ta = document.querySelector('textarea');
    const col = ta.parentElement;
    const colCls = (col.getAttribute('class')||'').slice(0,70);
    const kids = [...col.children].map(c => { const r = c.getBoundingClientRect(); return { tag: c.tagName, cls: (c.getAttribute('class')||'').slice(0,65), y: Math.round(r.y), h: Math.round(r.height), txt: (c.textContent||'').trim().slice(0,25) }; });
    return { colCls: colCls, kids: kids };
  })()`);
  console.log(`[wall-col ${name}]`, JSON.stringify(r));
  const r2 = await evalOn(s, `(() => {
    const ta = document.querySelector('textarea');
    const taR = ta.getBoundingClientRect();
    const sel = document.querySelector('button[role=combobox]');
    const selR = sel ? sel.getBoundingClientRect() : null;
    const post = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Post');
    const postR = post ? post.getBoundingClientRect() : null;
    return { taBottom: Math.round(taR.y + taR.height), selY: selR ? Math.round(selR.y) : null, selH: selR ? Math.round(selR.height) : null, postY: postR ? Math.round(postR.y) : null, postH: postR ? Math.round(postR.height) : null };
  })()`);
  console.log(`[wall-row2 ${name}]`, JSON.stringify(r2));
}
process.exit(0);
