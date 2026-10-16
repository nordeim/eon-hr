#!/usr/bin/env node
// probe-r45-census-b6.mjs — phase B6: the reset SUCCESS view's complete
// interior (the element above the H2, the P's text, the green Alert's
// full tree, the bottom button), then the signup duplicate-error state
// + both CTA loading states + the mobile band of both views.
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
const submit = () => evalOn("ref", `(() => { document.querySelector('form').requestSubmit(); return 'sent'; })()`);

// ===================== 1. the reset success view: FULL interior =====================
await freshLogin();
await evalOn("ref", `(() => { [...document.querySelectorAll('button')].find(x => /forgot password/i.test(x.textContent||'')).click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 900));
await evalSet("form input[type=email]", "probe-never-used-9x@example.com");
await submit();
await new Promise(r => setTimeout(r, 2600));
const S1 = `(() => {
  const card = document.querySelector('.rounded-2xl');
  const cardR = card.getBoundingClientRect();
  const view = card.querySelector('.w-full > div') || card;
  const dump = (n, d) => { const r = n.getBoundingClientRect(); const cs = getComputedStyle(n); return { d, tag: n.tagName, cls: (n.getAttribute('class')||''), txt: (n.textContent||'').trim().slice(0, 160), y: Math.round(r.y - cardR.y), h: Math.round(r.height), w: Math.round(r.width), mt: cs.marginTop, bg: cs.backgroundColor, br: cs.borderRadius, color: cs.color }; };
  const out = [];
  const walk = (n, d) => { if (d > 8) return; for (const c of n.children) { out.push(dump(c, d)); walk(c, d + 1); } };
  walk(view, 0);
  return out;
})()`;
log("=== RESET SUCCESS: full walk ===");
for (const e of (await evalOn("ref", S1) || [])) {
  log(`d${e.d} ${e.tag} y=${e.y} h=${e.h} w=${e.w} mt=${e.mt} bg=${e.bg} br=${e.br}`);
  if (e.cls) log(`   cls: ${e.cls.slice(0, 200)}`);
  if (e.txt) log(`   txt: "${e.txt}"`);
}

// the Alert's specific tree
const S2 = `(() => {
  const a = document.querySelector('[role=alert]');
  if (!a) return { none: true };
  const dump = (n, d) => { const r = a.getBoundingClientRect(); const cs = getComputedStyle(n); return { d, tag: n.tagName, cls: (n.getAttribute('class')||''), txt: (n.textContent||'').trim().slice(0, 160), color: cs.color, bg: cs.backgroundColor, borderColor: cs.borderColor, mt: cs.marginTop }; };
  const out = [dump(a, 0)];
  const walk = (n, d) => { for (const c of n.children) { out.push(dump(c, d + 1)); walk(c, d + 1); } };
  walk(a, 0);
  return out;
})()`;
log("\n=== RESET SUCCESS: the green Alert tree ===");
log(JSON.stringify(await evalOn("ref", S2), null, 1).slice(0, 3500));
