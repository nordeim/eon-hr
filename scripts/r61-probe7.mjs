#!/usr/bin/env node
// r61-probe7.mjs — last decomposition pass: the evaluations tab-strip
// 16px offset, profile below-500, interviewassistant, onboardingtemplates,
// hrassistantchat, careers, hrassistant + the refresh-cw icon mystery.
// Usage: node scripts/r61-probe7.mjs
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

const ALLY = (y0, y1) => `(() => {
  window.scrollTo(0, 0);
  const out = [];
  for (const el of document.querySelectorAll('main h1, main h2, main h3, main h4, main p, main span, main div, main svg, main label, main button, main a')) {
    if (el.children.length > 0 && el.tagName.toLowerCase() !== 'svg' && el.tagName.toLowerCase() !== 'button') continue;
    const r = el.getBoundingClientRect();
    if (r.y < ${y0} || r.y > ${y1}) continue;
    const txt = (el.textContent || '').trim();
    if (!txt && el.tagName.toLowerCase() !== 'svg') continue;
    out.push({ tg: el.tagName.toLowerCase(), c: getComputedStyle(el).color.replace(/, /g, ','), t: txt.slice(0, 24), cls: (el.getAttribute('class') || '').slice(0, 62), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) });
  }
  out.sort((a, b) => a.y - b.y);
  return out.slice(0, 44);
})()`;

async function pair(route, name, READ, wait = 4200) {
  console.log(`\n########## ${name} (${route}) ##########`);
  run(`agent-browser --session ref open "${refBase}${route}"`);
  run(`agent-browser --session loc open "${locBase}${route}"`);
  await new Promise(r => setTimeout(r, wait));
  console.log("REF:", JSON.stringify(await evalOn("ref", READ, 1800)).slice(0, 2300));
  console.log("LOC:", JSON.stringify(await evalOn("loc", READ, 600)).slice(0, 2300));
}

// evaluations: the strip between the subtitle (y144) and the stat spans (y287)
await pair("/evaluations", "evaluations strip 144-300", ALLY(144, 300));
// profile: below 500
await pair("/profile", "profile 500-900", ALLY(500, 900), 5200);
// refresh-cw mystery on payroll
await pair("/payroll", "payroll -80..90", ALLY(-80, 90));
// interviewassistant full
await pair("/interviewassistant", "interviewassistant 60-500", ALLY(60, 500));
// onboardingtemplates
await pair("/onboardingtemplates", "onboardingtemplates 60-500", ALLY(60, 500), 5200);
// hrassistantchat
await pair("/hrassistantchat", "hrassistantchat 60-600", ALLY(60, 600));
process.exit(0);
