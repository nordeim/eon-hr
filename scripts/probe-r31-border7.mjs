#!/usr/bin/env node
// probe-r31-border7.mjs — find REF's painted desktop sidebar panel (any
// element at x=0 w~256 h>=700) and read bg + full border on both apps.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const ALLPANELS = `(() => {
  const out = [];
  for (const el of [...document.querySelectorAll('div, aside, nav')]) {
    const r = el.getBoundingClientRect();
    if (Math.round(r.x) !== 0 || Math.round(r.width) < 250 || Math.round(r.width) > 260 || Math.round(r.height) < 700) continue;
    const cs = getComputedStyle(el);
    out.push({ tag: el.tagName, cls: el.className.toString().slice(0,80), bg: cs.backgroundColor, br: cs.borderRightWidth, brc: cs.borderRightColor, h: Math.round(r.height), kids: el.children.length });
  }
  return JSON.stringify(out);
})()`;

for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3500));
  const d = await evalOn(s, ALLPANELS);
  console.log(`DESKTOP ${s.toUpperCase()}:`);
  console.log(JSON.stringify(d).replace(/\},\{/g, '}\n{'));
}
