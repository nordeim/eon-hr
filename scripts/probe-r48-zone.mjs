#!/usr/bin/env node
// probe-r48-zone.mjs — deep zone reader: dump a page's full element tree
// (tag + class + own-text, depth-indented) from the main scroller, both
// sides (REF vs zero-tenant LOC), so structural diffs decompose precisely.
// Usage: node scripts/probe-r48-zone.mjs /leavemanagement [maxDepth]
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseZero = "http://127.0.0.1:3201";
const route = process.argv[2] || "/leavemanagement";
const maxDepth = parseInt(process.argv[3] || "10", 10);

const TREE = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return ['GONE'];
  const lines = [];
  const walk = (el, d) => {
    if (lines.length >= 120 || d > ${maxDepth}) return;
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').replace(/\\s+/g, ' ').trim();
    const cls = (typeof el.className === 'string' ? el.className : '').split(' ').filter(Boolean).slice(0, 8).join(' ');
    lines.push(' '.repeat(d * 2) + el.tagName + (cls ? '.' + cls : '') + (own ? ' :' + own.slice(0, 44) : ''));
    for (const c of el.children) walk(c, d + 1);
  };
  walk(sc, 0);
  return lines;
})()`;

run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc0 set viewport 1440 900`);
run(`agent-browser --session ref open "${baseRef}${route}"`);
await new Promise(r => setTimeout(r, 2600));
const a = await evalOn("ref", TREE);
run(`agent-browser --session loc0 open "${baseZero}${route}"`);
await new Promise(r => setTimeout(r, 2000));
const b = await evalOn("loc0", TREE);

console.log(`=== ${route} REF tree ===`);
for (const l of (Array.isArray(a) ? a : [JSON.stringify(a)])) console.log(l);
console.log(`\n=== ${route} LOC tree ===`);
for (const l of (Array.isArray(b) ? b : [JSON.stringify(b)])) console.log(l);
