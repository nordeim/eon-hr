#!/usr/bin/env node
// probe-r31-assets-behav.mjs — click REF /assets "Add Asset" and observe
// (dialog vs navigation), then dump the card's element tree (y 200-420).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

run("agent-browser --session ref set viewport 1440 900");
run("agent-browser --session ref open https://eon.base44.app/assets");
await new Promise(r => setTimeout(r, 3500));

// dump the card structure between y=200 and y=420
const TREE = `(() => {
  const out = [];
  for (const el of [...document.querySelectorAll('main div, main table, main section')]) {
    const r = el.getBoundingClientRect();
    if (r.y < 200 || r.y > 430 || r.width === 0) continue;
    const cs = getComputedStyle(el);
    out.push({ tag: el.tagName, cls: el.className.toString().slice(0,70), y: Math.round(r.y), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, border: cs.borderTopWidth + ' ' + cs.borderTopColor, kids: el.children.length });
  }
  return JSON.stringify(out.slice(0, 18));
})()`;
console.log("REF /assets card region tree:");
console.log(JSON.stringify(await evalOn("ref", TREE)).replace(/\},\{/g, '}\n{'));

// click Add Asset
const CLICK = `(() => {
  const b = [...document.querySelectorAll('button')].find(x => (x.textContent||'').trim() === 'Add Asset');
  if (!b) return 'no-btn';
  b.click();
  return 'clicked';
})()`;
console.log("\n" + JSON.stringify(await evalOn("ref", CLICK)));
await new Promise(r => setTimeout(r, 1800));

const AFTER = `(() => {
  const dlg = document.querySelector('[role=dialog], [data-radix-portal] > *');
  return JSON.stringify({ url: location.pathname, dialog: dlg ? dlg.innerText.replace(/\\n+/g, ' | ').slice(0, 400) : null, bodyHasOverlay: !!document.querySelector('[data-radix-portal]') });
})()`;
console.log(JSON.stringify(await evalOn("ref", AFTER)));
