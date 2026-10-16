#!/usr/bin/env node
// probe-r44-login2.mjs — session-45 / parity round 44 login redeploy deep pass:
// (1) the failed-login Alert re-fire, (2) the transition-settled focused ring
// reads on the Sign in + inputs (the round-42 lesson), (3) the logo + icon
// geometry, (4) the links' href family, (5) the or-divider + form details.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
const press = (session, key) => run(`agent-browser --session ${session} press ${key}`);

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b) { const match = JSON.stringify(a) === JSON.stringify(b); results.push({ name, match }); console.log(`${match ? "MATCH" : "DIFF "} ${name}`); if (!match) { console.log(`  ref: ${JSON.stringify(a).slice(0, 700)}`); console.log(`  loc: ${JSON.stringify(b).slice(0, 700)}`); } }

for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
}

// ---- (1) the failed-login Alert re-fire (wrong password → shadcn Alert in form) ----
async function fireAlert(session) {
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 300));
  run(`agent-browser --session ${session} fill 'input[type=password]' 'WrongPassword123!'`);
  await new Promise(r => setTimeout(r, 300));
  // submit via Enter in the password field (works even if the button ref changes)
  run(`agent-browser --session ${session} press Enter`);
  await new Promise(r => setTimeout(r, 3500));
  return evalOn(session, `(() => { const a = [...document.querySelectorAll('[role=alert], .alert, [class*="alert"]')].find(e => e.getBoundingClientRect().width > 0); if (!a) return { found: false }; const r = a.getBoundingClientRect(); return { found: true, text: (a.textContent||'').trim().slice(0,90), cls: a.className, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), parent: a.parentElement.tagName }; })()`);
}
rec("failed-login Alert", await fireAlert("ref"), await fireAlert("loc"));

// back to a clean login state both sides
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
}

// ---- (2) the transition-settled focused ring reads ----
async function focusRead(session) {
  await evalOn(session, `(() => { const b = [...document.querySelectorAll('button')].find(b => (b.textContent||'').trim() === 'Sign in'); b.focus(); return true; })()`);
  await new Promise(r => setTimeout(r, 500)); // the 200ms transition + settle
  return evalOn(session, `(() => { const b = [...document.querySelectorAll('button')].find(b => (b.textContent||'').trim() === 'Sign in'); const cs = getComputedStyle(b); return { shadow: cs.boxShadow, outline: cs.outlineWidth + ' ' + cs.outlineStyle + ' ' + cs.outlineColor }; })()`);
}
rec("Sign in focused ring (settled)", await focusRead("ref"), await focusRead("loc"));

async function inputFocusRead(session) {
  await evalOn(session, `(() => { document.querySelector('input[type=email]').focus(); return true; })()`);
  await new Promise(r => setTimeout(r, 500));
  return evalOn(session, `(() => { const i = document.querySelector('input[type=email]'); const cs = getComputedStyle(i); return { shadow: cs.boxShadow, bColor: cs.borderColor }; })()`);
}
rec("email input focused (settled)", await inputFocusRead("ref"), await inputFocusRead("loc"));

// ---- (3) the logo + social icon geometry ----
const LOGO = `(() => { const img = document.querySelector('img[alt*="logo"], img[alt*="Eon"]'); if (!img) return {found:false}; const s = img.closest('span') || img.parentElement; const r = s.getBoundingClientRect(); const ir = img.getBoundingClientRect(); return { found:true, spanCls: s.className, spanW: Math.round(r.width), spanH: Math.round(r.height), imgW: Math.round(ir.width), imgH: Math.round(ir.height) }; })()`;
rec("logo circle geometry", await evalOn("ref", LOGO), await evalOn("loc", LOGO));

const ICONS = `(() => { const bs = [...document.querySelectorAll('button')].filter(b => /google|microsoft|apple/i.test(b.textContent||'')); return bs.map(b => { const svg = b.querySelector('svg'); const r = svg ? svg.getBoundingClientRect() : null; return { t: (b.textContent||'').trim().slice(0,10), iconX: r ? Math.round(r.x) : null, iconW: r ? Math.round(r.width) : null, labelX: Math.round(b.getBoundingClientRect().x) }; }); })()`;
rec("social icon positions", await evalOn("ref", ICONS), await evalOn("loc", ICONS));

// ---- (4) the links' href family + the Sign in type ----
const HREFS = `(() => ({ links: [...document.querySelectorAll('a')].map(a => (a.getAttribute('href')||'') + ' :: ' + (a.textContent||'').trim().slice(0,25)), signinType: [...document.querySelectorAll('button')].find(b => (b.textContent||'').trim()==='Sign in')?.type || null }))()`;
rec("links + signin type", await evalOn("ref", HREFS), await evalOn("loc", HREFS));

// ---- (5) the or-divider + the form structure detail ----
const DIVIDER = `(() => { const chip = [...document.querySelectorAll('span')].find(e => /^or$/i.test((e.textContent||'').trim())); if (!chip) return {found:false}; const wrap = chip.closest('div.relative'); return { found:true, chipCls: chip.className, wrapCls: wrap?.className || null, lineCls: wrap?.querySelector('[role=none], .h-\\\\[1px\\\\]')?.className || null }; })()`;
rec("or-divider family", await evalOn("ref", DIVIDER), await evalOn("loc", DIVIDER));

const FORM = `(() => { const f = document.querySelector('form'); return { cls: f?.className || null, childCount: f ? f.children.length : 0, firstGrandchild: f?.firstElementChild?.firstElementChild?.className?.slice(0,120) || null }; })()`;
rec("form structure", await evalOn("ref", FORM), await evalOn("loc", FORM));

const sum = results.filter(r => r.match).length;
console.log(`\n${sum}/${results.length} deep-pass dimensions MATCH`);
