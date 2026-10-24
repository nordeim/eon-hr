#!/usr/bin/env node
// r88-recipes4.mjs — the attendancedashboard deep-dive: enumerate ALL
// recharts svgs (resolve the empty-chart contradiction) + the full header
// row inventory + the reports crop-diff localization.
import { execSync } from "node:child_process";
function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }
async function open(session, base, route, ms = 6000) {
  run(`agent-browser --session ${session} open ${base}/${route}`);
  await new Promise(r => setTimeout(r, ms));
}
const SIDES = [["REF", "ref88x", "https://eon.base44.app"], ["LOC", "loc88x", "http://127.0.0.1:3200"]];

for (const [name, s, base] of SIDES) {
  await open(s, base, "attendancedashboard");
  // enumerate all recharts svgs
  const svgs = await evalOn(s, `(() => {
    return [...document.querySelectorAll('svg.recharts-surface')].map((svg, i) => {
      const r = svg.getBoundingClientRect();
      const title = (function(){ let c = svg; while (c && !(c.className && String(c.className).includes('rounded-'))) c = c.parentElement; return c ? (c.querySelector('[class*=font-semibold]') || {}).textContent : ''; })() || '';
      return { i: i, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), title: String(title).trim().slice(0,30), texts: [...svg.querySelectorAll('text')].length, grid: svg.querySelectorAll('.recharts-cartesian-grid line').length, bars: svg.querySelectorAll('.recharts-bar-rectangle').length, legendN: svg.parentElement.querySelectorAll('.recharts-legend-item-text').length };
    });
  })()`);
  console.log(`[att-svgs ${name}]`, JSON.stringify(svgs));
  // the header: find via the h1 text 'Attendance Dashboard'
  const hdr = await evalOn(s, `(() => {
    const h1 = [...document.querySelectorAll('h1,h2,div')].find(e => (e.children.length === 0 || e.querySelector('div.font-semibold,[class*=text-2xl],[class*=text-3xl]')) && (e.textContent||'').trim().startsWith('Attendance Dashboard') && e.getBoundingClientRect().height < 60);
    if (!h1) return null;
    let hdr = h1;
    for (let i = 0; i < 5; i++) { hdr = hdr.parentElement; const c = hdr.getAttribute('class')||''; if (c.includes('justify-between') || c.includes('flex-col')) break; }
    const members = [];
    hdr.querySelectorAll('input,button,select,[role=combobox]').forEach(el => { const r = el.getBoundingClientRect(); if (r.width === 0) return; members.push({ tag: el.tagName + (el.getAttribute('role') || ''), txt: (el.textContent||'').trim().slice(0,16), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), ph: el.getAttribute('placeholder') || '' }); });
    return { hdrCls: (hdr.getAttribute('class')||'').slice(0,110), hdrY: Math.round(hdr.getBoundingClientRect().y), hdrH: Math.round(hdr.getBoundingClientRect().height), members: members };
  })()`);
  console.log(`[att-hdr3 ${name}]`, JSON.stringify(hdr));
}
process.exit(0);
