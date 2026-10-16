#!/usr/bin/env node
// probe-r46-census-f.mjs — session-47 / parity round 46 census F (closing):
// (1) the LOC0 page-root map, (2) the refresh-cw context, (3) doctracker
// card on LOC0, (4) profile structure both sides, (5) attendance badge on
// LOC0 + REF overflow source, (6) training New Platform context, (7) the
// quick-action item full classes, (8) payroll/recruitment stat zones on REF,
// (9) the deco opacity on scroll.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseZero = "http://127.0.0.1:3201";
const ROUTES = ["/dashboard", "/employees", "/payroll", "/taskmanager", "/attendance", "/recruitment", "/training", "/documenttracker", "/profile", "/settings", "/staffrequests", "/careers"];

// ---------- (1) the LOC0 page-root map ----------
run(`agent-browser --session loc0 set viewport 1440 900`);
const ROOT = `(() => {
  const main = document.querySelector('main');
  const scroller = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!scroller) return { gone: true };
  const first = scroller.children[0];
  return { firstCls: (first.className||'').toString().slice(0, 70) };
})()`;
console.log("===== (1) LOC0 PAGE-ROOT MAP =====");
for (const route of ROUTES) {
  run(`agent-browser --session loc0 open "${baseZero}${route}"`);
  await new Promise(r => setTimeout(r, 1700));
  const t = await evalOn("loc0", ROOT);
  console.log(route.padEnd(20), JSON.stringify(t));
}

// ---------- (2) the refresh-cw context on REF ----------
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open "${baseRef}/employees"`);
await new Promise(r => setTimeout(r, 2400));
const REFW = `(() => {
  const svg = [...document.querySelectorAll('svg')].find(s => /refresh-cw/.test((s.getAttribute('class')||'')));
  if (!svg) return { gone: true };
  const chain = [];
  let n = svg.parentElement;
  for (let i = 0; i < 5 && n; i++) { chain.push(n.tagName + '{' + (n.className||'').toString().slice(0, 60) + '}'); n = n.parentElement; }
  const r = svg.getBoundingClientRect();
  return { chain, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), animate: (svg.querySelector('animate') || svg.getAttribute('class')||'').toString().slice(0, 90) };
})()`;
console.log("\n===== (2) REFRESH-CW CONTEXT (REF employees) =====");
console.log(JSON.stringify(await evalOn("ref", REFW), null, 1).slice(0, 900));

// ---------- (3) the doctracker card on LOC0 ----------
run(`agent-browser --session loc0 open "${baseZero}/documenttracker"`);
await new Promise(r => setTimeout(r, 1900));
const DTL = `(() => {
  const p = [...document.querySelectorAll('p')].find(x => /^[0-9]+$/.test((x.textContent||'').trim()) && /text-3xl/.test(x.className));
  if (!p) return { gone: true };
  const card = p.closest('div[class*=rounded-xl]');
  return { cardCls: (card.className||'').toString(), cardHTML: card.outerHTML.slice(0, 800) };
})()`;
console.log("\n===== (3) DOCTRACKER STAT CARD (LOC0) =====");
console.log(JSON.stringify(await evalOn("loc0", DTL), null, 1).slice(0, 1300));

// ---------- (4) the profile empty button + structure (REF full) ----------
run(`agent-browser --session ref open "${baseRef}/profile"`);
await new Promise(r => setTimeout(r, 2200));
const PROF = `(() => {
  const bs = [...document.querySelectorAll('button')].filter(b => !(b.textContent||'').trim());
  const out = bs.map(b => ({ html: b.outerHTML.slice(0, 420), parentCls: (b.parentElement.className||'').toString().slice(0, 80), gpCls: (b.parentElement.parentElement.className||'').toString().slice(0, 80) }));
  const avatarInput = document.querySelector('input[type=file]');
  return { emptyButtons: out, avatar: avatarInput ? { id: avatarInput.id, cls: (avatarInput.className||'').toString(), parentCls: (avatarInput.parentElement.className||'').toString().slice(0, 70) } : null };
})()`;
console.log("\n===== (4) PROFILE EMPTY BUTTON + AVATAR INPUT (REF) =====");
console.log(JSON.stringify(await evalOn("ref", PROF), null, 1).slice(0, 1500));

// ---------- (5) the attendance badge + overflow on REF ----------
run(`agent-browser --session ref open "${baseRef}/attendance"`);
await new Promise(r => setTimeout(r, 2400));
const ATT = `(() => {
  const badge = [...document.querySelectorAll('div')].find(d => /^inline-flex items-center gap-2/.test((d.className||'').toString()));
  const main = document.querySelector('main');
  const scroller = main.querySelector('div.overflow-auto, div.overflow-y-auto') || main;
  const wide = [...scroller.querySelectorAll('div,table,button')].filter(e => { const r = e.getBoundingClientRect(); return r.right > 1184 && r.width > 30; }).map(e => e.tagName + '[' + Math.round(e.getBoundingClientRect().right) + ']' + (e.className||'').toString().slice(0, 45)).slice(0, 8);
  return { badgeCls: badge ? (badge.className||'').toString() : null, scrollW: scroller.scrollWidth, wide };
})()`;
console.log("\n===== (5) ATTENDANCE BADGE + OVERFLOW (REF) =====");
console.log(JSON.stringify(await evalOn("ref", ATT), null, 1).slice(0, 1100));

// ---------- (6) the training New Platform (LOC0) ----------
run(`agent-browser --session loc0 open "${baseZero}/training"`);
await new Promise(r => setTimeout(r, 1900));
const NEWPLAT = `(() => {
  const b = [...document.querySelectorAll('button')].find(x => /New Platform/i.test(x.textContent||''));
  if (!b) return { gone: true };
  const chain = [];
  let n = b;
  for (let i = 0; i < 4 && n; i++) { chain.push(n.tagName + '{' + (n.className||'').toString().slice(0, 55) + '}'); n = n.parentElement; }
  return { chain, cls: (b.className||'').toString().slice(0, 120) };
})()`;
console.log("\n===== (6) TRAINING NEW PLATFORM (LOC0) =====");
console.log(JSON.stringify(await evalOn("loc0", NEWPLAT), null, 1).slice(0, 700));

// ---------- (7) the quick-action item classes (REF) ----------
run(`agent-browser --session ref open "${baseRef}/dashboard"`);
await new Promise(r => setTimeout(r, 2400));
const QA = `(() => {
  const a = [...document.querySelectorAll('a')].find(x => /My Portal/.test(x.textContent||''));
  if (!a) return { gone: true };
  return { aCls: (a.getAttribute('class')||''), innerDivCls: (a.firstElementChild.getAttribute('class')||''), spanCls: (a.querySelector('span').getAttribute('class')||'') };
})()`;
console.log("\n===== (7) QUICK-ACTION ITEM (REF) =====");
console.log(JSON.stringify(await evalOn("ref", QA), null, 1).slice(0, 600));

// ---------- (8) the payroll/recruitment stat zones (REF) ----------
run(`agent-browser --session ref open "${baseRef}/recruitment"`);
await new Promise(r => setTimeout(r, 2200));
const REC = `(() => {
  const zone = [...document.querySelectorAll('div')].filter(d => /grid/.test(d.className||'') && d.querySelectorAll('p').length >= 3 && d.querySelector('p') && /text-2xl|text-3xl/.test(d.querySelector('p').className||''));
  return zone.length ? { zoneCls: (zone[0].className||'').toString(), firstHTML: zone[0].outerHTML.slice(0, 600) } : { gone: true };
})()`;
console.log("\n===== (8) RECRUITMENT STAT ZONE (REF — expect gone at zero) =====");
console.log(JSON.stringify(await evalOn("ref", REC), null, 1).slice(0, 800));

// ---------- (9) the deco opacity on scroll ----------
const DECO2 = `(() => {
  const deco = document.querySelector('div[class*=absolute][class*=top-0]');
  return deco ? { opacity: (deco.style||{}).opacity, childTransform: deco.firstElementChild ? (deco.firstElementChild.style||{}).transform : null } : { gone: true };
})()`;
await evalOn("ref", `(() => { const s = document.querySelector('main') ? (document.querySelector('main').querySelector('div.overflow-auto, div.overflow-y-auto') || document.querySelector('main')) : window; s.scrollTop = 300; s.scrollBy(0, 300); window.scrollTo(0, 300); return 'scrolled'; })()`);
await new Promise(r => setTimeout(r, 900));
console.log("\n===== (9) DECO OPACITY AFTER SCROLL (REF dashboard) =====");
console.log(JSON.stringify(await evalOn("ref", DECO2)));

// reset scroll + restore REF to a clean page
await evalOn("ref", `(() => { window.scrollTo(0, 0); const s = document.querySelector('main') ? (document.querySelector('main').querySelector('div.overflow-auto, div.overflow-y-auto')) : null; if (s) s.scrollTop = 0; return 'reset'; })()`);
