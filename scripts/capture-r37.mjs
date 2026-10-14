#!/usr/bin/env node
// capture-r37.mjs — session-38 / parity round 37 screenshots:
// the keyboard/focus dimension — the loans text-layer pair, the Add Level
// mr-1 pair, the focus-restore pair (the focused trigger after Escape),
// the asset at-rest enabled submit pair.
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
  run(`agent-browser --session ${session} set viewport 1440 900`);
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

// 140: the loans dialog pair (the text layer — the apartment placeholder,
// the 0 amount, the New Era LLC paid-from)
await open("ref", "https://eon.base44.app/loans");
await open("loc", "http://127.0.0.1:3200/loans");
for (const s of ["ref", "loc"]) await clickPattern(s, "New Loan Request", 2200);
shot("ref", "140-ref-loans-text-layer");
shot("loc", "140b-loc-loans-text-layer");
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} press Escape`);
await new Promise(r => setTimeout(r, 900));

// 141: the workflow dialog pair (the Add Level 113×32 — the mr-1 recipe)
for (const [s, base] of [["ref", "https://eon.base44.app"], ["loc", "http://127.0.0.1:3200"]]) {
  await open(s, `${base}/settings`);
  await clickPattern(s, `tab "Approval Workflows"`, 2600);
  await clickPattern(s, "Add Workflow", 2200);
}
shot("ref", "141-ref-add-level-mr1");
shot("loc", "141b-loc-add-level-mr1");
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} press Escape`);
await new Promise(r => setTimeout(r, 900));

// 142: the focus-restore pair — Escape closes the dialog and the TRIGGER
// regains focus (the keyboard focus ring on the Add Asset button)
for (const [s, base] of [["ref", "https://eon.base44.app"], ["loc", "http://127.0.0.1:3200"]]) {
  await open(s, `${base}/assets`);
  await clickPattern(s, "Add Asset", 2200);
  run(`agent-browser --session ${s} press Escape`);
  await new Promise(r => setTimeout(r, 1300));
}
shot("ref", "142-ref-focus-restore");
shot("loc", "142b-loc-focus-restore");

// 143: the asset dialog pair (the at-rest ENABLED submit — R37-B)
for (const [s, base] of [["ref", "https://eon.base44.app"], ["loc", "http://127.0.0.1:3200"]]) {
  await open(s, `${base}/assets`);
  await clickPattern(s, "Add Asset", 2200);
}
shot("ref", "143-ref-asset-enabled-submit");
shot("loc", "143b-loc-asset-enabled-submit");
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} press Escape`);

console.log("done");
