#!/usr/bin/env node
// probe-r46-census-d.mjs — session-47 / parity round 46 census D: the
// closing reads. (1) the FULL dashboard tree both sides (no slice), (2) the
// attendance root structure + the overflow source, (3) the doctracker stat
// card full markup, (4) the employees refresh-cw identification, (5) the
// profile empty-text button + Change Photo wiring.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseZero = "http://127.0.0.1:3201";

async function openBoth(route, settle = 2600) {
  run(`agent-browser --session ref set viewport 1440 900`);
  run(`agent-browser --session loc0 set viewport 1440 900`);
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, settle));
  run(`agent-browser --session loc0 open "${baseZero}${route}"`);
  await new Promise(r => setTimeout(r, settle));
}

// ---------- (1) the FULL dashboard tree ----------
await openBoth("/dashboard", 3200);
const DASHFULL = `(() => {
  const main = document.querySelector('main');
  const scroller = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!scroller) return { gone: true };
  const dump = [];
  const walk = (el, depth) => {
    if (dump.length > 110) return;
    const r = el.getBoundingClientRect();
    const t = depth <= 3 ? (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 28) : '';
    dump.push('  '.repeat(depth) + el.tagName.toLowerCase() + (t ? '=' + t : '') + '{' + (el.className||'').toString().slice(0, 60) + '}');
    for (const c of el.children) walk(c, depth + 1);
  };
  for (const c of scroller.children) walk(c, 0);
  return dump;
})()`;
const dashRef = await evalOn("ref", DASHFULL);
const dashLoc = await evalOn("loc0", DASHFULL);
console.log("\n===== DASHBOARD FULL REF =====\n" + (Array.isArray(dashRef) ? dashRef.join("\n") : JSON.stringify(dashRef)));
console.log("\n===== DASHBOARD FULL LOC0 =====\n" + (Array.isArray(dashLoc) ? dashLoc.join("\n") : JSON.stringify(dashLoc)));
