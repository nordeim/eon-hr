#!/usr/bin/env node
// capture-r35.mjs — session-36 / parity round 35 screenshots:
// the user-menu pair (the w-48 amendment), the 404 pair (the wrapper
// re-centering), the settings pairs (workflows+dialog, theme presets,
// logs island), the add-shift dialog, the compliance select pair.
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
async function open(session, url, ms = 2800) {
  run(`agent-browser --session ${session} open "${url}"`);
  await new Promise(r => setTimeout(r, ms));
}
async function clickPattern(session, pattern, ms = 900) {
  const ref = findRef(session, pattern);
  if (!ref) { console.log(`  [${session}] NO-REF: ${pattern}`); return false; }
  run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, ms));
  return true;
}
const shot = (session, name) => run(`agent-browser --session ${session} screenshot ${SHOTS}/${name}.png`);

// 1) the user-menu pair (both apps, menu open, desktop /settings)
await open("ref", "https://eon.base44.app/settings");
await open("loc", "http://127.0.0.1:3200/settings");
for (const s of ["ref", "loc"]) await clickPattern(s, "sepnetflix2023", 1000);
shot("ref", "128-ref-user-menu");
shot("loc", "128b-loc-user-menu");
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} press Escape`);

// 2) the 404 pair (re-centered at y=306)
await open("ref", "https://eon.base44.app/nonexistentroute123", 2600);
await open("loc", "http://127.0.0.1:3200/nonexistentroute123", 2600);
shot("ref", "129-ref-404");
shot("loc", "129b-loc-404");

// 3) the workflows tab pair (the Add Workflow header action + the dialog)
await open("ref", "https://eon.base44.app/settings");
await open("loc", "http://127.0.0.1:3200/settings");
for (const s of ["ref", "loc"]) await clickPattern(s, '"Approval Workflows"', 1100);
shot("ref", "130-ref-workflows-tab");
shot("loc", "130b-loc-workflows-tab");
// the dialog (both — REF's measured contract vs the clone's)
for (const s of ["ref", "loc"]) await clickPattern(s, "Add Workflow", 1200);
shot("ref", "131-ref-workflow-dialog");
shot("loc", "131b-loc-workflow-dialog");
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} press Escape`);
await new Promise(r => setTimeout(r, 600));

// 4) the theme presets pair (Quick Presets + dark Save Theme)
for (const s of ["ref", "loc"]) await clickPattern(s, '"Theme & Layout"', 1300);
shot("ref", "132-ref-theme-presets");
shot("loc", "132b-loc-theme-presets");

// 5) the logs island pair (slate-50 wrapper + 48px FileText empty)
for (const s of ["ref", "loc"]) await clickPattern(s, '"System Logs"', 1300);
shot("ref", "133-ref-logs-island");
shot("loc", "133b-loc-logs-island");

// 6) the add-shift dialog (clone superset; REF's for the record)
for (const s of ["ref", "loc"]) await clickPattern(s, '"Shifts"', 1100);
for (const s of ["ref", "loc"]) await clickPattern(s, "Add Shift", 1200);
shot("ref", "134-ref-add-shift-dialog");
shot("loc", "134b-loc-add-shift-dialog");
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} press Escape`);

// 7) the compliance select pair (Saudi taxonomy)
await open("ref", "https://eon.base44.app/compliancedashboard", 3200);
await open("loc", "http://127.0.0.1:3200/compliancedashboard", 3200);
for (const s of ["ref", "loc"]) await clickPattern(s, "All Types", 1000);
shot("ref", "135-ref-compliance-select");
shot("loc", "135b-loc-compliance-select");
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} press Escape`);

console.log("captures done:", run(`ls ${SHOTS} | grep -c "^13[0-9]"`));
