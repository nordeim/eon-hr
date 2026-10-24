#!/usr/bin/env node
// r87-crossdiff-deep4.mjs — session-87 probe round 4 (decisive): the
// tenantsetup/payrollengine field outerHTML (the +8/+4 mystery), the loans
// page container below the topbar (+32px), the payrollai CardHeader
// (fixed selector), the shiftswap stat svg paths, and the sidebar
// All-Employees icon full composition (circle count — Users vs UsersRound).
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
const p = (label, o) => console.log(`${label}:`, JSON.stringify(o).slice(0, 850));

// 1. tenantsetup field outerHTML
const fieldHTML = `(() => {
  const f = [...document.querySelectorAll('form .space-y-2')][0];
  return f ? f.outerHTML.replace(/\\s+/g, ' ').slice(0, 620) : null;
})()`;
{ const r = await both("tenantsetup", fieldHTML); console.log("--- tenantsetup field HTML"); p("  REF", r.ref); p("  LOC", r.loc); }

// 2. payrollengine field outerHTML
const pfieldHTML = `(() => {
  const row = [...document.querySelectorAll('main .flex-wrap')].find(f => /Payroll Month/.test(f.textContent));
  const f = row ? row.querySelector('.space-y-1') : null;
  return f ? f.outerHTML.replace(/\\s+/g, ' ').slice(0, 620) : null;
})()`;
{ const r = await both("payrollengine", pfieldHTML); console.log("--- payrollengine field HTML"); p("  REF", r.ref); p("  LOC", r.loc); }

// 3. loans: the page container below the topbar
const loansBody = `(() => {
  const containers = [...document.querySelectorAll('main > div, main > *')];
  const pageWrap = containers.find(c => /Loan Management/.test(c.textContent));
  if (!pageWrap) return { found: false };
  const kids = [...pageWrap.children].slice(0, 4).map(c => ({ tag: c.tagName.toLowerCase(), cls: (typeof c.className === 'string' ? c.className : '').split(/\\s+/).slice(0, 6).join('.'), y: Math.round(c.getBoundingClientRect().y), h: Math.round(c.getBoundingClientRect().height), text: (c.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 26) }));
  return { found: true, wrapCls: (typeof pageWrap.className === 'string' ? pageWrap.className : '').slice(0, 90), wrapY: Math.round(pageWrap.getBoundingClientRect().y), kids };
})()`;
{ const r = await both("loans", loansBody); console.log("--- loans page wrap"); p("  REF", r.ref); p("  LOC", r.loc); }

// 4. payrollai CardHeader (fixed)
const aiHeader = `(() => {
  const card = [...document.querySelectorAll('main .rounded-xl')].find(c => /All Clear/.test(c.textContent));
  if (!card) return { found: false };
  const head = card.firstElementChild;
  const title = head ? head.querySelector('h3') : null;
  return { found: true, headCls: head ? (typeof head.className === 'string' ? head.className : '').slice(0, 90) : null, headH: head ? Math.round(head.getBoundingClientRect().height) : null,
    titleHTML: title ? title.outerHTML.replace(/\\s+/g, ' ').slice(0, 300) : null,
    headKids: head ? [...head.children].map(c => ({ tag: c.tagName.toLowerCase(), h: Math.round(c.getBoundingClientRect().height) })) : [] };
})()`;
{ const r = await both("payrollai", aiHeader); console.log("--- payrollai card header"); p("  REF", r.ref); p("  LOC", r.loc); }

// 5. shiftswap stat svg paths
const statSvg = `(() => {
  const grid = [...document.querySelectorAll('main .grid')].find(g => /Peer Approval/.test(g.textContent) && g.getBoundingClientRect().width > 400);
  const cell = grid.children[1];
  const svg = cell.querySelector('svg');
  const val = cell.querySelector('p');
  return { svgCls: svg ? svg.getAttribute('class') : null, svgW: svg ? Math.round(svg.getBoundingClientRect().width) : null,
    svgPaths: svg ? [...svg.querySelectorAll('path')].slice(0, 2).map(x => (x.getAttribute('d') || '').slice(0, 30)) : null,
    valX: val ? Math.round(val.getBoundingClientRect().x) : null };
})()`;
{ const r = await both("shiftswap", statSvg); console.log("--- shiftswap stat svg"); p("  REF", r.ref); p("  LOC", r.loc); }

// 6. sidebar All-Employees icon full composition
const navIcon = `(() => {
  const a = [...document.querySelectorAll('a')].find(x => x.textContent.trim() === 'All Employees' && x.getBoundingClientRect().x < 240);
  if (!a) return { found: false };
  const svg = a.querySelector('svg');
  return { found: true, svgCls: svg ? svg.getAttribute('class') : null, circles: svg ? [...svg.querySelectorAll('circle')].map(c => c.getAttribute('cx') + ',' + c.getAttribute('cy') + 'r' + c.getAttribute('r')) : null,
    paths: svg ? [...svg.querySelectorAll('path')].map(x => (x.getAttribute('d') || '').slice(0, 34)) : null };
})()`;
{ const r = await both("documenttracker", navIcon); console.log("--- sidebar All-Employees icon"); p("  REF", r.ref); p("  LOC", r.loc); }

// 7. interviewassistant: the REF's Notes card interior (the word counter)
const notesCard = `(() => {
  const card = [...document.querySelectorAll('main .rounded-xl')].find(c => /Interview Notes/.test(c.textContent));
  const head = card ? card.firstElementChild : null;
  return { headHTML: head ? head.outerHTML.replace(/\\s+/g, ' ').slice(0, 400) : null };
})()`;
{ const r = await both("interviewassistant", notesCard); console.log("--- interviewassistant notes header"); p("  REF", r.ref); p("  LOC", r.loc); }
process.exit(0);
