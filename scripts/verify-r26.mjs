#!/usr/bin/env node
// verify-r26.mjs — session-27 / parity round 26: live verification, take 2.
// Fixes from take 1: (a) no // comments inside flattened evals (the
// session-21 lesson — they swallow the line); (b) the group button is
// located via [aria-expanded] (chevron-right when collapsed, chevron-down
// when expanded — the take-1 selector matched only the expanded state);
// (c) fresh page opens after every media toggle (REF's CDN-JIT layout
// went stale once after viewport/media churn — a fresh session recovered).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
function findRef(session, re) { const snap = run(`agent-browser --session ${session} snapshot -i -c`); const m = snap.match(re); return m ? m[1] : null; }

const GROUP = `(() => { const g = document.querySelector('button[aria-expanded]'); return JSON.stringify({ group: g ? g.textContent.trim().slice(0, 10) : null, transition: g ? getComputedStyle(g).transitionDuration : null }); })()`;
const DROPDOWN = `(() => { const c = document.querySelector('[role=menu]'); return JSON.stringify({ anim: c ? getComputedStyle(c).animationDuration : null }); })()`;
const DRAWERCLOSE = `(() => { const panels = [...document.querySelectorAll('div')].filter(x => x.getBoundingClientRect().width >= 280 && x.getBoundingClientRect().width <= 296 && x.getBoundingClientRect().height >= 700); return JSON.stringify({ panelsLeft: panels.length }); })()`;

async function probe(session, base) {
  const out = {};
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3500));
  out.group = await evalOn(session, GROUP);
  const u = findRef(session, /- button "[^"]*(sepnetflix|Notifications)[^"]*" \[[^\]]*ref=(\w+)/i);
  if (u) { run(`agent-browser --session ${session} click @${u[2]}`); await new Promise(r => setTimeout(r, 1100)); }
  out.dropdown = await evalOn(session, DROPDOWN);
  run(`agent-browser --session ${session} press Escape`);
  await new Promise(r => setTimeout(r, 600));
  run(`agent-browser --session ${session} set viewport 390 844`);
  await new Promise(r => setTimeout(r, 1400));
  const h = findRef(session, /- button "Toggle Sidebar" \[[^\]]*ref=(\w+)/);
  if (h) {
    run(`agent-browser --session ${session} click @${h[1]}`);
    await new Promise(r => setTimeout(r, 1000));
    run(`agent-browser --session ${session} press Escape`);
    await new Promise(r => setTimeout(r, 1000));
  }
  out.drawerAfterClose = await evalOn(session, DRAWERCLOSE);
  return out;
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
run("agent-browser --session ref set media reduced-motion");
run("agent-browser --session loc set media reduced-motion");
const refReduce = await probe("ref", baseRef);
const locReduce = await probe("loc", baseLoc);
console.log("REF under reduce:", JSON.stringify(refReduce));
console.log("LOC under reduce:", JSON.stringify(locReduce));
const locCalm = locReduce.group?.transition === "0.01ms";
const refWild = refReduce.group?.transition === "0.2s";
console.log(`\nREDUCE: LOC calm=${locCalm} (group ${locReduce.group?.transition}) | REF still animating=${refWild} (${refReduce.group?.transition})`);
console.log(`REDUCE: LOC drawer unmount clean=${locReduce.drawerAfterClose?.panelsLeft === 0} | REF=${JSON.stringify(refReduce.drawerAfterClose)}`);
console.log(`REDUCE: LOC dropdown anim=${locReduce.dropdown?.anim} | REF=${refReduce.dropdown?.anim}`);

run("agent-browser --session ref set media");
run("agent-browser --session loc set media");
const locDefault = await probe("loc", baseLoc);
const refDefault = await probe("ref", baseRef);
console.log("\nLOC under DEFAULT:", JSON.stringify(locDefault));
console.log("REF under DEFAULT:", JSON.stringify(refDefault));
const familyOk = locDefault.group?.transition === "0.2s" && locDefault.dropdown?.anim === "0.15s";
const refOk = refDefault.group?.transition === "0.2s" && refDefault.dropdown?.anim === "0.15s";
console.log(`DEFAULT: LOC motion family intact=${familyOk} | REF intact=${refOk}`);
