#!/usr/bin/env node
// probe-r45-census-b7.mjs — phase B7: the signup duplicate-email error,
// both CTA loading states (same-tick), the mobile band (390px) of the
// reset + signup + success views, and the failed-login Alert's class.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 250) }; } }
const log = (...a) => console.log(...a);

async function freshLogin(w, h) {
  run(`agent-browser --session ref set viewport ${w} ${h}`);
  run(`agent-browser --session ref open https://eon.base44.app/login`);
  await new Promise(r => setTimeout(r, 3200));
}
const evalSet = (sel, val) => evalOn("ref", `(() => { const i = document.querySelector('${sel}'); const d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; d.call(i, '${val}'); i.dispatchEvent(new Event('input', { bubbles: true })); return 'set'; })()`);
const clickBtn = (re) => evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /${re}/i.test(x.textContent||'')); if (!b) return 'NOTFOUND'; b.click(); return 'ok'; })()`);
const CARDREL = `(() => { window.__cr = document.querySelector('.rounded-2xl').getBoundingClientRect(); return 'ok'; })()`;

// ===================== 1. the signup duplicate-email error =====================
await freshLogin(1440, 900);
await clickBtn("sign up");
await new Promise(r => setTimeout(r, 900));
await evalSet("form input[type=email]", "sepnetflix2023@outlook.com");
await evalSet("form input[type=password]", "\\$Abcd1234");
await evalOn("ref", `(() => { const i = [...document.querySelectorAll('form input')][2]; const d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; d.call(i, '\\$Abcd1234'); i.dispatchEvent(new Event('input', { bubbles: true })); return 'set'; })()`);
await evalOn("ref", `(() => { document.querySelector('form').requestSubmit(); return 'sent'; })()`);
await new Promise(r => setTimeout(r, 3000));
const E1 = `(() => {
  const card = document.querySelector('.rounded-2xl');
  const a = document.querySelector('[role=alert]');
  const cardR = card.getBoundingClientRect();
  const allTxt = [...card.querySelectorAll('button, h2, p, div')].filter(e => e.children.length === 0 && (e.textContent||'').trim()).map(e => (e.textContent||'').trim().slice(0, 100));
  const out = { cardH: Math.round(cardR.height), alert: null, formGone: !card.querySelector('form'), allTxt, cta: [...card.querySelectorAll('form button')].map(b => (b.textContent||'').trim()).filter(Boolean) };
  if (a) { const r = a.getBoundingClientRect(); const inner = a.querySelector('div'); out.alert = { cls: a.className, txt: (a.textContent||'').trim(), y: Math.round(r.y - cardR.y), w: Math.round(r.width), h: Math.round(r.height), mt: getComputedStyle(a).marginTop, bg: getComputedStyle(a).backgroundColor, innerCls: inner ? inner.className : null, innerColor: inner ? getComputedStyle(inner).color : null }; }
  return out;
})()`;
log("=== SIGNUP: duplicate-email error state ===");
log(JSON.stringify(await evalOn("ref", E1), null, 1));

// ===================== 2. both CTA loading states (same-tick snapshots) =====================
await freshLogin(1440, 900);
await clickBtn("forgot password");
await new Promise(r => setTimeout(r, 900));
await evalSet("form input[type=email]", "loading-probe@example.com");
const L1 = await evalOn("ref", `(() => { document.querySelector('form').requestSubmit(); const b = [...document.querySelectorAll('form button')].pop(); const svg = b.querySelector('svg'); return { txt: (b.textContent||'').trim(), disabled: b.disabled, svgCls: svg ? svg.getAttribute('class') : null }; })()`);
log("\n=== RESET: CTA loading (same-tick) ===");
log(JSON.stringify(L1));

await freshLogin(1440, 900);
await clickBtn("sign up");
await new Promise(r => setTimeout(r, 900));
await evalSet("form input[type=email]", "loading-probe@example.com");
await evalSet("form input[type=password]", "Password123!");
await evalOn("ref", `(() => { const i = [...document.querySelectorAll('form input')][2]; const d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; d.call(i, 'Password123!'); i.dispatchEvent(new Event('input', { bubbles: true })); return 'set'; })()`);
const L2 = await evalOn("ref", `(() => { document.querySelector('form').requestSubmit(); const b = [...document.querySelectorAll('form button')].pop(); const svg = b.querySelector('svg'); return { txt: (b.textContent||'').trim(), disabled: b.disabled, svgCls: svg ? svg.getAttribute('class') : null }; })()`);
log("\n=== SIGNUP: CTA loading (same-tick) ===");
log(JSON.stringify(L2));

// ===================== 3. the mobile band (390px): reset + signup =====================
await freshLogin(390, 844);
await clickBtn("forgot password");
await new Promise(r => setTimeout(r, 900));
await evalOn("ref", CARDREL);
const M1 = await evalOn("ref", `(() => {
  const card = document.querySelector('.rounded-2xl');
  const cardR = card.getBoundingClientRect();
  const back = [...card.querySelectorAll('button')].find(b => /back to sign in/i.test(b.textContent||''));
  const h2 = card.querySelector('h2');
  const p = card.querySelector('h2') ? (h2.parentElement.querySelector('p') || null) : null;
  const form = card.querySelector('form');
  const cta = form ? [...form.querySelectorAll('button')].pop() : null;
  const g = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { y: Math.round(r.y - cardR.y), h: Math.round(r.height), mt: cs.marginTop }; };
  return { cardH: Math.round(cardR.height), cardW: Math.round(cardR.width), back: g(back), h2: g(h2), sub: g(p), form: g(form), cta: g(cta) };
})()`);
log("\n=== MOBILE 390: reset view rhythm ===");
log(JSON.stringify(M1));

await freshLogin(390, 844);
await clickBtn("sign up");
await new Promise(r => setTimeout(r, 900));
await evalOn("ref", CARDREL);
const M2 = await evalOn("ref", `(() => {
  const card = document.querySelector('.rounded-2xl');
  const cardR = card.getBoundingClientRect();
  const back = [...card.querySelectorAll('button')].find(b => /back to sign in/i.test(b.textContent||''));
  const h2 = card.querySelector('h2');
  const form = card.querySelector('form');
  const cta = form ? [...form.querySelectorAll('button')].pop() : null;
  const labels = [...card.querySelectorAll('label')].map(l => Math.round(l.getBoundingClientRect().y - cardR.y));
  const footer = [...card.querySelectorAll('div')].filter(d => (d.getAttribute('class')||'').includes('sm:hidden') || (getComputedStyle(d).display === 'none' ? false : false));
  const g = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { y: Math.round(r.y - cardR.y), h: Math.round(r.height), mt: cs.marginTop }; };
  return { cardH: Math.round(cardR.height), cardW: Math.round(cardR.width), back: g(back), h2: g(h2), form: g(form), cta: g(cta), labelYs: labels };
})()`);
log("\n=== MOBILE 390: signup view rhythm ===");
log(JSON.stringify(M2));

// ===================== 4. the failed-login Alert class (for the variant comparison) =====================
await freshLogin(1440, 900);
await evalSet("input[type=email]", "probe@x.com");
await evalSet("input[type=password]", "WrongPass1!");
await evalOn("ref", `(() => { document.querySelector('form').requestSubmit(); return 'sent'; })()`);
await new Promise(r => setTimeout(r, 2600));
const E2 = await evalOn("ref", `(() => { const a = document.querySelector('[role=alert]'); if (!a) return { none: true }; const inner = a.querySelector('div'); return { cls: a.className, innerCls: inner ? inner.className : null }; })()`);
log("\n=== failed-login Alert class (REF) ===");
log(JSON.stringify(E2));
