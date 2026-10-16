#!/usr/bin/env node
// probe-r45-census-b5.mjs — phase B5: the consolidated remainder — the
// reset field unit + icons, full input classes, the view wrappers, then
// the DYNAMIC states: reset success view, signup duplicate error, both
// CTA loading states, and the mobile band of both views.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 250) }; } }
const log = (...a) => console.log(...a);

async function freshLogin() {
  run(`agent-browser --session ref set viewport 1440 900`);
  run(`agent-browser --session ref open https://eon.base44.app/login`);
  await new Promise(r => setTimeout(r, 3200));
}
const clickBtn = (re) => evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /${re}/i.test(x.textContent||'')); if (!b) return 'NOTFOUND'; b.click(); return 'ok'; })()`);
const CARDY = `(() => { const c = document.querySelector('.rounded-2xl'); const cy = c.getBoundingClientRect().y; window.__cy = cy; return Math.round(cy); })()`;

// ===================== 1. the reset view: field unit + icons =====================
await freshLogin();
await clickBtn("forgot password");
await new Promise(r => setTimeout(r, 900));
const R1 = `(() => {
  const card = document.querySelector('.rounded-2xl');
  const form = card.querySelector('form');
  const view = form.parentElement;
  const unit = form.children[0];
  const relwrap = unit.querySelector('.relative');
  const icon = relwrap ? relwrap.querySelector('svg') : unit.querySelector('svg');
  const input = form.querySelector('input');
  const cta = [...form.querySelectorAll('button')].pop();
  const backSvg = [...card.querySelectorAll('button')].find(b => /back to sign in/i.test(b.textContent||'')).querySelector('svg');
  return {
    viewCls: view.getAttribute('class'),
    unitCls: unit.getAttribute('class'),
    relCls: relwrap ? relwrap.getAttribute('class') : null,
    iconCls: icon ? icon.getAttribute('class') : null,
    iconColor: icon ? getComputedStyle(icon).color : null,
    iconGlyph: icon ? [...icon.children].map(c => c.tagName + '[' + (c.getAttribute('x')||'') + (c.getAttribute('width')||'') + '] d=' + (c.getAttribute('d')||'').slice(0, 44)) : null,
    inputCls: input.className,
    ctaCls: cta.className,
    backSvgGlyph: backSvg ? { cls: backSvg.getAttribute('class'), d: [...backSvg.children].map(c => (c.getAttribute('d')||'')).join(';').slice(0, 120) } : null
  };
})()`;
log("=== RESET: field unit + icons + full classes ===");
log(JSON.stringify(await evalOn("ref", R1), null, 1));

// ===================== 2. the reset SUCCESS view (send with a throwaway email) =====================
await evalOn("ref", `(() => { const i = document.querySelector('form input[type=email]'); const d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; d.call(i, 'probe-never-used-9x@example.com'); i.dispatchEvent(new Event('input', { bubbles: true })); document.querySelector('form').requestSubmit(); return 'sent'; })()`);
await new Promise(r => setTimeout(r, 2600));
const R2 = `(() => {
  const card = document.querySelector('.rounded-2xl');
  if (!card) return { gone: true };
  const cardR = card.getBoundingClientRect();
  const pick = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { tag: el.tagName, cls: (el.getAttribute('class')||''), txt: (el.children.length === 0 ? (el.textContent||'').trim().slice(0, 120) : ''), y: Math.round(r.y - cardR.y), h: Math.round(r.height), w: Math.round(r.width), mt: cs.marginTop, mb: cs.marginBottom, bg: cs.backgroundColor, color: cs.color, fs: cs.fontSize, fw: cs.fontWeight }; };
  const out = [];
  const walk = (n, d) => { if (d > 6) return; for (const c of n.children) { out.push(pick(c)); walk(c, d + 1); } };
  walk(card, 0);
  return { cardH: Math.round(cardR.height), rows: out.filter(e => e.txt || e.tag === 'SVG' || e.tag === 'BUTTON' || e.tag === 'FORM' || e.tag === 'INPUT' || e.tag === 'H2' || e.tag === 'P' || (e.cls||'').includes('alert')) };
})()`;
log("\n=== RESET: SUCCESS VIEW (after send) ===");
log(JSON.stringify(await evalOn("ref", R2), null, 1).slice(0, 7000));
