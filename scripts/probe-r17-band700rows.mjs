#!/usr/bin/env node
// probe-r17-band700rows.mjs — enumerate REF's header-row classes at 700px
// across the flagged pages (REF may be per-page inconsistent: payrollmodule
// measured md:flex-row, but allleaverequests' title wraps like a row layout).
// Also measures the mobile top bar height at 700 (the 12px y-delta mystery).
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 100);
  }
}

const PROBE = `(() => {
  const out = {};
  const header = document.querySelector("main > header") || document.querySelector("header");
  if (header) { const r = header.getBoundingClientRect(); out.topBar = { h: Math.round(r.height), y: Math.round(r.y), w: Math.round(r.width) }; }
  const h1 = [...document.querySelectorAll("h1")].find(h => h.offsetParent !== null && h.getBoundingClientRect().y > 70);
  if (h1) {
    const r = h1.getBoundingClientRect();
    out.h1 = { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y) };
    let row = h1.parentElement;
    while (row && row !== document.body) {
      const cs = getComputedStyle(row);
      if (cs.display === "flex" && row.getBoundingClientRect().width > 300 && row.querySelectorAll("h1").length === 1 && row.parentElement?.querySelectorAll("h1").length === 1 && [...row.children].some(c => !c.contains(h1) && c.getBoundingClientRect().height > 20)) break;
      row = row.parentElement;
    }
    if (row && row !== document.body) {
      const rr = row.getBoundingClientRect(); const rcs = getComputedStyle(row);
      out.row = { cls: String(row.className).slice(0, 85), dir: rcs.flexDirection, wrap: rcs.flexWrap, w: Math.round(rr.width) };
    }
  }
  return JSON.stringify(out);
})()`;

async function measure(session, base, route) {
  run(`agent-browser --session ${session} open "${base}${route}"`);
  await new Promise(r => setTimeout(r, 1400));
  const oneLine = PROBE.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
  } catch {
    return { error: out.slice(0, 90) };
  }
}

const ROUTES = process.argv.slice(2).length ? process.argv.slice(2) : [
  "/payrollmodule", "/allleaverequests", "/compliancedashboard", "/advancedanalytics",
  "/evaluations", "/offboarding", "/workflowautomation", "/organogram", "/documenttracker",
  "/hrletters", "/reports", "/communications", "/companywall", "/securitysettings",
];
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
run(`agent-browser --session ref set viewport 700 844`);
run(`agent-browser --session loc set viewport 700 844`);
await new Promise(r => setTimeout(r, 800));
for (const route of ROUTES) {
  const ref = await measure("ref", baseRef, route);
  const loc = await measure("loc", baseLoc, route);
  console.log(`\n${route}`);
  console.log(`  REF: ${JSON.stringify(ref)}`);
  console.log(`  LOC: ${JSON.stringify(loc)}`);
}
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc set viewport 1440 900`);
