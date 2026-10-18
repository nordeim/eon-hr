#!/usr/bin/env node
// r56-probe6.mjs — round 6 (retry): decisive evidence for the mobile
// Company-grid divergence, in two smaller evals.
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const settle = (ms) => new Promise(r => setTimeout(r, ms));
function evalStr(expr) { return JSON.stringify(expr.split("\n").join(" ")); }
async function ev(session, expr) {
  const out = run(`agent-browser --session ${session} eval ${evalStr(expr)}`);
  try { return JSON.parse(JSON.parse(out.trim())); } catch { return "ERR:" + out.slice(0, 300); }
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const GRID = `JSON.stringify((() => {
  const g = [...document.querySelectorAll('main div')].filter(d => /grid-cols/.test((d.className||'')))[0];
  if (!g) return { noGrid: true };
  const cs = getComputedStyle(g);
  const rects = [...g.children].slice(0,4).map(c => { const r = c.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) }; });
  return { cls: (g.className||'').toString(), cols: cs.gridTemplateColumns, rects };
})())`;

const RULES = `JSON.stringify((() => {
  const out = [];
  for (const sheet of document.styleSheets) {
    let rs; try { rs = sheet.cssRules; } catch { continue; }
    for (const r of rs) {
      if (r.cssRules) { for (const r2 of r.cssRules) { if (r2.selectorText && r2.selectorText.includes('md\\\\:grid-cols-2')) out.push({ m: r.media ? r.media.mediaText : '?', sel: r2.selectorText.slice(0,40), css: r2.style.cssText.slice(0,50) }); } continue; }
      if (r.selectorText && r.selectorText.includes('grid-cols-2')) out.push({ m: 'NONE', sel: r.selectorText.slice(0,40), css: r.style.cssText.slice(0,50) });
    }
  }
  return out.slice(0,8);
})())`;

async function side(session, base, tag) {
  console.log(`\n===== ${tag} =====`);
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/settings`);
  await settle(3200);
  console.log("grid:", JSON.stringify(await ev(session, GRID)).slice(0, 700));
  console.log("rules:", JSON.stringify(await ev(session, RULES)).slice(0, 700));
}

await side("ref56", baseRef, "REF");
await side("loc", baseLoc, "LOC");
process.exit(0);
