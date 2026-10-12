#!/usr/bin/env node
// probe-r30-organogram.mjs — session-30 / parity round 29 census:
// the organogram dimension on BOTH apps — draggables, structure, empty state.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const READER = `(() => {
  const out = {};
  out.draggables = document.querySelectorAll('[draggable=true]').length;
  out.cards = document.querySelectorAll('.rounded-xl').length;
  const h1 = [...document.querySelectorAll('h1')].find(h => h.offsetParent !== null);
  out.h1 = h1 ? { t: h1.textContent.trim().slice(0,40), fs: getComputedStyle(h1).fontSize, x: Math.round(h1.getBoundingClientRect().x), y: Math.round(h1.getBoundingClientRect().y) } : null;
  out.borders = [...document.querySelectorAll('div')].filter(d => String(d.className).includes('border-l-2')).length;
  out.avatars = document.querySelectorAll('[data-slot=avatar]').length;
  out.buttons = document.querySelectorAll('button').length;
  out.rows = document.querySelectorAll('table tbody tr').length;
  const sc = document.querySelector('.overflow-x-auto');
  out.scroller = sc ? { y: Math.round(sc.getBoundingClientRect().y), h: Math.round(sc.getBoundingClientRect().height) } : null;
  return JSON.stringify(out);
})()`;

run("agent-browser --session ref set viewport 1440 900");
run("agent-browser --session loc set viewport 1440 900");

for (const [name, base] of [["REF", baseRef], ["LOC", baseLoc]]) {
  run(`agent-browser --session ${name.toLowerCase()} open ${base}/organogram`);
  await new Promise(r => setTimeout(r, 3500));
  const d = await evalOn(name.toLowerCase(), READER);
  console.log(`${name} /organogram: ${JSON.stringify(d)}`);
}
