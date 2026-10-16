#!/usr/bin/env node
// probe-r45-census-b3.mjs — phase B3: the reset view's wrapper + icons +
// the sign-up view's full census (the second hidden flow).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
const log = (...a) => console.log(...a);

run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open https://eon.base44.app/login`);
await new Promise(r => setTimeout(r, 3200));
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /forgot password/i.test(x.textContent||'')); b.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 900));

// ---------- the reset view's structural details ----------
const WRAP = `(() => {
  const card = document.querySelector('.rounded-2xl');
  const form = card.querySelector('form');
  const wrap = form.children[0];
  const wrapCs = getComputedStyle(wrap);
  const backBtn = [...card.querySelectorAll('button')].find(b => /back to sign in/i.test(b.textContent||''));
  const backSvg = backBtn.querySelector('svg');
  const input = form.querySelector('input');
  const iconSvg = wrap.querySelector('svg');
  const label = form.querySelector('label');
  const wrapR = wrap.getBoundingClientRect(); const inputR = input.getBoundingClientRect(); const labelR = label.getBoundingClientRect();
  return {
    wrapCls: wrap.getAttribute('class'),
    wrapStyle: { display: wrapCs.display, mt: wrapCs.marginTop, mb: wrapCs.marginBottom, pt: wrapCs.paddingTop },
    wrapBox: { y: Math.round(wrapR.y - card.getBoundingClientRect().y), h: Math.round(wrapR.height) },
    labelBottomToInputTop: Math.round(inputR.y - (labelR.y + labelR.height)),
    inputToCTATop: Math.round(form.children[1].getBoundingClientRect().y - (inputR.y + inputR.height)),
    backSvg: backSvg ? { cls: backSvg.getAttribute('class'), html: backSvg.outerHTML.slice(0, 400), size: Math.round(backSvg.getBoundingClientRect().width) } : null,
    fieldIcon: iconSvg ? { cls: iconSvg.getAttribute('class'), color: getComputedStyle(iconSvg).color, kids: [...iconSvg.children].map(c => c.tagName + ':' + (c.getAttribute('d')||'').slice(0, 40) + (c.getAttribute('x')||'') + (c.getAttribute('width')||'')) } : null
  };
})()`;
log("=== RESET: wrapper + icons ===");
log(JSON.stringify(await evalOn("ref", WRAP), null, 1));

// ---------- back to sign-in, then the SIGN-UP view ----------
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /back to sign in/i.test(x.textContent||'')); b.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 700));
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /sign up/i.test(x.textContent||'')); b.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 900));

const SIGNUP = `(() => {
  const card = document.querySelector('.rounded-2xl');
  const cardR = card.getBoundingClientRect();
  const pick = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { tag: el.tagName, cls: (el.getAttribute('class')||''), txt: [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).filter(Boolean).join('|'), ph: el.getAttribute('placeholder'), type: el.getAttribute('type'), ac: el.getAttribute('autocomplete'), y: Math.round(r.y - cardR.y), h: Math.round(r.height), w: Math.round(r.width), mt: cs.marginTop, mb: cs.marginBottom }; };
  const out = [];
  const walk = (n, d) => { if (d > 7) return; for (const c of n.children) { const e = pick(c); if (e.tag === 'BUTTON' || e.tag === 'INPUT' || e.tag === 'SVG' || e.txt || e.tag === 'H1' || e.tag === 'H2' || e.tag === 'P' || e.tag === 'FORM' || e.tag === 'LABEL') out.push(e); walk(c, d + 1); } };
  walk(card, 0);
  const form = card.querySelector('form');
  const forms = card.querySelectorAll('form');
  const structure = { formCount: forms.length, formCls: form ? form.getAttribute('class') : null, cardH: Math.round(cardR.height) };
  return { structure, out };
})()`;
log("\n=== SIGNUP VIEW (desktop 1440) ===");
const su = await evalOn("ref", SIGNUP);
log(`structure: ${JSON.stringify(su.structure)}`);
for (const e of (su.out || [])) {
  log(`${e.tag} y=${e.y} h=${e.h} mt=${e.mt} mb=${e.mb}`);
  log(`   cls: ${e.cls}`);
  if (e.txt) log(`   txt: "${e.txt}"`);
  if (e.ph) log(`   ph: "${e.ph}" type=${e.type} ac=${e.ac}`);
}
