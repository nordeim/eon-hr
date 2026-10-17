#!/usr/bin/env node
// r48-screenshots.mjs — the round's evidence captures: REF + zero-tenant
// LOC pairs of the round's families (the stat tags, the no-tile rewrite,
// the affordances, the merged roots, the stubs) at 1440x900.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function shot(session, base, route, file) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}${route}`);
  await new Promise(r => setTimeout(r, 2300));
  run(`agent-browser --session ${session} screenshot /home/z/my-project/eon-hr/docs/screenshots/${file}`);
  console.log(`ok ${file}`);
}

const baseRef = "https://eon.base44.app", baseZero = "http://127.0.0.1:3201";
const PAIRS = [
  // the four analytics compacts + the no-tile rewrite + the mt-4 family
  ["/attendancedashboard", "184"],
  ["/performancemanagement", "185"],
  ["/advancedanalytics", "186"],
  // the affordances + the merged root + the stubs
  ["/announcements", "187"],
  ["/hrletters", "188"],
  ["/templates", "189"],
  ["/assetmanagement", "190"],
  ["/employeedetail", "191"],
  ["/compliancedashboard", "192"],
];
for (const [route, n] of PAIRS) {
  await shot("ref", baseRef, route, `${n}-ref-r47.png`);
  await shot("loc0", baseZero, route, `${n}b-loc0-r47.png`);
}
console.log("captures done");
