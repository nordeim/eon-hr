#!/usr/bin/env node
// probe-r37-taborder.mjs — session-38 / parity round 37 frontier census:
// the KEYBOARD/FOCUS dimension on the dialog family (never probed before).
// For each dialog: initial focus on open, the Tab sequence (10 presses),
// and the focus-restore after Escape. Both apps, structural compare.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

function findRef(session, pattern, kind = "button") {
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const lines = snap.split("\n");
  const re = new RegExp(`- ${kind} "[^"]*${pattern}[^"]*"((?!\\])[^\\n])*ref=(\\w+)\\]`);
  for (const line of lines) {
    const m = line.match(re);
    if (m) return m[2];
  }
  // fallback: attribute-bearing line (expanded=false, ref=…)
  const re2 = new RegExp(`- ${kind} [^\\[]*\\[[^\\]]*${pattern}[^\\]]*ref=(\\w+)\\]`);
  for (const line of lines) {
    const m = line.match(re2);
    if (m) return m[1];
  }
  return null;
}

const DESCRIBE = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return 'BODY';
  const tag = el.tagName.toLowerCase();
  const bits = [tag];
  if (el.type) bits.push('type=' + el.type);
  if (el.getAttribute('role')) bits.push('role=' + el.getAttribute('role'));
  if (el.id) bits.push('id=' + el.id);
  if (el.name) bits.push('name=' + el.name);
  const ph = el.getAttribute('placeholder');
  if (ph) bits.push('ph=' + ph);
  const lbl = el.getAttribute('aria-label');
  if (lbl) bits.push('al=' + lbl);
  const txt = (el.textContent || '').trim().slice(0, 18);
  if (txt && tag !== 'input' && tag !== 'textarea') bits.push('txt=' + txt);
  const r = el.getBoundingClientRect();
  bits.push(Math.round(r.x) + ',' + Math.round(r.y) + ',' + Math.round(r.width) + 'x' + Math.round(r.height));
  return bits.join(' ');
})()`;

const DIALOG_STATE = `(() => { return { dlgOpen: !!document.querySelector('[role=dialog]') }; })()`;

// The three settings dialogs: [tabLabel, addLabel, dialogTitle]
const DIALOGS = [
  ["Departments", "Add Department", "Add Department"],
  ["Approval Workflows", "Add Workflow", "Create Approval Workflow"],
  ["Shifts", "Add Shift", "Add Shift"],
];

async function probeDialog(label, session, base, tabLabel, addLabel) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/settings`);
  await new Promise(r => setTimeout(r, 3500));
  // switch tab
  let tabRef = findRef(session, tabLabel.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "tab");
  if (!tabRef) tabRef = findRef(session, tabLabel.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "button");
  if (!tabRef) return { error: "no tab ref for " + tabLabel };
  run(`agent-browser --session ${session} click @${tabRef}`);
  await new Promise(r => setTimeout(r, 1800));
  // open the dialog
  const addRef = findRef(session, addLabel.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"));
  if (!addRef) return { error: "no add button ref for " + addLabel };
  run(`agent-browser --session ${session} click @${addRef}`);
  await new Promise(r => setTimeout(r, 1300));
  const state0 = await evalOn(session, DIALOG_STATE);
  if (!state0.dlgOpen) return { error: "dialog did not open" };
  // initial focus + tab sequence
  const seq = [await evalOn(session, DESCRIBE)];
  for (let i = 0; i < 10; i++) {
    run(`agent-browser --session ${session} press Tab`);
    await new Promise(r => setTimeout(r, 220));
    seq.push(await evalOn(session, DESCRIBE));
  }
  // escape + restore
  run(`agent-browser --session ${session} press Escape`);
  await new Promise(r => setTimeout(r, 900));
  const afterEsc = await evalOn(session, DESCRIBE);
  const stateEsc = await evalOn(session, DIALOG_STATE);
  return { initial: seq[0], seq: seq.slice(1), afterEsc, dlgClosedAfterEsc: !stateEsc.dlgOpen };
}

const results = [];
for (const [tabLabel, addLabel, dlgTitle] of DIALOGS) {
  const ref = await probeDialog(dlgTitle, "ref", baseRef, tabLabel, addLabel);
  const loc = await probeDialog(dlgTitle, "loc", baseLoc, tabLabel, addLabel);
  const match = JSON.stringify(ref) === JSON.stringify(loc);
  results.push({ dlg: dlgTitle, match });
  console.log(`\n===== ${dlgTitle} =====`);
  console.log(`REF: ${JSON.stringify(ref, null, 1)}`);
  console.log(`LOC: ${JSON.stringify(loc, null, 1)}`);
  console.log(match ? "MATCH" : "DIFF");
}

console.log("\n===== SUMMARY =====");
for (const r of results) console.log(`${r.match ? "MATCH " : "DIFF  "} ${r.dlg}`);
