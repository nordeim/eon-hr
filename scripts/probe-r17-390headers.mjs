#!/usr/bin/env node
// probe-r17-390headers.mjs — the non-category-A header story at 390 (never
// compared): REF's actionsStart rows are UNPREFIXED always-row; the clone is
// column below sm (640). Do REF's headers really render row at 390?
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
  const h1 = [...document.querySelectorAll("h1")].find(h => h.offsetParent !== null && h.getBoundingClientRect().y > 70);
  if (!h1) return JSON.stringify({ noH1: true });
  const r = h1.getBoundingClientRect();
  out.h1 = { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y), fs: getComputedStyle(h1).fontSize };
  let row = h1.parentElement;
  while (row && row !== document.body) {
    const cs = getComputedStyle(row);
    if (cs.display === "flex" && row.getBoundingClientRect().width > 200 && [...row.children].some(c => !c.contains(h1) && c.getBoundingClientRect().height > 20 && c.getBoundingClientRect().y < r.y + 200)) break;
    row = row.parentElement;
  }
  if (row && row !== document.body) {
    const rr = row.getBoundingClientRect(); const rcs = getComputedStyle(row);
    out.row = { cls: String(row.className).slice(0, 70), dir: rcs.flexDirection, w: Math.round(rr.width) };
    const btn = [...row.querySelectorAll("button")].filter(b => b.textContent.trim().length > 2).map(b => { const br = b.getBoundingClientRect(); return { t: b.textContent.trim().slice(0, 12), x: Math.round(br.x), y: Math.round(br.y) }; }).slice(0, 3);
    out.rowBtns = btn;
  }
  out.docW = document.documentElement.scrollWidth;
  return JSON.stringify(out);
})()`;

async function measure(session, base, route, settle = 2200) {
  run(`agent-browser --session ${session} open "${base}${route}"`);
  await new Promise(r => setTimeout(r, settle));
  const oneLine = PROBE.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
  } catch {
    return { error: out.slice(0, 90) };
  }
}

const ROUTES = ["/allleaverequests", "/compliancedashboard", "/workflowautomation", "/offboarding", "/advancedanalytics", "/payrollmodule", "/documenttracker"];
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
run(`agent-browser --session ref set viewport 390 844`);
run(`agent-browser --session loc set viewport 390 844`);
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
