#!/usr/bin/env node
// verify-r36.mjs — round-36 live verification: the dialog form contracts.
// Drives the ref + loc agent-browser sessions through the three rebuilt
// dialogs + the asset text layer, comparing structure (form presence,
// required attrs, defaults, button types, placeholders) and geometry.
import { execSync } from "node:child_process";

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 200);
  }
}

function evalOn(session, expr) {
  // Flatten multi-line probes to one line — JSON.stringify would leave
  // literal \n sequences that break the CLI's JS parser (the round-36
  // lesson: every multi-line record before this fix was a vacuous MATCH).
  const flat = expr.replace(/\n\s*/g, " ");
  const out = run(
    `agent-browser --session ${session} eval ${JSON.stringify(flat)}`
  ).trim();
  if (out.startsWith('"') && out.endsWith('"')) {
    try { return JSON.parse(out); } catch { return out; }
  }
  try { return JSON.parse(out); } catch { return out; }
}

// A line-based ref finder. "ref=" is NOT always preceded by a bracket —
// attribute lines read [selected, ref=e12] / [expanded=false, ref=e34]
// (the round-35 lesson, re-learned in round 36: REF's dialog triggers
// carry aria-expanded, so \[ref= never matched them and every REF-side
// dialog click silently no-opped).
function findRef(session, label, kind = "button") {
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const lines = snap.split("\n");
  const re = new RegExp(`- ${kind} "[^"]*${label}[^"]*"(.*)ref=(\\w+)\\]`);
  for (const line of lines) {
    const m = line.match(re);
    if (m) return m[2];
  }
  return null;
}

function click(session, ref) {
  return run(`agent-browser --session ${session} click @${ref}`);
}

const dlgProbe = `(()=> {
  const dlg = document.querySelector('[role=dialog]');
  if (!dlg) return null;
  const form = dlg.querySelector('form');
  const r = dlg.getBoundingClientRect();
  return {
    w: Math.round(r.width),
    title: dlg.querySelector('h2')?.textContent ?? null,
    hasForm: !!form,
    formCls: form ? form.className : null,
    inputs: Array.from(dlg.querySelectorAll('input')).map(i => ({
      ph: i.placeholder, type: i.type, required: i.required, val: i.value.slice(0, 14),
    })),
    nativeSelects: Array.from(dlg.querySelectorAll('select')).map(s => s.value),
    buttons: Array.from(dlg.querySelectorAll('button')).map(b => ({
      t: b.textContent.trim().slice(0, 14), type: b.type,
    })),
  };
})()`;

async function openSettingsTab(session, tabName) {
  run(`agent-browser --session ${session} open "${session === "ref" ? baseRef : baseLoc}/settings"`);
  await new Promise(r => setTimeout(r, 3000));
  const ref = findRef(session, tabName, "tab");
  if (ref) click(session, ref);
  // REF's tab panels fetch their data — the panel's buttons appear with
  // a delay; 2.5s settles it (the round-36 script lesson: 1.3s raced it).
  await new Promise(r => setTimeout(r, 2500));
}

function record(name, refVal, locVal, eq) {
  results.push({ name, refVal, locVal, match: eq });
  console.log(`${eq ? "MATCH" : "DIFF "}  ${name}`);
  if (!eq) {
    console.log(`  ref: ${JSON.stringify(refVal)}`);
    console.log(`  loc: ${JSON.stringify(locVal)}`);
  }
}

const cmp = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------- 1. Add Workflow ----------
await openSettingsTab("ref", "Approval Workflows");
await openSettingsTab("loc", "Approval Workflows");
for (const s of ["ref", "loc"]) {
  let ref = findRef(s, "Add Workflow");
  if (!ref) { await new Promise(r => setTimeout(r, 1800)); ref = findRef(s, "Add Workflow"); }
  if (ref) click(s, ref);
  await new Promise(r => setTimeout(r, 2200));
}
const wfRef = evalOn("ref", dlgProbe), wfLoc = evalOn("loc", dlgProbe);
record("workflow: hasForm", wfRef?.hasForm, wfLoc?.hasForm, wfRef?.hasForm === wfLoc?.hasForm);
record("workflow: formCls", wfRef?.formCls, wfLoc?.formCls, wfRef?.formCls === wfLoc?.formCls);
record("workflow: inputs (ph/type/required)", wfRef?.inputs, wfLoc?.inputs, cmp(wfRef?.inputs, wfLoc?.inputs));
record("workflow: nativeSelects", wfRef?.nativeSelects, wfLoc?.nativeSelects, cmp(wfRef?.nativeSelects, wfLoc?.nativeSelects));
record("workflow: buttons (label/type)", wfRef?.buttons, wfLoc?.buttons, cmp(wfRef?.buttons, wfLoc?.buttons));
record("workflow: width", wfRef?.w, wfLoc?.w, wfRef?.w === wfLoc?.w);
// empty submit → dialog stays open on both (native validation)
for (const s of ["ref", "loc"]) {
  const create = findRef(s, "Create");
  if (create) click(s, create);
  await new Promise(r => setTimeout(r, 900));
}
const refOpen = evalOn("ref", `!!document.querySelector('[role=dialog]')`);
const locOpen = evalOn("loc", `!!document.querySelector('[role=dialog]')`);
// the dialog geometry probes (JSON-string returns — the round-36 script
// lesson: object-returning evals fail through execSync quoting)
const geoProbe = (fields) => `(()=> {
  const dlg = document.querySelector('[role=dialog]');
  if (!dlg) return null;
  const r = dlg.getBoundingClientRect();
  const lbl = dlg.querySelector('label');
  const inp = dlg.querySelector('label ~ input');
  const out = { w: Math.round(r.width), h: Math.round(r.height) };
  if (lbl && inp) out.gap = Math.round(inp.getBoundingClientRect().y - (lbl.getBoundingClientRect().y + lbl.getBoundingClientRect().height));
  return JSON.stringify(out);
})()`;
const wfGeoRef = evalOn("ref", geoProbe()), wfGeoLoc = evalOn("loc", geoProbe());
record("workflow: geometry (w/h/gap)", wfGeoRef, wfGeoLoc, wfGeoRef === wfGeoLoc);
run(`agent-browser --session ref press Escape`);
run(`agent-browser --session loc press Escape`);
await new Promise(r => setTimeout(r, 800));

// ---------- 2. Add Shift ----------
await openSettingsTab("ref", "Shifts");
await openSettingsTab("loc", "Shifts");
for (const s of ["ref", "loc"]) {
  let ref = findRef(s, "Add Shift");
  if (!ref) { await new Promise(r => setTimeout(r, 1800)); ref = findRef(s, "Add Shift"); }
  if (ref) click(s, ref);
  await new Promise(r => setTimeout(r, 2200));
}
const shRef = evalOn("ref", dlgProbe), shLoc = evalOn("loc", dlgProbe);
record("shift: hasForm", shRef?.hasForm, shLoc?.hasForm, shRef?.hasForm === shLoc?.hasForm);
record("shift: inputs (ph/type/required/val)", shRef?.inputs, shLoc?.inputs, cmp(shRef?.inputs, shLoc?.inputs));
record("shift: buttons", shRef?.buttons, shLoc?.buttons, cmp(shRef?.buttons, shLoc?.buttons));
record("shift: width", shRef?.w, shLoc?.w, shRef?.w === shLoc?.w);
// the status trigger geometry (223×36, inside the grid)
const trigProbe = `(()=> {
  const dlg = document.querySelector('[role=dialog]');
  if (!dlg) return null;
  const btn = Array.from(dlg.querySelectorAll('button')).find(b => b.textContent.trim() === 'Active');
  if (!btn) return 'NO_ACTIVE';
  const r = btn.getBoundingClientRect();
  return JSON.stringify({ w: Math.round(r.width), h: Math.round(r.height) });
})()`;
const stRef = evalOn("ref", trigProbe), stLoc = evalOn("loc", trigProbe);
record("shift: status trigger (w/h)", stRef, stLoc, cmp(stRef, stLoc));
run(`agent-browser --session ref press Escape`);
run(`agent-browser --session loc press Escape`);
await new Promise(r => setTimeout(r, 800));

// ---------- 3. Add Department ----------
await openSettingsTab("ref", "Departments");
await openSettingsTab("loc", "Departments");
for (const s of ["ref", "loc"]) {
  let ref = findRef(s, "Add Department");
  if (!ref) { await new Promise(r => setTimeout(r, 1800)); ref = findRef(s, "Add Department"); }
  if (ref) click(s, ref);
  await new Promise(r => setTimeout(r, 2200));
}
const dpRef = evalOn("ref", dlgProbe), dpLoc = evalOn("loc", dlgProbe);
record("department: hasForm", dpRef?.hasForm, dpLoc?.hasForm, dpRef?.hasForm === dpLoc?.hasForm);
record("department: formCls", dpRef?.formCls, dpLoc?.formCls, dpRef?.formCls === dpLoc?.formCls);
record("department: inputs", dpRef?.inputs, dpLoc?.inputs, cmp(dpRef?.inputs, dpLoc?.inputs));
record("department: buttons", dpRef?.buttons, dpLoc?.buttons, cmp(dpRef?.buttons, dpLoc?.buttons));
record("department: width", dpRef?.w, dpLoc?.w, dpRef?.w === dpLoc?.w);
const dpH = evalOn("ref", `Math.round(document.querySelector('[role=dialog]').getBoundingClientRect().height)`);
const dpHLoc = evalOn("loc", `Math.round(document.querySelector('[role=dialog]').getBoundingClientRect().height)`);
record("department: height", dpH, dpHLoc, Math.abs(dpH - dpHLoc) <= 2);
run(`agent-browser --session ref press Escape`);
run(`agent-browser --session loc press Escape`);
await new Promise(r => setTimeout(r, 800));

// ---------- 4. Add Asset (the text layer) ----------
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} open "${base}/assets"`);
  await new Promise(r => setTimeout(r, 3000));
  let ref = findRef(s, "Add Asset");
  if (!ref) { await new Promise(r => setTimeout(r, 1800)); ref = findRef(s, "Add Asset"); }
  if (ref) click(s, ref);
  await new Promise(r => setTimeout(r, 2200));
}
const asRef = evalOn("ref", dlgProbe), asLoc = evalOn("loc", dlgProbe);
record("asset: inputs (ph/type/required)", asRef?.inputs, asLoc?.inputs, cmp(asRef?.inputs, asLoc?.inputs));
record("asset: buttons", asRef?.buttons, asLoc?.buttons, cmp(asRef?.buttons, asLoc?.buttons));
record("asset: width", asRef?.w, asLoc?.w, asRef?.w === asLoc?.w);
const optProbe = `(()=> {
  const dlg = document.querySelector('[role=dialog]');
  if (!dlg) return null;
  const sel = dlg.querySelector('select');
  return JSON.stringify(sel ? Array.from(sel.options).map(o => o.textContent) : null);
})()`;
const aoRef = evalOn("ref", optProbe), aoLoc = evalOn("loc", optProbe);
record("asset: assign options text", aoRef, aoLoc, cmp(aoRef, aoLoc));
run(`agent-browser --session ref press Escape`);
run(`agent-browser --session loc press Escape`);

// ---------- summary ----------
const matches = results.filter(r => r.match).length;
console.log(`\n${matches}/${results.length} MATCH`);
