#!/usr/bin/env node
// r61-probe1.mjs — decompose the lab() (oklch drift) family + colored
// stat values. Element-level reads: text, tag, color, class attribute
// on BOTH sides (dark mode). Filter out the plain neutrals; keep the
// colored family. Usage: node scripts/r61-probe1.mjs [route ...]
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
const ROUTES = process.argv.slice(2).length > 0 ? process.argv.slice(2) : [
  "/securitysettings", "/hrreports", "/performancemanagement", "/advancedanalytics",
  "/compliancedashboard", "/workflowautomation",
];

const READ = `(() => {
  const out = [];
  const isPlain = (c) => c.startsWith('rgb(15,') || c.startsWith('rgb(51,') || c.startsWith('rgb(71,') || c.startsWith('rgb(100,') || c.startsWith('rgb(163,') || c.startsWith('rgb(148,') || c.startsWith('rgb(203,') || c.startsWith('rgb(250,') || c.startsWith('rgb(255,') || c.startsWith('rgba(');
  for (const el of document.querySelectorAll('main h1, main h2, main h3, main h4, main p, main span, main div, main th, main td, main label, main svg, main a')) {
    if (el.closest('button')) continue;
    if (el.children.length > 0 && el.tagName.toLowerCase() !== 'svg') continue;
    const c = getComputedStyle(el).color.replace(/, /g, ',');
    if (isPlain(c)) continue;
    const r = el.getBoundingClientRect();
    out.push({ tg: el.tagName.toLowerCase(), c, t: (el.textContent || '').trim().slice(0, 26), cls: (el.getAttribute('class') || '').slice(0, 100), y: Math.round(r.y), x: Math.round(r.x) });
  }
  out.sort((a, b) => a.y - b.y);
  return out.slice(0, 44);
})()`;

// auth fresh (short REF TTL)
await auth("loc", locBase);
await auth("ref", refBase);
for (const s of ["loc", "ref"]) await evalOn(s, `localStorage.setItem('darkMode','true')`);

for (const route of ROUTES) {
  console.log(`\n########## ${route} ##########`);
  run(`agent-browser --session ref open "${refBase}${route}"`);
  run(`agent-browser --session loc open "${locBase}${route}"`);
  await new Promise(r => setTimeout(r, 4200));
  const ref = await evalOn("ref", READ, 1500);
  const loc = await evalOn("loc", READ, 400);
  console.log("REF:", JSON.stringify(ref).slice(0, 2400));
  console.log("LOC:", JSON.stringify(loc).slice(0, 2400));
}
process.exit(0);
