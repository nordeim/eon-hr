#!/usr/bin/env node
// probe-r13-sweep.mjs — full 46-route desktop sweep comparing h1 metrics +
// first stat-cards + header buttons between REF and LOC.
// Usage: node scripts/probe-r13-sweep.mjs
const { execSync } = await import("node:child_process");

const PROBE = `(() => {
  const out = { url: location.pathname, docW: document.documentElement.scrollWidth };
  const h1 = [...document.querySelectorAll("h1")].find(h => h.offsetParent !== null);
  if (h1) {
    const r = h1.getBoundingClientRect();
    const cs = getComputedStyle(h1);
    out.h1 = { t: h1.textContent.trim().slice(0, 22), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), fs: cs.fontSize, fw: cs.fontWeight };
  }
  const cards = [...document.querySelectorAll("main .grid > div")].slice(0, 6);
  out.gridCards = cards.map(c => {
    const r = c.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y) };
  }).filter(c => c.h > 40 && c.h < 400);
  const btns = [...document.querySelectorAll("main button")].filter(b => { const y = b.getBoundingClientRect().y; return y < 260 && y > 40; });
  out.headerBtns = btns.map(b => { const r = b.getBoundingClientRect(); return { y: Math.round(r.y), w: Math.round(r.w0 || r.width), h: Math.round(r.height), t: (b.textContent || "").trim().slice(0, 12) }; }).slice(0, 8);
  return JSON.stringify(out);
})()`;

async function measure(session, base, route) {
  const url = base + route;
  try {
    execSync(`agent-browser --session ${session} open "${url}"`, { stdio: "pipe", timeout: 45000 });
  } catch { /* continue */ }
  await new Promise(r => setTimeout(r, 1500));
  const oneLine = PROBE.split("\n").join(" ");
  try {
    const out = execSync(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 30000 });
    return JSON.parse(out.toString().trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
  } catch (e) {
    return { error: String(e).slice(0, 60) };
  }
}

const ROUTES = ["/dashboard","/employees","/payroll","/payrollmodule","/payrollengine","/taskmanager","/leavemanagement","/allleaverequests","/expenses","/loans","/attendance","/attendancedashboard","/shiftcalendar","/recruitment","/recruitmentkanban","/interviewassistant","/training","/compliancedashboard","/documenttracker","/performancemanagement","/evaluations","/offboarding","/organogram","/companywall","/chat","/communications","/announcements","/templates","/workflowautomation","/workflowconfigpage","/surveys","/surveyanalytics","/hrreports","/hrletters","/analytics","/analyticsdashboard","/advancedanalytics","/attendancedashboard","/reports","/profile","/settings","/securitysettings","/notificationpreferences","/staffrequests","/hrassistantchat","/employeeselfservice"];

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
for (const route of ROUTES) {
  const ref = await measure("ref", baseRef, route);
  const loc = await measure("loc", baseLoc, route);
  const diffs = [];
  const j = JSON.stringify;
  if (ref.error || loc.error) { console.log(`${route} | ERROR ref=${ref.error} loc=${loc.error}`); continue; }
  if (j(ref.h1) !== j(loc.h1)) diffs.push(`h1: R ${j(ref.h1)} L ${j(loc.h1)}`);
  const n = Math.max(ref.gridCards?.length || 0, loc.gridCards?.length || 0);
  for (let i = 0; i < n; i++) {
    const a = ref.gridCards?.[i], b = loc.gridCards?.[i];
    if (j(a) !== j(b)) { diffs.push(`card${i}: R ${j(a)} L ${j(b)}`); break; }
  }
  if (j(ref.headerBtns) !== j(loc.headerBtns)) diffs.push(`btns: R ${j(ref.headerBtns)} L ${j(loc.headerBtns)}`);
  if (diffs.length === 0) console.log(`${route} | OK (h1 ${ref.h1?.t} ${ref.h1?.fs})`);
  else console.log(`${route} | **DIFF** ${diffs.join(" || ").slice(0, 400)}`);
}
