#!/usr/bin/env node
// r61-probe5.mjs — the final decomposition pass: payrollai title area,
// shiftcalendar calendar body, evaluations wide spans, employees svgs,
// profile identity card, securitysettings bottom section,
// interviewassistant extras, onboardingtemplates svg, hrassistantchat,
// careers, hrassistant, recruitment svg map.
// Usage: node scripts/r61-probe5.mjs
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

const SECT = (y0, y1) => `(() => {
  const out = [];
  for (const el of document.querySelectorAll('main h1, main h2, main h3, main h4, main p, main span, main div, main svg, main label, main th, main td, main a')) {
    if (el.closest('button')) continue;
    if (el.children.length > 0 && el.tagName.toLowerCase() !== 'svg') continue;
    const r = el.getBoundingClientRect();
    if (r.y < ${y0} || r.y > ${y1}) continue;
    const txt = (el.textContent || '').trim();
    if (!txt && el.tagName.toLowerCase() !== 'svg') continue;
    out.push({ tg: el.tagName.toLowerCase(), c: getComputedStyle(el).color.replace(/, /g, ','), t: txt.slice(0, 26), cls: (el.getAttribute('class') || '').slice(0, 66), x: Math.round(r.x), y: Math.round(r.y) });
  }
  out.sort((a, b) => a.y - b.y);
  return out.slice(0, 40);
})()`;

const SVGS = `(() => {
  const out = [];
  for (const el of document.querySelectorAll('main svg')) {
    if (el.closest('button')) continue;
    const c = getComputedStyle(el).color.replace(/, /g, ',');
    const r = el.getBoundingClientRect();
    out.push({ c, t: '', cls: (el.getAttribute('class') || '').slice(0, 66), y: Math.round(r.y), x: Math.round(r.x) });
  }
  out.sort((a, b) => a.y - b.y);
  return out.slice(0, 34);
})()`;

async function pair(route, name, READ, wait = 4200) {
  console.log(`\n########## ${name} (${route}) ##########`);
  run(`agent-browser --session ref open "${refBase}${route}"`);
  run(`agent-browser --session loc open "${locBase}${route}"`);
  await new Promise(r => setTimeout(r, wait));
  console.log("REF:", JSON.stringify(await evalOn("ref", READ, 1500)).slice(0, 2100));
  console.log("LOC:", JSON.stringify(await evalOn("loc", READ, 400)).slice(0, 2100));
}

await pair("/payrollai", "payrollai title+stats", SECT(140, 230));
await pair("/shiftcalendar", "shiftcalendar calendar body", SECT(370, 760), 5200);
await pair("/evaluations", "evaluations full spans", SECT(200, 1000));
await pair("/employees", "employees svgs", SVGS);
await pair("/recruitment", "recruitment svgs", SVGS);
await pair("/securitysettings", "securitysettings bottom", SECT(900, 1300));
process.exit(0);
