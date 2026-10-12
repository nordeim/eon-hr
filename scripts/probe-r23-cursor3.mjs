#!/usr/bin/env node
// probe-r23-cursor3.mjs — element-level resolution: (1) REF adoptedStyleSheets
// cursor-rule source, (2) per-element button/link dumps (text+cursor+userSelect+
// class-prefix) on /dashboard both apps, (3) tab census across all tab-rooted
// pages, (4) table th/td cursor on table-bearing routes, (5) input/textarea/
// select census with user-select + cursor.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; }
}

// 1. adoptedStyleSheets + shadow roots scan for cursor rules
const ADOPTED = `(() => {
  const hits = [];
  const walk = (rules, src) => {
    for (const r of rules) {
      if (r.cssRules) { walk(r.cssRules, src); continue; }
      const t = r.cssText || '';
      if (/cursor\\s*:|user-select\\s*:|::selection/.test(t)) hits.push({ src, css: t.replace(/\\s+/g, ' ').slice(0, 200) });
    }
  };
  let adopted = 0;
  try { adopted = (document.adoptedStyleSheets || []).length; for (const s of document.adoptedStyleSheets) walk(s.cssRules, 'adopted'); } catch (e) {}
  const styleTags = document.querySelectorAll('style').length;
  return JSON.stringify({ adopted, styleTags, hits: hits.slice(0, 20) });
})()`;
console.log("── 1. ADOPTED STYLESHEETS (REF then LOC) ──");
for (const [s, u] of [["ref", "https://eon.base44.app/dashboard"], ["loc", "http://127.0.0.1:3200/dashboard"]]) {
  run(`agent-browser --session ${s} open ${u}`);
  await new Promise(r => setTimeout(r, s === "ref" ? 3000 : 2600));
  console.log(`${s}: ` + JSON.stringify(await evalOn(s, ADOPTED)).slice(0, 800));
}

// 2. element-level dumps on /dashboard
const DUMP = `(() => {
  const out = [];
  for (const el of document.querySelectorAll('button, a')) {
    if (!el.offsetParent) continue;
    const cs = getComputedStyle(el);
    const t = (el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').slice(0, 22);
    out.push(t + '|' + cs.cursor.slice(0, 7) + '/' + cs.userSelect.slice(0, 4) + '|' + (el.getAttribute('class') || '').replace(/\\s+/g, '.').slice(0, 55));
  }
  return JSON.stringify(out);
})()`;
console.log("\n── 2. ELEMENT DUMP /dashboard (text|cursor/usel|class-prefix) ──");
const refD = await evalOn("ref", DUMP);
for (const d of refD) console.log("R " + d);
const locD = await evalOn("loc", DUMP);
for (const d of locD) console.log("L " + d);

// 3. tab census across tab-rooted pages
const TABS = `(() => {
  const tabs = [...document.querySelectorAll('[role=tab]')].map(t => {
    const cs = getComputedStyle(t);
    return { t: (t.textContent || '').trim().slice(0, 14), c: cs.cursor, us: cs.userSelect };
  });
  return JSON.stringify(tabs);
})()`;
console.log("\n── 3. TAB CENSUS (tab pages) ──");
for (const route of ["/settings", "/attendance", "/compliancedashboard", "/profile", "/leavemanagement", "/hrreports", "/staffrequests"]) {
  run(`agent-browser --session ref open https://eon.base44.app${route}`);
  await new Promise(r => setTimeout(r, 3000));
  const r1 = await evalOn("ref", TABS);
  run(`agent-browser --session loc open http://127.0.0.1:3200${route}`);
  await new Promise(r => setTimeout(r, 2600));
  const l1 = await evalOn("loc", TABS);
  const rs = JSON.stringify(r1), ls = JSON.stringify(l1);
  console.log(`${route}: ${rs === ls ? "TABS-MATCH" : "**DIFF**"}\n  R ${rs.slice(0, 300)}\n  L ${ls.slice(0, 300)}`);
}

// 4. table th/td/tr cursor on table routes
const TABLE = `(() => {
  const th = document.querySelector('table th'); const td = document.querySelector('table td');
  const read = el => el ? (getComputedStyle(el).cursor + '/' + getComputedStyle(el).userSelect) : 'absent';
  return JSON.stringify({ th: read(th), td: read(td) });
})()`;
console.log("\n── 4. TABLE CELLS ──");
for (const route of ["/employees", "/hrreports", "/attendancedashboard", "/loans"]) {
  run(`agent-browser --session ref open https://eon.base44.app${route}`);
  await new Promise(r => setTimeout(r, 3000));
  const r1 = await evalOn("ref", TABLE);
  run(`agent-browser --session loc open http://127.0.0.1:3200${route}`);
  await new Promise(r => setTimeout(r, 2600));
  const l1 = await evalOn("loc", TABLE);
  console.log(`${route}: REF=${JSON.stringify(r1)} LOC=${JSON.stringify(l1)}`);
}

// 5. input/textarea/select-trigger census
const FORMS = `(() => {
  const out = [];
  for (const el of document.querySelectorAll('input, textarea')) {
    if (!el.offsetParent) continue;
    const cs = getComputedStyle(el);
    out.push({ k: el.type || el.tagName.toLowerCase(), c: cs.cursor, us: cs.userSelect, caret: cs.caretColor });
  }
  const trig = document.querySelector('[role=combobox], button[aria-haspopup=listbox]');
  if (trig) { const cs = getComputedStyle(trig); out.push({ k: 'select-trigger', c: cs.cursor, us: cs.userSelect }); }
  return JSON.stringify(out.slice(0, 10));
})()`;
console.log("\n── 5. FORM CONTROLS ──");
for (const route of ["/employees", "/payroll", "/expenses"]) {
  run(`agent-browser --session ref open https://eon.base44.app${route}`);
  await new Promise(r => setTimeout(r, 3000));
  const r1 = await evalOn("ref", FORMS);
  run(`agent-browser --session loc open http://127.0.0.1:3200${route}`);
  await new Promise(r => setTimeout(r, 2600));
  const l1 = await evalOn("loc", FORMS);
  console.log(`${route}:\n  R ${JSON.stringify(r1).slice(0, 400)}\n  L ${JSON.stringify(l1).slice(0, 400)}`);
}
console.log("\nCURSOR3-DONE");
