#!/usr/bin/env node
// probe-r44-login.mjs — session-45 / parity round 44 login redeploy re-audit.
// REF redeployed BOTH login JS (DRs9_-5K → DsVpN8yE) and login CSS
// (DPOrvWRk → 0a_RfWl5). Full re-measure of the login recipes on both
// bands (desktop 1440x900 + mobile 390x844), both apps — the round-42
// precedent: prove the rendered surface first, then the authored recipes.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b, norm) {
  const na = norm ? norm(a) : a, nb = norm ? norm(b) : b;
  const match = JSON.stringify(na) === JSON.stringify(nb);
  results.push({ name, match });
  console.log(`${match ? "MATCH" : "DIFF "} ${name}`);
  if (!match) { console.log(`  ref: ${JSON.stringify(na).slice(0, 700)}`); console.log(`  loc: ${JSON.stringify(nb).slice(0, 700)}`); }
}
async function openLogin(session, base, w, h) {
  run(`agent-browser --session ${session} set viewport ${w} ${h}`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
}

// ---------------- desktop band ----------------
await openLogin("ref", baseRef, 1440, 900);
await openLogin("loc", baseLoc, 1440, 900);

const CARD = `(() => { const c = document.querySelector('.rounded-2xl, [class*="rounded-2xl"]'); const card = c || document.querySelector('main form')?.closest('div'); if (!card) return {found:false}; const r = card.getBoundingClientRect(); return {found:true, x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height)}; })()`;
rec("desktop card geometry", await evalOn("ref", CARD), await evalOn("loc", CARD));

const DOC = `(() => ({ docH: document.documentElement.scrollHeight, main: !!document.querySelector('main'), bodyChild: document.body.firstElementChild?.tagName })()`;
rec("desktop doc + root", await evalOn("ref", DOC), await evalOn("loc", DOC));

const INPUTS = `(() => { const ins = [...document.querySelectorAll('input')]; return ins.map(i => { const r = i.getBoundingClientRect(); return { type: i.type, cls: i.className, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), ph: i.placeholder || null, auto: i.autocomplete || null }; }); })()`;
rec("desktop inputs", await evalOn("ref", INPUTS), await evalOn("loc", INPUTS));

const SIGNIN = `(() => { const b = [...document.querySelectorAll('button')].find(b => (b.textContent||'').trim() === 'Sign in'); if (!b) return {found:false}; const r = b.getBoundingClientRect(); return { found:true, cls: b.className, x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height), type: b.type }; })()`;
rec("desktop Sign in", await evalOn("ref", SIGNIN), await evalOn("loc", SIGNIN));

const SOCIAL = `(() => { const bs = [...document.querySelectorAll('button')].filter(b => /google|microsoft|apple/i.test(b.textContent||'')); return bs.map(b => { const r = b.getBoundingClientRect(); return { t:(b.textContent||'').trim().slice(0,30), cls:b.className, h:Math.round(r.height) }; }); })()`;
rec("desktop social buttons", await evalOn("ref", SOCIAL), await evalOn("loc", SOCIAL));

const LINKS = `(() => [...document.querySelectorAll('a')].map(a => ({ t:(a.textContent||'').trim().slice(0,40), href:a.getAttribute('href'), cls:a.className })).slice(0,6) )()`;
rec("desktop links", await evalOn("ref", LINKS), await evalOn("loc", LINKS));

const TITLES = `(() => { const h = document.querySelector('h1,h2,h3'); const sub = h?.parentElement?.querySelector('p'); return { title: h?.textContent || null, titleCls: h?.className || null, sub: sub?.textContent || null, subCls: sub?.className || null }; })()`;
rec("desktop titles", await evalOn("ref", TITLES), await evalOn("loc", TITLES));

const LABELS = `(() => { const ls = [...document.querySelectorAll('label')]; return ls.map(l => ({ t:(l.textContent||'').trim(), cls:l.className, htmlFor:l.htmlFor||null })); })()`;
rec("desktop labels", await evalOn("ref", LABELS), await evalOn("loc", LABELS));

const FIELDWRAP = `(() => { const f = document.querySelector('form div'); const wrap = document.querySelector('form')?.children; return { formChildren: [...(wrap||[])].map(c => c.tagName + ':' + (c.className||'').slice(0,80)) }; })()`;
rec("desktop form children", await evalOn("ref", FIELDWRAP), await evalOn("loc", FIELDWRAP));

// theme-inert check: the login html has no .dark and toggling storage does nothing
const THEME = `(() => ({ htmlCls: document.documentElement.className || '(none)', dark: document.documentElement.classList.contains('dark'), bg: getComputedStyle(document.body).backgroundColor })()`;
rec("desktop theme-inert", await evalOn("ref", THEME), await evalOn("loc", THEME));

// ---------------- mobile band ----------------
await openLogin("ref", baseRef, 390, 844);
await openLogin("loc", baseLoc, 390, 844);
rec("mobile card geometry", await evalOn("ref", CARD), await evalOn("loc", CARD));
rec("mobile doc + root", await evalOn("ref", DOC), await evalOn("loc", DOC));
rec("mobile inputs", await evalOn("ref", INPUTS), await evalOn("loc", INPUTS));
rec("mobile Sign in", await evalOn("ref", SIGNIN), await evalOn("loc", SIGNIN));
rec("mobile social buttons", await evalOn("ref", SOCIAL), await evalOn("loc", SOCIAL));

const sum = results.filter(r => r.match).length;
console.log(`\n${sum}/${results.length} login re-audit dimensions MATCH`);
