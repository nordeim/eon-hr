#!/usr/bin/env node
// probe-r46-census-g.mjs — session-47 / parity round 46 census G (final):
// (1) the content-root classes inside the trio (dashboard/employees/payroll/
//     taskmanager on REF), (2) the clone's doctracker stat markup, (3) the
// profile empty-button full HTML, (4) the attendance hero row + badge + the
// clone's hero, (5) the REF training/recruitment zero-state zone classes,
// (6) the leave-balances card texts on REF (the default UI values).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseZero = "http://127.0.0.1:3201";

// ---------- (1) the trio content roots on REF ----------
run(`agent-browser --session ref set viewport 1440 900`);
const CONTENT = `(() => {
  const main = document.querySelector('main');
  const scroller = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!scroller) return { gone: true };
  const panY = scroller.querySelector('div[class*=touch-pan-y]');
  if (!panY) return { noTrio: true };
  const kids = [...panY.children].map(c => (c.className||'').toString().slice(0, 90));
  const content = [...panY.children].find(c => !/absolute/.test((c.className||'').toString()));
  return { panYKids: kids, contentCls: content ? (content.className||'').toString() : null };
})()`;
console.log("===== (1) TRIO CONTENT ROOTS (REF) =====");
for (const route of ["/dashboard", "/employees", "/payroll", "/taskmanager"]) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 2100));
  const t = await evalOn("ref", CONTENT);
  console.log(route.padEnd(15), JSON.stringify(t));
}

// ---------- (2) the clone's doctracker stat markup ----------
run(`agent-browser --session loc0 set viewport 1440 900`);
run(`agent-browser --session loc0 open "${baseZero}/documenttracker"`);
await new Promise(r => setTimeout(r, 1900));
const DTL = `(() => {
  const main = document.querySelector('main');
  const scroller = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!scroller) return { gone: true };
  const zone = [...scroller.querySelectorAll('div')].find(d => /grid/.test(d.className||'') && d.children.length >= 3 && d.querySelectorAll('svg').length >= 3);
  if (!zone) return { noZone: true };
  return { zoneCls: (zone.className||'').toString(), firstCard: zone.children[0].outerHTML.slice(0, 750) };
})()`;
console.log("\n===== (2) DOCTRACKER STAT ZONE (LOC0) =====");
console.log(JSON.stringify(await evalOn("loc0", DTL), null, 1).slice(0, 1200));

// ---------- (3) the profile empty-button full HTML (REF) ----------
run(`agent-browser --session ref open "${baseRef}/profile"`);
await new Promise(r => setTimeout(r, 2200));
const EB = `(() => {
  const b = [...document.querySelectorAll('button')].find(x => !(x.textContent||'').trim());
  if (!b) return { gone: true };
  let n = b, chain = [];
  for (let i = 0; i < 6 && n; i++) { chain.push(n.tagName + '{' + (n.className||'').toString().slice(0, 70) + '}'); n = n.parentElement; }
  return { html: b.outerHTML, chain };
})()`;
console.log("\n===== (3) PROFILE EMPTY BUTTON (REF full) =====");
console.log(JSON.stringify(await evalOn("ref", EB), null, 1).slice(0, 1300));

// ---------- (4) the attendance hero row classes ----------
run(`agent-browser --session ref open "${baseRef}/attendance"`);
await new Promise(r => setTimeout(r, 2400));
const HERO = `(() => {
  const h1 = [...document.querySelectorAll('h1')].find(h => /Staff Attendance/.test(h.textContent||''));
  if (!h1) return { gone: true };
  const hero = h1.closest('div[class*=flex]');
  const badge = [...document.querySelectorAll('div')].find(d => /inline-flex items-center gap-2 px-4 py-2/.test((d.className||'').toString()));
  return { heroCls: (hero.className||'').toString(), heroHTMLHead: hero.outerHTML.slice(0, 400), badgeText: badge ? (badge.textContent||'').trim() : null, badgeSVGcls: badge ? (badge.querySelector('svg').getAttribute('class')||'') : null };
})()`;
console.log("\n===== (4) ATTENDANCE HERO (REF) =====");
console.log(JSON.stringify(await evalOn("ref", HERO), null, 1).slice(0, 1100));
run(`agent-browser --session loc0 open "${baseZero}/attendance"`);
await new Promise(r => setTimeout(r, 2100));
console.log("ATTENDANCE HERO (LOC0):");
console.log(JSON.stringify(await evalOn("loc0", HERO), null, 1).slice(0, 1100));

// ---------- (5) the training/recruitment zero-state zone classes (REF) ----------
for (const route of ["/training", "/recruitment"]) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 2000));
  const Z = `(() => {
    const p = [...document.querySelectorAll('p')].find(x => /No training platforms|No job/.test(x.textContent||'') || /opportunit|No /.test(x.textContent||''));
    const zero = p ? p.closest('div[class*=text-center], div[class*=p-]') : null;
    return { pCls: p ? (p.className||'').toString() : null, zeroCls: zero ? (zero.className||'').toString() : null, zeroHTML: zero ? zero.outerHTML.slice(0, 320) : null };
  })()`;
  console.log(`\n===== (5) ZERO-STATE ZONE (REF ${route}) =====`);
  console.log(JSON.stringify(await evalOn("ref", Z), null, 1).slice(0, 800));
}

// ---------- (6) the leave-balances card texts on REF ----------
run(`agent-browser --session ref open "${baseRef}/dashboard"`);
await new Promise(r => setTimeout(r, 2400));
const LB = `(() => {
  const card = [...document.querySelectorAll('div')].find(d => /My Leave Balances/.test(d.textContent||'') && /rounded-xl/.test(d.className||''));
  if (!card) return { gone: true };
  const rows = [...card.querySelectorAll('div[class*=justify-between]')].map(r => ({ spans: [...r.querySelectorAll('span')].map(s => (s.textContent||'').trim()) }));
  const bars = [...card.querySelectorAll('div[class*=bg-blue-500], div[class*=bg-green-500]')].map(b => (b.className||'').toString() + ' w=' + Math.round(b.getBoundingClientRect().width));
  const link = card.querySelector('a');
  return { rows, bars, linkCls: link ? (link.getAttribute('class')||'') + ' = ' + (link.textContent||'').trim() : null };
})()`;
console.log("\n===== (6) LEAVE-BALANCES DEFAULT UI (REF) =====");
console.log(JSON.stringify(await evalOn("ref", LB), null, 1).slice(0, 900));
