#!/usr/bin/env node
// probe-r23-cursor2.mjs — follow-up: find REF's cursor/user-select SOURCE rules
// (cssText scan incl. inside layers) + full census dumps to resolve the link
// group question + tab/switch/checkbox/radio/kanban surface census.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; }
}

// 1. scan every rule whose cssText mentions cursor or user-select
const SCAN = `(() => {
  const hits = [];
  const walk = (rules, ctx) => {
    for (const r of rules) {
      if (r.cssRules) { walk(r.cssRules, ctx.concat(r.name || (r.conditionText || '').slice(0, 30) || r.constructor.name)); continue; }
      const t = r.cssText || '';
      if (/cursor\\s*:/.test(t) || /user-select\\s*:/.test(t) || /::selection/.test(t)) {
        hits.push({ ctx: ctx.join('>'), sel: (r.selectorText || t.slice(0, 60)).slice(0, 90), css: t.replace(/\\s+/g, ' ').slice(0, 160) });
      }
    }
  };
  for (const sheet of document.styleSheets) { try { walk(sheet.cssRules, []); } catch (e) {} }
  return JSON.stringify(hits.slice(0, 40));
})()`;

console.log("── REF cursor/user-select/selection rules ──");
run("agent-browser --session ref set viewport 1440 900");
run("agent-browser --session ref open https://eon.base44.app/dashboard");
await new Promise(r => setTimeout(r, 3200));
const refHits = await evalOn("ref", SCAN);
for (const h of refHits) console.log(`  [${h.ctx}] ${h.sel} :: ${h.css}`);
console.log("── LOC cursor/user-select/selection rules ──");
run("agent-browser --session loc open http://127.0.0.1:3200/dashboard");
await new Promise(r => setTimeout(r, 2800));
const locHits = await evalOn("loc", SCAN);
for (const h of locHits) console.log(`  [${h.ctx}] ${h.sel} :: ${h.css}`);

// 2. full group dumps on /dashboard + link detail
const FULL = `(() => {
  const groups = {};
  for (const el of document.querySelectorAll('button, a, input, [role=tab], [role=switch], [role=slider], label, summary')) {
    if (!el.offsetParent && el.getClientRects().length === 0) continue;
    const cs = getComputedStyle(el);
    const key = el.tagName.toLowerCase() + (el.getAttribute('role') ? '[' + el.getAttribute('role') + ']' : '') + '|' + cs.cursor + '|' + cs.userSelect;
    groups[key] = (groups[key] || 0) + 1;
  }
  const links = [...document.querySelectorAll('a')].filter(a => a.offsetParent).slice(0, 12).map(a => {
    const cs = getComputedStyle(a);
    return (a.textContent || '').trim().slice(0, 18) + '->' + cs.cursor + '/' + cs.userSelect;
  });
  return JSON.stringify({ groups, links });
})()`;
console.log("\n── FULL GROUPS /dashboard ──");
const refF = await evalOn("ref", FULL);
const locF = await evalOn("loc", FULL);
console.log("REF groups: " + JSON.stringify(refF.groups));
console.log("REF links:  " + JSON.stringify(refF.links));
console.log("LOC groups: " + JSON.stringify(locF.groups));
console.log("LOC links:  " + JSON.stringify(locF.links));

// 3. deeper surfaces: tabs, switches, checkboxes, kanban cards, table rows
const DEEP = `(() => {
  const out = [];
  const probe = (sel, label) => {
    const el = document.querySelector(sel);
    if (!el) { out.push(label + ':absent'); return; }
    const cs = getComputedStyle(el);
    out.push(label + ':' + cs.cursor + '/' + cs.userSelect + (el.tagName === 'INPUT' ? '/caret=' + cs.caretColor : ''));
  };
  probe('[role=tab]', 'tab');
  probe('[role=switch]', 'switch');
  probe('input[type=checkbox]', 'checkbox');
  probe('input[type=radio]', 'radio');
  probe('table tr', 'tr');
  probe('table th', 'th');
  probe('table td', 'td');
  probe('[draggable=true]', 'draggable');
  return JSON.stringify(out);
})()`;
console.log("\n── DEEP SURFACES ──");
for (const [route, extra] of [["/settings", ""], ["/attendance", ""], ["/recruitmentkanban", ""]]) {
  run(`agent-browser --session ref open https://eon.base44.app${route}`);
  await new Promise(r => setTimeout(r, 3000));
  const r1 = await evalOn("ref", DEEP);
  run(`agent-browser --session loc open http://127.0.0.1:3200${route}`);
  await new Promise(r => setTimeout(r, 2800));
  const l1 = await evalOn("loc", DEEP);
  console.log(`${route}:\n  REF ${JSON.stringify(r1)}\n  LOC ${JSON.stringify(l1)}`);
}
console.log("\nCURSOR2-DONE");
