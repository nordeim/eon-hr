#!/usr/bin/env node
// probe-r42-login5.mjs — structural census: the parent chains of the
// or-divider / social buttons / form / title block on both apps — the
// wrapper-class question (w-full vs space-y-3) and the space-y split.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
}

// parent chain of the or-divider (up 4 levels)
const DIVIDER_CHAIN = `(() => { const chips = [...document.querySelectorAll('div')].filter(e => /^or$/i.test((e.textContent||'').trim()) && e.className.includes('my-6')); const d = chips[0]; if (!d) return {found:false}; const chain = []; let el = d; for (let i = 0; i < 4 && el; i++) { chain.push({ tag: el.tagName, cls: el.className.slice(0,90) }); el = el.parentElement; } return {found:true, chain}; })()`;
// parent chain of the first social button (up 4)
const SOCIAL_CHAIN = `(() => { const b = [...document.querySelectorAll('button')].find(x => /google/i.test(x.textContent||'')); const chain = []; let el = b; for (let i = 0; i < 4 && el; i++) { chain.push({ tag: el.tagName, cls: (el.className||'').slice(0,90) }); el = el.parentElement; } return chain; })()`;
// parent chain of the form (up 4)
const FORM_CHAIN = `(() => { const f = document.querySelector('form'); const chain = []; let el = f; for (let i = 0; i < 4 && el; i++) { chain.push({ tag: el.tagName, cls: (el.className||'').slice(0,90) }); el = el.parentElement; } return chain; })()`;
// the title wrapper + children margins (v3/v4 space-y split check)
const TITLE_CHAIN = `(() => { const h = [...document.querySelectorAll('h1,h2')].find(e => /welcome/i.test(e.textContent||'')); const wrap = h.parentElement; const p = h.nextElementSibling; const wcs = getComputedStyle(wrap); const hcs = getComputedStyle(h); const pcs = getComputedStyle(p); return { wrapCls: wrap.className, wrapDisplay: wcs.display, hMB: hcs.marginBottom, hMT: hcs.marginTop, pMT: pcs.marginTop, pMB: pcs.marginBottom, kids: wrap.children.length }; })()`;
// the w-full column + its children
const WCOL = `(() => { const w = [...document.querySelectorAll('div')].filter(d => (d.className||'').trim() === 'w-full'); return w.map(d => ({ cls: d.className, kids: [...d.children].map(c => (c.className||'').slice(0,60)) })); })()`;

for (const [name, expr] of [["divider chain", DIVIDER_CHAIN], ["social chain", SOCIAL_CHAIN], ["form chain", FORM_CHAIN], ["title wrapper", TITLE_CHAIN], ["w-full columns", WCOL]]) {
  const ref = await evalOn("ref", expr), loc = await evalOn("loc", expr);
  const match = JSON.stringify(ref) === JSON.stringify(loc);
  console.log(`${match ? "MATCH" : "DIFF "} ${name}`);
  console.log(`  ref: ${JSON.stringify(ref).slice(0, 700)}`);
  if (!match) console.log(`  loc: ${JSON.stringify(loc).slice(0, 700)}`);
}
