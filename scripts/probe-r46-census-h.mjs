#!/usr/bin/env node
// probe-r46-census-h.mjs — session-47 / parity round 46 census H (contract
// completion): (1) the attendance stat tile + svg classes on REF, (2) the
// dark: gradient pairs on attendance/profile/taskmanager, (3) the REF
// profile avatar zone markup, (4) the REF doctracker stat svg + value/label
// full classes, (5) the employees hero zone classes on REF.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app";
run(`agent-browser --session ref set viewport 1440 900`);

// ---------- (1) the attendance stat tile + svg ----------
run(`agent-browser --session ref open "${baseRef}/attendance"`);
await new Promise(r => setTimeout(r, 2600));
const TILE = `(() => {
  const tile = [...document.querySelectorAll('div')].find(d => /^bg-blue-100 p-3 rounded-xl$/.test((d.className||'').toString()));
  if (!tile) return { gone: true };
  const svg = tile.querySelector('svg');
  const card = tile.closest('div[class*=rounded-xl]');
  const value = card.querySelector('div[class*=text-3xl]');
  const label = card.querySelector('div[class*=text-sm]');
  return { tileCls: (tile.className||'').toString(), svgCls: svg ? (svg.getAttribute('class')||'') : null, valueCls: value ? (value.className||'').toString() : null, valueTag: value ? value.tagName : null, labelCls: label ? (label.className||'').toString() : null, labelTag: label ? label.tagName : null, cardCls: (card.className||'').toString() };
})()`;
console.log("===== (1) ATTENDANCE STAT TILE (REF) =====");
console.log(JSON.stringify(await evalOn("ref", TILE), null, 1).slice(0, 800));

// ---------- (2) the dark gradient pairs ----------
const DARK = `(() => {
  const root = document.querySelector('div[class*=min-h-screen]');
  return root ? { fullCls: (root.className||'').toString() } : { gone: true };
})()`;
for (const route of ["/attendance", "/profile", "/taskmanager", "/payroll"]) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 2100));
  console.log(`\n(2) ${route} ROOT:`);
  console.log(JSON.stringify(await evalOn("ref", DARK)));
}

// ---------- (3) the REF profile avatar zone ----------
run(`agent-browser --session ref open "${baseRef}/profile"`);
await new Promise(r => setTimeout(r, 2400));
const AVATAR = `(() => {
  const h2 = [...document.querySelectorAll('h2')].find(h => /sepnetflix/.test(h.textContent||''));
  if (!h2) return { gone: true };
  const zone = h2.parentElement;
  return { zoneCls: (zone.className||'').toString(), zoneHTML: zone.outerHTML.slice(0, 1100) };
})()`;
console.log("\n===== (3) PROFILE AVATAR ZONE (REF) =====");
console.log(JSON.stringify(await evalOn("ref", AVATAR), null, 1).slice(0, 1400));

// ---------- (4) the doctracker stat full classes ----------
run(`agent-browser --session ref open "${baseRef}/documenttracker"`);
await new Promise(r => setTimeout(r, 2200));
const DT = `(() => {
  const tile = [...document.querySelectorAll('div')].find(d => /^w-11 h-11 rounded-xl flex items-center justify-center bg-blue-100$/.test((d.className||'').toString()));
  if (!tile) return { gone: true };
  const svg = tile.querySelector('svg');
  const card = tile.closest('div[class*=rounded-xl]');
  const kids = [...card.querySelectorAll('p,div,span')].slice(0, 8).map(e => e.tagName + '{' + (e.className||'').toString().slice(0, 60) + '}=' + (e.textContent||'').trim().slice(0, 18));
  return { tileCls: (tile.className||'').toString(), svgCls: svg ? (svg.getAttribute('class')||'') : null, kids };
})()`;
console.log("\n===== (4) DOCTRACKER STAT (REF full) =====");
console.log(JSON.stringify(await evalOn("ref", DT), null, 1).slice(0, 1100));

// ---------- (5) the employees hero zone on REF ----------
run(`agent-browser --session ref open "${baseRef}/employees"`);
await new Promise(r => setTimeout(r, 2200));
const EMPH = `(() => {
  const h1 = [...document.querySelectorAll('h1')].find(h => /Employees/.test(h.textContent||''));
  if (!h1) return { gone: true };
  const row = h1.closest('div[class*=flex]');
  return { rowCls: (row.className||'').toString(), rowHTML: row.outerHTML.slice(0, 700) };
})()`;
console.log("\n===== (5) EMPLOYEES HERO (REF) =====");
console.log(JSON.stringify(await evalOn("ref", EMPH), null, 1).slice(0, 900));
