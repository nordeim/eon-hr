#!/usr/bin/env node
// r88-surveyanalytics-deep2.mjs — closing the remaining recipe unknowns
// (split into small evals — the agent-browser argv limit trap).
import { execSync } from "node:child_process";
function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }

async function probe(session, base, label) {
  run(`agent-browser --session ${session} open ${base}/surveyanalytics`);
  await new Promise(r => setTimeout(r, 3000));
  console.log(`\n========== ${label} ==========`);
  // (1) legend HTML
  const legend = await evalOn(session, `(() => {
    const w = document.querySelector('.recharts-legend-wrapper');
    if (!w) return null;
    const items = [...w.querySelectorAll('.recharts-legend-item')].map(li => {
      const svg = li.querySelector('svg');
      const txt = li.textContent.trim();
      const r = li.getBoundingClientRect();
      return { txt: txt, iconFill: svg ? svg.querySelector('path,rect,line') ? (svg.querySelector('path,rect,line').getAttribute('fill') || svg.innerHTML.slice(0,80)) : svg.innerHTML.slice(0,100) : null, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    });
    const wr = w.getBoundingClientRect();
    return { items: items, wrapX: Math.round(wr.x), wrapY: Math.round(wr.y), wrapW: Math.round(wr.width), wrapH: Math.round(wr.height) };
  })()`);
  console.log("legend:", JSON.stringify(legend, null, 1));
  // (2) tick computed styles
  const tick = await evalOn(session, `(() => {
    const t = document.querySelector('.recharts-yAxis text');
    if (!t) return null;
    const cs = getComputedStyle(t);
    return { txt: t.textContent.trim(), fontSize: cs.fontSize, family: cs.fontFamily.slice(0,50), fill: cs.fill, anchor: cs.textAnchor, weight: cs.fontWeight, styleAttr: t.getAttribute('style') };
  })()`);
  console.log("tickStyle:", JSON.stringify(tick, null, 1));
  // (3) the wide chart's axis layer class (full)
  const layer = await evalOn(session, `(() => {
    const svgs = [...document.querySelectorAll('svg.recharts-surface')].filter(s => s.getBoundingClientRect().width > 1000);
    const wide = svgs[0];
    if (!wide) return null;
    const ax = [...wide.querySelectorAll('g[class*=cartesian-axis]')];
    return ax.map(a => a.getAttribute('class'));
  })()`);
  console.log("wideAxisLayers:", JSON.stringify(layer));
}

await probe("ref88s", "https://eon.base44.app", "REF");
await probe("loc88s", "http://127.0.0.1:3200", "LOC");
process.exit(0);
