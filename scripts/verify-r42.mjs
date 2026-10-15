#!/usr/bin/env node
// verify-r42.mjs — session-43 / parity round 42 live verification: the
// login pair re-run on REF's redeployed build vs the remediated clone —
// the input DOM strings (content contract), the Sign in focused ring
// (token render), the w-full column structure, the field wrappers, and
// both bands' geometry.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b) { results.push({ name, ref: a, loc: b, match: JSON.stringify(a) === JSON.stringify(b) }); }

// both apps to the login, desktop band
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
}

// 1. the input DOM strings (content sets, order-insensitive — tw-merge reorders)
const inputCls = async (s) => evalOn(s, `(() => { const i = document.querySelector('input[type=email]'); return { cls: i.className.split(' ').sort().join(' ') }; })()`);
rec("email input DOM string (sorted content)", await inputCls("ref"), await inputCls("loc"));

// 2. the Sign in class string (sorted)
const btnCls = async (s) => evalOn(s, `(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent||'').trim() === 'Sign in'); return { cls: b.className.split(' ').sort().join(' ') }; })()`);
rec("Sign in DOM string (sorted content)", await btnCls("ref"), await btnCls("loc"));

// 3. the w-full column structure
const colStruct = async (s) => evalOn(s, `(() => { const f = document.querySelector('form'); const w = f.parentElement; return { wcol: w.className, kids: [...w.children].map(c => (c.tagName === 'FORM' ? 'FORM' : (c.className || '').slice(0, 20))) }; })()`);
rec("w-full column structure", await colStruct("ref"), await colStruct("loc"));

// 4. the field wrapper structure
const fieldStruct = async (s) => evalOn(s, `(() => { const i = document.querySelector('input[type=email]'); const rel = i.parentElement; const field = rel.parentElement; return { field: field.className, rel: rel.className }; })()`);
rec("field wrapper structure", await fieldStruct("ref"), await fieldStruct("loc"));

// 5. the --ring resolution on the login subtree
const ringVar = async (s) => evalOn(s, `(() => ({ main: getComputedStyle(document.querySelector('main')).getPropertyValue('--ring').trim(), btn: getComputedStyle([...document.querySelectorAll('button')].find(b => (b.textContent||'').trim() === 'Sign in')).getPropertyValue('--ring').trim() })()`);
rec("--ring resolution (main + button)", await ringVar("ref"), await ringVar("loc"));

// 6. the Sign in focused ring (transition-settled read via real Tab presses)
async function focusedRing(session) {
  await evalOn(session, `(() => { const i = document.querySelector('input[type=email]'); i.focus(); return 'ok'; })()`);
  run(`agent-browser --session ${session} press Tab`);
  await new Promise(r => setTimeout(r, 150));
  run(`agent-browser --session ${session} press Tab`);
  await new Promise(r => setTimeout(r, 500)); // past the 200ms transition-all
  return evalOn(session, `(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent||'').trim() === 'Sign in'); if (b !== document.activeElement) return { focused: false }; return { focused: true, shadow: getComputedStyle(b).boxShadow }; })()`);
}
rec("Sign in focused ring (settled)", await focusedRing("ref"), await focusedRing("loc"));

// 7. both bands' geometry re-verify
const geo = async (s) => evalOn(s, `(() => { const card = document.querySelector('main form')?.closest('div'); const r = card ? card.getBoundingClientRect() : null; const i = document.querySelector('input[type=email]'); const ir = i.getBoundingClientRect(); return { card: r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) } : null, inputH: Math.round(ir.height), docH: document.documentElement.scrollHeight }; })()`);
rec("desktop geometry", await geo("ref"), await geo("loc"));

for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
}
rec("mobile geometry", await geo("ref"), await geo("loc"));

// report
let m = 0;
for (const r of results) {
  console.log(`${r.match ? "MATCH" : "DIFF "} ${r.name}`);
  if (!r.match) console.log(`  ref: ${JSON.stringify(r.ref).slice(0, 400)}\n  loc: ${JSON.stringify(r.loc).slice(0, 400)}`);
  if (r.match) m++;
}
console.log(`\n${m}/${results.length} verify-r42 MATCH`);
