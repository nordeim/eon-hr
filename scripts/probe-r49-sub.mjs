#!/usr/bin/env node
// probe-r49-sub.mjs — dump a named child subtree of the content wrapper
// with FULL classes (no truncation). Usage:
//   node scripts/probe-r49-sub.mjs ref /payrollreports 1
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } }
const side = process.argv[2] || "ref";
const route = process.argv[3];
const idx = Number(process.argv[4] || 1);
const maxd = Number(process.argv[5] || 6);
const BASE = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3201";
const S = side === "ref" ? "ref" : "loc0";

const SUB = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true };
  const root = sc.querySelector('[class*="min-h-screen"]') || sc;
  const wrap = root.querySelector('[class*="max-w-"]') || root;
  const kid = wrap.children[${idx}];
  if (!kid) return { kids: [...wrap.children].map(c => (c.className || '').slice(0, 80)) };
  const dump = (el, d, out) => {
    if (d > ${maxd} || out.length > 120) return;
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').replace(/\\s+/g, ' ').trim();
    out.push(' '.repeat(d * 2) + el.tagName + ' <' + (el.className || '').toString().replace(/\\s+/g, ' ') + '>' + (own ? ' :: ' + own.slice(0, 50) : ''));
    for (const c of el.children) dump(c, d + 1, out);
  };
  const out = [];
  dump(kid, 0, out);
  return { out };
})()`;

run(`agent-browser --session ${S} open "${BASE}${route}"`);
await new Promise(r => setTimeout(r, side === "ref" ? 3000 : 2200));
const r = await evalOn(S, SUB);
if (r.out) for (const l of r.out) console.log(l);
else console.log(JSON.stringify(r, null, 1).slice(0, 2000));
