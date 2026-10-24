#!/usr/bin/env node
// r87-crossdiff-deep.mjs — session-87: the deep probe pass over the
// triage's clone-authored candidates. Four question groups:
//   A. THE ACTIVE-NAV FAMILY — which sidebar item is active on each side
//      for the sub-pages (dynamicdashboard, allleaverequests,
//      documenttracker, taskmanager, requestreports, requestsettings)?
//   B. THE EMPTY-STATE FAMILY — the full card-interior structure both
//      sides (employeeportal, loans, companywall, assets, organogram,
//      payrollai).
//   C. CHART INTERIORS — surveyanalytics (the missing axis ticks),
//      attendancedashboard (the legend delta), hrreports.
//   D. SMALL GEOMETRY — shiftswap stats, requestsettings level grid,
//      tenantsetup form, payrollengine filter card, reports card,
//      payrollmodule empty text, interviewassistant extra card, chat
//      button icon, offboarding badge dot, shiftcalendar cell.
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } }

const REF = "ref87x", LOC = "loc87x", RB = "https://eon.base44.app", LB = "http://127.0.0.1:3200";
async function both(route, expr) {
  run(`agent-browser --session ${REF} open ${RB}/${route}`);
  run(`agent-browser --session ${LOC} open ${LB}/${route}`);
  await new Promise(r => setTimeout(r, 3000));
  const ref = await evalOn(REF, expr);
  const loc = await evalOn(LOC, expr);
  return { ref, loc };
}
const p = (label, o) => console.log(`${label}:`, JSON.stringify(o).slice(0, 700));

// ---------- A. THE ACTIVE-NAV FAMILY ----------
const activeNav = `(() => {
  const links = [...document.querySelectorAll('aside a, nav a')];
  const act = links.filter(a => {
    const cs = getComputedStyle(a);
    const bg = cs.backgroundColor;
    return bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
  }).map(a => ({ text: a.textContent.trim().slice(0, 24), bg: getComputedStyle(a).backgroundColor, cls: (typeof a.className === 'string' ? a.className : '').split(/\\s+/).slice(0, 8).join('.') }));
  return { activeCount: act.length, active: act.slice(0, 4) };
})()`;
console.log("========== A. ACTIVE-NAV FAMILY ==========");
for (const route of ["dynamicdashboard", "allleaverequests", "documenttracker", "taskmanager", "requestreports", "requestsettings"]) {
  const { ref, loc } = await both(route, activeNav);
  console.log(`--- ${route}`);
  p("  REF", ref); p("  LOC", loc);
}

// ---------- B. THE EMPTY-STATE FAMILY ----------
const emptyState = `(() => {
  const card = [...document.querySelectorAll('main .rounded-xl')].find(c => /No onboarding|No loans|No posts|No assets|No reporting|All Clear|no reporting/i.test(c.textContent));
  if (!card) return { found: false };
  const inner = card.querySelector('[class*=p-12], [class*=p-8], [class*=py-12]') || card;
  return { found: true, cardH: Math.round(card.getBoundingClientRect().height),
    innerCls: (typeof inner.className === 'string' ? inner.className : '').slice(0, 120),
    innerH: Math.round(inner.getBoundingClientRect().height),
    children: [...inner.children].map(c => ({ tag: c.tagName.toLowerCase(), cls: (typeof c.className === 'string' ? c.className : '').split(/\\s+/).slice(0, 6).join('.'), h: Math.round(c.getBoundingClientRect().height), svg: c.querySelector('svg') ? (c.querySelector('svg').getAttribute('class') || '') + '|' + Math.round(c.querySelector('svg').getBoundingClientRect().width) : null, text: (c.textContent || '').trim().slice(0, 40) })) };
})()`;
console.log("\n========== B. EMPTY-STATE FAMILY ==========");
for (const route of ["employeeportal", "loans", "companywall", "assets", "organogram", "payrollai"]) {
  const { ref, loc } = await both(route, emptyState);
  console.log(`--- ${route}`);
  p("  REF", ref); p("  LOC", loc);
}

// ---------- C. CHART INTERIORS ----------
console.log("\n========== C. CHART INTERIORS ==========");
{
  const tickProbe = `(() => {
    const svg = document.querySelector('.recharts-wrapper svg');
    if (!svg) return { found: false };
    const texts = [...svg.querySelectorAll('text')].map(t => t.textContent.trim()).filter(Boolean).slice(0, 24);
    const legend = document.querySelector('.recharts-legend-wrapper, [class*=legend]');
    const lines = [...svg.querySelectorAll('line')].length;
    const bars = [...svg.querySelectorAll('path.recharts-rectangle, .recharts-bar-rectangle')].length;
    return { found: true, texts, legend: legend ? legend.textContent.trim().slice(0, 60) : null, lines, bars, w: Math.round(svg.getBoundingClientRect().width), h: Math.round(svg.getBoundingClientRect().height) };
  })()`;
  for (const route of ["surveyanalytics", "attendancedashboard", "hrreports"]) {
    const { ref, loc } = await both(route, tickProbe);
    console.log(`--- ${route}`);
    p("  REF", ref); p("  LOC", loc);
  }
}

// ---------- D. SMALL GEOMETRY ----------
console.log("\n========== D. SMALL GEOMETRY ==========");
{
  // shiftswap: the stats row geometry
  const statsRow = `(() => {
    const grid = [...document.querySelectorAll('main .grid')].find(g => /Peer Approval/.test(g.textContent) && g.getBoundingClientRect().width > 400);
    if (!grid) return { found: false };
    return { found: true, cls: (typeof grid.className === 'string' ? grid.className : '').slice(0, 100), x: Math.round(grid.getBoundingClientRect().x), w: Math.round(grid.getBoundingClientRect().width),
      cells: [...grid.children].map(c => ({ x: Math.round(c.getBoundingClientRect().x), w: Math.round(c.getBoundingClientRect().width), text: c.textContent.trim().slice(0, 22) })) };
  })()`;
  let r = await both("shiftswap", statsRow);
  console.log("--- shiftswap stats"); p("  REF", r.ref); p("  LOC", r.loc);

  // requestsettings: the level grid + Add button
  const levelGrid = `(() => {
    const grid = [...document.querySelectorAll('main .grid')].find(g => /Level 1/.test(g.textContent));
    if (!grid) return { found: false };
    const add = [...grid.querySelectorAll('button')].map(b => ({ text: b.textContent.trim(), bg: getComputedStyle(b).backgroundColor, cls: (typeof b.className === 'string' ? b.className : '').split(/\\s+/).slice(0, 7).join('.'), x: Math.round(b.getBoundingClientRect().x), w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height) }));
    return { found: true, cls: (typeof grid.className === 'string' ? grid.className : '').slice(0, 100), x: Math.round(grid.getBoundingClientRect().x), w: Math.round(grid.getBoundingClientRect().width), buttons: add };
  })()`;
  r = await both("requestsettings", levelGrid);
  console.log("--- requestsettings level grid"); p("  REF", r.ref); p("  LOC", r.loc);

  // tenantsetup: the form field structure
  const formProbe = `(() => {
    const form = document.querySelector('form');
    if (!form) return { found: false };
    return { found: true, formCls: (typeof form.className === 'string' ? form.className : '').slice(0, 80), h: Math.round(form.getBoundingClientRect().height),
      fields: [...form.querySelectorAll('label')].map(l => ({ text: l.textContent.trim().slice(0, 20), cls: (typeof l.className === 'string' ? l.className : '').split(/\\s+/).slice(0, 5).join('.'), h: Math.round(l.getBoundingClientRect().height) })),
      inputs: [...form.querySelectorAll('input')].map(i => ({ cls: (typeof i.className === 'string' ? i.className : '').split(/\\s+/).slice(0, 6).join('.'), h: Math.round(i.getBoundingClientRect().height) })) };
  })()`;
  r = await both("tenantsetup", formProbe);
  console.log("--- tenantsetup form"); p("  REF", r.ref); p("  LOC", r.loc);

  // payrollengine: the filter card interior
  const filterCard = `(() => {
    const card = [...document.querySelectorAll('main .rounded-xl')].find(c => /Payroll Month/.test(c.textContent));
    if (!card) return { found: false };
    const inner = card.firstElementChild;
    return { found: true, h: Math.round(card.getBoundingClientRect().height), innerCls: inner ? (typeof inner.className === 'string' ? inner.className : '').slice(0, 60) : null,
      children: inner ? [...inner.children].map(c => ({ tag: c.tagName.toLowerCase(), cls: (typeof c.className === 'string' ? c.className : '').split(/\\s+/).slice(0, 5).join('.'), h: Math.round(c.getBoundingClientRect().height), text: c.textContent.trim().slice(0, 24) })) : [] };
  })()`;
  r = await both("payrollengine", filterCard);
  console.log("--- payrollengine filter card"); p("  REF", r.ref); p("  LOC", r.loc);

  // reports: the card structure (p-4 on card vs inner)
  const cardProbe = `(() => {
    const card = [...document.querySelectorAll('main .rounded-xl')].find(c => /Saudization/.test(c.textContent));
    if (!card) return { found: false };
    const r = card.getBoundingClientRect();
    return { found: true, cardCls: (typeof card.className === 'string' ? card.className : '').slice(0, 110), h: Math.round(r.height), w: Math.round(r.width),
      child: card.firstElementChild ? { tag: card.firstElementChild.tagName.toLowerCase(), cls: (typeof card.firstElementChild.className === 'string' ? card.firstElementChild.className : '').slice(0, 60), h: Math.round(card.firstElementChild.getBoundingClientRect().height) } : null };
  })()`;
  r = await both("reports", cardProbe);
  console.log("--- reports Saudization card"); p("  REF", r.ref); p("  LOC", r.loc);

  // payrollmodule: the empty-state full text
  const emptyText = `(() => {
    const td = [...document.querySelectorAll('td')].find(t => /No payslips/.test(t.textContent));
    return td ? { text: td.textContent.trim(), cls: (typeof td.className === 'string' ? td.className : '').slice(0, 80) } : { found: false };
  })()`;
  r = await both("payrollmodule", emptyText);
  console.log("--- payrollmodule empty text"); p("  REF", r.ref); p("  LOC", r.loc);

  // interviewassistant: the at-rest cards
  const cardsProbe = `(() => {
    const cards = [...document.querySelectorAll('main .rounded-xl')];
    return { count: cards.length, cards: cards.map(c => ({ h: Math.round(c.getBoundingClientRect().height), head: (c.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 46) })) };
  })()`;
  r = await both("interviewassistant", cardsProbe);
  console.log("--- interviewassistant cards"); p("  REF", r.ref); p("  LOC", r.loc);

  // chat: the header button icon
  const chatBtn = `(() => {
    const btn = [...document.querySelectorAll('main button')].find(b => b.getBoundingClientRect().width <= 48 && b.getBoundingClientRect().height <= 40 && getComputedStyle(b).backgroundColor.includes('37, 99, 235'));
    if (!btn) return { found: false };
    const svg = btn.querySelector('svg');
    return { found: true, btnCls: (typeof btn.className === 'string' ? btn.className : '').slice(0, 90), w: Math.round(btn.getBoundingClientRect().width),
      svg: svg ? { w: Math.round(svg.getBoundingClientRect().width), paths: [...svg.querySelectorAll('path')].slice(0, 3).map(p => (p.getAttribute('d') || '').slice(0, 40)) } : null };
  })()`;
  r = await both("chat", chatBtn);
  console.log("--- chat header button"); p("  REF", r.ref); p("  LOC", r.loc);

  // offboarding: the kicker icon + badge dot
  const kickerProbe = `(() => {
    const svgs = [...document.querySelectorAll('main svg')].filter(s => s.getBoundingClientRect().width <= 20 && s.getBoundingClientRect().y < 100);
    return svgs.slice(0, 3).map(s => ({ w: Math.round(s.getBoundingClientRect().width), x: Math.round(s.getBoundingClientRect().x), y: Math.round(s.getBoundingClientRect().y), circles: s.querySelectorAll('circle').length, paths: [...s.querySelectorAll('path')].slice(0, 2).map(p => (p.getAttribute('d') || '').slice(0, 36)) }));
  })()`;
  r = await both("offboarding", kickerProbe);
  console.log("--- offboarding kicker icons"); p("  REF", r.ref); p("  LOC", r.loc);

  // shiftcalendar: the calendar cell + assign label
  const calProbe = `(() => {
    const td = [...document.querySelectorAll('td')].find(t => /assign/.test(t.textContent) && t.getBoundingClientRect().width < 200);
    if (!td) return { found: false };
    const r = td.getBoundingClientRect();
    return { found: true, cls: (typeof td.className === 'string' ? td.className : '').slice(0, 110), bg: getComputedStyle(td).backgroundColor, w: Math.round(r.width), h: Math.round(r.height), text: td.textContent.trim(), inner: td.firstElementChild ? { tag: td.firstElementChild.tagName.toLowerCase(), cls: (typeof td.firstElementChild.className === 'string' ? td.firstElementChild.className : '').slice(0, 80), text: td.firstElementChild.textContent.trim().slice(0, 30) } : null };
  })()`;
  r = await both("shiftcalendar", calProbe);
  console.log("--- shiftcalendar cell"); p("  REF", r.ref); p("  LOC", r.loc);
}
process.exit(0);
