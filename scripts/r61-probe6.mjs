#!/usr/bin/env node
// r61-probe6.mjs — final pass: payrollai full read, compliance chip
// labels, loans empty-state geometry, profile identity, refresh-cw
// mystery, evaluations y-offset, interviewassistant, onboardingtemplates,
// hrassistantchat, careers, hrassistant.
// Usage: node scripts/r61-probe6.mjs
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
  window.scrollTo(0, 0);
  const out = [];
  for (const el of document.querySelectorAll('main h1, main h2, main h3, main h4, main p, main span, main div, main svg, main label, main th, main a')) {
    if (el.closest('button')) continue;
    if (el.children.length > 0 && el.tagName.toLowerCase() !== 'svg') continue;
    const r = el.getBoundingClientRect();
    if (r.y < ${y0} || r.y > ${y1}) continue;
    const txt = (el.textContent || '').trim();
    if (!txt && el.tagName.toLowerCase() !== 'svg') continue;
    out.push({ tg: el.tagName.toLowerCase(), c: getComputedStyle(el).color.replace(/, /g, ','), t: txt.slice(0, 26), cls: (el.getAttribute('class') || '').slice(0, 66), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) });
  }
  out.sort((a, b) => a.y - b.y);
  return out.slice(0, 42);
})()`;

async function pair(route, name, READ, wait = 4200) {
  console.log(`\n########## ${name} (${route}) ##########`);
  run(`agent-browser --session ref open "${refBase}${route}"`);
  run(`agent-browser --session loc open "${locBase}${route}"`);
  await new Promise(r => setTimeout(r, wait));
  console.log("REF:", JSON.stringify(await evalOn("ref", READ, 1800)).slice(0, 2300));
  console.log("LOC:", JSON.stringify(await evalOn("loc", READ, 600)).slice(0, 2300));
}

await pair("/payrollai", "payrollai 100-420", SECT(100, 420));
await pair("/compliancedashboard", "compliance chips+alerts 430-850", SECT(430, 850), 5200);
await pair("/loans", "loans 150-420", SECT(150, 420));
await pair("/evaluations", "evaluations top 60-300", SECT(60, 300));
await pair("/profile", "profile 150-500", SECT(150, 500));
process.exit(0);
