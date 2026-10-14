#!/usr/bin/env node
// probe-r38-logintree.mjs — inspect the LOC login container's inner tree
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); return out.trim(); }

const TREE = `(() => {
  const c = document.body.children[1];
  const walk = (el, d) => {
    let out = [];
    for (const k of el.children) {
      const r = k.getBoundingClientRect();
      const cls = (k.getAttribute('class') || '').split(' ').slice(0, 3).join('.');
      out.push('  '.repeat(d) + k.tagName + (cls ? '.' + cls : '') + ' [y=' + Math.round(r.y) + ' h=' + Math.round(r.height) + ']' + (k.children.length === 0 ? ' "' + (k.textContent || '').trim().slice(0, 30) + '"' : ''));
      if (d < 5) out = out.concat(walk(k, d + 1));
    }
    return out;
  };
  return walk(c, 0).join('\\n');
})()`;

console.log(await evalOn("loc2", TREE));
