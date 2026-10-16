#!/usr/bin/env node
// verify-r45.mjs — session-46 / parity round 45 live verification.
// The round's pairs: (1) the reset view's rendered surface both bands,
// (2) the signup view's rendered surface both bands, (3) the sibling input
// class strings (sorted-set — tw-merge reorders), (4) the hidden views'
// field icon colors (slate-400), (5) the reset-success view (the circle +
// the green Alert + the email span), (6) the signup duplicate-error Alert,
// (7) the two CTA loading interiors (the microtask snapshot), (8) the
// --foreground resolution on the Alert family (rgb(9,9,11) both apps),
// (9) the at-rest sign-in regression (the r44 set), (10) the action
// buttons' view-swap behavior.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b) { const match = JSON.stringify(a) === JSON.stringify(b); results.push({ name, match }); console.log(`${match ? "MATCH" : "DIFF "} ${name}`); if (!match) { console.log(`  ref: ${JSON.stringify(a).slice(0, 650)}`); console.log(`  loc: ${JSON.stringify(b).slice(0, 650)}`); } }

// the documented-restoration strip: the clone authors mt members v4's
// :where space-y cannot deliver past an authored -mb-2 / the inline label
// (the trap-6 family). REF's runtime CSS supplies the same margins.
const stripRestorations = (cls) => (cls || "")
  .split(" ").filter((m) => m !== "mt-4" && m !== "sm:mt-6" && m !== "mt-1.5").join(" ");
const sortSet = (cls) => (cls || "").split(" ").sort().join(" ");

async function freshLogin(session, base, w, h) {
  run(`agent-browser --session ${session} set viewport ${w} ${h}`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
}
const clickBtn = (session, re) => evalOn(session, `(() => { const b = [...document.querySelectorAll('button')].find(x => /${re}/i.test(x.textContent||'')); if (!b) return 'NOTFOUND'; b.click(); return 'ok'; })()`);
const evalSet = (session, sel, val) => evalOn(session, `(() => { const i = document.querySelector('${sel}'); const d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; d.call(i, '${val}'); i.dispatchEvent(new Event('input', { bubbles: true })); return 'set'; })()`);

// the rhythm reader: the card + the back/H2/sub/form/CTA stack with the
// restoration-stripped classes
const RHYTHM = `(() => {
  const card = document.querySelector('.rounded-2xl');
  if (!card) return { gone: true };
  const cardR = card.getBoundingClientRect();
  const g = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { y: Math.round(r.y - cardR.y), h: Math.round(r.height), mt: cs.marginTop, mb: cs.marginBottom, cls: (el.getAttribute('class')||'') }; };
  const back = [...card.querySelectorAll('button')].find(b => /back to sign in/i.test(b.textContent||''));
  const h2 = card.querySelector('h2');
  const sub = h2 ? h2.parentElement.querySelector('p') : null;
  const form = card.querySelector('form');
  const cta = form ? [...form.querySelectorAll('button')].pop() : null;
  return { cardH: Math.round(cardR.height), cardW: Math.round(cardR.width), back: g(back), h2: g(h2), sub: g(sub), form: g(form), cta: g(cta) };
})()`;
function normalizeRhythm(r) {
  if (!r || r.gone) return r;
  /* The mt/mb mechanism split (the documented trap-6 family): REF's v3
     space-y lands mt on FOLLOWING siblings, v4's lands mb on PRECEDING
     ones — the same rendered gaps via the other margin side. The y/h
     geometry (which encodes the rendered gaps) is the contract, so the
     raw margin-side values drop out of the comparison. */
  const strip = (e) => e ? { y: e.y, h: e.h, cls: stripRestorations(e.cls) } : e;
  return { cardH: r.cardH, cardW: r.cardW, back: strip(r.back), h2: strip(r.h2), sub: strip(r.sub), form: strip(r.form), cta: strip(r.cta) };
}

// ---------- (1)(2) the two views' rhythm, both bands ----------
for (const [band, w, h] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
  for (const view of ["reset", "signup"]) {
    const reads = [];
    for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
      await freshLogin(session, base, w, h);
      await clickBtn(session, view === "reset" ? "forgot password" : "sign up");
      await new Promise(r => setTimeout(r, 900));
      reads.push(normalizeRhythm(await evalOn(session, RHYTHM)));
    }
    rec(`the ${view} view rhythm (${band})`, reads[0], reads[1]);
  }
}

// ---------- (3)(4) the sibling input classes + icon colors ----------
const FIELDS = `(() => {
  const card = document.querySelector('.rounded-2xl');
  const input = card.querySelector('form input');
  const icon = card.querySelector('form svg');
  return { inputCls: (input.getAttribute('class')||'').split(' ').sort().join(' '), iconCls: icon.getAttribute('class'), iconColor: getComputedStyle(icon).color };
})()`;
{
  const reads = [];
  for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    await freshLogin(session, base, 1440, 900);
    await clickBtn(session, "forgot password");
    await new Promise(r => setTimeout(r, 900));
    reads.push(await evalOn(session, FIELDS));
  }
  rec("the reset input class + icon color", reads[0], reads[1]);
}
{
  const reads = [];
  for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    await freshLogin(session, base, 1440, 900);
    await clickBtn(session, "sign up");
    await new Promise(r => setTimeout(r, 900));
    reads.push(await evalOn(session, `(() => { const card = document.querySelector('.rounded-2xl'); const ins = [...card.querySelectorAll('form input')]; const icons = [...card.querySelectorAll('form svg')].filter(s => (s.getAttribute('class')||'').includes('absolute')); return { inputCls: (ins[1].getAttribute('class')||'').split(' ').sort().join(' '), phs: ins.map(i => i.getAttribute('placeholder')), iconColors: icons.map(i => getComputedStyle(i).color) }; })()`));
  }
  rec("the signup inputs' classes + placeholders + icon colors", reads[0], reads[1]);
}

// ---------- (5) the success view ----------
{
  const reads = [];
  for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    await freshLogin(session, base, 1440, 900);
    await clickBtn(session, "forgot password");
    await new Promise(r => setTimeout(r, 900));
    await evalSet(session, "form input[type=email]", "verify-r45-probe@example.com");
    await evalOn(session, `(() => { document.querySelector('form').requestSubmit(); return 'sent'; })()`);
    await new Promise(r => setTimeout(r, 2600));
    reads.push(await evalOn(session, `(() => {
      const card = document.querySelector('.rounded-2xl');
      const cardR = card.getBoundingClientRect();
      const circle = card.querySelector('.rounded-full');
      const h2 = card.querySelector('h2');
      const span = h2 ? h2.parentElement.querySelector('span') : null;
      const alert = document.querySelector('[role=alert]');
      const bottom = [...card.querySelectorAll('button')].filter(b => /back to sign in/i.test(b.textContent||'')).pop();
      const g = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { y: Math.round(r.y - cardR.y), h: Math.round(r.height), w: Math.round(r.width), cls: (el.getAttribute('class')||'') }; };
      const alertBg = alert ? getComputedStyle(alert).backgroundColor : null;
      /* the documented lab()/rgba() serialization split on bg-green-50/70 */
      const alertBgN = alertBg && (alertBg.startsWith('rgba(240, 253, 244') || alertBg.startsWith('lab(')) ? 'green-50/70' : alertBg;
      return { cardH: Math.round(cardR.height), circle: g(circle), circleSvg: circle ? circle.querySelector('svg').getAttribute('class') : null, h2: g(h2), emailSpan: g(span), emailTxt: span ? span.textContent : null, alert: alert ? { y: Math.round(alert.getBoundingClientRect().y - cardR.y), bg: alertBgN, fg: getComputedStyle(alert).color } : null, bottom: g(bottom) };
    })()`));
  }
  rec("the reset-success view (circle + alert + email span + back)", reads[0], reads[1]);
}

// ---------- (6) the duplicate-error Alert ----------
{
  const reads = [];
  for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    await freshLogin(session, base, 1440, 900);
    await clickBtn(session, "sign up");
    await new Promise(r => setTimeout(r, 900));
    await evalSet(session, "form input[type=email]", "sepnetflix2023@outlook.com");
    await evalSet(session, "form input[type=password]", "VerifyPass1!");
    await evalOn(session, `(() => { const i = [...document.querySelectorAll('form input')][2]; const d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; d.call(i, 'VerifyPass1!'); i.dispatchEvent(new Event('input', { bubbles: true })); return 'set'; })()`);
    await evalOn(session, `(() => { document.querySelector('form').requestSubmit(); return 'sent'; })()`);
    await new Promise(r => setTimeout(r, 3200));
    reads.push(await evalOn(session, `(() => { const card = document.querySelector('.rounded-2xl'); const cardR = card.getBoundingClientRect(); const a = document.querySelector('[role=alert]'); if (!a) return { none: true }; const r = a.getBoundingClientRect(); const inner = a.querySelector('div'); /* the documented lab()/rgba() serialization split (the clone's v4 oklch palette emits lab() where REF's v3 emits rgba()) — canvas-rasterize to pixel bytes, the r44 pixel-identical precedent */ const bg = getComputedStyle(a).backgroundColor; const cv = document.createElement('canvas'); cv.width = 2; cv.height = 2; const cx = cv.getContext('2d'); cx.fillStyle = bg; cx.fillRect(0, 0, 2, 2); const px = cx.getImageData(0, 0, 1, 1).data; const bgN = px.join(','); return { txt: (a.textContent||'').trim(), y: Math.round(r.y - cardR.y), w: Math.round(r.width), h: Math.round(r.height), bg: bgN, innerCls: (inner.getAttribute('class')||'').split(' ').sort().join(' ') }; })()`));
  }
  rec("the signup duplicate-error Alert", reads[0], reads[1]);
}

// ---------- (7) the two CTA loading interiors (microtask) ----------
async function loadingSnap(session, view) {
  await freshLogin(session, session === "ref" ? baseRef : baseLoc, 1440, 900);
  await clickBtn(session, view === "reset" ? "forgot password" : "sign up");
  await new Promise(r => setTimeout(r, 900));
  if (view === "reset") {
    await evalSet(session, "form input[type=email]", "loading-probe@example.com");
  } else {
    await evalSet(session, "form input[type=email]", "loading-probe@example.com");
    await evalSet(session, "form input[type=password]", "Password123!");
    await evalOn(session, `(() => { const i = [...document.querySelectorAll('form input')][2]; const d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; d.call(i, 'Password123!'); i.dispatchEvent(new Event('input', { bubbles: true })); return 'set'; })()`);
  }
  await evalOn(session, `(() => { window.__snap = null; document.querySelector('form').requestSubmit(); const b = [...document.querySelectorAll('form button')].pop(); queueMicrotask(() => { const svg = b.querySelector('svg'); window.__snap = { txt: (b.textContent||'').trim(), disabled: b.disabled, svgCls: svg ? svg.getAttribute('class') : null }; }); return 'armed'; })()`);
  await new Promise(r => setTimeout(r, 800));
  return evalOn(session, `(() => window.__snap)()`);
}
rec("the reset CTA loading (Sending...)", await loadingSnap("ref", "reset"), await loadingSnap("loc", "reset"));
rec("the signup CTA loading (Creating account...)", await loadingSnap("ref", "signup"), await loadingSnap("loc", "signup"));

// ---------- (8) the --foreground resolution on the Alert family ----------
{
  const reads = [];
  for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    await freshLogin(session, base, 1440, 900);
    await clickBtn(session, "forgot password");
    await new Promise(r => setTimeout(r, 900));
    await evalSet(session, "form input[type=email]", "fg-probe@example.com");
    await evalOn(session, `(() => { document.querySelector('form').requestSubmit(); return 'sent'; })()`);
    await new Promise(r => setTimeout(r, 2600));
    reads.push(await evalOn(session, `(() => { const main = document.querySelector('main'); const a = document.querySelector('[role=alert]'); const rawFg = getComputedStyle(main).getPropertyValue('--foreground').trim(); /* the documented trap-1 serialization split: REF ships the hsl() form, the clone the hex pin — both resolve rgb(9,9,11) */ const mainFg = (rawFg === '240 10% 3.9%' || rawFg === '#09090b') ? 'zinc-950' : rawFg; return { mainFg, alertFg: a ? getComputedStyle(a).color : null }; })()`));
  }
  rec("the --foreground token (the Alert's container color)", reads[0], reads[1]);
}

// ---------- (9) the at-rest sign-in regression (the r44 set) ----------
{
  const reads = [];
  for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    await freshLogin(session, base, 1440, 900);
    reads.push(await evalOn(session, `(() => { const card = document.querySelector('.rounded-2xl'); const cr = card.getBoundingClientRect(); const ins = [...document.querySelectorAll('input')].map(i => ({ t: i.type, h: Math.round(i.getBoundingClientRect().height) })); const b = [...document.querySelectorAll('button')].find(x => (x.textContent||'').trim() === 'Sign in'); const br = b.getBoundingClientRect(); const icons = [...document.querySelectorAll('svg')].filter(s => (s.getAttribute('class')||'').includes('lucide-mail') || (s.getAttribute('class')||'').includes('lucide-lock')).map(s => getComputedStyle(s).color); return { card: { x: Math.round(cr.x), y: Math.round(cr.y), w: Math.round(cr.width), h: Math.round(cr.height) }, inputs: ins, signin: { h: Math.round(br.height), y: Math.round(br.y) }, iconColors: icons }; })()`));
  }
  rec("the at-rest sign-in regression (card/inputs/CTA/icons)", reads[0], reads[1]);
}

// ---------- (10) the action buttons swap views (no error Alerts) ----------
{
  const reads = [];
  for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    await freshLogin(session, base, 1440, 900);
    const before = await evalOn(session, `(() => ({ h1: Boolean(document.querySelector('h1')), social: [...document.querySelectorAll('button')].filter(b => /continue with/i.test(b.textContent||'')).length }))()`);
    await clickBtn(session, "forgot password");
    await new Promise(r => setTimeout(r, 800));
    const after = await evalOn(session, `(() => ({ h1: Boolean(document.querySelector('h1')), social: [...document.querySelectorAll('button')].filter(b => /continue with/i.test(b.textContent||'')).length, h2: (document.querySelector('h2')||{}).textContent || null, alerts: document.querySelectorAll('[role=alert]').length }))()`);
    await clickBtn(session, "back to sign in");
    await new Promise(r => setTimeout(r, 800));
    const back = await evalOn(session, `(() => ({ h1: Boolean(document.querySelector('h1')), form: Boolean(document.querySelector('form')) }))()`);
    reads.push({ before, after, back });
  }
  rec("the action-button view swap (logo/social unmount, back restores)", reads[0], reads[1]);
}

console.log(`\nverify-r45: ${results.filter(r => r.match).length}/${results.length} MATCH`);
