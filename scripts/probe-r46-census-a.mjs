#!/usr/bin/env node
// probe-r46-census-a.mjs — session-47 / parity round 46 census:
// the ZERO-STATE app page interiors (the never-censused dimension — the
// route sweep pins h1s only). For each of the 12 canonical routes: a
// structural fingerprint of the main scroller (tag census + text outline
// + stat-family detection) on REF vs LOC, zero-data on both.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const ROUTES = ["/dashboard", "/employees", "/payroll", "/taskmanager", "/attendance", "/recruitment", "/training", "/documenttracker", "/profile", "/settings", "/staffrequests", "/careers"];

// the interior reader: the main scroller's structural fingerprint
// (NOTE: no line comments inside the template literal — the one-liner
// trap from session-46: split-join collapses them onto the first line)
const INTERIOR = `(() => {
  const main = document.querySelector('main');
  const scroller = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!scroller) return { gone: true };
  const r = scroller.getBoundingClientRect();
  const tags = {};
  for (const el of scroller.querySelectorAll('*')) tags[el.tagName] = (tags[el.tagName] || 0) + 1;
  const outline = [...scroller.querySelectorAll('h1,h2,h3,h4,p,button,[role=alert]')].slice(0, 60).map(e => {
    const t = (e.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 50);
    return e.tagName + '|' + t;
  }).filter(s => !s.endsWith('|'));
  const stats = [...scroller.querySelectorAll('p')].filter(p => /text-3xl/.test(p.className)).map(p => (p.textContent || '').trim().slice(0, 20));
  return { w: Math.round(r.width), h: Math.round(r.height), els: scroller.querySelectorAll('*').length, tags, outline, stats };
})()`;

for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 2200));
  const ref = await evalOn("ref", INTERIOR);
  run(`agent-browser --session loc open "${baseLoc}${route}"`);
  await new Promise(r => setTimeout(r, 1800));
  const loc = await evalOn("loc", INTERIOR);
  const same = JSON.stringify(ref) === JSON.stringify(loc);
  console.log(`\n=== ${route} ${same ? 'MATCH' : 'DIFF'} ===`);
  if (!same) {
    const rt = JSON.stringify(ref, null, 0), lt = JSON.stringify(loc, null, 0);
    console.log('REF:', rt.slice(0, 900));
    console.log('LOC:', lt.slice(0, 900));
  }
}
