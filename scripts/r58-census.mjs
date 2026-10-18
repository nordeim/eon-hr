#!/usr/bin/env node
// r58-census.mjs — session-58 / parity round 57 census: the solid-fill
// toggle family + the gradient-vs-solid drift sweep.
// Phase (A): the employees view-toggle pair (paired live read).
// Phase (B): the gradient-button sweep — every gradient-filled button on
//   each main page, compared by position/text against REF (a clone-only
//   gradient at a non-CTA position = the drift family).
// Phase (C): the training/taskmanager toggle re-verification (the family's
//   known-good pins).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b) { const match = JSON.stringify(a) === JSON.stringify(b); results.push({ name, match }); console.log(`${match ? "MATCH" : "DIFF "} ${name}`); if (!match) { console.log(`  ref: ${JSON.stringify(a).slice(0, 500)}`); console.log(`  loc: ${JSON.stringify(b).slice(0, 500)}`); } }

const ROUTES = ["/employees", "/taskmanager", "/training", "/staffrequests", "/payroll", "/recruitment", "/attendance", "/companywall", "/profile", "/settings"];

// the gradient-button reader: every button whose backgroundImage is a
// linear-gradient, with text + position + size (the CTA fingerprint)
const GRAD_BTN = `(() => {
  const btns = [...document.querySelectorAll('main button')].filter(b => {
    const bi = getComputedStyle(b).backgroundImage;
    return bi && bi !== 'none' && bi.includes('gradient');
  });
  return btns.map(b => {
    const r = b.getBoundingClientRect();
    return { text: (b.textContent || '').trim().slice(0, 24), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height) };
  }).slice(0, 12);
})()`;

// (A) the employees view-toggle pair — at-rest, both modes, hover-free
const TOGGLE = `(() => {
  const btns = [...document.querySelectorAll('main button')].filter(b => {
    const s = (b.querySelector('svg') || {}).className?.baseVal || '';
    return s.includes('grid3x3') || s.includes('lucide-list');
  });
  return btns.map(b => {
    const svg = b.querySelector('svg');
    const r = b.getBoundingClientRect();
    const cs = getComputedStyle(b);
    return {
      svg: svg ? svg.className.baseVal.replace('lucide lucide-', '').split(' ')[0] : null,
      bg: cs.backgroundColor, bgImg: cs.backgroundImage.slice(0, 70),
      w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize,
      cls: b.className.slice(-110),
    };
  });
})()`;

async function openBoth(route) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  run(`agent-browser --session loc open "${baseLoc}${route}"`);
  await new Promise(r => setTimeout(r, 2800));
}

// ---------- (A) the employees toggle pair ----------
await openBoth("/employees");
const refT = await evalOn("ref", TOGGLE, 400);
const locT = await evalOn("loc", TOGGLE, 400);
rec("(A) employees view-toggle at-rest (list default)", refT, locT);

// ---------- (B) the gradient-button sweep ----------
for (const route of ROUTES) {
  await openBoth(route);
  const refG = await evalOn("ref", GRAD_BTN, 500);
  const locG = await evalOn("loc", GRAD_BTN, 500);
  rec(`(B) gradient buttons ${route}`, refG, locG);
}

// ---------- (C) the known-good toggle pins ----------
await openBoth("/taskmanager");
const refC1 = await evalOn("ref", TOGGLE, 400);
const locC1 = await evalOn("loc", TOGGLE, 400);
rec("(C) taskmanager toggle re-verify", refC1, locC1);

await openBoth("/training");
const CHIP = `(() => {
  const chips = [...document.querySelectorAll('main button')].filter(b => b.textContent.trim() && b.textContent.length < 22);
  return chips.slice(0, 5).map(b => {
    const cs = getComputedStyle(b);
    return { text: b.textContent.trim().slice(0, 16), bg: cs.backgroundColor, fs: cs.fontSize };
  });
})()`;
const refC2 = await evalOn("ref", CHIP, 400);
const locC2 = await evalOn("loc", CHIP, 400);
rec("(C) training chips re-verify", refC2, locC2);

const nMatch = results.filter(r => r.match).length;
console.log(`\nCENSUS: ${nMatch}/${results.length} MATCH`);
