#!/usr/bin/env node
// probe-r31-assets-alias.mjs — compare REF's /assets vs REF's
// /assetmanagement content (is /assets a duplicate/legacy page?), and dump
// the /hrassistantchat empty-state DOM on both apps for the copy diff.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const FULLTXT = `(() => {
  const main = document.querySelector('main');
  return JSON.stringify({ url: location.pathname, txt: (main || document.body).innerText.replace(/\\n+/g, ' | ').slice(0, 600) });
})()`;

run("agent-browser --session ref set viewport 1440 900");

console.log("=== REF /assets (full text) ===");
run("agent-browser --session ref open https://eon.base44.app/assets");
await new Promise(r => setTimeout(r, 3200));
console.log(JSON.stringify(await evalOn("ref", FULLTXT)));

console.log("\n=== REF /assetmanagement (full text) ===");
run("agent-browser --session ref open https://eon.base44.app/assetmanagement");
await new Promise(r => setTimeout(r, 3200));
console.log(JSON.stringify(await evalOn("ref", FULLTXT)));

// chat page DOM: the empty-state panel's visible text nodes with geometry
const CHATDOM = `(() => {
  const main = document.querySelector('main');
  const out = [];
  const walk = (el) => {
    for (const c of el.children) {
      const r = c.getBoundingClientRect();
      if (r.width === 0) continue;
      const cs = getComputedStyle(c);
      const own = [...c.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
      if (own) out.push({ tag: c.tagName, t: own.slice(0,60), fs: cs.fontSize, fw: cs.fontWeight, col: cs.color, y: Math.round(r.y), x: Math.round(r.x) });
      walk(c);
    }
  };
  walk(main || document.body);
  return JSON.stringify(out);
})()`;

console.log("\n=== /hrassistantchat empty-state DOM ===");
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} open "${base}/hrassistantchat"`);
  await new Promise(r => setTimeout(r, 3200));
  const d = await evalOn(s, CHATDOM);
  console.log(`${s.toUpperCase()}:`);
  console.log(JSON.stringify(d).replace(/\},\{/g, '}\n{'));
}
