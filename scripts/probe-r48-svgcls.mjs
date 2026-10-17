#!/usr/bin/env node
// probe-r48-svgcls.mjs — the svg-class detail reads (svg.className is an
// SVGAnimatedString, invisible to the tree readers): the hrletters empty
// icon, the performancemanagement stat icons, the compliance empty P.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 250) }; } }

const baseRef = "https://eon.base44.app";
const reads = [
  ["/hrletters", `(() => { const h3 = [...document.querySelectorAll('main h3')].find(h => /No letter/.test(h.textContent||'')); if (!h3) return null; const wrap = h3.parentElement; const svg = wrap.querySelector('svg'); const p = h3.nextElementSibling; return { wrapCls: wrap.className, svgCls: svg ? svg.getAttribute('class') : null, svgW: svg ? Math.round(svg.getBoundingClientRect().width) : null, h3Cls: h3.className, pCls: p ? p.className : null, pText: p ? p.textContent.slice(0, 40) : null }; })()`],
  ["/performancemanagement", `(() => { const grid = [...document.querySelectorAll('main div')].find(d => /^grid/.test(d.className||'') && /grid-cols-4/.test(d.className)); if (!grid) return null; const card = grid.children[0]; const svg = card.querySelector('svg'); const ps = [...card.querySelectorAll('p')]; return { cardCls: card.className, svgCls: svg ? svg.getAttribute('class') : null, svgW: svg ? Math.round(svg.getBoundingClientRect().width) : null, svgParentCls: svg && svg.parentElement !== card ? svg.parentElement.className : 'direct', p0: ps[0] ? [ps[0].className, ps[0].textContent] : null, p1: ps[1] ? [ps[1].className, ps[1].textContent] : null }; })()`],
  ["/compliancedashboard", `(() => { const p = [...document.querySelectorAll('main p')].find(x => /No documents at risk/.test(x.textContent||'')); if (!p) return null; return { pCls: p.className, pTag: p.tagName, wrapCls: p.parentElement.className, wrapParentCls: p.parentElement.parentElement.className }; })()`],
  ["/announcements", `(() => { const el = [...document.querySelectorAll('main div')].find(d => /No announcements/.test(d.textContent||'') && d.children.length === 0); return el ? { cls: el.className, tag: el.tagName } : null; })()`],
];

for (const [route, expr] of reads) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 2400));
  const r = await evalOn("ref", expr);
  console.log(`### ${route}\n${JSON.stringify(r, null, 1)}`);
}
