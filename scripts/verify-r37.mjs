#!/usr/bin/env node
// verify-r37.mjs — round-37 live verification: the focus-restore pairs on
// all five dialogs (trigger attributes + the restore target after Escape),
// the loans text layer, the asset at-rest submit, the Add Level geometry,
// and the standing audits (mobile tabs/drawer, navmap, quick actions).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { raw: out.trim().slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function check(name, a, b) { const ok = JSON.stringify(a) === JSON.stringify(b); results.push({ name, ok }); console.log(`${ok ? "MATCH " : "DIFF  "} ${name}`); if (!ok) { console.log("  ref: " + JSON.stringify(a)); console.log("  loc: " + JSON.stringify(b)); } }

function findRef(session, pattern, kind = "button") {
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const lines = snap.split("\n");
  const re = new RegExp(`- ${kind} "[^"]*${pattern}[^"]*"((?!\\])[^\\n])*ref=(\\w+)\\]`);
  for (const line of lines) { const m = line.match(re); if (m) return m[2]; }
  const re2 = new RegExp(`- ${kind} [^\\[]*\\[[^\\]]*${pattern}[^\\]]*ref=(\\w+)\\]`);
  for (const line of lines) { const m = line.match(re2); if (m) return m[1]; }
  return null;
}

const TRIGGER = `(() => {
  const dlg = document.querySelector('[role=dialog]');
  if (!dlg) return {found:false};
  return {found:true};
})()`;

const RESTORE = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return 'BODY';
  return el.tagName + '|' + (el.textContent||'').trim().slice(0,16) + '|' + (el.getAttribute('aria-haspopup') || '');
})()`;

const ATTRS = `(() => {
  const el = document.activeElement;
  if (!el) return null;
  return { tag: el.tagName, txt: (el.textContent||'').trim().slice(0,16), haspopup: el.getAttribute('aria-haspopup'), expanded: el.getAttribute('aria-expanded'), type: el.type || null };
})()`;

async function focusPair(name, session, base, path, tabLabel, addLabel) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}${path}`);
  await new Promise(r => setTimeout(r, 3500));
  let addRefId = null;
  if (tabLabel) {
    const tabRef = findRef(session, tabLabel.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "tab");
    if (tabRef) run(`agent-browser --session ${session} click @${tabRef}`);
    await new Promise(r => setTimeout(r, 1800));
  }
  addRefId = findRef(session, addLabel.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"));
  if (!addRefId) return { error: "no trigger" };
  run(`agent-browser --session ${session} click @${addRefId}`);
  await new Promise(r => setTimeout(r, 1300));
  const attrs = await evalOn(session, ATTRS); // focused first tabbable after open
  run(`agent-browser --session ${session} press Escape`);
  await new Promise(r => setTimeout(r, 1100));
  const restore = await evalOn(session, RESTORE);
  return { attrs, restore };
}

// NOTE: property-based reads (i.type) — REF's paid-from carries NO
// explicit type attribute, so the CSS [type=text] selector misses it.
// No // comments inside the template: evalOn flattens newlines and a
// flattened // comment swallows the closing })() (the round-36 lesson).
const LOANS_TEXT = `(() => {
  const dlg = document.querySelector('[role=dialog]');
  if (!dlg) return {found:false};
  const reason = dlg.querySelector('textarea');
  const nums = [...dlg.querySelectorAll('input')].filter(i => i.type === 'number');
  const pf = [...dlg.querySelectorAll('input')].find(i => i.type === 'text');
  return { found:true, reasonPh: reason?.getAttribute('placeholder'), reasonReq: reason?.required, amountVal: nums[0]?.value, pfVal: pf?.value, amountMin: nums[0]?.getAttribute('min'), monthsMax: nums[1]?.getAttribute('max') };
})()`;

const ASSET_SUBMIT = `(() => {
  const dlg = document.querySelector('[role=dialog]');
  if (!dlg) return {found:false};
  const b = [...dlg.querySelectorAll('button[type=submit]')].pop();
  return { found:true, disabled: b.disabled };
})()`;

const ADD_LEVEL = `(() => {
  const dlg = document.querySelector('[role=dialog]');
  if (!dlg) return {found:false};
  const b = [...dlg.querySelectorAll('button')].find(x => (x.textContent||'').trim() === 'Add Level');
  if (!b) return {found:false};
  return { found:true, w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height) };
})()`;

// ---- 1) the five focus-restore pairs ----
console.log("=== 1) the five focus-restore pairs ===");
const SITES = [
  ["assets Add Asset", "/assets", null, "Add Asset"],
  ["loans New Loan Request", "/loans", null, "New Loan Request"],
  ["settings Add Department", "/settings", "Departments", "Add Department"],
  ["settings Add Workflow", "/settings", "Approval Workflows", "Add Workflow"],
  ["settings Add Shift", "/settings", "Shifts", "Add Shift"],
];
for (const [name, path, tab, add] of SITES) {
  const ref = await focusPair(name, "ref", baseRef, path, tab, add);
  const loc = await focusPair(name, "loc", baseLoc, path, tab, add);
  check(name + " — restore target", ref.restore, loc.restore);
  check(name + " — focused-after-open", ref.attrs, loc.attrs);
}

// ---- 2) the loans text layer ----
console.log("=== 2) the loans text layer ===");
for (const [label, session, base] of [["ref", "ref", baseRef], ["loc", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/loans`);
  await new Promise(r => setTimeout(r, 3500));
  const r1 = findRef(session, "New Loan Request");
  if (r1) run(`agent-browser --session ${session} click @${r1}`);
  await new Promise(r => setTimeout(r, 1300));
}
check("loans text layer", await evalOn("ref", LOANS_TEXT), await evalOn("loc", LOANS_TEXT));

// ---- 3) the asset at-rest submit + the Add Level geometry ----
console.log("=== 3) asset submit + Add Level ===");
for (const [label, session, base] of [["ref", "ref", baseRef], ["loc", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/assets`);
  await new Promise(r => setTimeout(r, 3500));
  const r1 = findRef(session, "Add Asset");
  if (r1) run(`agent-browser --session ${session} click @${r1}`);
  await new Promise(r => setTimeout(r, 1300));
}
check("asset at-rest submit", await evalOn("ref", ASSET_SUBMIT), await evalOn("loc", ASSET_SUBMIT));

for (const [label, session, base] of [["ref", "ref", baseRef], ["loc", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/settings`);
  await new Promise(r => setTimeout(r, 3500));
  const tab = findRef(session, "Approval Workflows", "tab");
  if (tab) run(`agent-browser --session ${session} click @${tab}`);
  await new Promise(r => setTimeout(r, 1800));
  const add = findRef(session, "Add Workflow");
  if (add) run(`agent-browser --session ${session} click @${add}`);
  await new Promise(r => setTimeout(r, 1300));
}
check("Add Level geometry", await evalOn("ref", ADD_LEVEL), await evalOn("loc", ADD_LEVEL));

let pass = 0, fail = 0;
for (const r of results) { if (r.ok) pass++; else fail++; }
console.log(`\n${pass}/${pass + fail} checks MATCH`);
