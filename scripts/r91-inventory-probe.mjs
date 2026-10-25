#!/usr/bin/env node
// r91-inventory-probe.mjs — the other pages' option inventories, read from
// the REF's OPEN selects (the r90-C open-state discipline).
//   1. /loans — the New Loan Request dialog's Loan Type + Paid From selects
//   2. /staffrequests — the filter selects (category + status)
// Runs at DESKTOP 1440 (the popper form — role=listbox reads cleanly).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 300); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const READ_LISTBOX = `(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const lbs = [...document.querySelectorAll('[role=listbox]')].map(l => ({ rect: r(l), dir: l.getAttribute('dir'), opts: [...l.querySelectorAll('[role=option]')].map(o => ({ text: o.textContent.trim(), selected: o.getAttribute('aria-selected') === 'true', rect: r(o) })) }));
  const dlg = [...document.querySelectorAll('[role=dialog]')].filter(d => d.offsetParent !== null || d.getBoundingClientRect().width > 0).map(d => ({ rect: r(d), heading: d.querySelector('h1,h2,h3')?.textContent?.trim() ?? null, labels: [...d.querySelectorAll('label')].map(l => l.textContent.trim()).slice(0, 10) }));
  return { lbs, dlg };
})()`;

const side = process.argv[2] || "ref";
const base = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
const session = side === "ref" ? "ref" : "loc";

// ---------- 1. the loans dialog ----------
run(`agent-browser --session ${session} set viewport 1440 900`);
run(`agent-browser --session ${session} open ${base}/loans`);
await sleep(6000);
// find the New Loan Request trigger button
const openDlg = await evalOn(session, `(() => {
  const b = [...document.querySelectorAll('button')].find(x => /new loan request/i.test(x.textContent));
  if (!b) return { found: false };
  b.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return { found: true };
})()`);
console.log("loans New Loan Request click:", JSON.stringify(openDlg));
await sleep(2200);
let read = await evalOn(session, READ_LISTBOX);
console.log("dialog state:", JSON.stringify(read).slice(0, 700));
// open each select in the dialog (Radix triggers = button[role=combobox])
const triggers = await evalOn(session, `(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const ts = [...document.querySelectorAll('[role=dialog] button[role=combobox], [role=dialog] button[aria-haspopup=listbox]')].map(t => ({ rect: r(t), text: t.textContent.trim().slice(0, 30) }));
  return ts;
})()`);
console.log("dialog select triggers:", JSON.stringify(triggers));
for (let i = 0; i < (triggers.length || 0); i++) {
  await evalOn(session, `(() => {
    const ts = [...document.querySelectorAll('[role=dialog] button[role=combobox], [role=dialog] button[aria-haspopup=listbox]')];
    if (ts[${i}]) ts[${i}].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  })()`);
  await sleep(1200);
  const opts = await evalOn(session, `(() => {
    const lbs = [...document.querySelectorAll('[role=listbox]')];
    if (!lbs.length) return { none: true };
    return { opts: [...lbs[lbs.length-1].querySelectorAll('[role=option]')].map(o => o.textContent.trim()) };
  })()`);
  console.log(`  select[${i}] options:`, JSON.stringify(opts));
  await evalOn(session, `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); true`);
  await sleep(500);
}

// ---------- 2. the staffrequests filters ----------
run(`agent-browser --session ${session} open ${base}/staffrequests`);
await sleep(6000);
const sTrigs = await evalOn(session, `(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const ts = [...document.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox]')].filter(t => t.offsetParent !== null);
  return ts.map(t => ({ rect: r(t), text: t.textContent.trim().slice(0, 30) }));
})()`);
console.log("\nstaffrequests filter triggers:", JSON.stringify(sTrigs));
for (let i = 0; i < (sTrigs.length || 0); i++) {
  await evalOn(session, `(() => {
    const ts = [...document.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox]')].filter(t => t.offsetParent !== null);
    if (ts[${i}]) ts[${i}].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  })()`);
  await sleep(1200);
  const opts = await evalOn(session, `(() => {
    const lbs = [...document.querySelectorAll('[role=listbox]')];
    if (!lbs.length) return { none: true };
    return { opts: [...lbs[lbs.length-1].querySelectorAll('[role=option]')].map(o => o.textContent.trim()) };
  })()`);
  console.log(`  filter[${i}] options:`, JSON.stringify(opts));
  await evalOn(session, `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); true`);
  await sleep(500);
}
process.exit(0);
