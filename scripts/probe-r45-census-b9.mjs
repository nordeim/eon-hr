#!/usr/bin/env node
// probe-r45-census-b9.mjs — phase B9: REF's SIGN-IN input class (the
// per-view input delta check) + the mobile success-view rhythm.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 250) }; } }
const log = (...a) => console.log(...a);

// ---------- 1. REF's sign-in inputs (desktop) ----------
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open https://eon.base44.app/login`);
await new Promise(r => setTimeout(r, 3200));
const S1 = await evalOn("ref", `(() => {
  const ins = [...document.querySelectorAll('form input')];
  return ins.map(i => ({ type: i.type, h: Math.round(i.getBoundingClientRect().height), cls: i.className }));
})()`);
log("=== SIGN-IN inputs (REF, desktop) ===");
for (const i of (S1 || [])) { log(`${i.type} h=${i.h}\n   ${i.cls}\n`); }

// ---------- 2. the mobile success-view rhythm ----------
run(`agent-browser --session ref set viewport 390 844`);
run(`agent-browser --session ref open https://eon.base44.app/login`);
await new Promise(r => setTimeout(r, 3200));
await evalOn("ref", `(() => { [...document.querySelectorAll('button')].find(x => /forgot password/i.test(x.textContent||'')).click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 900));
await evalOn("ref", `(() => { const i = document.querySelector('form input[type=email]'); const d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; d.call(i, 'mobile-success@example.com'); i.dispatchEvent(new Event('input', { bubbles: true })); document.querySelector('form').requestSubmit(); return 'sent'; })()`);
await new Promise(r => setTimeout(r, 2600));
const M1 = await evalOn("ref", `(() => {
  const card = document.querySelector('.rounded-2xl');
  const cardR = card.getBoundingClientRect();
  const g = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { y: Math.round(r.y - cardR.y), h: Math.round(r.height), w: Math.round(r.width), mt: getComputedStyle(el).marginTop }; };
  const circle = card.querySelector('.rounded-full');
  const h2 = card.querySelector('h2');
  const p = card.querySelector('h2')?.parentElement.querySelector('p');
  const alert = document.querySelector('[role=alert]');
  const btns = [...card.querySelectorAll('button')];
  const bottom = btns[btns.length - 1];
  return { cardH: Math.round(cardR.height), cardW: Math.round(cardR.width), circle: g(circle), circleCls: circle ? circle.getAttribute('class') : null, svgCls: circle ? (circle.querySelector('svg')||{}).getAttribute?.('class') : null, h2: g(h2), sub: g(p), alert: g(alert), bottom: g(bottom) };
})()`);
log("=== MOBILE 390: success view rhythm ===");
log(JSON.stringify(M1, null, 1));
