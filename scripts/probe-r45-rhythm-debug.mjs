#!/usr/bin/env node
// probe-r45-rhythm-debug.mjs — the full-JSON rhythm diff (the verify's
// 650-char truncation hides the delta).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
const log = (...a) => console.log(...a);

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const RHYTHM = `(() => {
  const card = document.querySelector('.rounded-2xl');
  const cardR = card.getBoundingClientRect();
  const g = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { y: Math.round(r.y - cardR.y), h: Math.round(r.height), mt: cs.marginTop, mb: cs.marginBottom, cls: (el.getAttribute('class')||'') }; };
  const back = [...card.querySelectorAll('button')].find(b => /back to sign in/i.test(b.textContent||''));
  const h2 = card.querySelector('h2');
  const sub = h2 ? h2.parentElement.querySelector('p') : null;
  const form = card.querySelector('form');
  const cta = form ? [...form.querySelectorAll('button')].pop() : null;
  return { cardH: Math.round(cardR.height), cardW: Math.round(cardR.width), back: g(back), h2: g(h2), sub: g(sub), form: g(form), cta: g(cta) };
})()`;

async function readPair(view) {
  const out = [];
  for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    run(`agent-browser --session ${session} set viewport 1440 900`);
    run(`agent-browser --session ${session} open ${base}/login`);
    await new Promise(r => setTimeout(r, 3200));
    await evalOn(session, `(() => { const b = [...document.querySelectorAll('button')].find(x => /${view === "reset" ? "forgot password" : "sign up"}/i.test(x.textContent||'')); b.click(); return 'ok'; })()`);
    await new Promise(r => setTimeout(r, 900));
    out.push(await evalOn(session, RHYTHM));
  }
  return out;
}

for (const view of ["reset", "signup"]) {
  const [ref, loc] = await readPair(view);
  log(`\n===== ${view} (desktop) — full JSON diff =====`);
  const keys = new Set([...Object.keys(ref), ...Object.keys(loc)]);
  for (const k of keys) {
    const a = JSON.stringify(ref[k]), b = JSON.stringify(loc[k]);
    if (a !== b) { log(`DIFF ${k}:\n  ref: ${a}\n  loc: ${b}`); }
    else log(`same ${k}`);
  }
}
