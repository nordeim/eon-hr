#!/usr/bin/env node
// r63-probe2.mjs — targeted DOM-context dumps for the mystery elements:
// (1) REF recruitment's slate-600 svg — parent chain + classes
// (2) REF employees' blue-600 svg — parent chain + classes
// (3) hrreports' clone-only neutral-500 button — text + classes both sides
// (4) attendance clone's headings — the restricted card's actual markup
// (5) shiftcalendar REF assign-button innerHTML (one sample)
// (6) advancedanalytics REF's "May" p — parent chain
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function ctx(session, base, route, target) {
  run(`agent-browser --session ${session} open "${base}${route}"`);
  await wait(4200);
  return evalOn(session, target, 2200);
}

// (1) recruitment slate-600 svgs on REF with context
const r1 = await ctx("ref", "https://eon.base44.app", "/recruitment", `(() => {
  const out = [];
  for (const el of document.querySelectorAll('main svg')) {
    const c = getComputedStyle(el).color.replace(/, /g, ',');
    if (c !== 'rgb(71,85,105)') continue;
    const p = el.parentElement, gp = p ? p.parentElement : null;
    out.push({ cls: (el.getAttribute('class')||'').slice(0,80), pTag: p ? p.tagName : '', pCls: p ? (p.getAttribute('class')||'').slice(0,90) : '', gpTag: gp ? gp.tagName : '', gpCls: gp ? (gp.getAttribute('class')||'').slice(0,90) : '', aria: el.getAttribute('aria-label'), pText: p ? (p.textContent||'').replace(/\\s+/g,' ').trim().slice(0,40) : '' });
  }
  return out;
})()`);
console.log("(1) REF recruitment slate-600 svg context:", JSON.stringify(r1, null, 1).slice(0, 900));

// (2) employees blue-600 svg on REF with context
const r2 = await ctx("ref", "https://eon.base44.app", "/employees", `(() => {
  const out = [];
  for (const el of document.querySelectorAll('main svg')) {
    const c = getComputedStyle(el).color.replace(/, /g, ',');
    if (c !== 'rgb(37,99,235)') continue;
    const p = el.parentElement, gp = p ? p.parentElement : null;
    out.push({ cls: (el.getAttribute('class')||'').slice(0,80), pTag: p ? p.tagName : '', pCls: p ? (p.getAttribute('class')||'').slice(0,90) : '', gpTag: gp ? gp.tagName : '', gpCls: gp ? (gp.getAttribute('class')||'').slice(0,90) : '', pText: p ? (p.textContent||'').replace(/\\s+/g,' ').trim().slice(0,40) : '' });
  }
  return out;
})()`);
console.log("\n(2) REF employees blue-600 svg context:", JSON.stringify(r2, null, 1).slice(0, 900));

// (3) hrreports buttons both sides
const r3a = await ctx("ref", "https://eon.base44.app", "/hrreports", `(() => {
  const out = [];
  for (const b of document.querySelectorAll('main button')) {
    out.push({ text: (b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,30), cls: (b.getAttribute('class')||'').slice(0,90), color: getComputedStyle(b).color.replace(/, /g,','), aria: b.getAttribute('aria-label') });
  }
  return out;
})()`);
const r3b = await ctx("loc", "http://127.0.0.1:3200", "/hrreports", `(() => {
  const out = [];
  for (const b of document.querySelectorAll('main button')) {
    out.push({ text: (b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,30), cls: (b.getAttribute('class')||'').slice(0,90), color: getComputedStyle(b).color.replace(/, /g,','), aria: b.getAttribute('aria-label') });
  }
  return out;
})()`);
console.log("\n(3) hrreports REF buttons:", JSON.stringify(r3a, null, 1).slice(0, 700));
console.log("hrreports LOC buttons:", JSON.stringify(r3b, null, 1).slice(0, 900));

// (4) attendance clone headings + restricted card markup
const r4 = await ctx("loc", "http://127.0.0.1:3200", "/attendance", `(() => {
  const out = { h: [], restricted: null };
  for (const el of document.querySelectorAll('main h1, main h2, main h3, main h4')) {
    out.h.push({ tg: el.tagName.toLowerCase(), c: getComputedStyle(el).color.replace(/, /g,','), t: (el.textContent||'').replace(/\\s+/g,' ').trim().slice(0,36) });
  }
  const cand = [...document.querySelectorAll('main *')].find(el => /restricted/i.test(el.textContent || '') && el.children.length < 3);
  if (cand) { const p = cand.parentElement; out.restricted = { tag: cand.tagName, cls: (cand.getAttribute('class')||'').slice(0,100), text: (cand.textContent||'').replace(/\\s+/g,' ').trim().slice(0,60), pCls: p ? (p.getAttribute('class')||'').slice(0,100) : '' }; }
  return out;
})()`);
console.log("\n(4) attendance LOC headings + restricted:", JSON.stringify(r4, null, 1).slice(0, 1200));

// (5) shiftcalendar REF one assign button innerHTML
const r5 = await ctx("ref", "https://eon.base44.app", "/shiftcalendar", `(() => {
  const b = [...document.querySelectorAll('main button')].find(x => (x.getAttribute('aria-label')||'') === 'assign' || /assign/i.test(x.textContent||''));
  if (!b) return 'none';
  const svgs = [...b.querySelectorAll('svg')].map(s => (s.getAttribute('class')||'').slice(0,60) + ' color=' + getComputedStyle(s).color);
  return { cls: (b.getAttribute('class')||'').slice(0,100), aria: b.getAttribute('aria-label'), text: (b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,20), innerStart: b.innerHTML.replace(/\\s+/g,' ').slice(0,220), svgs };
})()`);
console.log("\n(5) shiftcalendar REF assign button:", JSON.stringify(r5, null, 1).slice(0, 800));

// (6) advancedanalytics REF "May" p context
const r6 = await ctx("ref", "https://eon.base44.app", "/advancedanalytics", `(() => {
  const el = [...document.querySelectorAll('main p')].find(x => (x.textContent||'').trim() === 'May' || (x.textContent||'').includes('May'));
  if (!el) return 'none';
  const p = el.parentElement, gp = p ? p.parentElement : null;
  return { cls: (el.getAttribute('class')||'').slice(0,80), text: (el.textContent||'').replace(/\\s+/g,' ').trim().slice(0,60), pTag: p ? p.tagName : '', pCls: p ? (p.getAttribute('class')||'').slice(0,90) : '', gpCls: gp ? (gp.getAttribute('class')||'').slice(0,90) : '' };
})()`);
console.log("\n(6) advancedanalytics REF May p:", JSON.stringify(r6, null, 1).slice(0, 700));
process.exit(0);
