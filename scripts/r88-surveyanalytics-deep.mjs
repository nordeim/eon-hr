#!/usr/bin/env node
// r88-surveyanalytics-deep.mjs — the deep raw-svg probe for surveyanalytics:
// innerHTML census of each chart svg (grid line geometry, axis line
// geometry, tick text coordinates/fontSize/fill, defs) to extract the
// exact recharts recipes at the shared zero-data state.
import { execSync } from "node:child_process";
function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }

const RAW = `(() => {
  const svgs = [...document.querySelectorAll('svg.recharts-surface')].filter(s => s.getBoundingClientRect().width > 100);
  return svgs.map((svg, i) => {
    const g = (sel) => [...svg.querySelectorAll(sel)].map(el => ({
      cls: String(el.getAttribute('class')||'').slice(0,40),
      d: (el.getAttribute('d')||'').slice(0,80),
      x1: el.getAttribute('x1'), y1: el.getAttribute('y1'), x2: el.getAttribute('x2'), y2: el.getAttribute('y2'),
      stroke: (el.getAttribute('stroke')||'').slice(0,30), dash: el.getAttribute('stroke-dasharray')
    }));
    const texts = [...svg.querySelectorAll('text')].map(t => {
      const tr = svg.createSVGPoint ? null : null;
      const m = t.getAttribute('transform') || '';
      return { t: t.textContent.trim(), x: t.getAttribute('x'), y: t.getAttribute('y'), m: m.slice(0,40), fs: t.getAttribute('font-size'), fill: (t.getAttribute('fill')||'').slice(0,30) };
    });
    const wrapper = svg.parentElement;
    return {
      i: i, vb: svg.getAttribute('viewBox'),
      surfaceCls: String(svg.getAttribute('class')||''),
      wrapperCls: String(wrapper.getAttribute('class')||'').slice(0,60),
      wrapperH: Math.round(wrapper.getBoundingClientRect().height),
      gridLines: g('.recharts-cartesian-grid line'),
      axisLines: g('.recharts-cartesian-axis-line'),
      ticks: g('.recharts-cartesian-axis-tick line'),
      texts: texts,
      childGs: [...svg.children].map(c => String(c.getAttribute('class')||c.tagName).slice(0,50)),
      bars: g('.recharts-bar-rectangle path'),
      curves: g('.recharts-line-curve')
    };
  });
})()`;

for (const [name, session, base] of [["REF", "ref88s", "https://eon.base44.app"], ["LOC", "loc88s", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${session} open ${base}/surveyanalytics`);
  await new Promise(r => setTimeout(r, 3000));
  const read = await evalOn(session, RAW);
  console.log(`\n========== ${name} RAW ==========`);
  console.log(JSON.stringify(read, null, 1));
}
process.exit(0);
