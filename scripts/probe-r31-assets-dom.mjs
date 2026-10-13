#!/usr/bin/env node
// probe-r31-assets-dom.mjs — REF /assets legacy page DOM census (the
// orphan route the clone 404s): every visible text node with geometry +
// the Add Asset button's tag/classes/behavior.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

run("agent-browser --session ref set viewport 1440 900");
run("agent-browser --session ref open https://eon.base44.app/assets");
await new Promise(r => setTimeout(r, 3500));

const DOM = `(() => {
  const main = document.querySelector('main');
  const out = [];
  const walk = (el, depth) => {
    for (const c of el.children) {
      const r = c.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const cs = getComputedStyle(c);
      const own = [...c.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
      if (own) out.push({ tag: c.tagName, t: own.slice(0,50), fs: cs.fontSize, fw: cs.fontWeight, col: cs.color, y: Math.round(r.y), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height) });
      walk(c, depth + 1);
    }
  };
  walk(main || document.body, 0);
  return JSON.stringify(out);
})()`;

const BUTTON = `(() => {
  const btns = [...document.querySelectorAll('main button')];
  return JSON.stringify(btns.map(b => ({ t: (b.textContent||'').trim().slice(0,24), tag: b.tagName, cls: b.className.toString().slice(0,120), type: b.getAttribute('type') })));
})()`;

console.log("REF /assets DOM:");
console.log(JSON.stringify(await evalOn("ref", DOM)).replace(/\},\{/g, '}\n{'));
console.log("\nREF /assets buttons:");
console.log(JSON.stringify(await evalOn("ref", BUTTON)).replace(/\},\{/g, '}\n{'));
