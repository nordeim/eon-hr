#!/usr/bin/env node
// probe-r23-cursor5.mjs — definitive: (A) full ancestor chains (identify the
// user-select:none AUTHORS on REF), (B) switch/checkbox prints fixed, (C) select
// options retry, (D) kanban fixed, (E) /settings vs /attendance tab context.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; }
}

// A. full ancestor chain for representative none-elements
const CHAIN2 = `(() => {
  const out = [];
  const chainOf = (el) => {
    const chain = [];
    let p = el;
    for (let i = 0; i < 10 && p; i++) {
      chain.push({ d: i, tag: p.tagName.toLowerCase(), cls: String(p.getAttribute('class') || '').replace(/\\s+/g, '.').slice(0, 60), us: getComputedStyle(p).userSelect });
      p = p.parentElement;
    }
    return chain;
  };
  const targets = [];
  const addT = (label, sel) => { const el = [...document.querySelectorAll(sel)].find(e => e.offsetParent && getComputedStyle(e).userSelect === 'none'); if (el) targets.push([label, el]); };
  addT('quickTile', 'a');
  addT('viewAll', 'a');
  addT('customizeBtn', 'button');
  addT('iconBtn', 'button');
  addT('searchInput', 'input');
  addT('tab', '[role=tab]');
  for (const [label, el] of targets.slice(0, 8)) out.push({ label, chain: chainOf(el) });
  return JSON.stringify(out);
})()`;
console.log("── A. FULL ANCESTOR CHAINS (REF) ──");
for (const route of ["/dashboard", "/employees", "/attendance"]) {
  run(`agent-browser --session ref open https://eon.base44.app${route}`);
  await new Promise(r => setTimeout(r, 3200));
  const res = await evalOn("ref", CHAIN2);
  console.log(`\nREF ${route}:`);
  for (const t of res) {
    console.log(`  [${t.label}]`);
    for (const c of t.chain.slice(0, 9)) console.log(`    d${c.d} <${c.tag}> ${c.cls.slice(0, 52)} → us=${c.us}`);
  }
}

// B. switch/checkbox prints fixed
const SW = `(() => {
  const out = {};
  for (const [k, sel] of [['switch', '[role=switch]'], ['checkbox', 'input[type=checkbox]'], ['switchLabel', '[role=switch] + label, label']]) {
    const el = document.querySelector(sel);
    if (el && el.offsetParent) { const cs = getComputedStyle(el); out[k] = cs.cursor + '/' + cs.userSelect; }
  }
  return JSON.stringify(out);
})()`;
console.log("\n── B. SWITCH/CHECKBOX ──");
for (const route of ["/notificationpreferences", "/securitysettings", "/settings"]) {
  run(`agent-browser --session ref open https://eon.base44.app${route}`);
  await new Promise(r => setTimeout(r, 3000));
  const r1 = await evalOn("ref", SW);
  run(`agent-browser --session loc open http://127.0.0.1:3200${route}`);
  await new Promise(r => setTimeout(r, 2600));
  const l1 = await evalOn("loc", SW);
  console.log(`${route}: REF=${JSON.stringify(r1)} LOC=${JSON.stringify(l1)}`);
}

// C. select options — better trigger
console.log("\n── C. SELECT OPTIONS ──");
for (const [tag, s] of [["REF", "ref"], ["LOC", "loc"]]) {
  const base = s === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} open ${base}/employees`);
  await new Promise(r => setTimeout(r, s === "ref" ? 3200 : 2800));
  const clicked = await evalOn(s, `(() => { const trig = [...document.querySelectorAll('button')].find(b => (b.textContent || '').includes('All Departments')); if (trig) { trig.click(); return 'clicked'; } return 'notfound'; })()`);
  await new Promise(r => setTimeout(r, 1300));
  const opts = await evalOn(s, `(() => { const o = [...document.querySelectorAll('[role=option]')].slice(0, 3).map(x => { const cs = getComputedStyle(x); return (x.textContent || '').trim().slice(0, 14) + '|' + cs.cursor + '/' + cs.userSelect; }); return JSON.stringify(o); })()`);
  console.log(`${tag} (${clicked}): ${JSON.stringify(opts)}`);
  await evalOn(s, `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); 'esc'`);
}

// D. kanban
const KAN = `(() => { const c = document.querySelector('[draggable=true]'); if (!c) return JSON.stringify('no-draggable'); const cs = getComputedStyle(c); return JSON.stringify(c.tagName.toLowerCase() + '|' + cs.cursor + '/' + cs.userSelect); })()`;
console.log("\n── D. KANBAN DRAGGABLES ──");
for (const [tag, s] of [["REF", "ref"], ["LOC", "loc"]]) {
  const base = s === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
  run(`agent-browser --session ${s} open ${base}/recruitmentkanban`);
  await new Promise(r => setTimeout(r, 3200));
  console.log(`${tag}: ` + JSON.stringify(await evalOn(s, KAN)));
}

// E. settings vs attendance tab parent context (top 4 levels)
const CTX = `(() => {
  const t = document.querySelector('[role=tab]');
  if (!t) return JSON.stringify('no-tabs');
  const up = [];
  let p = t;
  for (let i = 0; i < 5 && p; i++) { up.push(p.tagName.toLowerCase() + '.' + String(p.getAttribute('class') || '').replace(/\\s+/g, '.').slice(0, 40) + '[' + getComputedStyle(p).userSelect + ']'); p = p.parentElement; }
  return JSON.stringify(up);
})()`;
console.log("\n── E. TAB CONTEXT ──");
for (const route of ["/settings", "/attendance"]) {
  run(`agent-browser --session ref open https://eon.base44.app${route}`);
  await new Promise(r => setTimeout(r, 3000));
  console.log(`REF ${route}: ` + JSON.stringify(await evalOn("ref", CTX)));
}
console.log("\nCURSOR5-DONE");
