#!/usr/bin/env node
// capture-r36.mjs — session-37 / parity round 36 screenshots:
// the dialog form contracts — the Add Department rebuild pair, the
// workflow dialog pair (the form + required), the Add Shift pair (the
// 60/0 defaults), the asset dialog pair (the text layer).
import { execSync } from "node:child_process";

const SHOTS = "/home/z/my-project/eon-hr/docs/screenshots";
function run(cmd) {
  try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); }
  catch (e) { return "ERR:" + String(e).slice(0, 140); }
}
function findRef(session, pattern) {
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  for (const line of snap.split("\n")) {
    if (line.includes(pattern)) {
      const m = line.match(/ref=(\w+)\]/);
      if (m) return m[1];
    }
  }
  return null;
}
async function open(session, url, ms = 3000) {
  run(`agent-browser --session ${session} open "${url}"`);
  await new Promise(r => setTimeout(r, ms));
}
async function clickPattern(session, pattern, ms = 1200) {
  const ref = findRef(session, pattern);
  if (!ref) { console.log(`  [${session}] NO-REF: ${pattern}`); return false; }
  run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, ms));
  return true;
}
const shot = (session, name) => run(`agent-browser --session ${session} screenshot ${SHOTS}/${name}.png`);

async function openSettingsTab(session, tab) {
  await open(session, session === "ref" ? "https://eon.base44.app/settings" : "http://127.0.0.1:3200/settings");
  await clickPattern(session, `tab "${tab}"`, 2600);
}

// 136: the Add Department dialog pair (the round's rebuild)
await openSettingsTab("ref", "Departments");
await openSettingsTab("loc", "Departments");
for (const s of ["ref", "loc"]) await clickPattern(s, "Add Department", 2200);
shot("ref", "136-ref-add-department-dialog");
shot("loc", "136b-loc-add-department-dialog");
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} press Escape`);
await new Promise(r => setTimeout(r, 900));

// 137: the Create Approval Workflow dialog pair (the form contract)
await openSettingsTab("ref", "Approval Workflows");
await openSettingsTab("loc", "Approval Workflows");
for (const s of ["ref", "loc"]) await clickPattern(s, "Add Workflow", 2200);
shot("ref", "137-ref-workflow-form-dialog");
shot("loc", "137b-loc-workflow-form-dialog");
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} press Escape`);
await new Promise(r => setTimeout(r, 900));

// 138: the Add Shift dialog pair (the 60/0 defaults visible in the fields)
await openSettingsTab("ref", "Shifts");
await openSettingsTab("loc", "Shifts");
for (const s of ["ref", "loc"]) await clickPattern(s, "Add Shift", 2200);
shot("ref", "138-ref-add-shift-defaults");
shot("loc", "138b-loc-add-shift-defaults");
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} press Escape`);
await new Promise(r => setTimeout(r, 900));

// 139: the asset dialog pair (the text layer: Macbook Air 2024 + bare serial)
await open("ref", "https://eon.base44.app/assets");
await open("loc", "http://127.0.0.1:3200/assets");
for (const s of ["ref", "loc"]) await clickPattern(s, "Add Asset", 2200);
shot("ref", "139-ref-asset-dialog-text");
shot("loc", "139b-loc-asset-dialog-text");
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} press Escape`);

console.log("done");
