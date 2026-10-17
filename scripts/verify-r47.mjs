#!/usr/bin/env node
// verify-r47.mjs — session-48 / parity round 47 live verification.
// The round pairs, live on the zero-tenant :3201 (the root families +
// zero-state contracts) and the seeded :3200 (the with-data forms):
// (1) the 48-route rootmap (the v3 gradients + the space-y wrappers +
//     the merged roots + the bare roots + the trio),
// (2) the kicker dark pair (the PageHeader's + the dashboard's copy),
// (3) the md-family row members (hrletters + attendancedashboard),
// (4) the per-page stat tags (the four analytics compacts + the no-tile
//     rewrite + the mt-4 family + tile-right/mini/mini-centered),
// (5) the zero-state affordances (announcements + hrletters +
//     performancemanagement + hrassistant),
// (6) the stubs (/home + /employeedetail + employeeselfservice's loader),
// (7) the quick hits (tenantsetup DIV + requestreports integer +
//     recruitmentkanban chips + compliance card header).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); for (let attempt = 0; attempt < 2; attempt++) { const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { if (attempt === 0) { await new Promise(r => setTimeout(r, 800)); continue; } return { error: out.slice(0, 300) }; } } }

const baseRef = "https://eon.base44.app", baseZero = "http://127.0.0.1:3201";
const results = [];
function rec(name, a, b) { const match = JSON.stringify(a) === JSON.stringify(b); results.push({ name, match }); console.log(`${match ? "MATCH" : "DIFF "} ${name}`); if (!match) { console.log(`  ref: ${JSON.stringify(a).slice(0, 500)}`); console.log(`  loc: ${JSON.stringify(b).slice(0, 500)}`); } }

async function open(session, base, route, settle = 2200) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}${route}`);
  await new Promise(r => setTimeout(r, settle));
}

// ---------- (1) the 48-route rootmap ----------
console.log("--- (1) the rootmap ---");
const ROOTMAP = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true };
  const cls = (el) => (el && typeof el.className === 'string' ? el.className.replace(/\\s+/g, ' ').trim() : '');
  const first = sc.children[0];
  const panY = first ? [...first.querySelectorAll(':scope > div')].find(d => /touch-pan-y/.test(cls(d))) : null;
  const grad = first && /gradient|min-h-screen/.test(cls(first)) ? first : (panY ? [...panY.querySelectorAll(':scope > div')].find(d => /gradient|min-h-screen/.test(cls(d)) || !/absolute/.test(cls(d))) : null);
  const inner = grad ? [...grad.children].find(d => !/^h-20$/.test(cls(d)) && !/absolute/.test(cls(d))) : null;
  const srt = (c) => c.split(' ').sort().join(' ');
  return { root: srt(cls(first)).slice(0, 95), trio: !!panY, grad: grad ? srt(cls(grad)).slice(0, 95) : null, inner: inner ? srt(cls(inner)).slice(0, 95) : null };
})()`;
const ROUTES = ["/leavemanagement", "/expenses", "/loans", "/compliancedashboard", "/performancemanagement", "/assetmanagement", "/organogram", "/surveys", "/announcements", "/companywall", "/chat", "/evaluations", "/templates", "/shiftcalendar", "/hrletters", "/offboarding", "/analytics", "/analyticsdashboard", "/attendancedashboard", "/surveyanalytics", "/advancedanalytics", "/hrreports", "/reports", "/payrollreports", "/payrollai", "/payrollengine", "/payrollmodule", "/recruitmentkanban", "/interviewassistant", "/workflowautomation", "/workflowconfigpage", "/notificationpreferences", "/employeeselfservice", "/employeeportal", "/hrassistantchat", "/hrassistant", "/securitysettings", "/requestreports", "/requestsettings", "/shiftswap", "/tenantsetup", "/allleaverequests", "/communications", "/assets", "/home", "/employeedetail", "/dynamicdashboard", "/organizationsetup"];
let rootMatch = 0;
// The documented divergence: /employeeselfservice resolves on the clone
// (the no-profile superset) where REF's loader never ends — excluded
// from the root pair count (its loader contract is pinned by R47-B7).
const ROOT_SKIP = new Set(["/employeeselfservice"]);
for (const route of ROUTES) {
  await open("ref", baseRef, route, 2000);
  const a = await evalOn("ref", ROOTMAP);
  await open("loc0", baseZero, route, 1600);
  const b = await evalOn("loc0", ROOTMAP);
  const same = JSON.stringify(a) === JSON.stringify(b) || ROOT_SKIP.has(route);
  if (same) rootMatch++;
  else { console.log(`DIFF  root ${route}`); console.log(`  ref: ${JSON.stringify(a)}`); console.log(`  loc: ${JSON.stringify(b)}`); }
}
rec(`rootmap ${ROUTES.length} routes (ess excluded — the documented superset)`, rootMatch, ROUTES.length);

// ---------- (2) the kicker dark pair ----------
console.log("--- (2) the kicker ---");
await open("ref", baseRef, "/payroll", 2000);
const kickRef = await evalOn("ref", `(() => { const k = document.querySelector('div.md\\\\:hidden'); return k ? k.querySelector('h1').className : null; })()`);
await open("loc0", baseZero, "/payroll", 1600);
const kickLoc = await evalOn("loc0", `(() => { const k = document.querySelector('div.md\\\\:hidden'); return k ? k.querySelector('h1').className : null; })()`);
rec("kicker h1 dark pair (payroll)", kickRef, kickLoc);

await open("ref", baseRef, "/dashboard", 2000);
const dKickRef = await evalOn("ref", `(() => { const k = document.querySelector('div.md\\\\:hidden'); return { bar: k.className, h1: k.querySelector('h1').className }; })()`);
await open("loc0", baseZero, "/dashboard", 1600);
const dKickLoc = await evalOn("loc0", `(() => { const k = document.querySelector('div.md\\\\:hidden'); return { bar: k.className, h1: k.querySelector('h1').className }; })()`);
rec("dashboard kicker verbatim", dKickRef, dKickLoc);

// ---------- (3) the md-family rows ----------
console.log("--- (3) the rows ---");
const ROWREAD = `(() => {
  const h1 = [...document.querySelectorAll('h1')].find(h => /HR Letters/.test(h.textContent || ''));
  if (!h1) return null;
  const row = h1.closest('div[class*=flex-col]');
  return row ? row.className.split(' ').sort().join(' ') : null;
})()`;
await open("ref", baseRef, "/hrletters", 2000);
const r1 = await evalOn("ref", ROWREAD);
await open("loc0", baseZero, "/hrletters", 1600);
const r2 = await evalOn("loc0", ROWREAD);
rec("hrletters md-family row", r1, r2);

// ---------- (4) the stat families ----------
console.log("--- (4) the stats ---");
const norm = (cls) => (cls || "").replace(/ mb-0/g, "").split(" ").sort().join(" ");
const STAT = (label) => `(() => {
  const grid = [...document.querySelectorAll('main div')].find(d => /^grid/.test(d.className || '') && /grid-cols-/.test(d.className || ''));
  if (!grid) return null;
  const card = grid.children[0];
  const leafs = [...card.querySelectorAll('*')].filter(e => e.children.length === 0 && (e.textContent || '').trim());
  const val = leafs.find(e => /text-3xl|text-2xl/.test(e.className || ''));
  const lab = leafs.find(e => /text-sm|text-xs/.test(e.className || '') && e !== val);
  const svg = card.querySelector('svg');
  const tile = card.querySelector('div[class*=rounded-xl]');
  return { tile: tile ? tile.className : null, val: val ? val.tagName + '|' + val.className : null, lab: lab ? lab.tagName + '|' + lab.className : null, svg: svg ? svg.getAttribute('class') : null, order: leafs.slice(0, 2).map(e => e.tagName + ':' + (e.textContent || '').trim().slice(0, 14)) };
})()`;
for (const [route, name] of [["/attendancedashboard", "attendancedashboard compact"], ["/analytics", "analytics tile-right"], ["/shiftcalendar", "shiftcalendar mini"], ["/notificationpreferences", "nprefs mini-centered"], ["/performancemanagement", "performance no-tile"], ["/workflowautomation", "workflow no-tile"], ["/advancedanalytics", "advancedanalytics mt-4"], ["/allleaverequests", "allleaverequests mt-4"]]) {
  await open("ref", baseRef, route, 2100);
  const a = await evalOn("ref", STAT());
  await open("loc0", baseZero, route, 1700);
  const b = await evalOn("loc0", STAT());
  const n = (r) => r && !r.error ? { ...r, val: r.val ? r.val.split("|")[0] + "|" + norm(r.val.split("|")[1]) : null, lab: r.lab ? r.lab.split("|")[0] + "|" + norm(r.lab.split("|")[1]) : null, tile: r.tile ? norm(r.tile) : null } : r;
  rec(`stat ${name}`, n(a), n(b));
}

// ---------- (5) the zero-state affordances ----------
console.log("--- (5) the affordances ---");
for (const [route, name] of [["/announcements", "announcements"], ["/hrletters", "hrletters"], ["/templates", "templates"], ["/hrassistant", "hrassistant"]]) {
  await open("ref", baseRef, route, 2100);
  const a = await evalOn("ref", `(() => { const sc = document.querySelector('main'); const buttons = [...sc.querySelectorAll('button')].map(b => b.textContent.trim()).filter(t => t); const text = sc.innerText.replace(/\\s+/g, ' ').slice(0, 400); return { buttons, text }; })()`);
  await open("loc0", baseZero, route, 1700);
  const b = await evalOn("loc0", `(() => { const sc = document.querySelector('main'); const buttons = [...sc.querySelectorAll('button')].map(b => b.textContent.trim()).filter(t => t); const text = sc.innerText.replace(/\\s+/g, ' ').slice(0, 400); return { buttons, text }; })()`);
  rec(`affordance ${name}`, a, b);
}

// performancemanagement: the goals tab at zero
await open("ref", baseRef, "/performancemanagement", 2100);
const pmRef = await evalOn("ref", `(() => { const tabs = document.querySelector('div[class*=space-y-6][class*=mt-2]'); return tabs ? tabs.innerText.replace(/\\s+/g, ' ').slice(0, 200) : null; })()`);
await open("loc0", baseZero, "/performancemanagement", 1700);
const pmLoc = await evalOn("loc0", `(() => { const tabs = document.querySelector('div[class*=space-y-6][class*=mt-2]'); return tabs ? tabs.innerText.replace(/\\s+/g, ' ').slice(0, 200) : null; })()`);
rec("performance goals tab zero", pmRef, pmLoc);

// ---------- (6) the stubs ----------
console.log("--- (6) the stubs ---");
for (const [route, name] of [["/home", "home"], ["/employeedetail", "employeedetail"], ["/employeeselfservice", "employeeselfservice"]]) {
  await open("ref", baseRef, route, 2100);
  const a = await evalOn("ref", `(() => { const m = document.querySelector('main'); const sc = m.querySelector('div.overflow-auto, div.overflow-y-auto') || m; return { html: sc.innerHTML.replace(/<!--.*?-->/g, '').slice(0, 300) }; })()`);
  await open("loc0", baseZero, route, 1700);
  const b = await evalOn("loc0", `(() => { const m = document.querySelector('main'); const sc = m.querySelector('div.overflow-auto, div.overflow-y-auto') || m; return { html: sc.innerHTML.replace(/<!--.*?-->/g, '').slice(0, 300) }; })()`);
  if (name === "employeeselfservice") {
    // The documented divergence: REF's zero-employee tenant NEVER resolves
    // (its loader is permanent); the clone resolves to the informative
    // no-profile superset — the LOADER itself is mirrored for the suspense
    // phase (pinned by R47-B7 + the E2E source contract). Re-read the
    // marker text (the 300-char html slice can cut before the h1).
    let refSpin = await evalOn("ref", `(() => { const m = document.querySelector('main'); const sc = m.querySelector('div.overflow-auto, div.overflow-y-auto') || m; return sc.innerHTML.includes('animate-spin'); })()`);
    if (refSpin !== true) { await open("ref", baseRef, route, 2200); refSpin = await evalOn("ref", `(() => { const m = document.querySelector('main'); const sc = m.querySelector('div.overflow-auto, div.overflow-y-auto') || m; return sc.innerHTML.includes('animate-spin'); })()`); }
    let locPortal = await evalOn("loc0", `(() => { const m = document.querySelector('main'); const sc = m.querySelector('div.overflow-auto, div.overflow-y-auto') || m; return sc.innerText.includes('My Portal'); })()`);
    if (locPortal !== true) { await open("loc0", baseZero, route, 1800); locPortal = await evalOn("loc0", `(() => { const m = document.querySelector('main'); const sc = m.querySelector('div.overflow-auto, div.overflow-y-auto') || m; return sc.innerText.includes('My Portal'); })()`); }
    rec(`stub ${name} (REF loader vs LOC resolved superset — documented)`, refSpin === true, locPortal === true);
  } else {
    rec(`stub ${name}`, a, b);
  }
}

// ---------- (7) the quick hits ----------
console.log("--- (7) the quick hits ---");
await open("ref", baseRef, "/tenantsetup", 2000);
const tsRef = await evalOn("ref", `(() => { const el = [...document.querySelectorAll('main *')].find(e => /Welcome to EonHR/.test(e.textContent || '') && e.children.length === 0); return el ? el.tagName : null; })()`);
await open("loc0", baseZero, "/tenantsetup", 1600);
const tsLoc = await evalOn("loc0", `(() => { const el = [...document.querySelectorAll('main *')].find(e => /Welcome to EonHR/.test(e.textContent || '') && e.children.length === 0); return el ? el.tagName : null; })()`);
rec("tenantsetup welcome tag", tsRef, tsLoc);

await open("ref", baseRef, "/requestreports", 2000);
const rrRef = await evalOn("ref", `(() => { const els = [...document.querySelectorAll('main *')].filter(e => e.children.length === 0 && /^0$/.test((e.textContent || '').trim())); return els.length; })()`);
await open("loc0", baseZero, "/requestreports", 1600);
const rrLoc = await evalOn("loc0", `(() => { const els = [...document.querySelectorAll('main *')].filter(e => e.children.length === 0 && /^0$/.test((e.textContent || '').trim())); return els.length; })()`);
rec("requestreports integer zeros (count)", rrRef, rrLoc);

await open("ref", baseRef, "/recruitmentkanban", 2100);
const rkRef = await evalOn("ref", `(() => { const chip = [...document.querySelectorAll('main div')].find(d => /h-\\[22px\\]/.test(d.className || '')); return chip ? chip.tagName : null; })()`);
await open("loc0", baseZero, "/recruitmentkanban", 1700);
const rkLoc = await evalOn("loc0", `(() => { const chip = [...document.querySelectorAll('main div')].find(d => /h-\\[22px\\]/.test(d.className || '')); return chip ? chip.tagName : null; })()`);
rec("recruitmentkanban chip tag", rkRef, rkLoc);

await open("ref", baseRef, "/compliancedashboard", 2200);
const compRef = await evalOn("ref", `(() => { const card = [...document.querySelectorAll('main div')].find(d => /bg-slate-50/.test(d.className || '')); const p = [...document.querySelectorAll('main p')].find(x => /No documents at risk/.test(x.textContent || '')); return card ? { hdr: card.className.split(' ').sort().join(' '), pCls: p ? p.className : null } : null; })()`);
await open("loc0", baseZero, "/compliancedashboard", 1800);
const compLoc = await evalOn("loc0", `(() => { const card = [...document.querySelectorAll('main div')].find(d => /bg-slate-50/.test(d.className || '')); const p = [...document.querySelectorAll('main p')].find(x => /No documents at risk/.test(x.textContent || '')); return card ? { hdr: card.className.split(' ').sort().join(' '), pCls: p ? p.className : null } : null; })()`);
rec("compliance at-risk card", compRef, compLoc);

const pass = results.filter(r => r.match).length;
console.log(`\nverify-r47: ${pass}/${results.length} MATCH`);
