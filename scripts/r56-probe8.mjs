#!/usr/bin/env node
// r56-probe8.mjs — clean re-verification of the (C) two-deep chain and the
// (D) scroll restoration, isolated and repeated (no intervening phases).
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const settle = (ms) => new Promise(r => setTimeout(r, ms));
function evalStr(expr) { return JSON.stringify(expr.split("\n").join(" ")); }
async function ev(session, expr) {
  const out = run(`agent-browser --session ${session} eval ${evalStr(expr)}`);
  try { return JSON.parse(JSON.parse(out.trim())); } catch { return "ERR:" + out.trim().slice(0, 200); }
}
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

async function chain(session, base, tag) {
  console.log(`\n===== ${tag} chain test =====`);
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/`);
  await settle(2600);
  console.log("  start:", run(`agent-browser --session ${session} get url`).trim().replace(base, ""));
  for (const label of ["staff requests", "training lms"]) {
    await ev(session, `(() => { const a = [...document.querySelectorAll('[data-sidebar=menu-button]')].filter(x => x.tagName==='A' && /${label}/i.test(x.textContent||'') && x.offsetParent !== null)[0]; if (a) { a.click(); return a.getAttribute('href'); } return 'NOTFOUND'; })()`);
    await settle(2400);
    console.log(`  after ${label}:`, run(`agent-browser --session ${session} get url`).trim().replace(base, ""));
  }
  run(`agent-browser --session ${session} back`);
  await settle(2600);
  const b1 = run(`agent-browser --session ${session} get url`).trim().replace(base, "");
  run(`agent-browser --session ${session} back`);
  await settle(2600);
  const b2 = run(`agent-browser --session ${session} get url`).trim().replace(base, "");
  console.log(`  back1: ${b1}  back2: ${b2}`);
  return { b1, b2 };
}

async function scroll(session, base, tag) {
  console.log(`\n===== ${tag} scroll test (x3) =====`);
  run(`agent-browser --session ${session} set viewport 1440 900`);
  const reads = [];
  for (let i = 0; i < 3; i++) {
    run(`agent-browser --session ${session} open ${base}/hrreports`);
    await settle(2600);
    await ev(session, "(() => { window.scrollTo(0, 40); return window.scrollY; })()");
    await settle(300);
    await ev(session, `(() => { const a = [...document.querySelectorAll('[data-sidebar=menu-button]')].filter(x => x.tagName==='A' && /training lms/i.test(x.textContent||'') && x.offsetParent !== null)[0]; if (a) a.click(); return 'nav'; })()`);
    await settle(2200);
    run(`agent-browser --session ${session} back`);
    await settle(2800);
    reads.push(await ev(session, "window.scrollY"));
  }
  console.log("  scrollY after back (3 runs):", JSON.stringify(reads));
  return reads;
}

const cr = await chain("ref56", baseRef, "REF");
const cl = await chain("loc", baseLoc, "LOC");
const sr = await scroll("ref56", baseRef, "REF");
const sl = await scroll("loc", baseLoc, "LOC");
console.log("\nVERDICTS:");
console.log("chain:", JSON.stringify(cr) === JSON.stringify(cl) ? "MATCH" : `DIFF ref=${JSON.stringify(cr)} loc=${JSON.stringify(cl)}`);
console.log("scroll:", JSON.stringify(sr) === JSON.stringify(sl) ? "MATCH" : `DIFF ref=${JSON.stringify(sr)} loc=${JSON.stringify(sl)}`);
process.exit(0);
