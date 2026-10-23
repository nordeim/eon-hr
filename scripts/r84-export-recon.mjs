#!/usr/bin/env node
// r84-export-recon.mjs — session 84 / parity round 83: THE EXPORT/PRINT
// TOOLBAR ACTION MATRIX recon (the r83 close-out's first suggested fresh-
// eyes frontier — never audited before). The r83 round closed with the
// candidate surfaces: "the print/export toolbar actions, the form-
// validation error states, the keyboard-navigation cycle".
// The opening probes (live, this round):
//   REF /attendance: Print → window.print() ONCE (real); PDF → NOTHING;
//   Excel → NOTHING (no print/open/toast/download; buttons not disabled)
//   LOC /attendance: Print → window.print() (real, parity); PDF/Excel →
//   the toast-superset pattern ("Export queued…", the same documented
//   class as Devices/Settings — "the reference leaves both dead")
// This recon walks the FULL 61-route registry on both sides census-ing
// the export/print cluster membership + geometry, so the classification
// (Print real / PDF+Excel dead on the REF) can be verified route by route
// and any route where the cluster diverges (present one side, absent the
// other; or different labels/geometry) surfaces for the deep read.
// Usage: node scripts/r84-export-recon.mjs
import { execSync } from "node:child_process";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 160); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app";
const baseLoc = "http://127.0.0.1:3200";
// the full 61-route registry (the session-32 orphan-route hunt's set)
const ROUTES = ["/dashboard","/employees","/payroll","/taskmanager","/attendance","/recruitment","/training","/documenttracker","/profile","/settings","/staffrequests","/careers","/dashboard/analytics","/announcements","/assetmanagement","/attendancekiosk","/attendancedashboard","/communication","/compliance","/dashboard/requests","/departments","/documents","/employeeperformance","/employeesdirectory","/employeeselfservice","/employeetimeoffs","/externaljobapplication","/hrletters","/integrations","/interviews","/jobpostings","/leavecalendar","/leavemanagement","/onboarding","/organizationchart","/payrollai","/payrollemployees","/payrollmodule","/payrollprocessing","/payrollreports","/payrollsettings","/performance","/recruitersportal","/recruitmentanalytics","/requests","/requestsettings","/resources","/surveys","/surveyanalytics","/surveytemplates","/shiftmanagement","/shiftswap","/templates","/tenantsetup","/workflowautomation","/workflowconfigpage","/workflowdashboard","/workflowexecutions","/workflowtemplates"];

// the export/print cluster census: buttons whose text/aria matches the
// export family (print/pdf/excel/export/download/csv/report) with geometry
const CENSUS = `(() => {
  const fam = /^(print|pdf|excel|export|download|csv|report(s)?|save|share)$/i;
  const btns = [...document.querySelectorAll('main button')].map(b => {
    const t = (b.textContent || '').trim();
    const a = b.getAttribute('aria-label') || '';
    const svg = b.querySelector('svg') ? (b.querySelector('svg').getAttribute('class') || '').match(/lucide-([a-z-]+)/) : null;
    return { t, a, icon: svg ? svg[1] : null };
  }).filter(b => fam.test(b.t) || fam.test(b.a));
  const out = [];
  for (const b of btns) {
    const el = [...document.querySelectorAll('main button')].find(x => (x.textContent || '').trim() === b.t && x.querySelector('svg')?.getAttribute('class')?.includes('lucide-' + (b.icon || '')));
    const r = el ? el.getBoundingClientRect() : null;
    out.push({ label: b.t || b.a, icon: b.icon, x: r ? Math.round(r.x) : null, y: r ? Math.round(r.y) : null, w: r ? Math.round(r.width) : null, h: r ? Math.round(r.height) : null });
  }
  return out;
})()`;

async function walk(session, base, label) {
  const found = {};
  for (const route of ROUTES) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 1600));
    const c = await evalOn(session, CENSUS);
    if (Array.isArray(c) && c.length) found[route] = c;
  }
  return found;
}

const refFound = await walk("ref", baseRef, "REF");
const locFound = await walk("loc", baseLoc, "LOC");

console.log("=== REF export-cluster routes (" + Object.keys(refFound).length + ") ===");
for (const [r, btns] of Object.entries(refFound)) console.log(r, JSON.stringify(btns.map(b => b.label + "(" + (b.icon || "?") + " " + b.w + "x" + b.h + ")")));
console.log("=== LOC export-cluster routes (" + Object.keys(locFound).length + ") ===");
for (const [r, btns] of Object.entries(locFound)) console.log(r, JSON.stringify(btns.map(b => b.label + "(" + (b.icon || "?") + " " + b.w + "x" + b.h + ")")));

// the parity compare: cluster membership per route (label sets)
console.log("=== PARITY (cluster label sets, route by route) ===");
let match = 0, diverge = 0;
for (const route of ROUTES) {
  const rset = (refFound[route] || []).map(b => b.label).sort().join(",");
  const lset = (locFound[route] || []).map(b => b.label).sort().join(",");
  if (rset === lset) { match++; if (rset) console.log("MATCH " + route + " [" + rset + "]"); }
  else { diverge++; console.log("DIVERGE " + route + "  REF=[" + rset + "]  LOC=[" + lset + "]"); }
}
console.log(`\n${match}/61 label-set MATCH, ${diverge} DIVERGE`);
process.exit(0);
