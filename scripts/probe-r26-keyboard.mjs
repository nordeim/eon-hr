#!/usr/bin/env node
// probe-r26-keyboard.mjs — session-27 / parity round 26: the keyboard-
// navigation dimension sweep (never swept — the frontier item). Tab-order
// census on /login and /dashboard: press Tab N times, record the focused
// element (tag + text/label + geometry) at each step, compare REF vs LOC.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const FOCUS = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return JSON.stringify({tag:'body'});
  const r = el.getBoundingClientRect();
  const label = (el.getAttribute('aria-label') || el.textContent || el.placeholder || el.name || '').trim().split(String.fromCharCode(10)).join(' ').slice(0, 24);
  return JSON.stringify({tag: el.tagName.toLowerCase(), type: (el.getAttribute('type')||'').slice(0,10), label, x: Math.round(r.x), y: Math.round(r.y)});
})()`;

async function tabSweep(session, base, route, n) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open "${base}${route}"`);
  await new Promise(r => setTimeout(r, 3200));
  const seq = [];
  for (let i = 0; i < n; i++) {
    run(`agent-browser --session ${session} press Tab`);
    await new Promise(r => setTimeout(r, 260));
    seq.push(await evalOn(session, FOCUS));
  }
  return seq;
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
for (const [route, n] of [["/login", 12], ["/dashboard", 16]]) {
  const ref = await tabSweep("ref", baseRef, route, n);
  const loc = await tabSweep("loc", baseLoc, route, n);
  console.log(`\n### ${route}`);
  const max = Math.max(ref.length, loc.length);
  for (let i = 0; i < max; i++) {
    const r = ref[i] || {tag:'-'}, l = loc[i] || {tag:'-'};
    const same = r.tag === l.tag && (r.label || '') === (l.label || '');
    console.log(`tab${String(i + 1).padStart(2)} ${same ? 'MATCH' : '**DIFF**'} REF ${JSON.stringify(r).padEnd(70)} LOC ${JSON.stringify(l)}`);
  }
}
