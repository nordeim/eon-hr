#!/usr/bin/env node
// r87-crossdiff-deep3.mjs — session-87 probe round 3 (final): the
// tenantsetup field interior, the payrollengine field interior, the loans
// page-header region (the +32px), the payrollai CardHeader (the +8px), the
// shiftswap stat-card children, and the sidebar icon-region crop
// localization on documenttracker (the maxd-245 cluster).
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
const p = (label, o) => console.log(`${label}:`, JSON.stringify(o).slice(0, 800));

// 1. tenantsetup field children (the +8px per field)
const fieldKids = `(() => {
  const f = [...document.querySelectorAll('form .space-y-2')][0];
  return { kids: [...f.children].map(c => ({ tag: c.tagName.toLowerCase(), cls: (typeof c.className === 'string' ? c.className : '').split(/\\s+/).slice(0, 5).join('.'), h: Math.round(c.getBoundingClientRect().height), text: (c.textContent || '').trim().slice(0, 20) })), fieldH: Math.round(f.getBoundingClientRect().height) };
})()`;
{ const r = await both("tenantsetup", fieldKids); console.log("--- tenantsetup field"); p("  REF", r.ref); p("  LOC", r.loc); }

// 2. payrollengine field children (the +4px)
const pfieldKids = `(() => {
  const row = [...document.querySelectorAll('main .flex-wrap')].find(f => /Payroll Month/.test(f.textContent));
  const f = row.querySelector('.space-y-1');
  return { kids: [...f.children].map(c => ({ tag: c.tagName.toLowerCase(), cls: (typeof c.className === 'string' ? c.className : '').split(/\\s+/).slice(0, 6).join('.'), h: Math.round(c.getBoundingClientRect().height), text: (c.textContent || '').trim().slice(0, 18) })) };
})()`;
{ const r = await both("payrollengine", pfieldKids); console.log("--- payrollengine field"); p("  REF", r.ref); p("  LOC", r.loc); }

// 3. loans page-header region (the +32px)
const loansHeader = `(() => {
  const main = document.querySelector('main');
  const wrapper = main.firstElementChild;
  const kids = wrapper ? [...wrapper.children].map(c => ({ tag: c.tagName.toLowerCase(), cls: (typeof c.className === 'string' ? c.className : '').split(/\\s+/).slice(0, 6).join('.'), h: Math.round(c.getBoundingClientRect().height), y: Math.round(c.getBoundingClientRect().y), text: (c.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 30) })) : [];
  return { wrapperCls: wrapper ? (typeof wrapper.className === 'string' ? wrapper.className : '').slice(0, 80) : null, kids };
})()`;
{ const r = await both("loans", loansHeader); console.log("--- loans page wrapper"); p("  REF", r.ref); p("  LOC", r.loc); }

// 4. payrollai CardHeader (the +8px card height)
const aiHeader = `(() => {
  const card = [...document.querySelectorAll('main .rounded-xl')].find(c => /All Clear/.test(c.textContent));
  const head = card.querySelector('[class*=border-b], [class*=space-y-1.5]');
  const title = head ? head.querySelector('h3, .font-semibold, h2') : null;
  return { headCls: head ? (typeof head.className === 'string' ? head.className : '').slice(0, 90) : null, headH: head ? Math.round(head.getBoundingClientRect().height) : null,
    titleTag: title ? title.tagName.toLowerCase() : null, titleCls: title ? (typeof title.className === 'string' ? title.className : '').slice(0, 90) : null,
    titleH: title ? Math.round(title.getBoundingClientRect().height) : null,
    titleHTML: title ? title.outerHTML.replace(/\\s+/g, ' ').slice(0, 240) : null };
})()`;
{ const r = await both("payrollai", aiHeader); console.log("--- payrollai card header"); p("  REF", r.ref); p("  LOC", r.loc); }

// 5. shiftswap stat-card children (the icon question)
const statCard = `(() => {
  const grid = [...document.querySelectorAll('main .grid')].find(g => /Peer Approval/.test(g.textContent) && g.getBoundingClientRect().width > 400);
  const cell = grid.children[1];
  return { cellCls: (typeof cell.className === 'string' ? cell.className : '').slice(0, 80),
    kids: [...cell.children].map(c => ({ tag: c.tagName.toLowerCase(), cls: (typeof c.className === 'string' ? c.className : '').split(/\\s+/).slice(0, 6).join('.'), x: Math.round(c.getBoundingClientRect().x), w: Math.round(c.getBoundingClientRect().width), text: (c.textContent || '').trim().slice(0, 20), svg: !!c.querySelector('svg') })) };
})()`;
{ const r = await both("shiftswap", statCard); console.log("--- shiftswap stat card[1]"); p("  REF", r.ref); p("  LOC", r.loc); }

// 6. documenttracker: where exactly are the maxd-245 pixels (sidebar x48-96)?
const hotPixels = `(() => {
  const out = [];
  for (let y = 192; y < 288; y += 4) for (let x = 48; x < 96; x += 4) {
    const el = document.elementFromPoint(x, y);
    if (el && (el.tagName === 'svg' || el.tagName === 'path' || el.tagName === 'circle')) out.push({ x, y, tag: el.tagName.toLowerCase(), cls: (typeof el.className === 'string' ? el.className : '').slice(0, 60) });
  }
  const uniq = {}; out.forEach(o => { uniq[o.cls + o.tag] = uniq[o.cls + o.tag] || o; });
  return Object.values(uniq).slice(0, 6);
})()`;
{ const r = await both("documenttracker", hotPixels); console.log("--- documenttracker sidebar svg hits"); p("  REF", r.ref); p("  LOC", r.loc); }

// 7. the REF's /home nav-active state (the dynamicdashboard mapping reference)
const navActive = `(() => {
  const links = [...document.querySelectorAll('a')];
  const act = links.filter(a => { const bg = getComputedStyle(a).backgroundColor; const r = a.getBoundingClientRect(); return bg && bg !== 'rgba(0, 0, 0, 0)' && r.x < 240 && r.width > 50; });
  return act.map(a => ({ text: a.textContent.trim().slice(0, 20), bg: getComputedStyle(a).backgroundColor, y: Math.round(a.getBoundingClientRect().y) }));
})()`;
for (const route of ["home", "dynamicdashboard", "dashboard"]) {
  const r = await both(route, navActive);
  console.log(`--- ${route} desktop-nav active`); p("  REF", r.ref); p("  LOC", r.loc);
}
process.exit(0);
