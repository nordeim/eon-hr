#!/usr/bin/env node
// r87-crossdiff-deep2.mjs — session-87 probe round 2: the remaining
// candidates from the first deep pass — the chart censuses (surveyanalytics,
// attendancedashboard), the tenantsetup form children, the payrollengine
// filter row, the reports card border, the assets/organogram REF icon
// sources, the loans/companywall/payrollai above-card regions, and the
// documenttracker sidebar region.
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 500) }; } }

const REF = "ref87x", LOC = "loc87x", RB = "https://eon.base44.app", LB = "http://127.0.0.1:3200";
async function both(route, expr) {
  run(`agent-browser --session ${REF} open ${RB}/${route}`);
  run(`agent-browser --session ${LOC} open ${LB}/${route}`);
  await new Promise(r => setTimeout(r, 3000));
  return { ref: await evalOn(REF, expr), loc: await evalOn(LOC, expr) };
}
const p = (label, o) => console.log(`${label}:`, JSON.stringify(o).slice(0, 900));

// 1. chart censuses
const chartCensus = `(() => {
  const charts = [...document.querySelectorAll('.recharts-wrapper')];
  return { count: charts.length, charts: charts.map(c => { const r = c.getBoundingClientRect();
    const svg = c.querySelector('svg');
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
      bars: c.querySelectorAll('.recharts-bar-rectangle, path.recharts-rectangle').length,
      sectors: c.querySelectorAll('.recharts-pie-sector, .recharts-pie circle').length,
      lines: c.querySelectorAll('line').length,
      texts: [...c.querySelectorAll('text')].map(t => t.textContent.trim()).filter(Boolean).slice(0, 12),
      parent: c.parentElement ? (typeof c.parentElement.className === 'string' ? c.parentElement.className : '').split(/\\s+/).slice(0, 4).join('.') : '' };
  }) };
})()`;
for (const route of ["surveyanalytics", "attendancedashboard"]) {
  const r = await both(route, chartCensus);
  console.log(`--- ${route} charts`); p("  REF", r.ref); p("  LOC", r.loc);
}

// 2. tenantsetup form children
const formKids = `(() => {
  const form = document.querySelector('form');
  return { kids: [...form.children].map(c => ({ tag: c.tagName.toLowerCase(), cls: (typeof c.className === 'string' ? c.className : '').split(/\\s+/).slice(0, 5).join('.'), h: Math.round(c.getBoundingClientRect().height), text: (c.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 30) })) };
})()`;
{ const r = await both("tenantsetup", formKids); console.log("--- tenantsetup form children"); p("  REF", r.ref); p("  LOC", r.loc); }

// 3. payrollengine filter row children
const rowKids = `(() => {
  const row = [...document.querySelectorAll('main .flex-wrap')].find(f => /Payroll Month/.test(f.textContent));
  return { kids: [...row.children].map(c => ({ tag: c.tagName.toLowerCase(), cls: (typeof c.className === 'string' ? c.className : '').split(/\\s+/).slice(0, 5).join('.'), h: Math.round(c.getBoundingClientRect().height), text: (c.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 26) })) };
})()`;
{ const r = await both("payrollengine", rowKids); console.log("--- payrollengine filter row"); p("  REF", r.ref); p("  LOC", r.loc); }

// 4. reports card border + grid
const borderProbe = `(() => {
  const card = [...document.querySelectorAll('main .rounded-xl')].find(c => /Saudization/.test(c.textContent));
  const cs = getComputedStyle(card);
  const grid = card.parentElement;
  return { borderColor: cs.borderTopColor, borderWidth: cs.borderTopWidth, cardCls: (typeof card.className === 'string' ? card.className : '').slice(0, 110),
    gridCls: grid ? (typeof grid.className === 'string' ? grid.className : '').slice(0, 80) : null, gridKids: grid ? grid.children.length : 0 };
})()`;
{ const r = await both("reports", borderProbe); console.log("--- reports card border"); p("  REF", r.ref); p("  LOC", r.loc); }

// 5. assets + organogram: the REF's bare-svg icon source
const iconSrc = `(() => {
  const main = document.querySelector('main');
  const svgs = [...main.querySelectorAll('svg')].filter(s => Math.round(s.getBoundingClientRect().height) === 64);
  return svgs.slice(0, 2).map(s => ({ cls: s.getAttribute('class') || null, w: s.getAttribute('width'), h: s.getAttribute('height'), viewBox: s.getAttribute('viewBox'),
    inner: s.innerHTML.replace(/\\s+/g, ' ').slice(0, 260) }));
})()`;
for (const route of ["assets", "organogram", "loans", "companywall", "payrollai", "employeeportal"]) {
  const r = await both(route, iconSrc);
  console.log(`--- ${route} 64px icon`); p("  REF", r.ref); p("  LOC", r.loc);
}

// 6. loans/companywall/payrollai: the region above the empty card
const aboveCard = `(() => {
  const card = [...document.querySelectorAll('main .rounded-xl')].find(c => /No loans|No posts|All Clear/.test(c.textContent));
  if (!card) return { found: false };
  const prev = card.previousElementSibling;
  const r = card.getBoundingClientRect();
  return { found: true, cardY: Math.round(r.y), prev: prev ? { tag: prev.tagName.toLowerCase(), cls: (typeof prev.className === 'string' ? prev.className : '').split(/\\s+/).slice(0, 5).join('.'), h: Math.round(prev.getBoundingClientRect().height), text: (prev.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40) } : null };
})()`;
for (const route of ["loans", "companywall", "payrollai"]) {
  const r = await both(route, aboveCard);
  console.log(`--- ${route} above-card`); p("  REF", r.ref); p("  LOC", r.loc);
}

// 7. documenttracker: the sidebar region HTML (y192-288)
const sidebarProbe = `(() => {
  const links = [...document.querySelectorAll('a')].filter(a => { const r = a.getBoundingClientRect(); return r.x < 240 && r.y > 180 && r.y < 300 && r.width > 50; });
  return links.map(a => ({ text: a.textContent.trim().slice(0, 22), y: Math.round(a.getBoundingClientRect().y), cls: (typeof a.className === 'string' ? a.className : '').split(/\\s+/).slice(0, 7).join('.'),
    svgPaths: [...a.querySelectorAll('svg path')].slice(0, 2).map(p => (p.getAttribute('d') || '').slice(0, 30)),
    bg: getComputedStyle(a).backgroundColor, color: getComputedStyle(a).color, fw: getComputedStyle(a).fontWeight }));
})()`;
{ const r = await both("documenttracker", sidebarProbe); console.log("--- documenttracker sidebar y180-300"); p("  REF", r.ref); p("  LOC", r.loc); }

// 8. shiftswap second stat row (the triage's x641 vs x621)
const statRows = `(() => {
  const heads = [...document.querySelectorAll('h2, h3')].filter(h => /Peer Approval|My Requests/.test(h.textContent));
  return heads.map(h => { const r = h.getBoundingClientRect(); return { text: h.textContent.trim().slice(0, 24), x: Math.round(r.x), y: Math.round(r.y) }; });
})()`;
{ const r = await both("shiftswap", statRows); console.log("--- shiftswap section heads"); p("  REF", r.ref); p("  LOC", r.loc); }
process.exit(0);
