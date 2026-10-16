#!/usr/bin/env node
// probe-r45-census-b2.mjs — phase B2: the reset view's DEEP interior —
// title texts, form fields, CTAs, exact class strings + computed rhythm.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
const log = (...a) => console.log(...a);

run(`agent-browser --session ref open https://eon.base44.app/login`);
await new Promise(r => setTimeout(r, 3200));
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /forgot password/i.test(x.textContent||'')); b.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 900));

// deep interior: every text node + every input/button/svg with full class
const DEEP = `(() => {
  const card = document.querySelector('.rounded-2xl');
  const pick = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { tag: el.tagName, cls: (el.getAttribute('class')||''), txt: [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).filter(Boolean).join('|'), type: el.getAttribute('type'), ph: el.getAttribute('placeholder'), x: Math.round(r.x - card.getBoundingClientRect().x), y: Math.round(r.y - card.getBoundingClientRect().y), w: Math.round(r.width), h: Math.round(r.height), mt: cs.marginTop, mb: cs.marginBottom, fs: cs.fontSize, fw: cs.fontWeight, color: cs.color }; };
  const out = [];
  const walk = (n, d) => { if (d > 7) return; for (const c of n.children) { out.push(pick(c)); walk(c, d + 1); } };
  walk(card, 0);
  return out.filter(e => e.tag === 'BUTTON' || e.tag === 'INPUT' || e.tag === 'SVG' || e.txt || e.tag === 'H1' || e.tag === 'P' || e.tag === 'FORM');
})()`;
log("=== RESET VIEW DEEP (elements with text/inputs/buttons) ===");
const deep = await evalOn("ref", DEEP);
for (const e of (Array.isArray(deep) ? deep : [])) {
  log(`${e.tag} y=${e.y} h=${e.h} mt=${e.mt} mb=${e.mb} fs=${e.fs} fw=${e.fw}`);
  log(`   cls: ${e.cls}`);
  if (e.txt) log(`   txt: "${e.txt}"`);
  if (e.ph) log(`   ph: "${e.ph}" type=${e.type}`);
  if (e.color && (e.tag === 'P' || e.tag === 'H1')) log(`   color: ${e.color}`);
}
