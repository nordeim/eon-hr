#!/usr/bin/env node
// r61-probe3.mjs — remaining families: both-theme compliance chips,
// the payroll slate-400 icon locator, payrollai values, shiftcalendar
// div, profile items, employees blue svg, securitysettings bottom
// section, evaluations wide spans.
// Usage: node scripts/r61-probe3.mjs
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 2200));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 350));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 350));
  run(`agent-browser --session ${session} click 'button[type=submit]'`);
  await new Promise(r => setTimeout(r, 5000));
}
const locBase = "http://127.0.0.1:3200";
const refBase = "https://eon.base44.app";
await auth("loc", locBase);
await auth("ref", refBase);

// A. compliance chips in LIGHT (re-measure after un-dark)
for (const s of ["loc", "ref"]) await evalOn(s, `localStorage.setItem('darkMode','false')`);
run(`agent-browser --session ref open "${refBase}/compliancedashboard"`);
run(`agent-browser --session loc open "${locBase}/compliancedashboard"`);
await new Promise(r => setTimeout(r, 4200));
const CHIPS = `(() => {
  const out = [];
  for (const el of document.querySelectorAll('main div, main p')) {
    if (el.children.length > 0) continue;
    const t = (el.textContent || '').trim();
    const r = el.getBoundingClientRect();
    if (r.y < 420 || r.y > 480) continue;
    const cs = getComputedStyle(el);
    out.push({ tg: el.tagName.toLowerCase(), t: t.slice(0, 18), c: cs.color.replace(/, /g, ','), fs: cs.fontSize, cls: (el.getAttribute('class') || '').slice(0, 70), x: Math.round(r.x), y: Math.round(r.y) });
  }
  out.sort((a, b) => a.x - b.x);
  return out.slice(0, 12);
})()`;
console.log("### compliance chips LIGHT ###");
console.log("REF:", JSON.stringify(await evalOn("ref", CHIPS, 1500)));
console.log("LOC:", JSON.stringify(await evalOn("loc", CHIPS, 400)));

// the green-400 all-clear + alerts icon, both themes on ref
const CLEARICON = `(() => {
  const out = [];
  for (const el of document.querySelectorAll('main svg')) {
    const c = getComputedStyle(el).color.replace(/, /g, ',');
    if (!c.startsWith('rgb(74,') && !c.startsWith('rgb(34,') && !c.startsWith('rgb(249,')) continue;
    const r = el.getBoundingClientRect();
    out.push({ c, cls: (el.getAttribute('class') || '').slice(0, 70), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) });
  }
  return out.slice(0, 8);
})()`;
console.log("REF clear/icons (light):", JSON.stringify(await evalOn("ref", CLEARICON, 0)));

// B. payroll: find ALL svgs with position + color (the slate-400 locator)
for (const s of ["loc", "ref"]) await evalOn(s, `localStorage.setItem('darkMode','true')`);
run(`agent-browser --session ref open "${refBase}/payroll"`);
run(`agent-browser --session loc open "${locBase}/payroll"`);
await new Promise(r => setTimeout(r, 4200));
const ALLSVG = `(() => {
  const out = [];
  for (const el of document.querySelectorAll('main svg')) {
    if (el.closest('button')) continue;
    const c = getComputedStyle(el).color.replace(/, /g, ',');
    const r = el.getBoundingClientRect();
    out.push({ c, cls: (el.getAttribute('class') || '').slice(0, 60), x: Math.round(r.x), y: Math.round(r.y) });
  }
  out.sort((a, b) => a.y - b.y);
  return out.slice(0, 30);
})()`;
console.log("\n### payroll svgs (dark) ###");
console.log("REF:", JSON.stringify(await evalOn("ref", ALLSVG, 1500)).slice(0, 1600));
console.log("LOC:", JSON.stringify(await evalOn("loc", ALLSVG, 400)).slice(0, 1600));
process.exit(0);
