#!/usr/bin/env node
// probe-r48-tiles.mjs — the compact-family tile contracts: per page, the
// first stat card's tile class + the svg's own class + the icon glyph
// name (the component rewrite: tile carries mb-3 + bg only, the icon
// carries w-5 h-5 text-{c}-600).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 250) }; } }

const baseRef = "https://eon.base44.app";
const READ = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return null;
  const grid = [...sc.querySelectorAll('div')].find(d => /^grid/.test(d.className || '') && /grid-cols-/.test(d.className || ''));
  if (!grid) return null;
  return [...grid.children].map(card => {
    const tile = card.querySelector('div[class*=rounded-xl]');
    const svg = tile ? tile.querySelector('svg') : null;
    return { tile: tile ? tile.className : null, svg: svg ? svg.getAttribute('class') : null };
  });
})()`;

for (const route of ["/attendancedashboard", "/surveyanalytics", "/analyticsdashboard", "/assetmanagement", "/compliancedashboard", "/payrollmodule", "/analytics"]) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 2300));
  const r = await evalOn("ref", READ);
  console.log(`\n### ${route}`);
  if (Array.isArray(r)) for (const c of r) console.log(`  ${JSON.stringify(c)}`);
  else console.log(`  ${JSON.stringify(r)}`);
}
