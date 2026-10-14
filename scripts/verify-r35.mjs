#!/usr/bin/env node
// verify-r35.mjs — session-36 / parity round 35 LIVE VERIFICATION (v2):
// the round's five gap groups + the R35-F amendments, measured as
// REF↔LOC pairs. v2 fixes the v1 probe bugs: line-based snapshot-ref
// clicking (attribute-bearing lines broke the old regex — it clicked the
// tab AFTER the pattern's), encodeURIComponent evals (quotes in the 404
// sentence broke the JSON unescape), REF's short tab labels, and the
// mobile nav's aria-label selector.
import { execSync } from "node:child_process";

function run(cmd) {
  try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); }
  catch (e) { return "ERR:" + String(e).slice(0, 140); }
}
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(expr)}`);
  try { return JSON.parse(decodeURIComponent(out.trim().replace(/^"|"$/g, ""))); }
  catch { return { error: out.slice(0, 200) }; }
}
const enc = (fn) => `encodeURIComponent(JSON.stringify((()=>{${fn}})()))`;
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
let fails = 0;
const check = (label, ref, loc) => {
  const same = JSON.stringify(ref) === JSON.stringify(loc);
  if (!same) fails++;
  console.log(`${same ? "MATCH" : "**DIFF**"} ${label}: ref=${JSON.stringify(ref)} loc=${JSON.stringify(loc)}`);
};
async function openBoth(route, ms = 3000, viewport = null) {
  for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    if (viewport) run(`agent-browser --session ${s} set viewport ${viewport}`);
    run(`agent-browser --session ${s} open "${base}${route}"`);
    await new Promise(r => setTimeout(r, ms));
  }
}
// Line-based ref finder: the FIRST snapshot line containing the pattern
// AND a ref (handles [selected, ref=e12] / [expanded=false, ref=e34]
// attribute forms — "ref=" is NOT always preceded by a bracket).
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
async function clickPattern(session, pattern) {
  const ref = findRef(session, pattern);
  if (!ref) { console.log(`  [${session}] NO-REF: ${pattern}`); return false; }
  run(`agent-browser --session ${session} click @${ref}`);
  return true;
}

// ---- 1) the user-menu pair (desktop /settings) ----
console.log("=== 1) user-menu pair (the w-48 amendment) ===");
await openBoth("/settings");
const MENU = `const m = document.querySelector('[role=menu]'); if (!m) return null; const items = [...m.querySelectorAll('[role=menuitem]')]; const first = items[0]; if (!first) return null; const svg = first.querySelector('svg'); const sr = svg.getBoundingClientRect(); const tn = [...first.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); const rg = document.createRange(); rg.selectNodeContents(tn); const tb = rg.getBoundingClientRect(); const mr = m.getBoundingClientRect(); const last = items[items.length - 1]; return { itemCount: items.length, w: Math.round(mr.width), h: Math.round(mr.height), itemH: Math.round(first.getBoundingClientRect().height), icon: svg.getAttribute('class').replace('lucide lucide-','').replace(/ ?[wh]-4/g,'').replace(' mr-2','').trim(), iconW: Math.round(sr.width), iconToText: Math.round(tb.x - (sr.x + sr.width)), texts: items.map(i => i.textContent.trim()), logoutColor: getComputedStyle(last).color, cursor: getComputedStyle(first).cursor, radius: getComputedStyle(m).borderRadius };`;
for (const s of ["ref", "loc"]) {
  await clickPattern(s, "sepnetflix2023");
  await new Promise(r => setTimeout(r, 900)); // zoom-in-95 settle
}
check("user menu", await evalOn("ref", enc(MENU)), await evalOn("loc", enc(MENU)));
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} press Escape`);

// ---- 2) the compliance All-Types select pair ----
console.log("\n=== 2) compliance select pair ===");
await openBoth("/compliancedashboard", 3200);
const SEL = `const lb = document.querySelector('[role=listbox]'); if (!lb) return null; const opts = [...lb.querySelectorAll('[role=option]')]; const lr = lb.getBoundingClientRect(); const first = opts[0]; return { optCount: opts.length, texts: opts.map(o => o.textContent.trim()), w: Math.round(lr.width), itemH: first ? Math.round(first.getBoundingClientRect().height) : 0, radius: getComputedStyle(lb).borderRadius, cursor: first ? getComputedStyle(first).cursor : null };`;
for (const s of ["ref", "loc"]) {
  await clickPattern(s, "All Types");
  await new Promise(r => setTimeout(r, 800));
}
check("compliance select", await evalOn("ref", enc(SEL)), await evalOn("loc", enc(SEL)));
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} press Escape`);

// ---- 3) the 404 pair ----
console.log("\n=== 3) 404 pair ===");
await openBoth("/nonexistentroute123", 3200);
const NF = `const out = { title: document.title }; const h1 = [...document.querySelectorAll('h1')].find(h => h.getBoundingClientRect().width > 0); if (h1) { const r = h1.getBoundingClientRect(); out.h1 = { t: h1.textContent.trim(), fs: getComputedStyle(h1).fontSize, x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width) }; } const h2 = [...document.querySelectorAll('h2')].find(h => h.getBoundingClientRect().width > 0); if (h2) { const r = h2.getBoundingClientRect(); out.h2 = { t: h2.textContent.trim(), fs: getComputedStyle(h2).fontSize, fw: getComputedStyle(h2).fontWeight, y: Math.round(r.y + scrollY) }; } const p = [...document.querySelectorAll('p')].find(p => p.textContent.includes('could not be found')); if (p) { out.sentence = p.textContent.trim(); out.pCls = p.getAttribute('class'); } const divider = [...document.querySelectorAll('div')].find(d => { const r = d.getBoundingClientRect(); return r.height === 2 && r.width === 64; }); out.divider = divider ? { bg: getComputedStyle(divider).backgroundColor, mx: getComputedStyle(divider).marginLeft } : null; const goHome = [...document.querySelectorAll('a, button')].find(a => /go home/i.test(a.textContent)); if (goHome) { const r = goHome.getBoundingClientRect(); out.goHome = { t: goHome.textContent.trim(), href: goHome.getAttribute('href'), h: Math.round(r.height), w: Math.round(r.width), radius: getComputedStyle(goHome).borderRadius }; } return out;`;
check("404", await evalOn("ref", enc(NF), 900), await evalOn("loc", enc(NF), 900));

// ---- 4) the six settings-tab pairs (short REF labels) ----
console.log("\n=== 4) settings-tab pairs ===");
await openBoth("/settings", 3200);
const TABPANEL = `const tab = document.querySelector('[role=tab][data-state=active]'); const p = document.querySelector('[role=tabpanel][data-state=active]'); if (!p) return null; const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }; const title = p.querySelector('div[class*=font-semibold]'); const btns = [...p.querySelectorAll('button')].filter(vis).filter(b => b.textContent.trim()).map(b => { const r = b.getBoundingClientRect(); return { t: b.textContent.trim().slice(0, 24), h: Math.round(r.height), w: Math.round(r.width), bg: getComputedStyle(b).backgroundColor }; }); const svgs = [...p.querySelectorAll('svg')].filter(vis).map(s => Math.round(s.getBoundingClientRect().width)); const paras = [...p.querySelectorAll('p')].filter(vis).map(p2 => p2.textContent.trim().slice(0, 44)).filter(t => t); return { activeTab: tab ? tab.textContent.trim() : null, title: title ? title.textContent.trim().slice(0, 40) : null, btns, maxSvg: Math.max(0, ...svgs), paras };`;
for (const tabName of ["Approval Workflows", "Shifts", "Departments", "Integrations", "Theme & Layout", "System Logs"]) {
  for (const s of ["ref", "loc"]) {
    await clickPattern(s, `"${tabName}"`);
    await new Promise(r => setTimeout(r, 1000));
  }
  check(`tab:${tabName}`, await evalOn("ref", enc(TABPANEL)), await evalOn("loc", enc(TABPANEL)));
}

// ---- 5) the standing audits ----
console.log("\n=== 5) standing audits ===");
await openBoth("/dashboard", 3500, "390 844");
const MOBILE = `const nav = document.querySelector('nav[aria-label="Bottom navigation"]') || document.querySelector('nav'); if (!nav) return null; const r = nav.getBoundingClientRect(); const tabs = [...nav.querySelectorAll('a, button')].filter(el => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0; }).map(el => { const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.width)]; }); return { navY: Math.round(r.y), navH: Math.round(r.height), tabsX: tabs };`;
check("mobile chrome", await evalOn("ref", enc(MOBILE)), await evalOn("loc", enc(MOBILE)));
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} set viewport 1440 900`);

// 5b) bell popover (desktop) — REF's bell is an UNNAMED button
// (no accessible name; identified as the expanded-bearing button two
// lines above عربي in the footer cluster).
await openBoth("/settings", 3000);
function bellRef(session) {
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const lines = snap.split("\n");
  // LOC names its bell ("Notifications"); REF's is unnamed — the
  // expanded-bearing button just above عربي.
  const named = lines.find((l) => l.includes('button "Notifications"'));
  if (named) {
    const m = named.match(/ref=(\w+)\]/);
    if (m) return m[1];
  }
  const arIdx = lines.findIndex((l) => l.includes("عربي"));
  for (let i = arIdx - 1; i >= Math.max(0, arIdx - 4); i--) {
    const m = lines[i].match(/- button \[expanded=[a-z]+, ref=(\w+)\]/);
    if (m) return m[1];
  }
  return null;
}
const BELL = `const pops = [...document.querySelectorAll('[data-radix-popper-content-wrapper]')]; const pop = pops[pops.length - 1]; if (!pop) return null; const inner = pop.firstElementChild; const r = inner.getBoundingClientRect(); const hdr = [...inner.querySelectorAll('*')].find(e => e.textContent.trim() === 'Notifications'); return { w: Math.round(r.width), h: Math.round(r.height), radius: getComputedStyle(inner).borderRadius, pad: getComputedStyle(inner).padding, hasHdr: !!hdr };`;
for (const s of ["ref", "loc"]) {
  const bRef = bellRef(s);
  if (bRef) run(`agent-browser --session ${s} click @${bRef}`);
  else console.log(`  [${s}] NO-BELL-REF`);
  await new Promise(r => setTimeout(r, 800));
}
check("bell popover", await evalOn("ref", enc(BELL)), await evalOn("loc", enc(BELL)));
for (const s of ["ref", "loc"]) run(`agent-browser --session ${s} press Escape`);

// 5c) login stack (logged-out — reuse the standing anchors)
console.log("\n=== 6) login stack (standing) ===");
await openBoth("/login", 2600);
const STACK = `const out = {}; const logo = [...document.querySelectorAll('img')].find(i => i.getBoundingClientRect().width > 40); if (logo) out.logoY = Math.round(logo.getBoundingClientRect().y); const h1 = document.querySelector('h1'); if (h1) out.h1 = h1.textContent.trim(); const btns = [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().height > 0); const google = btns.find(b => b.textContent.includes('Google')); if (google) out.googleY = Math.round(google.getBoundingClientRect().y); const pw = document.querySelector('input[type=password]'); if (pw) out.pwY = Math.round(pw.getBoundingClientRect().y); return out;`;
check("login stack", await evalOn("ref", enc(STACK)), await evalOn("loc", enc(STACK)));

console.log(`\n${fails} DIFF(S) FOUND`);
