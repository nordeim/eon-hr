#!/usr/bin/env node
// probe-r49-zone.mjs — deep zone reader for named pages: dumps a
// targeted region (by index or class signature) with full classes.
// Usage: node scripts/probe-r49-zone.mjs ref /payrollreports kicker
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } }
const side = process.argv[2] || "ref";
const route = process.argv[3];
const BASE = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3201";
const S = side === "ref" ? "ref" : "loc0";

// generic zone dump: children of the content wrapper with FULL class
// strings (no truncation) + svg class inventory + table th/td forms
const ZONE = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true };
  const dump = (el, d, out, maxd) => {
    if (d > maxd || out.length > 90) return;
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').replace(/\\s+/g, ' ').trim();
    out.push(' '.repeat(d * 2) + el.tagName + ' <' + (el.className || '').toString().replace(/\\s+/g, ' ').slice(0, 300) + '>' + (own ? ' :: ' + own.slice(0, 44) : ''));
    for (const c of el.children) dump(c, d + 1, out, maxd);
  };
  const out = [];
  dump(sc, 0, out, 5);
  const ths = [...sc.querySelectorAll('th')].slice(0, 6).map(t => (t.className || '').slice(0, 160));
  const svgs = [...sc.querySelectorAll('svg')].slice(0, 10).map(s => (s.getAttribute('class') || '').slice(0, 110));
  return { out: out.slice(0, 90), ths, svgs };
})()`;

run(`agent-browser --session ${S} open "${BASE}${route}"`);
await new Promise(r => setTimeout(r, side === "ref" ? 3000 : 2200));
const r = await evalOn(S, ZONE);
if (r.out) for (const l of r.out) console.log(l);
if (r.ths && r.ths.length) { console.log("--TH--"); for (const t of r.ths) console.log(t); }
if (r.svgs && r.svgs.length) { console.log("--SVG--"); for (const s of r.svgs) console.log(s); }
if (r.error || r.gone) console.log(JSON.stringify(r));
