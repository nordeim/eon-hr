#!/usr/bin/env node
// probe-r17-tablet2.mjs — tablet-band geometry sweep (768/900/1024): docW
// overflow + h1 wrap on both REF and LOC across the REMAINING routes (the
// r16 sweep covered the 17 fitting-sensitive ones; this finishes the map —
// session_26's suggested frontier). Usage: node scripts/probe-r17-tablet2.mjs
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 100);
  }
}

const PROBE = `(() => {
  const out = { vw: window.innerWidth, docW: document.documentElement.scrollWidth };
  const h1 = [...document.querySelectorAll("h1")].find(h => h.offsetParent !== null);
  if (h1) { const r = h1.getBoundingClientRect(); out.h1 = { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y) }; }
  const wide = [...document.querySelectorAll("main *")].filter(e => { const r = e.getBoundingClientRect(); return r.right > window.innerWidth + 1 && r.width > 80; }).slice(0, 2);
  out.overflow = wide.map(e => { const r = e.getBoundingClientRect(); return { cls: String(e.className).slice(0, 40), w: Math.round(r.width), right: Math.round(r.right) }; });
  return JSON.stringify(out);
})()`;

// The remaining routes NOT covered by probe-r16-tablet.mjs
const ROUTES = [
  "/advancedanalytics", "/allleaverequests", "/analyticsdashboard", "/announcements",
  "/assetmanagement", "/attendancedashboard", "/communications", "/companywall",
  "/documenttracker", "/employeeselfservice", "/evaluations", "/hrassistantchat",
  "/hrletters", "/interviewassistant", "/loans", "/notificationpreferences",
  "/offboarding", "/organogram", "/payrollengine", "/payrollmodule",
  "/performancemanagement", "/recruitmentkanban", "/securitysettings", "/shiftcalendar",
  "/staffrequests", "/surveyanalytics", "/templates", "/workflowconfigpage",
];

async function sweep(session, base, vp) {
  run(`agent-browser --session ${session} set viewport ${vp} 844`);
  await new Promise(r => setTimeout(r, 1200));
  const results = [];
  for (const route of ROUTES) {
    run(`agent-browser --session ${session} open "${base}${route}"`);
    await new Promise(r => setTimeout(r, 1300));
    const oneLine = PROBE.split("\n").join(" ");
    try {
      const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
      results.push(JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")));
    } catch {
      results.push({ error: true });
    }
  }
  return results;
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
let flags = 0;
for (const vp of [768, 900, 1024]) {
  const ref = await sweep("ref", baseRef, vp);
  const loc = await sweep("loc", baseLoc, vp);
  console.log(`\n═══ @${vp} ═══`);
  for (let i = 0; i < ROUTES.length; i++) {
    const r = ref[i], l = loc[i];
    if (r.error || l.error) { console.log(`ERR   ${ROUTES[i]}`); flags++; continue; }
    const notes = [];
    // BOTH overflow the same way → REF's own bug (family) — not a gap
    const bothOverflow = r.docW > r.vw + 1 && l.docW > l.vw + 1;
    if (r.docW !== l.docW) {
      notes.push(`docW ref=${r.docW} loc=${l.docW}${bothOverflow ? " (both overflow — REF family)" : ""}`);
    }
    if (r.h1 && l.h1 && (r.h1.h !== l.h1.h || Math.abs(r.h1.y - l.h1.y) > 6)) {
      notes.push(`h1 ref=${JSON.stringify(r.h1)} loc=${JSON.stringify(l.h1)}`);
    }
    if (notes.length) { console.log(`DIFF  ${ROUTES[i]} — ${notes.join(" | ")}`); flags++; }
    else console.log(`OK    ${ROUTES[i]} (docW ${l.docW})`);
  }
}
console.log(`\nTABLET2: ${flags} flagged route×viewport combos`);
