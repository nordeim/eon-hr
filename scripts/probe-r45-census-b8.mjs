#!/usr/bin/env node
// probe-r45-census-b8.mjs — phase B8: the signup duplicate-error (button
// click + fetch capture), the CTA loading states (the r44 microtask
// pattern), and the signup inputs' exact attrs.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 250) }; } }
const log = (...a) => console.log(...a);

async function freshLogin() {
  run(`agent-browser --session ref set viewport 1440 900`);
  run(`agent-browser --session ref open https://eon.base44.app/login`);
  await new Promise(r => setTimeout(r, 3200));
}
const evalSet = (sel, val) => evalOn("ref", `(() => { const i = document.querySelector('${sel}'); const d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; d.call(i, '${val}'); i.dispatchEvent(new Event('input', { bubbles: true })); return 'set'; })()`);

// ===================== 1. the signup duplicate-error via BUTTON CLICK + fetch capture =====================
await freshLogin();
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /sign up/i.test(x.textContent||'')); b.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 900));
// instrument fetch FIRST
await evalOn("ref", `(() => { window.__fetches = []; const orig = window.fetch; window.fetch = function(...a) { const url = String(a[0]); const p = orig.apply(this, a); p.then(r => { window.__fetches.push({ url: url.slice(0, 120), status: r.status }); }).catch(e => { window.__fetches.push({ url: url.slice(0, 120), err: String(e).slice(0, 80) }); }); return p; }; return 'instrumented'; })()`);
await evalSet("form input[type=email]", "sepnetflix2023@outlook.com");
await evalSet("form input[type=password]", "Abcd1234!");
await evalOn("ref", `(() => { const i = [...document.querySelectorAll('form input')][2]; const d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; d.call(i, 'Abcd1234!'); i.dispatchEvent(new Event('input', { bubbles: true })); return 'set'; })()`);
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('form button')].find(x => /create account/i.test(x.textContent||'')); b.click(); return 'clicked'; })()`);
await new Promise(r => setTimeout(r, 4000));
const E1 = await evalOn("ref", `(() => {
  const card = document.querySelector('.rounded-2xl');
  const a = document.querySelector('[role=alert]');
  const out = { fetches: window.__fetches, alert: null, allTexts: [...card.querySelectorAll('p, h2, [role=alert], span')].filter(e => (e.textContent||'').trim()).map(e => ({ tag: e.tagName, cls: (e.getAttribute('class')||'').slice(0, 120), txt: (e.textContent||'').trim().slice(0, 140) })) };
  if (a) { const inner = a.querySelector('div'); out.alert = { cls: a.className, y: Math.round(a.getBoundingClientRect().y - card.getBoundingClientRect().y), mt: getComputedStyle(a).marginTop, bg: getComputedStyle(a).backgroundColor, innerCls: inner ? inner.className : null }; }
  return out;
})()`);
log("=== SIGNUP: duplicate error (button click + fetch log) ===");
log(JSON.stringify(E1, null, 1).slice(0, 4000));

// ===================== 2. the CTA loading states (the microtask pattern) =====================
await freshLogin();
await evalOn("ref", `(() => { [...document.querySelectorAll('button')].find(x => /forgot password/i.test(x.textContent||'')).click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 900));
await evalSet("form input[type=email]", "loading-probe@example.com");
await evalOn("ref", `(() => { window.__snap = null; document.querySelector('form').requestSubmit(); const b = [...document.querySelectorAll('form button')].pop(); queueMicrotask(() => { const svg = b.querySelector('svg'); window.__snap = { txt: (b.textContent||'').trim(), disabled: b.disabled, svgCls: svg ? svg.getAttribute('class') : null }; }); return 'armed'; })()`);
await new Promise(r => setTimeout(r, 800));
const L1 = await evalOn("ref", `(() => window.__snap)()`);
log("\n=== RESET: CTA loading (microtask) ===");
log(JSON.stringify(L1));

await freshLogin();
await evalOn("ref", `(() => { [...document.querySelectorAll('button')].find(x => /sign up/i.test(x.textContent||'')).click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 900));
await evalSet("form input[type=email]", "loading-probe@example.com");
await evalSet("form input[type=password]", "Password123!");
await evalOn("ref", `(() => { const i = [...document.querySelectorAll('form input')][2]; const d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; d.call(i, 'Password123!'); i.dispatchEvent(new Event('input', { bubbles: true })); return 'set'; })()`);
await evalOn("ref", `(() => { window.__snap = null; document.querySelector('form').requestSubmit(); const b = [...document.querySelectorAll('form button')].pop(); queueMicrotask(() => { const svg = b.querySelector('svg'); window.__snap = { txt: (b.textContent||'').trim(), disabled: b.disabled, svgCls: svg ? svg.getAttribute('class') : null }; }); return 'armed'; })()`);
await new Promise(r => setTimeout(r, 800));
const L2 = await evalOn("ref", `(() => window.__snap)()`);
log("\n=== SIGNUP: CTA loading (microtask) ===");
log(JSON.stringify(L2));

// ===================== 3. the signup inputs' exact attrs =====================
await freshLogin();
await evalOn("ref", `(() => { [...document.querySelectorAll('button')].find(x => /sign up/i.test(x.textContent||'')).click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 900));
const A1 = await evalOn("ref", `(() => {
  const ins = [...document.querySelectorAll('form input')];
  return ins.map(i => ({ type: i.type, ph: i.getAttribute('placeholder'), ac: i.getAttribute('autocomplete'), req: i.required, name: i.getAttribute('name'), cls: i.className, h: Math.round(i.getBoundingClientRect().height) }));
})()`);
log("\n=== SIGNUP: inputs' attrs + full classes ===");
log(JSON.stringify(A1, null, 1).slice(0, 4500));
