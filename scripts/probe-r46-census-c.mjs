#!/usr/bin/env node
// probe-r46-census-c.mjs — session-47 / parity round 46 census C: the deep
// reads. Targeted per-page subtree dumps (classes + geometry) at matched
// 1440x900 viewports, zero-tenant on both sides:
// (1) dashboard sections, (2) attendance view structure, (3) documenttracker
// stat cards, (4) training tail, (5) profile census, (6) employees/taskmanager
// icon census.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseZero = "http://127.0.0.1:3201";

async function openBoth(route, settle = 2600) {
  run(`agent-browser --session ref set viewport 1440 900`);
  run(`agent-browser --session loc0 set viewport 1440 900`);
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, settle));
  run(`agent-browser --session loc0 open "${baseZero}${route}"`);
  await new Promise(r => setTimeout(r, settle));
}

// ---------- (1) dashboard: the section structure after the Customize row ----------
await openBoth("/dashboard");
const DASH = `(() => {
  const main = document.querySelector('main');
  const scroller = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!scroller) return { gone: true };
  const kids = [...scroller.children].map(c => ({ tag: c.tagName, cls: (c.className||'').toString().slice(0, 80) }));
  const inner = [...scroller.querySelectorAll('h1,h2,h3,h4,div,p,span,button')].slice(0, 70).map(e => {
    const r = e.getBoundingClientRect();
    const t = (e.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40);
    return e.tagName.toLowerCase() + '[' + Math.round(r.y) + ',' + Math.round(r.height) + ']' + (t ? '=' + t : '') + '{' + (e.className||'').toString().slice(0, 55) + '}';
  });
  return { kids, inner };
})()`;
const dashRef = await evalOn("ref", DASH);
const dashLoc = await evalOn("loc0", DASH);
console.log("\n===== DASHBOARD REF =====\n" + JSON.stringify(dashRef, null, 0).slice(0, 3000));
console.log("\n===== DASHBOARD LOC0 =====\n" + JSON.stringify(dashLoc, null, 0).slice(0, 3000));

// ---------- (2) attendance: the full structure ----------
await openBoth("/attendance", 3200);
const ATT = `(() => {
  const main = document.querySelector('main');
  const scroller = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!scroller) return { gone: true };
  const inner = [...scroller.querySelectorAll('h1,h2,h3,h4,div,p,button,table')].slice(0, 55).map(e => {
    const r = e.getBoundingClientRect();
    const t = (e.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 30);
    return e.tagName.toLowerCase() + '[' + Math.round(r.y) + ',' + Math.round(r.height) + ']' + (t ? '=' + t : '') + '{' + (e.className||'').toString().slice(0, 45) + '}';
  });
  return { w: Math.round(scroller.getBoundingClientRect().width), scrollW: scroller.scrollWidth, inner };
})()`;
const attRef = await evalOn("ref", ATT);
const attLoc = await evalOn("loc0", ATT);
console.log("\n===== ATTENDANCE REF =====\n" + JSON.stringify(attRef, null, 0).slice(0, 2600));
console.log("\n===== ATTENDANCE LOC0 =====\n" + JSON.stringify(attLoc, null, 0).slice(0, 2600));

// ---------- (3) documenttracker: one stat card's markup ----------
await openBoth("/documenttracker");
const DOCS = `(() => {
  const main = document.querySelector('main');
  const scroller = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!scroller) return { gone: true };
  const card = scroller.querySelector('p') ? scroller.querySelectorAll('p')[1] : null;
  const zone = card ? (card.closest('div') && card.closest('div').parentElement) : null;
  if (!zone) return { gone: true };
  const dump = [...zone.children].slice(0, 4).map(c => ({ tag: c.tagName, cls: (c.className||'').toString().slice(0, 90), html: c.innerHTML.slice(0, 320) }));
  return { zoneCls: (zone.className||'').toString().slice(0, 90), dump };
})()`;
const docRef = await evalOn("ref", DOCS);
const docLoc = await evalOn("loc0", DOCS);
console.log("\n===== DOCTRACKER STAT ZONE REF =====\n" + JSON.stringify(docRef, null, 1).slice(0, 2200));
console.log("\n===== DOCTRACKER STAT ZONE LOC0 =====\n" + JSON.stringify(docLoc, null, 1).slice(0, 2200));

// ---------- (4) training: the platform section tail ----------
await openBoth("/training");
const TRAIN = `(() => {
  const h2 = [...document.querySelectorAll('h2')].find(h => /Training Platforms/i.test(h.textContent||''));
  if (!h2) return { gone: true };
  const sect = h2.parentElement;
  const dump = [...sect.querySelectorAll('button,h2,p')].map(e => {
    const r = e.getBoundingClientRect();
    return e.tagName.toLowerCase() + '[' + Math.round(r.y) + ',' + Math.round(r.height) + ']=' + (e.textContent||'').trim().slice(0, 32) + '{' + (e.className||'').toString().slice(0, 55) + '}';
  });
  return { sectCls: (sect.className||'').toString().slice(0, 90), dump };
})()`;
const trRef = await evalOn("ref", TRAIN);
const trLoc = await evalOn("loc0", TRAIN);
console.log("\n===== TRAINING PLATFORM SECTION REF =====\n" + JSON.stringify(trRef, null, 0).slice(0, 1200));
console.log("\n===== TRAINING PLATFORM SECTION LOC0 =====\n" + JSON.stringify(trLoc, null, 0).slice(0, 1200));

// ---------- (5) profile: the audit-note + full census ----------
await openBoth("/profile");
const PROF = `(() => {
  const main = document.querySelector('main');
  const scroller = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!scroller) return { gone: true };
  const audit = [...scroller.querySelectorAll('p')].find(p => /audited for security/i.test(p.textContent||''));
  const form = scroller.querySelector('form');
  const buttons = [...scroller.querySelectorAll('button')].map(b => (b.textContent||'').trim().slice(0, 20));
  const inputs = [...scroller.querySelectorAll('input')].map(i => i.type + ':' + (i.id || i.name || '?'));
  return { auditNote: audit ? { t: (audit.textContent||'').trim().slice(0, 60), cls: (audit.className||'').toString().slice(0, 80) } : null, buttons, inputs };
})()`;
const prRef = await evalOn("ref", PROF);
const prLoc = await evalOn("loc0", PROF);
console.log("\n===== PROFILE REF =====\n" + JSON.stringify(prRef, null, 0).slice(0, 1000));
console.log("\n===== PROFILE LOC0 =====\n" + JSON.stringify(prLoc, null, 0).slice(0, 1000));

// ---------- (6) employees + taskmanager: the svg census ----------
await openBoth("/employees");
const SVG = `(() => {
  const main = document.querySelector('main');
  const scroller = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!scroller) return { gone: true };
  const svgs = [...scroller.querySelectorAll('svg')].map(s => {
    const first = s.querySelector('path,line,polyline,rect,circle,polygon');
    return (s.getAttribute('class')||'') + '::' + (first ? first.tagName + ':' + (first.getAttribute('d') || '').slice(0, 26) : '');
  });
  return svgs;
})()`;
const emRef = await evalOn("ref", SVG);
const emLoc = await evalOn("loc0", SVG);
console.log("\n===== EMPLOYEES SVG REF =====\n" + JSON.stringify(emRef, null, 0).slice(0, 1200));
console.log("\n===== EMPLOYEES SVG LOC0 =====\n" + JSON.stringify(emLoc, null, 0).slice(0, 1200));

await openBoth("/taskmanager");
const tkRef = await evalOn("ref", SVG);
const tkLoc = await evalOn("loc0", SVG);
console.log("\n===== TASKMANAGER SVG REF =====\n" + JSON.stringify(tkRef, null, 0).slice(0, 1200));
console.log("\n===== TASKMANAGER SVG LOC0 =====\n" + JSON.stringify(tkLoc, null, 0).slice(0, 1200));
