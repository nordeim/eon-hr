#!/usr/bin/env node
// r61-probe4.mjs — remaining families: search icons on chat/
// documenttracker/recruitmentkanban/recruitment (REF class read),
// loans empty icon, payrollai values, shiftcalendar #fafafa div,
// profile items, employees blue svg, securitysettings bottom section,
// evaluations wide spans, interviewassistant extras, onboardingtemplates
// svg, hrassistantchat p, careers, hrassistant.
// Usage: node scripts/r61-probe4.mjs
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

const SEARCHICONS = `(() => {
  const out = [];
  for (const el of document.querySelectorAll('main svg')) {
    const cls = el.getAttribute('class') || '';
    if (!cls.includes('search')) continue;
    const r = el.getBoundingClientRect();
    out.push({ c: getComputedStyle(el).color.replace(/, /g, ','), cls: cls.slice(0, 100), y: Math.round(r.y), x: Math.round(r.x) });
  }
  return out.slice(0, 4);
})()`;

const EMPTYICONS = `(() => {
  const out = [];
  for (const el of document.querySelectorAll('main svg')) {
    const r = el.getBoundingClientRect();
    if (r.width < 40) continue;
    if (el.closest('button')) continue;
    out.push({ c: getComputedStyle(el).color.replace(/, /g, ','), cls: (el.getAttribute('class') || '').slice(0, 80), w: Math.round(r.width), y: Math.round(r.y), x: Math.round(r.x) });
  }
  out.sort((a, b) => a.y - b.y);
  return out.slice(0, 8);
})()`;

const SECT = (y0, y1) => `(() => {
  const out = [];
  for (const el of document.querySelectorAll('main h1, main h2, main h3, main h4, main p, main span, main div, main svg, main label, main th')) {
    if (el.closest('button')) continue;
    if (el.children.length > 0 && el.tagName.toLowerCase() !== 'svg') continue;
    const r = el.getBoundingClientRect();
    if (r.y < ${y0} || r.y > ${y1}) continue;
    const txt = (el.textContent || '').trim();
    if (!txt && el.tagName.toLowerCase() !== 'svg') continue;
    out.push({ tg: el.tagName.toLowerCase(), c: getComputedStyle(el).color.replace(/, /g, ','), t: txt.slice(0, 24), cls: (el.getAttribute('class') || '').slice(0, 70), x: Math.round(r.x), y: Math.round(r.y) });
  }
  out.sort((a, b) => a.y - b.y);
  return out.slice(0, 40);
})()`;

async function pair(route, name, READ, wait = 4200) {
  console.log(`\n########## ${name} (${route}) ##########`);
  run(`agent-browser --session ref open "${refBase}${route}"`);
  run(`agent-browser --session loc open "${locBase}${route}"`);
  await new Promise(r => setTimeout(r, wait));
  console.log("REF:", JSON.stringify(await evalOn("ref", READ, 1500)).slice(0, 2000));
  console.log("LOC:", JSON.stringify(await evalOn("loc", READ, 400)).slice(0, 2000));
}

// search icons on the other family routes
for (const r of ["/chat", "/documenttracker", "/recruitmentkanban", "/recruitment"]) await pair(r, "search icons", SEARCHICONS);
// loans + payroll empty icons
await pair("/loans", "empty icons ≥40px", EMPTYICONS);
// payrollai stat values (y 200-400)
await pair("/payrollai", "payrollai values", SECT(180, 420));
// shiftcalendar #fafafa div — full page section read
await pair("/shiftcalendar", "shiftcalendar all", SECT(0, 1400), 5200);
process.exit(0);
