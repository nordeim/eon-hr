#!/usr/bin/env node
// probe-r37-taborder2.mjs — extend the keyboard census to the asset + loan
// dialogs (round-34 geometry-verified; never focus-probed) + the bell
// popover + user menu focus behavior.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { raw: out.trim().slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

function findRef(session, pattern, kind = "button") {
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const lines = snap.split("\n");
  const re = new RegExp(`- ${kind} "[^"]*${pattern}[^"]*"((?!\\])[^\\n])*ref=(\\w+)\\]`);
  for (const line of lines) { const m = line.match(re); if (m) return m[2]; }
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
  const ph = el.getAttribute('placeholder');
  if (ph) bits.push('ph=' + ph);
  const txt = (el.textContent || '').trim().slice(0, 18);
  if (txt && tag !== 'input' && tag !== 'textarea') bits.push('txt=' + txt);
  const r = el.getBoundingClientRect();
  bits.push(Math.round(r.x) + ',' + Math.round(r.y) + ',' + Math.round(r.width) + 'x' + Math.round(r.height));
  return bits.join(' ');
})()`;

const DIALOG_STATE = `(() => { return { dlgOpen: !!document.querySelector('[role=dialog]') }; })()`;

async function probeSimpleDialog(label, session, base, path, addLabel) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}${path}`);
  await new Promise(r => setTimeout(r, 3500));
  const addRef = findRef(session, addLabel.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"));
  if (!addRef) return { error: "no add button: " + addLabel };
  run(`agent-browser --session ${session} click @${addRef}`);
  await new Promise(r => setTimeout(r, 1300));
  const state0 = await evalOn(session, DIALOG_STATE);
  if (!state0.dlgOpen) return { error: "dialog did not open" };
  const seq = [await evalOn(session, DESCRIBE)];
  for (let i = 0; i < 8; i++) {
    run(`agent-browser --session ${session} press Tab`);
    await new Promise(r => setTimeout(r, 220));
    seq.push(await evalOn(session, DESCRIBE));
  }
  run(`agent-browser --session ${session} press Escape`);
  await new Promise(r => setTimeout(r, 900));
  const afterEsc = await evalOn(session, DESCRIBE);
  return { initial: seq[0], seq: seq.slice(1), afterEsc };
}

// asset + loan dialogs
for (const [label, path, addLabel] of [
  ["Add Asset", "/assets", "Add Asset"],
  ["New Loan Request", "/staffrequests", "New Loan Request"],
]) {
  const ref = await probeSimpleDialog(label, "ref", baseRef, path, addLabel);
  const loc = await probeSimpleDialog(label, "loc", baseLoc, path, addLabel);
  console.log(`\n===== ${label} =====`);
  console.log(`REF: ${JSON.stringify(ref, null, 1)}`);
  console.log(`LOC: ${JSON.stringify(loc, null, 1)}`);
  console.log(JSON.stringify(ref) === JSON.stringify(loc) ? "MATCH" : "DIFF");
}
