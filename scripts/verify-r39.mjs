#!/usr/bin/env node
// verify-r39.mjs — session-40 / parity round 39 live verification:
// the login pair (social type + theme-inert), the input family pair
// (loans dialog), the shell tree pair, the careers pair (zero-data +
// org view), and the tenantsetup mobile pair.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b) { results.push({ name, ref: a, loc: b, match: JSON.stringify(a) === JSON.stringify(b) }); }

// ---------- 1. the login pair ----------
for (const [label, session, base] of [["ref", "ref", baseRef], ["loc", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
}
const socialTypes = async (s) => evalOn(s, `(() => [...document.querySelectorAll('button')].filter(b => /google|microsoft|apple/i.test(b.textContent || '')).map(b => b.getAttribute('type')) )()`);
rec("login social types (null x3)", await socialTypes("ref"), await socialTypes("loc"));

const loginInputs = async (s) => evalOn(s, `(() => { const i = document.querySelector('input[type=email]'); const cs = getComputedStyle(i); return { h: Math.round(i.getBoundingClientRect().height), shadow: cs.boxShadow.slice(0, 60), cls: i.className.slice(0, 140) }; })()`);
rec("login input recipe (h48, no shadow)", await loginInputs("ref"), await loginInputs("loc"));

// theme-inert: arm darkMode, reload, html.dark must NOT apply
for (const s of ["ref", "loc"]) {
  await evalOn(s, `localStorage.setItem('darkMode','true'); 'armed'`);
  run(`agent-browser --session ${s} reload`);
  await new Promise(r => setTimeout(r, 2500));
}
const themeInert = async (s) => evalOn(s, `(() => ({ htmlDark: document.documentElement.classList.contains('dark'), stored: localStorage.getItem('darkMode') }))()`);
rec("login theme-inert (htmlDark false, stored true)", await themeInert("ref"), await themeInert("loc"));
// reset
for (const s of ["ref", "loc"]) await evalOn(s, `localStorage.setItem('darkMode','false'); 'reset'`);

// ---------- 2. the shell tree pair (desktop) ----------
for (const [label, session, base] of [["ref", "ref", baseRef], ["loc", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3500));
}
const shellTree = async (s) => evalOn(s, `(() => {
  const main = document.querySelector('main');
  const sc = [...main.children].find(c => (c.className || '').includes('overflow-auto'));
  const peer = [...document.querySelectorAll('div')].find(d => d.classList.contains('peer') && d.classList.contains('group'));
  const panel = peer ? peer.children[1] : null;
  const inner = panel ? panel.firstElementChild : null;
  const header = main.querySelector('header');
  return {
    mainCls: main.className,
    scrollerCls: sc ? sc.className : null,
    scrollerHasH1: !!(sc && sc.querySelector('h1')),
    headerInsideMain: !!header,
    headerFirst: main.firstElementChild === header,
    peerCls: peer ? peer.className : null,
    panelPos: panel ? getComputedStyle(panel).position : null,
    panelX: panel ? Math.round(panel.getBoundingClientRect().x) : null,
    panelW: panel ? Math.round(panel.getBoundingClientRect().width) : null,
    innerSurface: inner ? getComputedStyle(inner).backgroundColor : null,
    spacerW: peer ? Math.round(peer.children[0].getBoundingClientRect().width) : null,
    docScrollH: document.documentElement.scrollHeight
  };
})()`);
rec("shell tree (peer/scroller/header/surface)", await shellTree("ref"), await shellTree("loc"));

// ---------- 3. the input family pair (loans dialog) ----------
const loansInput = async (s, base) => {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} open ${base}/loans`);
  await new Promise(r => setTimeout(r, 3500));
  await evalOn(s, `(() => { const b = [...document.querySelectorAll('button')].find(b => /new loan/i.test(b.textContent || '')); if (b) b.click(); return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 1500));
  const r = await evalOn(s, `(() => {
    const dlg = [...document.querySelectorAll('[role=dialog]')][0];
    if (!dlg) return null;
    const inp = dlg.querySelector('input:not([type=hidden])');
    const ta = dlg.querySelector('textarea');
    const before = getComputedStyle(inp);
    const atRest = { shadow: before.boxShadow, bg: before.backgroundColor, h: Math.round(inp.getBoundingClientRect().height) };
    inp.focus();
    const focused = getComputedStyle(inp).boxShadow;
    inp.blur();
    return { atRest, focused, taCls: ta ? ta.className.slice(0, 120) : null };
  })()`);
  run(`agent-browser --session ${s} press Escape`);
  await new Promise(r => setTimeout(r, 600));
  return r;
};
rec("loans input family (shadow-sm/ring-1/transparent)", await loansInput("ref", baseRef), await loansInput("loc", baseLoc));

// ---------- 4. the careers pair ----------
const careers = async (s, base) => {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} open ${base}/careers`);
  await new Promise(r => setTimeout(r, 3500));
  return evalOn(s, `(() => {
    const input = document.querySelector('input');
    const h3 = [...document.querySelectorAll('h3')].find(h => /open position/i.test(h.textContent || ''));
    const card = [...document.querySelectorAll('div')].find(d => /rounded-xl/.test(d.className) && /No Open Positions/i.test(d.textContent || ''));
    return { inputH: input ? Math.round(input.getBoundingClientRect().height) : null, inputCls: input ? input.className.slice(-80) : null, countH3: h3 ? h3.textContent.trim() : null, zeroCard: !!card, docH: document.documentElement.scrollHeight };
  })()`);
};
rec("careers board (input h50, count, zero-card)", await careers("ref", baseRef), await careers("loc", baseLoc));

// ---------- 5. tenantsetup mobile pair ----------
const tenant = async (s, base) => {
  run(`agent-browser --session ${s} set viewport 390 844`);
  run(`agent-browser --session ${s} open ${base}/tenantsetup`);
  await new Promise(r => setTimeout(r, 3500));
  return evalOn(s, `(() => {
    const card = [...document.querySelectorAll('div')].find(d => d.className.includes('max-w-2xl') && d.getBoundingClientRect().width > 300);
    const input = document.querySelector('input:not([type=hidden])');
    return { cardX: card ? Math.round(card.getBoundingClientRect().x) : null, cardW: card ? Math.round(card.getBoundingClientRect().width) : null, inputH: input ? Math.round(input.getBoundingClientRect().height) : null };
  })()`);
};
rec("tenantsetup mobile (card x16 w358, input 36)", await tenant("ref", baseRef), await tenant("loc", baseLoc));

// reset viewports
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} set viewport 1440 900`);

console.log("\n===== RESULTS =====");
for (const r of results) {
  console.log(`${r.match ? "MATCH " : "DIFF  "} ${r.name}`);
  if (!r.match) {
    console.log(`  ref: ${JSON.stringify(r.ref).slice(0, 400)}`);
    console.log(`  loc: ${JSON.stringify(r.loc).slice(0, 400)}`);
  }
}
const m = results.filter(r => r.match).length;
console.log(`\n${m}/${results.length} MATCH`);
