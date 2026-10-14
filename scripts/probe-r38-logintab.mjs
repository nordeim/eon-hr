#!/usr/bin/env node
// probe-r38-logintab.mjs — the login page's Tab order pair (the keyboard
// frontier) + REF's title-block class + the social-button hover motion.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); return out.trim(); }

const TITLE = `(() => {
  const h1 = document.querySelector('h1');
  const block = h1.parentElement;
  const p = block.querySelector('p');
  return JSON.stringify({ blockCls: block.getAttribute('class'), blockW: Math.round(block.getBoundingClientRect().width), h1W: Math.round(h1.getBoundingClientRect().width), pW: Math.round(p.getBoundingClientRect().width) });
})()`;

const FOCUS = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return 'BODY';
  const tag = el.tagName.toLowerCase();
  const bits = [tag];
  if (el.type) bits.push('type=' + el.type);
  const ph = el.getAttribute('placeholder');
  if (ph) bits.push('ph=' + ph);
  const txt = (el.textContent || '').trim().slice(0, 22);
  if (txt && tag !== 'input') bits.push('txt=' + txt);
  return bits.join(' ');
})()`;

async function tabwalk(name, session, url) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open "${url}"`);
  await new Promise(r => setTimeout(r, 3000));
  console.log(`\n===== ${name} title-block =====`);
  console.log(await evalOn(session, TITLE));
  console.log(`===== ${name} Tab walk =====`);
  const seq = ["initial:" + await evalOn(session, FOCUS)];
  for (let i = 0; i < 9; i++) {
    run(`agent-browser --session ${session} press Tab`);
    await new Promise(r => setTimeout(r, 350));
    seq.push("T" + (i + 1) + ":" + (await evalOn(session, FOCUS)).replace(/"/g, ""));
  }
  // Shift+Tab back down a few
  for (let i = 0; i < 4; i++) {
    run(`agent-browser --session ${session} press Shift+Tab`);
    await new Promise(r => setTimeout(r, 350));
    seq.push("S" + (i + 1) + ":" + (await evalOn(session, FOCUS)).replace(/"/g, ""));
  }
  console.log(seq.join("\n"));
}

await tabwalk("REF", "ref2", "https://eon.base44.app/login");
await tabwalk("LOC", "loc2", "http://127.0.0.1:3200/login");

// hover motion on REF's Google button
console.log("\n===== REF social hover motion =====");
run(`agent-browser --session ref2 set viewport 1440 900`);
run(`agent-browser --session ref2 open "https://eon.base44.app/login"`);
await new Promise(r => setTimeout(r, 3000));
const snap = run(`agent-browser --session ref2 snapshot -i -c`);
const m = snap.match(/- button "[^"]*Google[^"]*" \[ref=(\w+)\]/);
if (m) {
  console.log("at-rest: " + await evalOn("ref2", `(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('Google')); const w = b.querySelector('svg').parentElement; return JSON.stringify({ wrapTransform: getComputedStyle(w).transform, svgTransform: getComputedStyle(b.querySelector('svg')).transform, wrapCls: w.getAttribute('class') }); })()`));
  run(`agent-browser --session ref2 hover @${m[1]}`);
  await new Promise(r => setTimeout(r, 600));
  console.log("hover-600ms: " + await evalOn("ref2", `(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('Google')); const w = b.querySelector('svg').parentElement; return JSON.stringify({ wrapTransform: getComputedStyle(w).transform, svgTransform: getComputedStyle(b.querySelector('svg')).transform, btnShadow: getComputedStyle(b).boxShadow.slice(0, 60), btnBg: getComputedStyle(b).backgroundColor, btnBorder: getComputedStyle(b).borderTopColor }); })()`));
  await new Promise(r => setTimeout(r, 1500));
  console.log("hover-settled: " + await evalOn("ref2", `(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('Google')); const w = b.querySelector('svg').parentElement; return JSON.stringify({ wrapTransform: getComputedStyle(w).transform, svgTransform: getComputedStyle(b.querySelector('svg')).transform }); })()`));
} else { console.log("no google button ref found"); }
