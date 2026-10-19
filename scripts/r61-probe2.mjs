#!/usr/bin/env node
// r61-probe2.mjs — decompose the PLAIN-color divergences: the search-icon
// family (slate-400 vs neutral-400), the chat h2, the requestreports th,
// the attendance h3/red-500, the evaluations status spans, the
// surveyanalytics blue span, the payrollai values, the shiftcalendar div,
// the profile div/span + p, the employees blue svg. Dark mode, both
// sides, element-level with classes.
// Usage: node scripts/r61-probe2.mjs
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
for (const s of ["loc", "ref"]) await evalOn(s, `localStorage.setItem('darkMode','true')`);

// read search-input icons (svg near input elements) with context
const SEARCH_ICONS = `(() => {
  const out = [];
  for (const inp of document.querySelectorAll('main input[type=text], main input[type=search], main input[placeholder]')) {
    const holder = inp.closest('div.relative, div.flex, div');
    const scope = holder && holder.parentElement ? holder.parentElement : document.querySelector('main');
    const svgs = [...scope.querySelectorAll('svg')].filter(s => { const r = s.getBoundingClientRect(); const ir = inp.getBoundingClientRect(); return r.x < ir.x && Math.abs(r.y - ir.y) < 30 && !s.closest('button'); });
    const inpR = inp.getBoundingClientRect();
    const ph = getComputedStyle(inp, '::placeholder').color.replace(/, /g, ',');
    out.push({ ph, phCls: (inp.getAttribute('placeholder') || '').slice(0, 20), icons: svgs.map(s => { const r = s.getBoundingClientRect(); return { c: getComputedStyle(s).color.replace(/, /g, ','), cls: (s.getAttribute('class') || '').slice(0, 60), x: Math.round(r.x), y: Math.round(r.y) }; }), inpX: Math.round(inpR.x), inpY: Math.round(inpR.y) });
  }
  return out.slice(0, 8);
})()`;

// read headings + th + status spans with classes (for the tag-level family)
const HEADINGS = `(() => {
  const out = [];
  for (const el of document.querySelectorAll('main h1, main h2, main h3, main th, main thead')) {
    if (el.closest('button')) continue;
    const c = getComputedStyle(el).color.replace(/, /g, ',');
    const r = el.getBoundingClientRect();
    out.push({ tg: el.tagName.toLowerCase(), c, t: (el.textContent || '').trim().slice(0, 24), cls: (el.getAttribute('class') || '').slice(0, 80), x: Math.round(r.x), y: Math.round(r.y) });
  }
  out.sort((a, b) => a.y - b.y);
  return out.slice(0, 30);
})()`;

// read spans in a y-range (status text colors) with classes
const SPANS_IN = (y0, y1) => `(() => {
  const out = [];
  for (const el of document.querySelectorAll('main span, main p, main div')) {
    if (el.closest('button')) continue;
    if (el.children.length > 0) continue;
    const r = el.getBoundingClientRect();
    if (r.y < ${y0} || r.y > ${y1}) continue;
    const c = getComputedStyle(el).color.replace(/, /g, ',');
    const txt = (el.textContent || '').trim();
    if (!txt) continue;
    out.push({ tg: el.tagName.toLowerCase(), c, t: txt.slice(0, 22), cls: (el.getAttribute('class') || '').slice(0, 70), x: Math.round(r.x), y: Math.round(r.y) });
  }
  out.sort((a, b) => a.y - b.y);
  return out.slice(0, 40);
})()`;

const PAIRS = [
  ["/payroll", "payroll search icons", SEARCH_ICONS],
  ["/chat", "chat headings", HEADINGS],
  ["/requestreports", "requestreports th", HEADINGS],
  ["/attendance", "attendance headings", HEADINGS],
  ["/evaluations", "evaluations spans 380-760", SPANS_IN(380, 900)],
  ["/surveyanalytics", "surveyanalytics spans all", SPANS_IN(0, 2000)],
];
for (const [route, name, READ] of PAIRS) {
  console.log(`\n########## ${name} (${route}) ##########`);
  run(`agent-browser --session ref open "${refBase}${route}"`);
  run(`agent-browser --session loc open "${locBase}${route}"`);
  await new Promise(r => setTimeout(r, 4200));
  const ref = await evalOn("ref", READ, 1500);
  const loc = await evalOn("loc", READ, 400);
  console.log("REF:", JSON.stringify(ref).slice(0, 2200));
  console.log("LOC:", JSON.stringify(loc).slice(0, 2200));
}
process.exit(0);
