#!/usr/bin/env node
// verify-r44.mjs — session-45 / parity round 44 live verification.
// The round's pairs: (1) the keyboard-focused input ring (slate-400, the
// runtime-cascade mirror), (2) the Sign in token ring (unchanged), (3)
// the field icon pair (classes + colors + the older-lucide Mail glyph),
// (4) the social fills (black Apple, REF's Microsoft variant, Google attr
// order), (5) the loading interior (microtask snapshot), (6) the title
// order, (7) the at-rest regression set, (8) the style block position.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim()); } catch { try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } } }
const press = (session, key) => run(`agent-browser --session ${session} press ${key}`);

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b) { const match = JSON.stringify(a) === JSON.stringify(b); results.push({ name, match }); console.log(`${match ? "MATCH" : "DIFF "} ${name}`); if (!match) { console.log(`  ref: ${JSON.stringify(a).slice(0, 600)}`); console.log(`  loc: ${JSON.stringify(b).slice(0, 600)}`); } }

// ---------- fresh login both apps ----------
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
}

// ---------- (3)(4) the icon family ----------
const ICONS = `(() => { const svgs = [...document.querySelectorAll('svg')]; const mail = svgs.find(v => (v.getAttribute('class')||'').includes('lucide-mail')); const lock = svgs.find(v => (v.getAttribute('class')||'').includes('lucide-lock')); const btns = [...document.querySelectorAll('button')]; const ap = btns.find(b => /apple/i.test(b.textContent||''))?.querySelector('svg'); const ms = btns.find(b => /microsoft/i.test(b.textContent||''))?.querySelector('svg'); const g = btns.find(b => /google/i.test(b.textContent||''))?.querySelector('svg'); return { mailCls: mail.getAttribute('class'), mailStroke: getComputedStyle(mail).color, mailKids: [...mail.children].map(c => c.tagName), lockStroke: getComputedStyle(lock).color, appleFill: ap.querySelector('path').getAttribute('fill'), appleRendered: getComputedStyle(ap.querySelector('path')).fill, msOrder: [...ms.querySelectorAll('path')].map(p => p.getAttribute('fill')), gFirstAttrs: [...g.querySelector('path').attributes].map(a => a.name).slice(0,3) }; })()`;
rec("the icon family (fields + socials)", await evalOn("ref", ICONS), await evalOn("loc", ICONS));

// ---------- (6) the title order ----------
const TITLES = `(() => ({ h1: document.querySelector('h1').className, p: document.querySelector('h1').parentElement.querySelector('p').className }))()`;
rec("the title/subtitle order", await evalOn("ref", TITLES), await evalOn("loc", TITLES));

// ---------- (7) the at-rest regression ----------
const REST = `(() => { const card = document.querySelector('.rounded-2xl'); const cr = card.getBoundingClientRect(); const ins = [...document.querySelectorAll('input')].map(i => ({ t: i.type, h: Math.round(i.getBoundingClientRect().height), cls: i.className.slice(0, 90) })); const b = [...document.querySelectorAll('button')].find(x => (x.textContent||'').trim() === 'Sign in'); const br = b.getBoundingClientRect(); return { card: { x: Math.round(cr.x), y: Math.round(cr.y), w: Math.round(cr.width), h: Math.round(cr.height) }, ins, signin: { h: Math.round(br.height), y: Math.round(br.y) } }; })()`;
rec("the at-rest card/inputs/Sign in", await evalOn("ref", REST), await evalOn("loc", REST));

// ---------- (1)(2) the keyboard-focused rings (real Tab, settled) ----------
async function tabRead(session, tabs) {
  // fresh page for a clean focus state
  run(`agent-browser --session ${session} open ${session === "ref" ? baseRef : baseLoc}/login`);
  await new Promise(r => setTimeout(r, 2500));
  for (let i = 0; i < tabs; i++) { await press(session, "Tab"); await new Promise(r => setTimeout(r, 120)); }
  await new Promise(r => setTimeout(r, 500)); // the transition settle
  return evalOn(session, `(() => { const el = document.activeElement; const cs = getComputedStyle(el); return { tag: el.tagName, ph: el.placeholder || (el.textContent||'').trim().slice(0,16), ring: cs.getPropertyValue('--tw-ring-color').trim() }; })()`);
}
rec("email focused ring (4 Tabs)", await tabRead("ref", 4), await tabRead("loc", 4));
rec("Sign in focused ring (6 Tabs)", await tabRead("ref", 6), await tabRead("loc", 6));

// ---------- (8) the style block position (LOC-only structural read) ----------
const stylePos = await evalOn("loc", `(() => { const style = [...document.querySelectorAll('style')].find(s => (s.textContent||'').includes('focus\\\\:ring-slate-400')); if (!style) return { found: false }; const link = document.querySelector('link[rel=stylesheet]'); return { found: true, inBody: !!style.closest('body'), linkPrecedes: !!(style.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_PRECEDING) }; })()`);
console.log(`${stylePos.found && stylePos.inBody && stylePos.linkPrecedes ? "MATCH" : "DIFF "} the injected style position (body, after the links)`);
console.log(`  loc: ${JSON.stringify(stylePos)}`);
results.push({ name: "style position", match: stylePos.found && stylePos.inBody && stylePos.linkPrecedes === true });

// ---------- (5) the loading interior (microtask snapshot) ----------
async function loadingSnap(session) {
  run(`agent-browser --session ${session} open ${session === "ref" ? baseRef : baseLoc}/login`);
  await new Promise(r => setTimeout(r, 2500));
  await evalOn(session, `(() => { document.querySelector('input[type=email]').value = 'a@b.com'; document.querySelector('input[type=email]').dispatchEvent(new Event('input', {bubbles:true})); document.querySelector('input[type=password]').value = 'WrongPass1!'; document.querySelector('input[type=password]').dispatchEvent(new Event('input', {bubbles:true}')); window.__snap = null; document.querySelector('form').requestSubmit(); const b = [...document.querySelectorAll('button')].find(x => (x.textContent||'').trim() === 'Sign in'); queueMicrotask(() => { const svg = b.querySelector('svg'); window.__snap = { txt: (b.textContent||'').trim(), spinCls: svg ? svg.getAttribute('class') : null }; }); return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 700));
  return evalOn(session, `window.__snap`);
}
rec("the loading interior (microtask)", await loadingSnap("ref"), await loadingSnap("loc"));

// ---------- the failed-login Alert (both apps, after the loading snaps) ----------
await new Promise(r => setTimeout(r, 1500));
const ALERT = `(() => { const a = [...document.querySelectorAll('[role=alert]')].find(e => e.getBoundingClientRect().width > 0); if (!a) return { found: false }; const r = a.getBoundingClientRect(); return { found: true, text: (a.textContent||'').trim().slice(0,60), w: Math.round(r.width), h: Math.round(r.height) }; })()`;
rec("the failed-login Alert", await evalOn("ref", ALERT), await evalOn("loc", ALERT));

const sum = results.filter(r => r.match).length;
console.log(`\n${sum}/${results.length} verify-r44 dimensions MATCH`);
