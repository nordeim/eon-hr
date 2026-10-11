#!/usr/bin/env node
// verify-r22.mjs — session-23 / parity round 22 live verification:
// 1. nav scrollbar computed auto (R22-A) + no .scrollbar-thin elements
// 2. /settings + /compliance docH now matching REF (R22-B phantom gone)
// 3. the loans dialog: 672px + full REF field set + installment + preview card (R22-C)
// 4. hrreports header-only table at 0 records (R22-E)
// 5. attendancedashboard 37px all-left th + the P empty state (R22-F)
// 6. compliance Expired-first order + At-Risk title (R22-D)
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    let raw = out.trim();
    try { const once = JSON.parse(raw); if (typeof once === "string") raw = once; } catch {}
    return JSON.parse(raw);
  } catch { return { error: out.slice(0, 300) }; }
}

// ---- 1. nav scrollbar (R22-A) ----
console.log("── 1. NAV SCROLLBAR (expect sbw=auto, no styled elements) ──");
run("agent-browser --session loc set viewport 1440 900");
run("agent-browser --session loc open http://127.0.0.1:3200/advancedanalytics");
await new Promise(r => setTimeout(r, 4000));
const nav = await evalOn("loc", `(() => { const nav = document.querySelector('nav[class*=overflow-y-auto]'); const cs = getComputedStyle(nav); return JSON.stringify({ sbw: cs.scrollbarWidth, sbc: cs.scrollbarColor, sh: nav.scrollHeight, ch: nav.clientHeight, styledEls: document.querySelectorAll('.scrollbar-thin').length }); })()`);
console.log("LOC nav: " + JSON.stringify(nav));

// ---- 2. docH checks (R22-B) ----
console.log("\n── 2. DOCH (expect settings ~919, compliance ~949±3 vs REF) ──");
for (const route of ["/settings", "/compliancedashboard"]) {
  run(`agent-browser --session ref open https://eon.base44.app${route}`);
  await new Promise(r => setTimeout(r, 3200));
  const refD = await evalOn("ref", `document.documentElement.scrollHeight`);
  run(`agent-browser --session loc open http://127.0.0.1:3200${route}`);
  await new Promise(r => setTimeout(r, 3000));
  const locD = await evalOn("loc", `document.documentElement.scrollHeight`);
  console.log(`${route}: REF=${refD} LOC=${locD} delta=${locD - refD}`);
}

// ---- 3. loans dialog (R22-C) ----
console.log("\n── 3. LOANS DIALOG (expect w=672, full fields, no description) ──");
run("agent-browser --session loc set viewport 1440 900");
run("agent-browser --session loc open http://127.0.0.1:3200/loans");
await new Promise(r => setTimeout(r, 3500));
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').toLowerCase().includes('new loan')); if (b) b.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 1500));
const dlg = await evalOn("loc", `(() => { const d = document.querySelector('[role=dialog]'); if (!d) return JSON.stringify({ open: false }); const r = d.getBoundingClientRect(); const labels = [...d.querySelectorAll('label')].map(l => l.textContent.trim()); const hasDesc = !!d.querySelector('p.text-sm.text-muted-foreground'); const inst = [...d.querySelectorAll('div')].find(x => (x.textContent||'').includes('SAR')); const actions = [...d.querySelectorAll('form button')].map(b => b.textContent.trim()).filter(t => t && !t.includes('Select') && !t.includes('Loan')); return JSON.stringify({ w: Math.round(r.width), h: Math.round(r.height), labels, hasDesc, instCls: inst ? inst.getAttribute('class') : null, actions }); })()`);
console.log("LOC dialog: " + JSON.stringify(dlg));

// select the employee → the Requesting-for card
await evalOn("loc", `(() => { const trig = [...document.querySelectorAll('[role=dialog] button')].find(b => (b.textContent||'').includes('Select employee')); if (trig) trig.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 900));
await evalOn("loc", `(() => { const opt = [...document.querySelectorAll('[role=option]')].find(o => o.textContent.includes('sepnetflix')); if (opt) opt.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 900));
const card = await evalOn("loc", `(() => { const d = document.querySelector('[role=dialog]'); const c = [...d.querySelectorAll('div')].find(x => (x.textContent||'').includes('Requesting for')); if (!c) return JSON.stringify({ card: false }); const r = c.getBoundingClientRect(); return JSON.stringify({ card: true, w: Math.round(r.width), h: Math.round(r.height), text: c.textContent.replace(/\s+/g, ' ').slice(0, 80) }); })()`);
console.log("Requesting-for card: " + JSON.stringify(card));

// fill amount/months → the installment display computes
await evalOn("loc", `(() => { const amt = document.querySelector('#loan-amount'); const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(amt, '1200'); amt.dispatchEvent(new Event('input', { bubbles: true })); const m = document.querySelector('#loan-months'); setter.call(m, '12'); m.dispatchEvent(new Event('input', { bubbles: true })); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 600));
const inst = await evalOn("loc", `(() => { const d = document.querySelector('[role=dialog]'); const cells = [...d.querySelectorAll('div')].filter(x => /^SAR /.test(x.textContent.trim())); return JSON.stringify(cells.map(c => ({ t: c.textContent.trim(), cls: (c.getAttribute('class')||'').slice(0, 50) }))); })()`);
console.log("Installment display: " + JSON.stringify(inst));
await evalOn("loc", `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); 'esc'`);

// ---- 4. hrreports table (R22-E) ----
console.log("\n── 4. HRREPORTS TABLE (expect 33px uppercase th, header-only, card ~139) ──");
run("agent-browser --session loc open http://127.0.0.1:3200/hrreports");
await new Promise(r => setTimeout(r, 4000));
const hr = await evalOn("loc", `(() => { const t = document.querySelector('table'); if (!t) return JSON.stringify({ table: false }); const th = t.querySelector('th'); const cs = getComputedStyle(th); const card = t.closest('.rounded-xl, [class*=border]'); const cr = card ? card.getBoundingClientRect() : null; return JSON.stringify({ thH: Math.round(th.getBoundingClientRect().height), thText: th.textContent.trim(), thTransform: cs.textTransform, rows: t.querySelectorAll('tr').length, cardH: cr ? Math.round(cr.height) : null, docH: document.documentElement.scrollHeight }); })()`);
console.log("LOC hrreports: " + JSON.stringify(hr));
run("agent-browser --session ref open https://eon.base44.app/hrreports");
await new Promise(r => setTimeout(r, 3500));
const hrRef = await evalOn("ref", `(() => { const t = document.querySelector('table'); const card = t.closest('.rounded-xl, [class*=border]'); const cr = card ? card.getBoundingClientRect() : null; return JSON.stringify({ cardH: cr ? Math.round(cr.height) : null, docH: document.documentElement.scrollHeight }); })()`);
console.log("REF hrreports: " + JSON.stringify(hrRef));

// ---- 5. attendancedashboard table (R22-F) ----
console.log("\n── 5. ATTENDANCEDASHBOARD (expect 37px all-left th) ──");
run("agent-browser --session loc open http://127.0.0.1:3200/attendancedashboard");
await new Promise(r => setTimeout(r, 4000));
const att = await evalOn("loc", `(() => { const t = [...document.querySelectorAll('table')].pop(); const ths = [...t.querySelectorAll('th')]; const cs = getComputedStyle(ths[2]); return JSON.stringify({ thH: Math.round(ths[0].getBoundingClientRect().height), n: ths.length, thirdAlign: cs.textAlign, thirdCls: (ths[2].getAttribute('class')||'').slice(0, 50), rows: t.querySelectorAll('tbody tr').length }); })()`);
console.log("LOC att table: " + JSON.stringify(att));

// ---- 6. compliance (R22-D) ----
console.log("\n── 6. COMPLIANCE (expect Expired first, At-Risk title) ──");
run("agent-browser --session loc open http://127.0.0.1:3200/compliancedashboard");
await new Promise(r => setTimeout(r, 4000));
const comp = await evalOn("loc", `(() => { const stats = [...document.querySelectorAll('[class*=grid] > div')].filter(d => d.getBoundingClientRect().height > 80 && d.getBoundingClientRect().height < 95 && d.textContent.trim().length < 30).slice(0, 4); const titles = [...document.querySelectorAll('.text-sm.font-semibold')].map(x => x.textContent.trim()); return JSON.stringify({ statOrder: stats.map(s => s.textContent.replace(/\s+/g, ' ').trim().slice(0, 22)), titles: titles.slice(0, 4) }); })()`);
console.log("LOC compliance: " + JSON.stringify(comp));

console.log("\nVERIFY-R22-DONE");
