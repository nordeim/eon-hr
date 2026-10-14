#!/usr/bin/env node
// probe-r39-extjob.mjs — externaljobapplication interior comparison.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 500) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

for (const [label, session, base] of [["REF", "ref", baseRef], ["LOC", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/externaljobapplication`);
  await new Promise(r => setTimeout(r, 4000));
  const ext = await evalOn(session, `(() => {
    const main = document.querySelector('main');
    const kids = main ? [...main.children].map(c => ({ tag: c.tagName, cls: c.className.slice(0, 150) })) : [];
    const card = [...document.querySelectorAll('div')].find(d => /max-w/.test(d.className) && d.getBoundingClientRect().height > 200);
    const inputs = [...document.querySelectorAll('input, textarea')].slice(0, 2).map(i => ({ tag: i.tagName, cls: i.className.slice(0, 150), h: Math.round(i.getBoundingClientRect().height) }));
    return { path: location.pathname, kids, cardCls: card ? card.className.slice(0, 200) : null, cardRect: card ? { x: Math.round(card.getBoundingClientRect().x), w: Math.round(card.getBoundingClientRect().width), y: Math.round(card.getBoundingClientRect().y) } : null, inputs };
  })()`);
  console.log(`=== ${label} EXTJOB ===`);
  console.log(JSON.stringify(ext, null, 1).slice(0, 1500));
}
