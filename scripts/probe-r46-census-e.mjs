#!/usr/bin/env node
// probe-r46-census-e.mjs — session-47 / parity round 46 census E:
// (1) the page-root trio map (relative overflow-hidden > touch-pan-y >
//     absolute-top decoration) across all 12 routes,
// (2) the decoration svg's full markup,
// (3) the REF mobile-header full class (dashboard),
// (4) the employees refresh-cw identification,
// (5) the doctracker stat-card full markup,
// (6) the profile empty-text button,
// (7) the attendance hero badge + gradient classes + the overflow source.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseZero = "http://127.0.0.1:3201";
const ROUTES = ["/dashboard", "/employees", "/payroll", "/taskmanager", "/attendance", "/recruitment", "/training", "/documenttracker", "/profile", "/settings", "/staffrequests", "/careers"];

// ---------- (1) the trio map on REF ----------
run(`agent-browser --session ref set viewport 1440 900`);
const TRIO = `(() => {
  const main = document.querySelector('main');
  const scroller = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!scroller) return { gone: true };
  const first = scroller.children[0];
  const cls = (el) => (el && el.className || '').toString();
  const hasRO = /relative overflow-hidden/.test(cls(first));
  const panY = first ? [...first.querySelectorAll(':scope > div')].find(d => /touch-pan-y/.test(cls(d))) : null;
  const deco = scroller.querySelector('div[class*=absolute][class*=top-0]');
  return { firstCls: cls(first).slice(0, 60), hasRO, panY: !!panY, deco: !!deco };
})()`;
console.log("\n===== (1) REF PAGE-ROOT TRIO MAP =====");
for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 2000));
  const t = await evalOn("ref", TRIO);
  console.log(route.padEnd(20), JSON.stringify(t));
}

// ---------- (2) the decoration svg markup (dashboard) ----------
run(`agent-browser --session ref open "${baseRef}/dashboard"`);
await new Promise(r => setTimeout(r, 2400));
const DECO = `(() => {
  const deco = document.querySelector('div[class*=absolute][class*=top-0]');
  if (!deco) return { gone: true };
  return { decoCls: (deco.className||'').toString(), decoHTML: deco.outerHTML.slice(0, 700), parentCls: (deco.parentElement.className||'').toString() };
})()`;
console.log("\n===== (2) DECORATION SVG (REF dashboard) =====");
console.log(JSON.stringify(await evalOn("ref", DECO), null, 1).slice(0, 1400));

// ---------- (3) the mobile-header full class ----------
const MOBHEAD = `(() => {
  const h = [...document.querySelectorAll('div')].find(d => /^md:hidden/.test((d.className||'').toString()));
  return h ? { cls: (h.className||'').toString(), html: h.outerHTML.slice(0, 400) } : null;
})()`;
console.log("\n===== (3) MOBILE HEADER (REF dashboard) =====");
console.log(JSON.stringify(await evalOn("ref", MOBHEAD), null, 1).slice(0, 900));

// ---------- (4) the employees refresh-cw ----------
run(`agent-browser --session ref open "${baseRef}/employees"`);
await new Promise(r => setTimeout(r, 2200));
const REFRESH = `(() => {
  const svg = [...document.querySelectorAll('svg')].find(s => /refresh-cw/.test((s.getAttribute('class')||'')));
  if (!svg) return { gone: true };
  const card = svg.closest('div.rounded-xl, div[class*=rounded]');
  return { svgCls: svg.getAttribute('class'), svgHTML: svg.outerHTML.slice(0, 500), cardCls: card ? (card.className||'').toString() : null };
})()`;
console.log("\n===== (4) EMPLOYEES REFRESH-CW (REF) =====");
console.log(JSON.stringify(await evalOn("ref", REFRESH), null, 1).slice(0, 1200));

// ---------- (5) the doctracker stat card ----------
run(`agent-browser --session ref open "${baseRef}/documenttracker"`);
await new Promise(r => setTimeout(r, 2200));
const DTCARD = `(() => {
  const p = [...document.querySelectorAll('p')].find(x => /Total Documents/.test(x.textContent||''));
  if (!p) return { gone: true };
  const card = p.closest('div[class*=rounded-xl]');
  return { cardCls: (card.className||'').toString(), cardHTML: card.outerHTML.slice(0, 900) };
})()`;
console.log("\n===== (5) DOCTRACKER STAT CARD (REF) =====");
console.log(JSON.stringify(await evalOn("ref", DTCARD), null, 1).slice(0, 1400));

// ---------- (6) the profile empty-text button ----------
run(`agent-browser --session ref open "${baseRef}/profile"`);
await new Promise(r => setTimeout(r, 2200));
const EMPTYBTN = `(() => {
  const bs = [...document.querySelectorAll('button')].filter(b => !(b.textContent||'').trim());
  return bs.map(b => ({ cls: (b.className||'').toString().slice(0, 120), html: b.outerHTML.slice(0, 320), parentCls: (b.parentElement.className||'').toString().slice(0, 80) }));
})()`;
console.log("\n===== (6) PROFILE EMPTY-TEXT BUTTONS (REF) =====");
console.log(JSON.stringify(await evalOn("ref", EMPTYBTN), null, 1).slice(0, 1200));

// ---------- (7) the attendance hero badge + gradient + overflow ----------
run(`agent-browser --session ref open "${baseRef}/attendance"`);
await new Promise(r => setTimeout(r, 2400));
const ATT7 = `(() => {
  const badge = [...document.querySelectorAll('div')].find(d => /^inline-flex items-center gap-2/.test((d.className||'').toString()));
  const root = document.querySelector('div[class*=min-h-screen]');
  const main = document.querySelector('main');
  const scroller = main.querySelector('div.overflow-auto, div.overflow-y-auto') || main;
  const wide = [...scroller.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > 1184).map(e => e.tagName + '.' + (e.className||'').toString().slice(0, 40)).slice(0, 8);
  return { badgeCls: badge ? (badge.className||'').toString() : null, badgeHTML: badge ? badge.outerHTML.slice(0, 350) : null, rootCls: root ? (root.className||'').toString() : null, overflowers: wide, scrollW: scroller.scrollWidth };
})()`;
console.log("\n===== (7) ATTENDANCE BADGE + GRADIENT + OVERFLOW (REF) =====");
console.log(JSON.stringify(await evalOn("ref", ATT7), null, 1).slice(0, 1600));
