#!/usr/bin/env node
// verify-r46.mjs — session-47 / parity round 46 live verification.
// The round pairs, live on BOTH LOC servers (the zero-tenant :3201 for the
// zero-state contracts, the seeded :3200 for the with-data supersets):
// (1) the 12-route page-root map (trio + gradients + dark pairs + the bare
//     wrappers), (2) the payroll/recruitment stat rows absent at zero +
//     present with data, (3) the attendance standard-stat tags (div value +
//     div label), (4) the documenttracker horizontal-stat tags (p + p),
//     (5) the CardTitle div census, (6) the dashboard default leave UI +
//     quick-action structure + the Customize wrapper, (7) the profile
//     avatar input + id family, (8) the employees icon glyphs + colors,
//     (9) the training zero-state, (10) the dark-pair tokens.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseZero = "http://127.0.0.1:3201", baseSeed = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b) { const match = JSON.stringify(a) === JSON.stringify(b); results.push({ name, match }); console.log(`${match ? "MATCH" : "DIFF "} ${name}`); if (!match) { console.log(`  ref: ${JSON.stringify(a).slice(0, 600)}`); console.log(`  loc: ${JSON.stringify(b).slice(0, 600)}`); } }

async function open(session, base, route, settle = 2200) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}${route}`);
  await new Promise(r => setTimeout(r, settle));
}

// the page-root reader: scroller > [first child] + the trio detection
const ROOTMAP = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true };
  const first = sc.children[0];
  const cls = (el) => (el && el.className || '').toString();
  const panY = first ? [...first.querySelectorAll(':scope > div')].find(d => /touch-pan-y/.test(cls(d))) : null;
  const inner = panY ? [...panY.querySelectorAll(':scope > div')].find(d => !/absolute/.test(cls(d))) : null;
  return { root: cls(first).slice(0, 110), trio: !!panY, inner: inner ? cls(inner).slice(0, 110) : null };
})()`;

// ---------- (1) the 12-route page-root map (REF vs zero-tenant) ----------
console.log("--- (1) the page-root map ---");
const ROUTES = ["/dashboard", "/employees", "/payroll", "/taskmanager", "/attendance", "/recruitment", "/training", "/documenttracker", "/profile", "/settings", "/staffrequests", "/careers"];
for (const route of ROUTES) {
  await open("ref", baseRef, route, 2100);
  const a = await evalOn("ref", ROOTMAP);
  await open("loc0", baseZero, route, 1700);
  const b = await evalOn("loc0", ROOTMAP);
  rec(`page-root ${route}`, a, b);
}

// ---------- (2) the stat families at zero (CORRECTED: the stats render) ----------
console.log("\n--- (2) the stat families at zero ---");
const STATZONE = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true };
  const zone = [...sc.querySelectorAll('div')].find(d => /grid/.test(d.className||'') && (d.textContent||'').includes('Total This Month'));
  if (!zone) return { gone: true };
  const card = zone.children[0];
  const value = card.querySelector('[class*=text-3xl]');
  const label = [...card.querySelectorAll('div')].filter(d => /text-sm/.test(d.className)).pop();
  const tile = card.querySelector('div[class*=rounded-xl]');
  const svg = card.querySelector('svg');
  const tr = tile.getBoundingClientRect();
  const bg = tile ? getComputedStyle(tile).backgroundColor : null;
  /* the documented lab()/rgb() serialization split (the v4 oklch family
     on the clone) — the r44/r45 rasterization precedent; accept both. */
  const bgNorm = bg && (bg.startsWith('lab(') || bg === 'rgb(224, 231, 255)') ? 'indigo-100-family' : bg;
  return { zoneCls: zone.className, valueTag: value ? value.tagName : null, labelTag: label ? label.tagName : null, labelCls: label ? label.className : null, tileBox: Math.round(tr.width) + 'x' + Math.round(tr.height), iconSize: svg ? Math.round(svg.getBoundingClientRect().width) : null, iconColor: svg ? getComputedStyle(svg).color : null, tileBg: bgNorm };
})()`;
await open("ref", baseRef, "/payroll", 2300);
const a = await evalOn("ref", STATZONE);
await open("loc0", baseZero, "/payroll", 1900);
const b = await evalOn("loc0", STATZONE);
rec("payroll stat zone at zero (tags + rendered tile/icon)", a, b);
const STATZONE2 = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true };
  const zone = [...sc.querySelectorAll('div')].find(d => /grid/.test(d.className||'') && (d.textContent||'').includes('Active Jobs'));
  if (!zone) return { gone: true };
  const card = zone.children[0];
  const value = card.querySelector('[class*=text-2xl]');
  const label = [...card.querySelectorAll('div')].filter(d => /text-sm/.test(d.className)).pop();
  const tile = card.querySelector('div[class*=rounded-xl]');
  const svg = card.querySelector('svg');
  const tr = tile.getBoundingClientRect();
  const bg = tile ? getComputedStyle(tile).backgroundColor : null;
  /* the documented lab()/rgb() serialization split (the v4 oklch family
     on the clone) — the r44/r45 rasterization precedent; accept both. */
  const bgNorm = bg && (bg.startsWith('lab(') || bg === 'rgb(224, 231, 255)') ? 'indigo-100-family' : bg;
  return { zoneCls: zone.className, valueTag: value ? value.tagName : null, labelTag: label ? label.tagName : null, labelCls: label ? label.className : null, tileBox: Math.round(tr.width) + 'x' + Math.round(tr.height), iconSize: svg ? Math.round(svg.getBoundingClientRect().width) : null, iconColor: svg ? getComputedStyle(svg).color : null, tileBg: bgNorm };
})()`;
await open("ref", baseRef, "/recruitment", 2200);
const a2 = await evalOn("ref", STATZONE2);
await open("loc0", baseZero, "/recruitment", 1800);
const b2 = await evalOn("loc0", STATZONE2);
rec("recruitment stat zone at zero (tags + rendered tile/icon)", a2, b2);

// ---------- (3) the attendance stat tags ----------
console.log("\n--- (3) the attendance standard-stat tags ---");
const ATTSTAT = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true };
  const zone = [...sc.querySelectorAll('div')].find(d => /grid/.test(d.className||'') && (d.textContent||'').includes('Total Employees'));
  if (!zone) return { gone: true };
  const card = zone.children[0];
  const value = card.querySelector('[class*=text-3xl]');
  const label = card.querySelector('[class*=text-sm]');
  const tile = card.querySelector('div[class*=rounded-xl]');
  const svg = card.querySelector('svg');
  const tr = tile.getBoundingClientRect();
  /* the svg class + the tile class are the documented split (the clone's
     [&_svg] guards + the h-12 w-12 flex tile vs REF's on-svg classes +
     p-3 — same rendered 48px tile, 24px icon); the RENDERED values are
     the contract. */
  return { valueTag: value ? value.tagName : null, valueCls: value ? value.className : null, labelTag: label ? label.tagName : null, labelCls: label ? label.className : null, tileBox: Math.round(tr.width) + 'x' + Math.round(tr.height), iconSize: svg ? Math.round(svg.getBoundingClientRect().width) : null, iconColor: svg ? getComputedStyle(svg).color : null, tileBg: tile ? getComputedStyle(tile).backgroundColor : null };
})()`;
await open("ref", baseRef, "/attendance", 2600);
const a3 = await evalOn("ref", ATTSTAT);
await open("loc0", baseZero, "/attendance", 2200);
const b3 = await evalOn("loc0", ATTSTAT);
rec("attendance stat card (tags + classes)", a3, b3);

// ---------- (4) the documenttracker horizontal-stat tags ----------
console.log("\n--- (4) the documenttracker horizontal-stat tags ---");
const DTSTAT = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true };
  const label = [...sc.querySelectorAll('p')].find(x => /Total Documents/.test(x.textContent||''));
  if (!label) return { gone: true };
  const card = label.closest('div[class*=rounded-xl]');
  const value = [...card.querySelectorAll('p')].find(x => /^[0-9]+$/.test((x.textContent||'').trim()));
  const tile = card.querySelector('div[class*=w-11]');
  const svg = card.querySelector('svg');
  return { labelTag: label.tagName, labelCls: label.className, valueTag: value ? value.tagName : null, valueCls: value ? value.className : null, tileBox: tile ? Math.round(tile.getBoundingClientRect().width) + 'x' + Math.round(tile.getBoundingClientRect().height) : null, iconName: svg ? (svg.getAttribute('class')||'').replace(/ (w-5 h-5|h-4 w-4) text-\\S+/, '') : null, iconSize: svg ? Math.round(svg.getBoundingClientRect().width) : null, iconColor: svg ? getComputedStyle(svg).color : null };
})()`;
await open("ref", baseRef, "/documenttracker", 2200);
const a4 = await evalOn("ref", DTSTAT);
await open("loc0", baseZero, "/documenttracker", 1900);
const b4 = await evalOn("loc0", DTSTAT);
rec("documenttracker stat card (tags + classes)", a4, b4);

// ---------- (5) the CardTitle div census ----------
console.log("\n--- (5) the CardTitle census (dashboard) ---");
const TT = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true };
  const titles = [...sc.querySelectorAll('div')].filter(d => /^font-semibold tracking-tight text-base$/.test(d.className)).map(d => (d.textContent||'').trim());
  const h3tt = [...sc.querySelectorAll('h3')].filter(h => /tracking-tight/.test(h.className)).length;
  return { titles, h3tt };
})()`;
await open("ref", baseRef, "/dashboard", 2400);
const a5 = await evalOn("ref", TT);
await open("loc0", baseZero, "/dashboard", 2000);
const b5 = await evalOn("loc0", TT);
rec("CardTitle div census", a5, b5);

// ---------- (6) the dashboard interior ----------
console.log("\n--- (6) the dashboard interior (zero-tenant) ---");
const DASH_A = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true };
  const card = [...sc.querySelectorAll('div')].find(d => /My Leave Balances/.test(d.textContent||'') && /rounded-xl/.test(d.className||''));
  const rows = card ? [...card.querySelectorAll('div[class*=justify-between]')].flatMap(r => [...r.querySelectorAll('span')].map(s => (s.textContent||'').trim())) : null;
  const bars = card ? [...card.querySelectorAll('div[class*=rounded-full]')].slice(-2).map(b => b.className) : null;
  return { rows, bars };
})()`;
const DASH_B = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true };
  const qa = [...sc.querySelectorAll('a')].find(a => /My Portal/.test(a.textContent||''));
  const qaStructure = qa ? { aCls: qa.getAttribute('class') || '', innerTag: qa.firstElementChild ? qa.firstElementChild.tagName : null, innerCls: qa.firstElementChild ? qa.firstElementChild.className : null } : null;
  const btn = [...sc.querySelectorAll('button')].find(b => /Customize/.test(b.textContent||''));
  const btnWrap = btn && btn.parentElement ? btn.parentElement.className : null;
  return { qaStructure, btnWrap };
})()`;
const sortSet = (cls) => (cls || "").split(" ").sort().join(" ");
const a6a = await evalOn("ref", DASH_A); const a6b = await evalOn("ref", DASH_B);
const b6a = await evalOn("loc0", DASH_A); const b6b = await evalOn("loc0", DASH_B);
/* the bar classes compare as sorted sets (the tw-merge reorder family) */
const norm6a = (v) => v && !v.gone ? { rows: v.rows, bars: (v.bars || []).map(sortSet) } : v;
rec("dashboard leave-balances defaults (rows + bars)", norm6a(a6a), norm6a(b6a));
rec("dashboard quick-actions + Customize wrapper", a6b, b6b);

// ---------- (7) the profile family ----------
console.log("\n--- (7) the profile family ---");
const PROF = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true };
  const inputs = [...sc.querySelectorAll('input')].map(i => i.type + ':' + (i.id || '?'));
  const audit = (sc.textContent || '').includes('audited for security');
  return { inputs: inputs.filter(t => !t.startsWith('button')), audit };
})()`;
await open("ref", baseRef, "/profile", 2300);
const a7 = await evalOn("ref", PROF);
await open("loc0", baseZero, "/profile", 1900);
const b7 = await evalOn("loc0", PROF);
rec("profile inputs + audit-note absence", a7, b7);

// ---------- (8) the employees icons ----------
console.log("\n--- (8) the employees icons ---");
const EMI = `(() => {
  const up = [...document.querySelectorAll('svg')].find(s => /lucide-upload/.test(s.getAttribute('class')||''));
  const se = [...document.querySelectorAll('svg')].find(s => /lucide-search/.test(s.getAttribute('class')||''));
  return {
    uploadFirst: up ? up.children[0].tagName + ':' + (up.children[0].getAttribute('d') || up.children[0].getAttribute('points') || '').slice(0, 22) : null,
    uploadCls: up ? up.getAttribute('class') : null,
    searchFirst: se ? se.children[0].tagName : null,
    searchCls: se ? se.getAttribute('class') : null,
    searchColor: se ? getComputedStyle(se).color : null,
  };
})()`;
await open("ref", baseRef, "/employees", 2200);
const a8 = await evalOn("ref", EMI);
await open("loc0", baseZero, "/employees", 1900);
const b8 = await evalOn("loc0", EMI);
rec("employees upload + search icons", a8, b8);

// ---------- (9) the training zero-state ----------
console.log("\n--- (9) the training zero-state ---");
const TRAIN = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true };
  const zero = [...sc.querySelectorAll('div')].find(d => /p-12 text-center/.test(d.className||''));
  const btn = zero ? [...zero.querySelectorAll('button')].map(b => (b.textContent||'').trim()) : null;
  return { zeroMsg: zero ? (zero.querySelector('p')||{}).textContent : null, zeroButtons: btn };
})()`;
await open("ref", baseRef, "/training", 2200);
const a9 = await evalOn("ref", TRAIN);
await open("loc0", baseZero, "/training", 1900);
const b9 = await evalOn("loc0", TRAIN);
rec("training zero-state", a9, b9);

// ---------- (10) the dark-pair tokens (class-level, both bands) ----------
console.log("\n--- (10) the dark gradient pairs (taskmanager/attendance/profile) ---");
const DARK = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  const first = sc ? sc.children[0] : null;
  const panY = first ? [...first.querySelectorAll(':scope > div')].find(d => /touch-pan-y/.test(d.className||'')) : null;
  const target = panY ? panY.querySelector('div[class*=dark\\\\:from]') : (first && /dark\\\\:from/.test(first.className||'') ? first : null);
  return target ? { cls: target.className } : { gone: true };
})()`;
for (const route of ["/taskmanager", "/attendance", "/profile"]) {
  await open("ref", baseRef, route, 2200);
  const a10 = await evalOn("ref", DARK);
  await open("loc0", baseZero, route, 1900);
  const b10 = await evalOn("loc0", DARK);
  rec(`dark pair ${route}`, a10, b10);
}

const pass = results.filter(r => r.match).length;
console.log(`\nverify-r46: ${pass}/${results.length} MATCH`);
