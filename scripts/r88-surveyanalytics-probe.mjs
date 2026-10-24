#!/usr/bin/env node
// r88-surveyanalytics-probe.mjs — the cross-side chart-census probe for
// surveyanalytics (the r87 carried-forward queue's #1: the 3-chart
// reconfiguration — "the biggest remaining structural divergence"). At the
// shared zero-data state (both tenants 0 surveys/0 responses), census each
// chart card's svg interior member by member: the axis ticks (x/y texts),
// the gridlines, the axis lines, the bars/lines/curves, the legend, the
// container geometry — plus the card structure around it.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }

const repo = "/home/z/my-project/eon-hr";
// ensure the seeded standalone is up
if (run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) {
  const server = spawn("bash", ["-c",
    `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r88b.log 2>&1`],
    { stdio: "ignore" });
  server.unref();
  for (let i = 0; i < 120; i++) {
    if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) break;
    await new Promise(r => setTimeout(r, 500));
  }
  console.log("standalone re-booted");
}

async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 600));
  run(`agent-browser --session ${session} click 'button[type=submit]'`);
  await new Promise(r => setTimeout(r, 5000));
}
await auth("ref88s", "https://eon.base44.app");
await auth("loc88s", "http://127.0.0.1:3200");

const CENSUS = `(() => {
  const svgs = [...document.querySelectorAll('svg.recharts-surface')];
  const charts = svgs.map((svg, idx) => {
    let card = svg.parentElement;
    for (let i = 0; i < 8 && card && !(card.className && String(card.className).includes('rounded-')); i++) card = card.parentElement;
    const cardR = card ? card.getBoundingClientRect() : { y: 0, height: 0, width: 0 };
    const title = card ? card.querySelector('[class*=font-semibold]') : null;
    const svgR = svg.getBoundingClientRect();
    const q = (s) => [...svg.querySelectorAll(s)];
    const txt = (s) => q(s + ' text').map(t => t.textContent.trim());
    return {
      idx: idx, title: title ? title.textContent.trim() : null,
      y: Math.round(cardR.y), h: Math.round(cardR.height), w: Math.round(cardR.width),
      svgW: Math.round(svgR.width), svgH: Math.round(svgR.height),
      vx: q('.recharts-xAxis text').map(t => t.textContent.trim()),
      vy: q('.recharts-yAxis text').map(t => t.textContent.trim()),
      grid: q('.recharts-cartesian-grid line').length,
      axis: q('.recharts-cartesian-axis-line').length,
      bars: q('.recharts-bar-rectangle').length,
      curves: q('.recharts-line-curve').length,
      legend: q('.recharts-legend-item-text').map(t => t.textContent.trim()),
      texts: q('text').map(t => t.textContent.trim()).filter(Boolean).slice(0, 24)
    };
  });
  return { n: charts.length, charts: charts };
})()`;

for (const [name, session, base] of [["REF", "ref88s", "https://eon.base44.app"], ["LOC", "loc88s", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${session} open ${base}/surveyanalytics`);
  await new Promise(r => setTimeout(r, 3500));
  const read = await evalOn(session, CENSUS);
  console.log(`\n========== ${name} /surveyanalytics ==========`);
  console.log(JSON.stringify(read, null, 1));
}
process.exit(0);
