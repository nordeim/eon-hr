#!/usr/bin/env node
// probe-r23-cursor4.mjs — parent-chain resolution for every user-select:none
// element on REF (find the exact ancestor that flips it) + disabled-button
// cursor (loans dialog) + switch/checkbox surfaces + select options + kanban.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; }
}

// walk up from each select-none element until userSelect != none
const CHAIN = `(() => {
  const out = [];
  const walkEl = (label, el) => {
    let p = el.parentElement, hops = 0;
    while (p && hops < 12) {
      if (getComputedStyle(p).userSelect !== 'none') break;
      p = p.parentElement; hops++;
    }
    if (p) {
      out.push({ el: label, hops, stop: p.tagName.toLowerCase() + '.' + String(p.getAttribute('class') || '').replace(/\\s+/g, '.').slice(0, 70), stopUs: getComputedStyle(p).userSelect });
    } else out.push({ el: label, hops: -1, stop: 'root' });
  };
  for (const a of document.querySelectorAll('a, button')) {
    if (!a.offsetParent) continue;
    if (getComputedStyle(a).userSelect === 'none') {
      walkEl((a.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 18) || '(icon)', a);
    }
  }
  for (const i of document.querySelectorAll('input, textarea')) {
    if (!i.offsetParent) continue;
    if (getComputedStyle(i).userSelect === 'none') walkEl('input:' + (i.type || 'ta') + ':' + (i.getAttribute('placeholder') || '').slice(0, 12), i);
  }
  for (const t of document.querySelectorAll('[role=tab]')) {
    if (getComputedStyle(t).userSelect === 'none') walkEl('tab:' + (t.textContent || '').trim().slice(0, 12), t);
  }
  return JSON.stringify(out);
})()`;

for (const [route, note] of [["/dashboard", "quick tiles + links + customize"], ["/employees", "search input"], ["/payroll", "inputs"], ["/attendance", "tabs"]]) {
  run(`agent-browser --session ref open https://eon.base44.app${route}`);
  await new Promise(r => setTimeout(r, 3200));
  const res = await evalOn("ref", CHAIN);
  console.log(`REF ${route} (${note}):`);
  for (const r of res) console.log(`  ${r.el} → ${r.hops} hops → stop@${r.stop} [${r.stopUs}]`);
}

// disabled button: open REF loans dialog, read submit state + cursor
console.log("\n── REF LOANS DIALOG submit button (disabled?) ──");
run("agent-browser --session ref set viewport 1440 900");
run("agent-browser --session ref open https://eon.base44.app/loans");
await new Promise(r => setTimeout(r, 3200));
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').toLowerCase().includes('new loan')); if (b) b.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 1800));
const dlgBtns = await evalOn("ref", `(() => { const d = document.querySelector('[role=dialog]'); if (!d) return JSON.stringify({ open: false }); const btns = [...d.querySelectorAll('button')].map(b => { const cs = getComputedStyle(b); return { t: (b.textContent || '(x)').trim().slice(0, 16), dis: b.disabled, c: cs.cursor, us: cs.userSelect, op: cs.opacity }; }); return JSON.stringify(btns); })()`);
console.log("REF dialog buttons: " + JSON.stringify(dlgBtns));
const dlgInputs = await evalOn("ref", `(() => { const d = document.querySelector('[role=dialog]'); if (!d) return 'closed'; const els = [...d.querySelectorAll('input, textarea, button[role=combobox]')].map(e => { const cs = getComputedStyle(e); return { k: e.type || e.tagName.toLowerCase() + (e.getAttribute('role') ? ':' + e.getAttribute('role') : ''), c: cs.cursor, us: cs.userSelect }; }); return JSON.stringify(els); })()`);
console.log("REF dialog inputs: " + JSON.stringify(dlgInputs));
await evalOn("ref", `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); 'esc'`);

// switch/checkbox surfaces
console.log("\n── SWITCH/CHECKBOX SURFACES ──");
const SW = `(() => {
  const out = {};
  const sw = document.querySelector('[role=switch]'); if (sw) { const cs = getComputedStyle(sw); out.switch = { c: cs.cursor, us: cs.userSelect }; }
  const cb = document.querySelector('input[type=checkbox]'); if (cb) { const cs = getComputedStyle(cb); out.checkbox = { c: cs.cursor, us: cs.userSelect }; }
  const lb = document.querySelector('[role=switch] label, label'); if (lb) { const cs = getComputedStyle(lb); out.label = { c: cs.cursor, us: cs.userSelect }; }
  return JSON.stringify(out);
})()`;
for (const route of ["/notificationpreferences", "/securitysettings", "/settings"]) {
  run(`agent-browser --session ref open https://eon.base44.app${route}`);
  await new Promise(r => setTimeout(r, 3000));
  const r1 = await evalOn("ref", SW);
  run(`agent-browser --session loc open http://127.0.0.1:3200${route}`);
  await new Promise(r => setTimeout(r, 2600));
  const l1 = await evalOn("loc", SW);
  console.log(`${route}: REF=${r1} LOC=${l1}`);
}

// select dropdown options (open a select on employees both apps)
console.log("\n── SELECT OPTIONS (employees dept filter) ──");
for (const [tag, s] of [["REF", "ref"], ["LOC", "loc"]]) {
  const base = s === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
  run(`agent-browser --session ${s} open ${base}/employees`);
  await new Promise(r => setTimeout(r, s === "ref" ? 3000 : 2600));
  await evalOn(s, `(() => { const t = document.querySelector('button[aria-haspopup=listbox], [role=combobox]'); if (t) t.click(); return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 1200));
  const opts = await evalOn(s, `(() => { const o = [...document.querySelectorAll('[role=option]')].slice(0, 3).map(x => { const cs = getComputedStyle(x); return { t: (x.textContent || '').trim().slice(0, 14), c: cs.cursor, us: cs.userSelect }; }); return JSON.stringify(o); })()`);
  console.log(`${tag} options: ${opts}`);
  await evalOn(s, `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); 'esc'`);
}

// kanban cards + columns
console.log("\n── KANBAN ──");
const KAN = `(() => { const c = document.querySelector('[draggable=true], [data-rbd-draggable-id], .kanban-card'); if (!c) return 'absent'; const cs = getComputedStyle(c); return c.tagName + '|' + cs.cursor + '/' + cs.userSelect; })()`;
for (const s of ["ref", "loc"]) {
  const base = s === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
  run(`agent-browser --session ${s} open ${base}/recruitmentkanban`);
  await new Promise(r => setTimeout(r, 3200));
  console.log(`${s}: ` + await evalOn(s, KAN));
}
console.log("\nCURSOR4-DONE");
