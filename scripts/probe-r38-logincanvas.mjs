#!/usr/bin/env node
// probe-r38-logincanvas.mjs — REF's login canvas structure at mobile (why
// y=16 + 18px scroll) — the tree with heights.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); return out.trim(); }

const TREE = `(() => {
  const out = [];
  const walk = (el, d) => {
    for (const k of el.children) {
      const r = k.getBoundingClientRect();
      const cls = (k.getAttribute('class') || '').split(' ').slice(0, 4).join('.');
      out.push('  '.repeat(d) + k.tagName + (cls ? '.' + cls : '') + ' [y=' + Math.round(r.y) + ' h=' + Math.round(r.height) + ' sh=' + k.scrollHeight + ']');
      if (d < 3) walk(k, d + 1);
    }
  };
  walk(document.body, 0);
  const canvas = document.body.children[1] || document.body.children[0];
  const cs = getComputedStyle(canvas);
  return JSON.stringify({ tree: out.join(' | '), canvasCls: canvas.getAttribute('class'), canvasDisplay: cs.display, canvasAlign: cs.alignItems, canvasJustify: cs.justifyContent, canvasMinH: cs.minHeight, docScrollH: document.documentElement.scrollHeight });
})()`;

for (const [name, session, url, vw, vh] of [
  ["REF", "ref2", "https://eon.base44.app/login", 390, 844],
  ["LOC", "loc2", "http://127.0.0.1:3200/login", 390, 844],
]) {
  run(`agent-browser --session ${session} set viewport ${vw} ${vh}`);
  run(`agent-browser --session ${session} open "${url}"`);
  await new Promise(r => setTimeout(r, 3500));
  console.log(`\n===== ${name} ${vw}x${vh} CANVAS TREE =====`);
  const out = await evalOn(session, TREE);
  try { const o = JSON.parse(out.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); console.log("canvasCls:", o.canvasCls); console.log("display/align/justify/minH:", o.canvasDisplay, o.canvasAlign, o.canvasJustify, o.canvasMinH); console.log("docScrollH:", o.docScrollH); console.log(o.tree); } catch { console.log(out); }
}
