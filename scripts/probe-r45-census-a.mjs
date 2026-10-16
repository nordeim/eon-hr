#!/usr/bin/env node
// probe-r45-census-a.mjs — session-46 / parity round 45, phase A: the
// r44-fixed surfaces regression on the NEW login build (11th deploy) +
// the standing at-rest census. Both apps, login only.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b) { const match = JSON.stringify(a) === JSON.stringify(b); results.push({ name, match }); console.log(`${match ? "MATCH" : "DIFF "} ${name}`); if (!match) { console.log(`  ref: ${JSON.stringify(a).slice(0, 700)}`); console.log(`  loc: ${JSON.stringify(b).slice(0, 700)}`); } }

for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
}

// ---------- (1) the icon family (r44 regression) ----------
const ICONS = `(() => { const svgs = [...document.querySelectorAll('svg')]; const mail = svgs.find(v => (v.getAttribute('class')||'').includes('lucide-mail')); const lock = svgs.find(v => (v.getAttribute('class')||'').includes('lucide-lock')); const btns = [...document.querySelectorAll('button')]; const ap = btns.find(b => /apple/i.test(b.textContent||'')); const ms = btns.find(b => /microsoft/i.test(b.textContent||'')); const g = btns.find(b => /google/i.test(b.textContent||'')); return { mailCls: mail ? mail.getAttribute('class') : null, mailStroke: mail ? getComputedStyle(mail).color : null, lockCls: lock ? lock.getAttribute('class') : null, appleFill: ap ? ap.querySelector('path').getAttribute('fill') : null, msOrder: ms ? [...ms.querySelectorAll('path')].map(p => p.getAttribute('fill')) : null }; })()`;
rec("icon family", await evalOn("ref", ICONS), await evalOn("loc", ICONS));

// ---------- (2) the title order + action buttons ----------
const TITLES = `(() => { const h1 = document.querySelector('h1'); const p = h1.parentElement.querySelector('p'); const acts = [...document.querySelectorAll('button')].filter(b => /forgot password|sign up|need an account/i.test(b.textContent||'')).map(b => { const r = b.getBoundingClientRect(); return { t: (b.textContent||'').trim(), cls: b.className, x: Math.round(r.x), y: Math.round(r.y), h: Math.round(r.height) }; }); return { h1: h1.className, h1t: h1.textContent.trim(), p: p ? p.className : null, pt: p ? p.textContent.trim() : null, acts }; })()`;
rec("title/subtitle + action buttons", await evalOn("ref", TITLES), await evalOn("loc", TITLES));

// ---------- (3) the at-rest geometry ----------
const REST = `(() => { const card = document.querySelector('.rounded-2xl'); const cr = card.getBoundingClientRect(); const ins = [...document.querySelectorAll('input')].map(i => ({ t: i.type, h: Math.round(i.getBoundingClientRect().height) })); const b = [...document.querySelectorAll('button')].find(x => (x.textContent||'').trim() === 'Sign in'); const br = b.getBoundingClientRect(); return { card: { x: Math.round(cr.x), y: Math.round(cr.y), w: Math.round(cr.width), h: Math.round(cr.height) }, inputs: ins, signin: { h: Math.round(br.height), y: Math.round(br.y) } }; })()`;
rec("at-rest geometry", await evalOn("ref", REST), await evalOn("loc", REST));

// ---------- (4) the root tokens (--foreground split + --ring) ----------
const TOKENS = `(() => { const main = document.querySelector('main'); const rcs = getComputedStyle(document.documentElement); return { rootFg: rcs.getPropertyValue('--foreground').trim(), rootRing: rcs.getPropertyValue('--ring').trim(), mainFg: getComputedStyle(main).getPropertyValue('--foreground').trim(), mainRing: getComputedStyle(main).getPropertyValue('--ring').trim() }; })()`;
rec("root tokens (fg/ring)", await evalOn("ref", TOKENS), await evalOn("loc", TOKENS));

// ---------- (5) the runtime style blocks (sizes + families) ----------
const BLOCKS = `(() => { const blocks = [...document.querySelectorAll('style')].map(s => { const t = s.textContent || ''; return { bytes: t.length, ring400: t.includes('ring-slate-400'), sonner: t.includes('sonner'), hotToast: t.includes('react-hot-toast'), inBody: Boolean(s.closest('body')) }; }); return blocks; })()`;
rec("style blocks census", await evalOn("ref", BLOCKS), await evalOn("loc", BLOCKS));

// ---------- (6) the failed-login Alert re-fire ----------
const ALERT = `(() => { const i = document.querySelector('input[type=email]'); const p = document.querySelector('input[type=password]'); const set = (el, v) => { const d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; d.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); }; set(i, 'probe@x.com'); set(p, 'WrongPass1!'); document.querySelector('form').requestSubmit(); return 'fired'; })()`;
for (const s of ["ref", "loc"]) await evalOn(s, ALERT);
await new Promise(r => setTimeout(r, 2500));
const ALERTREAD = `(() => { const a = document.querySelector('[role=alert]'); if (!a) return { found: false }; const r = a.getBoundingClientRect(); const text = a.querySelector('[class*=text]'); return { found: true, txt: (a.textContent||'').trim(), color: getComputedStyle(text || a).color, w: Math.round(r.width), h: Math.round(r.height) }; })()`;
rec("failed-login Alert", await evalOn("ref", ALERTREAD), await evalOn("loc", ALERTREAD));

console.log(`\nphase A: ${results.filter(r => r.match).length}/${results.length} MATCH`);
