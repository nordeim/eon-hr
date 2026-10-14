#!/usr/bin/env node
// probe-r39-inputs.mjs — session-40 / round 39: the global Input/Textarea
// recipe migration. Interrupted-session finding: REF's app inputs now
// render v4-style shadcn (ring-1, bg-transparent, text-base md:text-sm,
// shadow-sm) vs the clone's round-19 recipe (ring-2 ring-offset-2
// bg-card text-sm). Measure at-rest + focus on the loans dialog + a
// Textarea + the Select trigger.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// open the loans "Request Advance" dialog and read the input + textarea + select recipes
for (const [label, session, base] of [["REF", "ref", baseRef], ["LOC", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/loans`);
  await new Promise(r => setTimeout(r, 3500));
  // click the dialog trigger (has "Request" text)
  const opened = await evalOn(session, `(() => {
    const btn = [...document.querySelectorAll('button')].find(b => /request|advance|new loan/i.test(b.textContent || ''));
    if (!btn) return { found: false };
    btn.click(); return { found: true, t: (btn.textContent || '').trim().slice(0, 30) };
  })()`);
  await new Promise(r => setTimeout(r, 1500));
  const recipes = await evalOn(session, `(() => {
    const dlg = [...document.querySelectorAll('[role=dialog]')][0];
    if (!dlg) return { dialog: false };
    const inp = dlg.querySelector('input:not([type=hidden])');
    const ta = dlg.querySelector('textarea');
    const sel = dlg.querySelector('[data-radix-select-trigger], button[role=combobox]');
    const read = el => el ? { cls: el.className.slice(0, 300), h: Math.round(el.getBoundingClientRect().height) } : null;
    return { dialog: true, input: read(inp), textarea: read(ta), select: read(sel) };
  })()`);
  // focus the input: at-rest vs focus shadow/ring
  const focusState = await evalOn(session, `(() => {
    const dlg = [...document.querySelectorAll('[role=dialog]')][0];
    if (!dlg) return null;
    const inp = dlg.querySelector('input:not([type=hidden])');
    if (!inp) return null;
    const before = getComputedStyle(inp);
    const atRest = { shadow: before.boxShadow, bg: before.backgroundColor, fontSize: before.fontSize };
    inp.focus();
    const after = getComputedStyle(inp);
    const focused = { shadow: after.boxShadow };
    inp.blur();
    return { atRest, focused };
  })()`);
  console.log(`=== ${label} ===`);
  console.log(`trigger:  ${JSON.stringify(opened)}`);
  console.log(`recipes:  ${JSON.stringify(recipes)}`);
  console.log(`focus:    ${JSON.stringify(focusState)}`);
  // close
  run(`agent-browser --session ${session} press Escape`);
  await new Promise(r => setTimeout(r, 800));
}
