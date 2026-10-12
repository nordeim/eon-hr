#!/usr/bin/env node
// probe-r23-cursor.mjs — session-24 / parity round 23: the FIRST cursor +
// selection/caret dimension audit. Never swept (session_38 next-steps).
// Stage 1: static CSSOM enumeration of cursor:/caret-color/::selection rules
//          (constructor-agnostic @layer recursion — the r22 lesson)
// Stage 2: live DOM census of computed cursor + caret-color + user-select on
//          interactive elements across /dashboard /employees /settings /payroll
// Stage 3: empirical — read the ::selection rules + measure an actual
//          selection rectangle on both apps (Range + getClientRects)
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; }
}

// ---- Stage 1: static CSSOM enumeration (cursor / caret / ::selection) ----
const CSSOM = `(() => {
  const cursorRules = {}; const selRules = []; let caretRules = {};
  const walk = (rules, layer) => {
    for (const r of rules) {
      if (r.cssRules) { walk(r.cssRules, layer.concat(r.name || r.conditionText || r.constructor.name)); continue; }
      if (!r.selectorText) continue;
      if (r.selectorText.includes('::selection') || r.selectorText.includes('::-moz-selection')) { selRules.push({ sel: r.selectorText, css: (r.style ? r.style.cssText : '').slice(0, 120) }); continue; }
      const st = r.style; if (!st) continue;
      const c = st.getPropertyValue('cursor'); const cc = st.getPropertyValue('caret-color');
      if (c) { cursorRules[c] = (cursorRules[c] || 0) + 1; }
      if (cc) { caretRules[r.selectorText.slice(0, 60)] = cc; }
    }
  };
  for (const sheet of document.styleSheets) { try { walk(sheet.cssRules, []); } catch (e) {} }
  return JSON.stringify({ cursorRules, caretRules, selRules });
})()`;

console.log("── STAGE 1: static CSSOM (cursor rules / caret-color / ::selection) ──");
for (const [tag, session, url] of [["REF", "ref", "https://eon.base44.app/dashboard"], ["LOC", "loc", "http://127.0.0.1:3200/dashboard"]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${url}`);
  await new Promise(r => setTimeout(r, 3200));
  const res = await evalOn(session, CSSOM);
  console.log(`${tag}: cursor=${JSON.stringify(res.cursorRules)} caret=${JSON.stringify(res.caretRules).slice(0, 400)}`);
  console.log(`${tag} ::selection=${JSON.stringify(res.selRules)}`);
}

// ---- Stage 2: live DOM census on 4 surfaces ----
const CENSUS = `(() => {
  const pick = el => {
    const cs = getComputedStyle(el);
    return { c: cs.cursor, us: cs.userSelect };
  };
  const out = {};
  const groups = {};
  const sel = 'button, a, input, textarea, select, [role=tab], [role=switch], [role=slider], [role=option], label, summary, tr';
  for (const el of document.querySelectorAll(sel)) {
    if (!el.offsetParent && el.getClientRects().length === 0) continue;
    const t = el.tagName.toLowerCase() + (el.getAttribute('role') ? '[' + el.getAttribute('role') + ']' : '');
    const r = pick(el);
    const disabled = el.disabled || el.getAttribute('aria-disabled') === 'true';
    const key = t + '|' + r.c + '|' + r.us + '|' + (disabled ? 'dis' : 'en');
    groups[key] = (groups[key] || 0) + 1;
  }
  const textInputs = [];
  for (const el of document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]), textarea')) {
    if (!el.offsetParent) continue;
    const cs = getComputedStyle(el);
    textInputs.push({ type: el.type || 'textarea', caret: cs.caretColor, ph: (el.getAttribute('placeholder') || '').slice(0, 20) });
  }
  return JSON.stringify({ groups, textInputs: textInputs.slice(0, 8) });
})()`;

console.log("\n── STAGE 2: live DOM census (groups: tag|cursor|userSelect|state) ──");
const SURFACES = ["/dashboard", "/employees", "/settings", "/payroll"];
for (const route of SURFACES) {
  run(`agent-browser --session ref open https://eon.base44.app${route}`);
  await new Promise(r => setTimeout(r, 3000));
  const ref = await evalOn("ref", CENSUS);
  run(`agent-browser --session loc open http://127.0.0.1:3200${route}`);
  await new Promise(r => setTimeout(r, 2800));
  const loc = await evalOn("loc", CENSUS);
  const refK = Object.keys(ref.groups || {}).sort(); const locK = Object.keys(loc.groups || {}).sort();
  const onlyRef = refK.filter(k => !locK.includes(k)); const onlyLoc = locK.filter(k => !refK.includes(k));
  console.log(`\n${route}: REF groups=${refK.length} LOC groups=${locK.length}`);
  if (onlyRef.length) console.log(`  only-REF: ${onlyRef.map(k => k + ' x' + ref.groups[k]).join('; ')}`);
  if (onlyLoc.length) console.log(`  only-LOC: ${onlyLoc.map(k => k + ' x' + loc.groups[k]).join('; ')}`);
  if (!onlyRef.length && !onlyLoc.length) console.log("  groups MATCH");
  const refT = JSON.stringify((ref.textInputs || []).map(t => t.caret));
  const locT = JSON.stringify((loc.textInputs || []).map(t => t.caret));
  console.log(`  caret-colors REF=${refT} LOC=${locT}`);
}

// ---- Stage 3: empirical ::selection application + disabled cursors ----
const EMPIRICAL = `(() => {
  const h1 = document.querySelector('h1'); const out = {};
  if (h1) {
    const range = document.createRange(); range.selectNodeContents(h1);
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    out.selCount = sel.rangeCount;
    out.selText = String(sel).slice(0, 20);
    sel.removeAllRanges();
  }
  const dis = [...document.querySelectorAll('button:disabled, [aria-disabled=true], input:disabled')].slice(0, 4);
  out.disabledCursors = dis.map(d => getComputedStyle(d).cursor);
  const tables = document.querySelectorAll('table').length;
  out.tables = tables;
  return JSON.stringify(out);
})()`;

console.log("\n── STAGE 3: empirical selection + disabled cursors ──");
for (const route of ["/dashboard", "/employees"]) {
  run(`agent-browser --session ref open https://eon.base44.app${route}`);
  await new Promise(r => setTimeout(r, 3000));
  const ref = await evalOn("ref", EMPIRICAL);
  run(`agent-browser --session loc open http://127.0.0.1:3200${route}`);
  await new Promise(r => setTimeout(r, 2800));
  const loc = await evalOn("loc", EMPIRICAL);
  console.log(`${route}: REF=${JSON.stringify(ref)} LOC=${JSON.stringify(loc)}`);
}
console.log("\nCURSOR-AUDIT-DONE");
