#!/usr/bin/env node
// probe-r17-band640.mjs — docW + h1 sweep of the never-audited 640–767 band
// (all 46 routes @640 and @700 — mobile chrome active, full headers visible).
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
  const h1 = [...document.querySelectorAll("h1")].find(h => h.offsetParent !== null && h.getBoundingClientRect().y > 80);
  if (h1) { const r = h1.getBoundingClientRect(); out.h1 = { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y) }; }
  return JSON.stringify(out);
})()`;

const ROUTES = ["/dashboard", "/employees", "/payroll", "/payrollmodule", "/payrollengine", "/leavemanagement", "/allleaverequests", "/expenses", "/loans", "/recruitment", "/recruitmentkanban", "/interviewassistant", "/training", "/taskmanager", "/attendance", "/shiftcalendar", "/documenttracker", "/compliancedashboard", "/performancemanagement", "/evaluations", "/hrreports", "/analytics", "/analyticsdashboard", "/advancedanalytics", "/surveyanalytics", "/organogram", "/employeeselfservice", "/staffrequests", "/hrletters", "/surveys", "/announcements", "/assetmanagement", "/attendancedashboard", "/chat", "/communications", "/companywall", "/offboarding", "/profile", "/reports", "/securitysettings", "/settings", "/templates", "/workflowautomation", "/workflowconfigpage", "/hrassistantchat", "/notificationpreferences"];

async function sweep(session, base, vp) {
  run(`agent-browser --session ${session} set viewport ${vp} 844`);
  await new Promise(r => setTimeout(r, 1000));
  const results = [];
  for (const route of ROUTES) {
    run(`agent-browser --session ${session} open "${base}${route}"`);
    await new Promise(r => setTimeout(r, 1100));
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
for (const vp of [700]) {
  const ref = await sweep("ref", baseRef, vp);
  const loc = await sweep("loc", baseLoc, vp);
  console.log(`\n═══ @${vp} (46 routes) ═══`);
  for (let i = 0; i < ROUTES.length; i++) {
    const r = ref[i], l = loc[i];
    if (r.error || l.error) { console.log(`ERR   ${ROUTES[i]}`); flags++; continue; }
    const notes = [];
    const bothOver = r.docW > r.vw + 1 && l.docW > l.vw + 1;
    if (r.docW !== l.docW) notes.push(`docW ref=${r.docW} loc=${l.docW}${bothOver ? " (both over — REF family)" : ""}`);
    if (r.h1 && l.h1 && (r.h1.h !== l.h1.h || Math.abs(r.h1.y - l.h1.y) > 6)) notes.push(`h1 ref=${JSON.stringify(r.h1)} loc=${JSON.stringify(l.h1)}`);
    if (notes.length) { console.log(`DIFF  ${ROUTES[i]} — ${notes.join(" | ")}`); flags++; }
    else console.log(`OK    ${ROUTES[i]}`);
  }
}
console.log(`\nBAND640/700: ${flags} flagged`);
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc set viewport 1440 900`);
