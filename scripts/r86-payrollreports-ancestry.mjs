#!/usr/bin/env node
// r86-payrollreports-ancestry.mjs — read the ancestor chain of the
// payrollreports max-w-7xl container on both sides (the -24px container
// offset: REF y56 vs LOC y32 — find WHICH ancestor carries the extra 24px).
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const CHAIN = `(() => {
  const container = [...document.querySelectorAll('div')].find(d => (d.className || '').toString().includes('max-w-7xl'));
  const chain = [];
  let n = container;
  for (let i = 0; i < 6 && n && n !== document.body; i++) {
    const r = n.getBoundingClientRect(); const cs = getComputedStyle(n);
    chain.push({ tag: n.tagName.toLowerCase(), y: Math.round(r.y), h: Math.round(r.height), pt: cs.paddingTop, mt: cs.marginTop, cls: (typeof n.className === 'string' ? n.className : '').split(/\\s+/).slice(0, 8).join('.') });
    n = n.parentElement;
  }
  const main = document.querySelector('main');
  if (main) { const mcs = getComputedStyle(main); const mr = main.getBoundingClientRect(); return { chain, main: { y: Math.round(mr.y), h: Math.round(mr.height), pt: mcs.paddingTop, mt: mcs.marginTop, cls: (typeof main.className === 'string' ? main.className : '').split(/\\s+/).slice(0, 6).join('.') } }; }
  return { chain };
})()`;

run(`agent-browser --session ref86x open https://eon.base44.app/payrollreports`);
run(`agent-browser --session loc86x open http://127.0.0.1:3200/payrollreports`);
await new Promise(r => setTimeout(r, 4000));
console.log("REF:", JSON.stringify(await evalOn("ref86x", CHAIN), null, 1));
console.log("\nLOC:", JSON.stringify(await evalOn("loc86x", CHAIN), null, 1));
process.exit(0);
