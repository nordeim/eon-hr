#!/usr/bin/env node
// r88-recipes6.mjs — the last-mile probes: the att main-chart geometry,
// the date-range wrapper HTML, the reports tab icons + filters card.
import { execSync } from "node:child_process";
function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }
async function open(session, base, route, ms = 5000) {
  run(`agent-browser --session ${session} open ${base}/${route}`);
  await new Promise(r => setTimeout(r, ms));
}
const SIDES = [["REF", "ref88x", "https://eon.base44.app"], ["LOC", "loc88x", "http://127.0.0.1:3200"]];

for (const [name, s, base] of SIDES) {
  await open(s, base, "attendancedashboard");
  // the main chart axis geometry
  const main = await evalOn(s, `(() => {
    const svgs = [...document.querySelectorAll('svg.recharts-surface')].filter(v => Math.round(v.getBoundingClientRect().width) === 498 && v.getBoundingClientRect().x < 800);
    const m = svgs[0];
    const axis = [...m.querySelectorAll('.recharts-cartesian-axis-line')].map(l => ({ x1: l.getAttribute('x1'), y1: l.getAttribute('y1'), x2: l.getAttribute('x2'), y2: l.getAttribute('y2') }));
    const firstH = [...m.querySelectorAll('.recharts-cartesian-grid line')].filter(l => l.getAttribute('x1') !== l.getAttribute('x2')).map(l => ({ y: l.getAttribute('y1'), x1: l.getAttribute('x1'), x2: l.getAttribute('x2') }))[0];
    const firstV = [...m.querySelectorAll('.recharts-cartesian-grid line')].filter(l => l.getAttribute('y1') === l.getAttribute('y2')).map(l => ({ x: l.getAttribute('x1'), y1: l.getAttribute('y1'), y2: l.getAttribute('y2') }))[0];
    const yTickX = m.querySelector('[class*=yAxis] text') ? m.querySelector('[class*=yAxis] text').getAttribute('x') : null;
    const legendWrap = m.parentElement.parentElement.querySelector('.recharts-legend-wrapper') || m.parentElement.querySelector('.recharts-legend-wrapper');
    return { axis: axis, firstH: firstH, firstV: firstV, yTickX: yTickX, legendWrapX: legendWrap ? Math.round(legendWrap.getBoundingClientRect().x) : null, legendWrapW: legendWrap ? Math.round(legendWrap.getBoundingClientRect().width) : null };
  })()`);
  console.log(`[att-main ${name}]`, JSON.stringify(main));
  // the date-range wrapper
  const dr = await evalOn(s, `(() => {
    const inp = [...document.querySelectorAll('input')].find(i => { const r = i.getBoundingClientRect(); return Math.round(r.x) === 885; });
    if (!inp) return null;
    const wrap = inp.parentElement;
    return { wrapTag: wrap.tagName, wrapCls: (wrap.getAttribute('class')||'').slice(0,80), html: wrap.outerHTML.replace(/\\s+/g,' ').slice(0, 600) };
  })()`);
  console.log(`[att-dr-wrap ${name}]`, JSON.stringify(dr));
}

for (const [name, s, base] of SIDES) {
  await open(s, base, "reports");
  const icons = await evalOn(s, `(() => {
    return [...document.querySelectorAll('[role=tab]')].slice(0,5).map(b => {
      const svg = b.querySelector('svg');
      return { txt: b.textContent.trim().slice(0,14), svgCls: svg ? (svg.getAttribute('class')||'') : null, svgW: svg ? Math.round(svg.getBoundingClientRect().width) : null };
    });
  })()`);
  console.log(`[rep-tabicons ${name}]`, JSON.stringify(icons));
  const fc = await evalOn(s, `(() => {
    const cards = [...document.querySelectorAll('[class*=rounded-xl][class*=border]')];
    const f = cards.find(c => (c.textContent||'').includes('Report Filters'));
    const kids = [...f.children].map(c => { const r = c.getBoundingClientRect(); return { cls: (c.getAttribute('class')||'').slice(0,70), y: Math.round(r.y), h: Math.round(r.height) }; });
    const inputs = [...f.querySelectorAll('input')].map(i => { const r = i.getBoundingClientRect(); return { type: i.type, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), val: i.value }; });
    return { kids: kids, inputs: inputs };
  })()`);
  console.log(`[rep-fc ${name}]`, JSON.stringify(fc));
  const titleRow = await evalOn(s, `(() => {
    const card = document.querySelector('[class*=rounded-xl][class*=border]');
    const header = [...card.children].find(c => (c.getAttribute('class')||'').includes('p-6'));
    const t = header.firstElementChild;
    return { html: t.outerHTML.replace(/\\s+/g,' ').slice(0, 400) };
  })()`);
  console.log(`[rep-titlerow ${name}]`, JSON.stringify(titleRow));
}
process.exit(0);
