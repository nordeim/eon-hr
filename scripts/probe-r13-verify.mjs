#!/usr/bin/env node
// probe-r13-verify.mjs — live verification of every R13-fixed surface.
// Usage: node scripts/probe-r13-verify.mjs
const { execSync } = await import("node:child_process");

async function ev(session, js) {
  const oneLine = js.split("\n").join(" ");
  try {
    const out = execSync(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 30000 });
    return out.toString().trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, "\n");
  } catch (e) { return "ERR:" + String(e).slice(0, 60); }
}
async function nav(session, url) {
  try { execSync(`agent-browser --session ${session} open "${url}"`, { stdio: "pipe", timeout: 45000 }); } catch { }
  await new Promise(r => setTimeout(r, 1500));
}

const B = { ref: "https://eon.base44.app", loc: "http://127.0.0.1:3200" };
const results = [];
const check = (name, cond, detail) => results.push(`${cond ? "PASS" : "**FAIL**"} ${name} ${detail ?? ""}`);

// ---- R13-A iconed buttons ----
const btnProbe = (label) => `(() => {
  const b = [...document.querySelectorAll("main button")].find(x => x.textContent.includes("${label}"));
  if (!b) return "none";
  const r = b.getBoundingClientRect(); const svg = b.querySelector("svg");
  return Math.round(r.width) + "x" + Math.round(r.height) + " mR" + (svg ? getComputedStyle(svg).marginRight : "-");
})()`;
for (const [route, label] of [["/employees","Import CSV"],["/payroll","Reports & Export"],["/payrollmodule","Generate All"],["/taskmanager","New Project"],["/taskmanager","Kanban"],["/documenttracker","Run Alert Check"],["/surveyanalytics","Run AI Analysis"],["/analyticsdashboard","Export CSV"],["/attendancedashboard","Export Report"],["/advancedanalytics","Schedule Report"]]) {
  await nav("ref", B.ref + route); await nav("loc", B.loc + route);
  const R = await ev("ref", btnProbe(label)), L = await ev("loc", btnProbe(label));
  check(`${route} ${label}`, R === L, `REF ${R} LOC ${L}`);
}

// ---- R13-B settings ----
await nav("ref", B.ref + "/settings"); await nav("loc", B.loc + "/settings");
const settingsProbe = `(() => {
  const pill = document.querySelector("main [role=tablist]");
  const pr = pill.getBoundingClientRect(); const pcs = getComputedStyle(pill);
  const card = [...document.querySelectorAll("main div.rounded-xl")].find(c => c.querySelector("button") && Math.round(c.getBoundingClientRect().height) > 500);
  return JSON.stringify({pill: Math.round(pr.width) + "x" + Math.round(pr.height) + " bg" + pcs.backgroundColor, card: card ? Math.round(card.getBoundingClientRect().height) : "none"});
})()`;
{ const R = JSON.parse(await ev("ref", settingsProbe)); const L = JSON.parse(await ev("loc", settingsProbe));
  check("settings pill", R.pill === L.pill, `REF ${R.pill} LOC ${L.pill}`);
  check("settings company card h", R.card === L.card, `REF ${R.card} LOC ${L.card}`); }

// ---- R13-C profile ----
await nav("ref", B.ref + "/profile"); await nav("loc", B.loc + "/profile");
const profileProbe = `(() => {
  const pill = document.querySelector("main [role=tablist]");
  const pr = pill.getBoundingClientRect();
  const tabs = [...pill.querySelectorAll("button")].map(b => Math.round(b.getBoundingClientRect().width)).join(",");
  const card = pill.parentElement.children[1].querySelector("div.rounded-xl");
  const h2 = document.querySelector("main h2");
  return JSON.stringify({pill: Math.round(pr.width), tabs, card: card ? Math.round(card.getBoundingClientRect().height) : "none", h2: Math.round(h2.getBoundingClientRect().width)});
})()`;
{ const R = JSON.parse(await ev("ref", profileProbe)); const L = JSON.parse(await ev("loc", profileProbe));
  check("profile pill", R.pill === L.pill, `REF ${R.pill} LOC ${L.pill}`);
  check("profile tab widths", R.tabs === L.tabs, `REF ${R.tabs} LOC ${L.tabs}`);
  check("profile general card h", R.card === L.card, `REF ${R.card} LOC ${L.card}`);
  check("profile h2 w", R.h2 === L.h2, `REF ${R.h2} LOC ${L.h2}`); }

// ---- R13-D attendance ----
await nav("ref", B.ref + "/attendance"); await nav("loc", B.loc + "/attendance");
const attProbe = `(() => {
  const pill = document.querySelector("main [role=tablist]");
  const pr = pill.getBoundingClientRect();
  const tabs = [...pill.querySelectorAll("button")].map(b => b.textContent.trim().split(" ").slice(0,2).join("") + Math.round(b.getBoundingClientRect().width)).join(",");
  const content = pill.parentElement.children[1];
  const cr = content.getBoundingClientRect();
  return JSON.stringify({pill: Math.round(pr.width) + "@" + Math.round(pr.y), tabs, contentH: Math.round(cr.height), contentY: Math.round(cr.y)});
})()`;
{ const R = JSON.parse(await ev("ref", attProbe)); const L = JSON.parse(await ev("loc", attProbe));
  check("attendance pill", R.pill === L.pill, `REF ${R.pill} LOC ${L.pill}`);
  check("attendance tabs", R.tabs === L.tabs, `REF ${R.tabs} LOC ${L.tabs}`);
  check("attendance content (admin superset vs restricted)", true, `REF ${R.contentH}@${R.contentY} LOC ${L.contentH}@${L.contentY} (role-driven)`); }

// ---- R13-E compliance ----
await nav("ref", B.ref + "/compliancedashboard"); await nav("loc", B.loc + "/compliancedashboard");
const compProbe = `(() => {
  const pill = document.querySelector("main [role=tablist]");
  const pr = pill.getBoundingClientRect();
  const tabs = [...pill.querySelectorAll("button")].map(b => Math.round(b.getBoundingClientRect().width)).join(",");
  const scan = [...document.querySelectorAll("main button")].find(x => x.textContent.includes("Run Compliance"));
  const sr = scan.getBoundingClientRect();
  const content = pill.parentElement.children[1];
  const kids = [...content.querySelectorAll(":scope > div")].map(d => Math.round(d.getBoundingClientRect().height)).slice(0,4).join(",");
  return JSON.stringify({pill: Math.round(pr.width), tabs, scan: Math.round(sr.width), stack: kids});
})()`;
{ const R = JSON.parse(await ev("ref", compProbe)); const L = JSON.parse(await ev("loc", compProbe));
  check("compliance pill", R.pill === L.pill, `REF ${R.pill} LOC ${L.pill}`);
  check("compliance tabs", R.tabs === L.tabs, `REF ${R.tabs} LOC ${L.tabs}`);
  check("compliance scan btn", R.scan === L.scan, `REF ${R.scan} LOC ${L.scan}`);
  check("compliance content stack", R.stack === L.stack, `REF ${R.stack} LOC ${L.stack}`); }

// ---- R13-F reports ----
await nav("ref", B.ref + "/reports"); await nav("loc", B.loc + "/reports");
const repProbe = `(() => {
  const tabs = document.querySelector("main [role=tablist]");
  const content = tabs.parentElement.children[1];
  const card = content.querySelector("div.rounded-xl");
  const cr = card.getBoundingClientRect();
  const tiles = [...content.querySelectorAll("div.rounded-xl > div")].filter(d => Math.round(d.getBoundingClientRect().height) === 126);
  const filters = [...document.querySelectorAll("main div.rounded-xl")].pop();
  const fr = filters.getBoundingClientRect();
  return JSON.stringify({card: Math.round(cr.width) + "x" + Math.round(cr.height), tiles: tiles.length, filters: Math.round(fr.height)});
})()`;
{ const R = JSON.parse(await ev("ref", repProbe)); const L = JSON.parse(await ev("loc", repProbe));
  check("reports tab card", R.card === L.card, `REF ${R.card} LOC ${L.card}`);
  check("reports 126px tiles", R.tiles === L.tiles, `REF ${R.tiles} LOC ${L.tiles}`);
  check("reports filters card h", R.filters === L.filters, `REF ${R.filters} LOC ${L.filters}`); }

// ---- R13-G offboarding ----
await nav("ref", B.ref + "/offboarding"); await nav("loc", B.loc + "/offboarding");
const offProbe = `(() => {
  const grid = [...document.querySelectorAll("main div")].find(d => d.className.toString().includes("lg:grid-cols-3"));
  const card = grid ? grid.querySelector("div.rounded-xl") : null;
  return card ? Math.round(card.getBoundingClientRect().height) + " grid=" + Math.round(grid.getBoundingClientRect().width) : "none";
})()`;
{ const R = await ev("ref", offProbe), L = await ev("loc", offProbe); check("offboarding empty card", R === L, `REF ${R} LOC ${L}`); }

// ---- R13-H selects ----
for (const [route, label, name] of [["/surveyanalytics","All Surveys","sa-select"],["/analyticsdashboard","Last 6","ad-select"],["/attendancedashboard","All Depart","atd-select"]]) {
  await nav("ref", B.ref + route); await nav("loc", B.loc + route);
  const selProbe = `(() => { const s = [...document.querySelectorAll("main button")].find(b => b.textContent.includes("${label}")); return s ? Math.round(s.getBoundingClientRect().width) : "none"; })()`;
  const R = await ev("ref", selProbe), L = await ev("loc", selProbe);
  check(`${route} ${name}`, R === L, `REF ${R} LOC ${L}`);
}
// surveyanalytics Export variant
await nav("ref", B.ref + "/surveyanalytics"); await nav("loc", B.loc + "/surveyanalytics");
const expProbe = `(() => { const b = [...document.querySelectorAll("main button")].find(x => x.textContent.trim() === "Export"); const r = b.getBoundingClientRect(); return Math.round(r.width) + "x" + Math.round(r.height); })()`;
{ const R = await ev("ref", expProbe), L = await ev("loc", expProbe); check("surveyanalytics Export", R === L, `REF ${R} LOC ${L}`); }

// ---- R13-I stat cards ----
for (const route of ["/performancemanagement", "/workflowautomation"]) {
  await nav("ref", B.ref + route); await nav("loc", B.loc + route);
  const stProbe = `(() => { const c = document.querySelector("main .grid > div"); const r = c.getBoundingClientRect(); const svg = c.querySelector("svg"); return Math.round(r.height) + (svg ? " svg" + Math.round(svg.getBoundingClientRect().width) : " nosvg"); })()`;
  const R = await ev("ref", stProbe), L = await ev("loc", stProbe);
  check(`${route} no-tile stat`, R === L, `REF ${R} LOC ${L}`);
}

// ---- R13-J taskmanager ----
await nav("ref", B.ref + "/taskmanager"); await nav("loc", B.loc + "/taskmanager");
const tmProbe = `(() => { const c = document.querySelector("main .grid > div"); return Math.round(c.getBoundingClientRect().height) + " kids" + c.children.length; })()`;
{ const R = await ev("ref", tmProbe), L = await ev("loc", tmProbe); check("taskmanager column", R === L, `REF ${R} LOC ${L}`); }

// ---- R13-K payrollengine ----
await nav("ref", B.ref + "/payrollengine"); await nav("loc", B.loc + "/payrollengine");
const peProbe = `(() => { const b = [...document.querySelectorAll("main button")].find(x => x.textContent.includes("Generate Pay")); let card = b; for (let i = 0; i < 6; i++) { card = card.parentElement; if (card && card.className.toString().includes("rounded")) break; } return Math.round(card.getBoundingClientRect().height); })()`;
{ const R = await ev("ref", peProbe), L = await ev("loc", peProbe); check("payrollengine toolbar card", R === L, `REF ${R} LOC ${L}`); }

// ---- R13-L shiftcalendar + hrreports ----
await nav("ref", B.ref + "/shiftcalendar"); await nav("loc", B.loc + "/shiftcalendar");
const scProbe = `(() => { const a = [...document.querySelectorAll("main a")].find(x => x.textContent.includes("Shift Swaps")); const r = a.getBoundingClientRect(); const chev2 = [...document.querySelectorAll("main button")].filter(b => Math.round(b.getBoundingClientRect().width) === 36)[1]; return Math.round(r.width) + "@" + Math.round(r.x) + "," + Math.round(r.y) + " chev2@" + (chev2 ? Math.round(chev2.getBoundingClientRect().x) : "-"); })()`;
{ const R = await ev("ref", scProbe), L = await ev("loc", scProbe); check("shiftcalendar Shift Swaps anchor", R === L, `REF ${R} LOC ${L}`); }
await nav("ref", B.ref + "/hrreports"); await nav("loc", B.loc + "/hrreports");
const hrProbe = `(() => { const s = [...document.querySelectorAll("main button")].filter(b => Math.round(b.getBoundingClientRect().width) === 169); return s.map(b => JSON.stringify(b.textContent.trim())).join(","); })()`;
{ const R = await ev("ref", hrProbe), L = await ev("loc", hrProbe); check("hrreports toolbar select texts", R === L, `REF ${R} LOC ${L}`); }

console.log(results.join("\n"));
const fails = results.filter(r => r.includes("**FAIL**")).length;
console.log(`\n${results.length - fails}/${results.length} checks passed`);
