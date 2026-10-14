#!/usr/bin/env node
// probe-r38-cardstack.mjs — full mobile card interior stack diff (the 8px
// residual beyond the input heights).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); return out.trim(); }

const STACK = `(() => {
  const card = document.querySelector('[class*=rounded-2xl]');
  const out = [];
  const walk = (el, d) => {
    for (const k of el.children) {
      const r = k.getBoundingClientRect();
      if (r.height === 0 && r.width === 0) { if (d < 6) walk(k, d + 1); continue; }
      const cls = (k.getAttribute('class') || '').split(' ').slice(0, 3).join('.');
      const txt = (k.textContent || '').trim().slice(0, 16);
      out.push('  '.repeat(d) + k.tagName + (cls ? '.' + cls : '') + ' [y=' + Math.round(r.y) + ' h=' + Math.round(r.height) + ']' + (k.children.length === 0 && txt ? ' "' + txt + '"' : ''));
      if (d < 7) walk(k, d + 1);
    }
  };
  walk(card, 0);
  return out.join('\\n');
})()`;

for (const [name, session, url] of [["REF", "ref2", "https://eon.base44.app/login"], ["LOC", "loc2", "http://127.0.0.1:3200/login"]]) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open "${url}"`);
  await new Promise(r => setTimeout(r, 3500));
  console.log(`\n===== ${name} card interior (390x844) =====`);
  console.log(await evalOn(session, STACK));
}
