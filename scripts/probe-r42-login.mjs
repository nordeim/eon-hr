#!/usr/bin/env node
// probe-r42-login.mjs — session-43 / parity round 42 login re-audit census.
// REF redeployed BOTH login JS (C-ulo5ek → DRs9_-5K) and login CSS
// (BIWjBcok → DPOrvWRk). Full re-measure of the login recipes on both
// bands (desktop 1440x900 + mobile 390x844), both apps, plus the CSS
// delta question (what changed in the stylesheet?).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b) { results.push({ name, ref: a, loc: b, match: JSON.stringify(a) === JSON.stringify(b) }); }

async function openLogin(session, base, w, h) {
  run(`agent-browser --session ${session} set viewport ${w} ${h}`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
}

// ---------------- desktop band ----------------
await openLogin("ref", baseRef, 1440, 900);
await openLogin("loc", baseLoc, 1440, 900);

const CARD = `(() => { const c = document.querySelector('.rounded-2xl, [class*="rounded-2xl"]'); const card = c || document.querySelector('main form')?.closest('div'); if (!card) return {found:false}; const r = card.getBoundingClientRect(); return {found:true, x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height)}; })()`;
rec("card geometry", await evalOn("ref", CARD), await evalOn("loc", CARD));

const DOC = `(() => ({ docH: document.documentElement.scrollHeight, main: !!document.querySelector('main'), bodyChild: document.body.firstElementChild?.tagName })()`;
rec("doc height + main root", await evalOn("ref", DOC), await evalOn("loc", DOC));

const INPUTS = `(() => { const i = document.querySelector('input[type=email]'); if (!i) return {found:false}; const cs = getComputedStyle(i); const r = i.getBoundingClientRect(); return {found:true, h:Math.round(r.height), y:Math.round(r.y), fs:cs.fontSize, ph:cs.getPropertyValue('--tw-placeholder-opacity') || null, phColor:(cs.getPropertyValue('color')), shadow:cs.boxShadow.slice(0,50), ring:cs.boxShadow.includes('0 0 0')}; })()`;
rec("email input (desktop)", await evalOn("ref", INPUTS), await evalOn("loc", INPUTS));

const PLACEHOLDER = `(() => { const i = document.querySelector('input[type=email]'); return { ph: i?.placeholder || '', cls: (i?.className || '').slice(0, 200) }; })()`;
rec("email placeholder + classes", await evalOn("ref", PLACEHOLDER), await evalOn("loc", PLACEHOLDER));

const SIGNIN = `(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent||'').trim() === 'Sign in'); if (!b) return {found:false}; const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return {found:true, w:Math.round(r.width), h:Math.round(r.height), y:Math.round(r.y), color:cs.color, bg:cs.backgroundImage.slice(0,60) || cs.backgroundColor, cls:(b.className||'').slice(0,250)}; })()`;
rec("Sign in button", await evalOn("ref", SIGNIN), await evalOn("loc", SIGNIN));

const SOCIAL = `(() => { const bs = [...document.querySelectorAll('button')].filter(b => /google|microsoft|apple/i.test(b.textContent||'')); return bs.map(b => { const r = b.getBoundingClientRect(); const img = b.querySelector('img,svg'); const ir = img ? img.getBoundingClientRect() : null; return { t:(b.textContent||'').trim().slice(0,10), type:b.getAttribute('type'), h:Math.round(r.height), w:Math.round(r.width), ix: ir?Math.round(ir.x):null, iw: ir?Math.round(ir.width):null }; }); })()`;
rec("social buttons", await evalOn("ref", SOCIAL), await evalOn("loc", SOCIAL));

const ORCHIP = `(() => { const els = [...document.querySelectorAll('div,span')].filter(e => /^(or|أو)$/i.test((e.textContent||'').trim()) && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().width < 60); if (!els.length) return {found:false}; const e = els[0]; const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return {found:true, w:Math.round(r.width), h:Math.round(r.height), bg:cs.backgroundColor, fs:cs.fontSize}; })()`;
rec("or-chip", await evalOn("ref", ORCHIP), await evalOn("loc", ORCHIP));

const LINKS = `(() => { const ls = [...document.querySelectorAll('a')].filter(a => /forgot|sign ?up|password/i.test(a.textContent||'')).map(a => { const r = a.getBoundingClientRect(); const cs = getComputedStyle(a); return { t:(a.textContent||'').trim().slice(0,20), y:Math.round(r.y), h:Math.round(r.height), w:Math.round(r.width), color:cs.color, deco:cs.textDecorationLine }; }); return ls; })()`;
rec("links (forgot/signup)", await evalOn("ref", LINKS), await evalOn("loc", LINKS));

const TITLE = `(() => { const h = [...document.querySelectorAll('h1,h2')].find(e => /welcome/i.test(e.textContent||'')); if (!h) return {found:false}; const r = h.getBoundingClientRect(); const cs = getComputedStyle(h); return {found:true, t:(h.textContent||'').trim(), y:Math.round(r.y), fs:cs.fontSize, fw:cs.fontWeight, ls:cs.letterSpacing, mt:cs.marginTop, mb:cs.marginBottom}; })()`;
rec("title block", await evalOn("ref", TITLE), await evalOn("loc", TITLE));

// ---------------- mobile band ----------------
await openLogin("ref", baseRef, 390, 844);
await openLogin("loc", baseLoc, 390, 844);

const M_CARD = `(() => { const card = document.querySelector('main form')?.closest('div'); if (!card) return {found:false}; const r = card.getBoundingClientRect(); return {found:true, x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height)}; })()`;
rec("card geometry (mobile)", await evalOn("ref", M_CARD), await evalOn("loc", M_CARD));

const M_INPUT = `(() => { const i = document.querySelector('input[type=email]'); const cs = getComputedStyle(i); const r = i.getBoundingClientRect(); return { h:Math.round(r.height), fs:cs.fontSize, y:Math.round(r.y) }; })()`;
rec("email input (mobile 44px/16px)", await evalOn("ref", M_INPUT), await evalOn("loc", M_INPUT));

const M_LINKS = `(() => { const row = [...document.querySelectorAll('div')].find(d => d.querySelectorAll('a').length === 2 && /forgot|sign ?up/i.test(d.textContent||'') && d.getBoundingClientRect().height > 0 && d.getBoundingClientRect().height < 100); if (!row) return {found:false}; const r = row.getBoundingClientRect(); const cs = getComputedStyle(row); const links = [...row.querySelectorAll('a')].map(a => { const ar = a.getBoundingClientRect(); return { y:Math.round(ar.y), h:Math.round(ar.h || ar.height), t:(a.textContent||'').trim().slice(0,15) }; }); return {found:true, y:Math.round(r.y), h:Math.round(r.height), fd:cs.flexDirection, links}; })()`;
rec("links row (mobile stacked)", await evalOn("ref", M_LINKS), await evalOn("loc", M_LINKS));

const M_SOCIAL = `(() => { const bs = [...document.querySelectorAll('button')].filter(b => /google|microsoft|apple/i.test(b.textContent||'')); return bs.map(b => { const img = b.querySelector('img,svg'); const ir = img ? img.getBoundingClientRect() : null; const r = b.getBoundingClientRect(); return { t:(b.textContent||'').trim().slice(0,10), ix: ir?Math.round(ir.x):null, h:Math.round(r.height) }; }); })()`;
rec("social icons (mobile)", await evalOn("ref", M_SOCIAL), await evalOn("loc", M_SOCIAL));

const M_DOC = `(() => ({ docH: document.documentElement.scrollHeight })()`;
rec("doc scrollHeight (mobile)", await evalOn("ref", M_DOC), await evalOn("loc", M_DOC));

// ---------------- CSS delta ----------------
const cssUrl = await evalOn("ref", `(() => (document.querySelector('link[rel=stylesheet]')?.href) || '')()`);
console.log("REF login CSS URL:", cssUrl);

let cssReport = { fetched: false };
if (cssUrl && typeof cssUrl === "string" && cssUrl.startsWith("http")) {
  const css = run(`curl -s "${cssUrl}"`);
  if (css && !css.startsWith("ERR")) {
    const fontFaces = (css.match(/@font-face/g) || []).length;
    const hasBase44 = css.includes(".font-base44");
    const fontFamilies = [...new Set((css.match(/font-family:\s*[^;]{3,40}/g) || []))].slice(0, 12);
    cssReport = { fetched: true, bytes: css.length, fontFaces, hasBase44, fontFamilies };
  }
}
console.log("REF login CSS report:", JSON.stringify(cssReport, null, 1));

// ---------------- report ----------------
let matchCount = 0;
for (const r of results) {
  console.log(`${r.match ? "MATCH " : "DIFF  "} ${r.name}`);
  if (!r.match) console.log(`   ref=${JSON.stringify(r.ref).slice(0, 320)}\n   loc=${JSON.stringify(r.loc).slice(0, 320)}`);
  if (r.match) matchCount++;
}
console.log(`\n${matchCount}/${results.length} login census MATCH`);
