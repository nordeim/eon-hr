#!/usr/bin/env node
// verify-r23.mjs — session-24 / parity round 23 live verification:
// 1. cursor: buttons now pointer on the previously-default surfaces (group
//    toggles, header bell/moon/arabic/user, page CTAs) + login census
// 2. user-select: the 8 wrapped routes now none; settings stays auto
// 3. attendance tabs now none (inside the wrapped page)
// 4. loans dialog buttons stay auto/pointer (portal escape)
// 5. geometry regression: canonical 12-route h1 sweep + mobile chrome
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; }
}

let pass = 0, fail = 0;
const check = (label, ok, detail = "") => { if (ok) { pass++; console.log(`  PASS ${label}`); } else { fail++; console.log(`  **FAIL** ${label} ${detail}`); } };

// ---- 1. cursor census on LOC (expect all buttons pointer now) ----
console.log("── 1. CURSOR (LOC buttons → pointer; tabs/switch/links unchanged) ──");
for (const route of ["/dashboard", "/employees", "/settings", "/payroll"]) {
  run(`agent-browser --session loc open http://127.0.0.1:3200${route}`);
  await new Promise(r => setTimeout(r, 2600));
  const res = await evalOn("loc", `(() => {
    const out = { btns: 0, pointer: 0, defaults: [], tabsPtr: true };
    for (const b of document.querySelectorAll('button')) {
      if (!b.offsetParent) continue;
      out.btns++;
      const c = getComputedStyle(b).cursor;
      if (c === 'pointer') out.pointer++;
      else out.defaults.push((b.textContent || b.getAttribute('aria-label') || '(icon)').trim().slice(0, 14) + ':' + c);
    }
    for (const t of document.querySelectorAll('[role=tab]')) { if (getComputedStyle(t).cursor !== 'pointer') out.tabsPtr = false; }
    return JSON.stringify(out);
  })()`);
  check(`${route} buttons ${res.pointer}/${res.btns} pointer`, res.pointer === res.btns, JSON.stringify(res.defaults));
  check(`${route} tabs pointer`, res.tabsPtr);
}

// login census (throwaway session)
run("agent-browser --session loginloc open http://127.0.0.1:3200/login");
await new Promise(r => setTimeout(r, 2400));
const lg = await evalOn("loginloc", `(() => { const out = []; for (const b of document.querySelectorAll('button')) { if (b.offsetParent) out.push(getComputedStyle(b).cursor); } return JSON.stringify(out); })()`);
check(`login buttons all pointer (${lg.length})`, lg.length > 0 && lg.every(c => c === 'pointer'), JSON.stringify(lg));

// ---- 2. user-select sweep on the 8 + settings ----
console.log("\n── 2. USER-SELECT (8 routes → none; settings → auto) ──");
for (const route of ["/dashboard", "/employees", "/payroll", "/attendance", "/leavemanagement", "/expenses", "/loans", "/taskmanager", "/settings"]) {
  run(`agent-browser --session loc open http://127.0.0.1:3200${route}`);
  await new Promise(r => setTimeout(r, 2400));
  const res = await evalOn("loc", `(() => { const h1 = [...document.querySelectorAll('h1')].find(h => h.offsetParent); return h1 ? getComputedStyle(h1).userSelect : 'no-h1'; })()`);
  const want = route === "/settings" ? "auto" : "none";
  check(`${route} h1 user-select=${res} (want ${want})`, res === want);
}

// ---- 3. attendance tabs + inputs inside wrapped page ----
console.log("\n── 3. ATTENDANCE TABS + PAGE INPUTS (→ none) ──");
run("agent-browser --session loc open http://127.0.0.1:3200/attendance");
await new Promise(r => setTimeout(r, 2600));
const att = await evalOn("loc", `(() => { const t = document.querySelector('[role=tab]'); return JSON.stringify({ tab: t ? getComputedStyle(t).userSelect : 'absent' }); })()`);
check(`attendance tab none`, att.tab === "none", JSON.stringify(att));
run("agent-browser --session loc open http://127.0.0.1:3200/employees");
await new Promise(r => setTimeout(r, 2600));
const emp = await evalOn("loc", `(() => { const i = document.querySelector('input[type=text], input:not([type])'); return i ? getComputedStyle(i).userSelect : 'no-input'; })()`);
check(`employees search input none`, emp === "none", String(emp));

// ---- 4. loans dialog portal escape (buttons auto + pointer) ----
console.log("\n── 4. LOANS DIALOG (portal → auto + pointer) ──");
run("agent-browser --session loc set viewport 1440 900");
run("agent-browser --session loc open http://127.0.0.1:3200/loans");
await new Promise(r => setTimeout(r, 2800));
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').toLowerCase().includes('new loan')); if (b) b.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 1500));
const dlg = await evalOn("loc", `(() => { const d = document.querySelector('[role=dialog]'); if (!d) return JSON.stringify({ open: false }); const btns = [...d.querySelectorAll('button')]; const allPtr = btns.every(b => getComputedStyle(b).cursor === 'pointer'); const allAuto = btns.every(b => getComputedStyle(b).userSelect === 'auto'); return JSON.stringify({ open: true, n: btns.length, allPtr, allAuto }); })()`);
check(`loans dialog buttons pointer+auto (n=${dlg.n})`, dlg.open && dlg.allPtr && dlg.allAuto, JSON.stringify(dlg));
await evalOn("loc", `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); 'esc'`);

// ---- 5. geometry regression: canonical 12-route h1 sweep vs REF ----
console.log("\n── 5. GEOMETRY REGRESSION (canonical 12-route) ──");
const ROUTES = ["/dashboard", "/employees", "/payroll", "/taskmanager", "/leavemanagement", "/expenses", "/loans", "/attendance", "/settings", "/profile", "/compliancedashboard", "/reports"];
const READER = `(() => { const h = [...document.querySelectorAll('h1')].find(h => h.offsetParent !== null); if (!h) return JSON.stringify({found:false}); const cs = getComputedStyle(h); const r = h.getBoundingClientRect(); return JSON.stringify({found:true, t: h.textContent.trim().split(String.fromCharCode(10)).join(' ').replace(/ +/g,' ').slice(0,30), f: cs.fontSize + '/' + cs.fontWeight, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width)}); })()`;
let geo = 0;
for (const route of ROUTES) {
  run(`agent-browser --session ref open https://eon.base44.app${route}`);
  await new Promise(r => setTimeout(r, 2800));
  const r1 = await evalOn("ref", READER);
  run(`agent-browser --session loc open http://127.0.0.1:3200${route}`);
  await new Promise(r => setTimeout(r, 2500));
  const l1 = await evalOn("loc", READER);
  const same = r1.found && l1.found && r1.t === l1.t && r1.f === l1.f && r1.x === l1.x && r1.y === l1.y;
  if (same) geo++; else console.log(`  **DIFF** ${route} ref=${JSON.stringify(r1)} loc=${JSON.stringify(l1)}`);
}
check(`canonical 12-route geometry ${geo}/12`, geo === 12);

// mobile chrome regression
run("agent-browser --session loc set viewport 390 844");
run("agent-browser --session loc open http://127.0.0.1:3200/dashboard");
await new Promise(r => setTimeout(r, 2800));
const mob = await evalOn("loc", `(() => { const bar = document.querySelector('header'); const r = bar ? bar.getBoundingClientRect() : null; const tabs = [...document.querySelectorAll('nav a, header + div a')].length; return JSON.stringify({ bar: r ? Math.round(r.width) + 'x' + Math.round(r.height) : 'absent' }); })()`);
check(`mobile top bar 390x73`, mob.bar === "390x73", JSON.stringify(mob));
run("agent-browser --session loc set viewport 1440 900");

console.log(`\nRESULT: ${pass} PASS / ${fail} FAIL`);
