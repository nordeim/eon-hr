#!/usr/bin/env node
// probe-r44-login3.mjs — session-45 / parity round 44 login hover renders
// (the round-20/41 pins re-verified on the redeployed build) + the Sign in
// pressed state + the links' hover pair. Uses the recursive hover polyfill
// (v4 nests @media (hover:hover) inside @layer — the round-43 lesson).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b) { const match = JSON.stringify(a) === JSON.stringify(b); results.push({ name, match }); console.log(`${match ? "MATCH" : "DIFF "} ${name}`); if (!match) { console.log(`  ref: ${JSON.stringify(a).slice(0, 600)}`); console.log(`  loc: ${JSON.stringify(b).slice(0, 600)}`); } }

// the recursive hover polyfill (unwrap @media (hover:hover) through @layer)
const POLYFILL = `(() => { const unwrap = (node) => { for (const rule of [...node.cssRules]) { if (rule.cssRules) { if (rule.media && /hover:\\s*hover/.test(rule.media.mediaText) && rule.parentRule) { const parent = rule.parentRule; const idx = [...parent.cssRules].indexOf(rule); for (const inner of [...rule.cssRules]) parent.insertRule(inner.cssText, idx); parent.deleteRule([...parent.cssRules].indexOf(rule)); } else unwrap(rule); } } }; for (const sheet of [...document.styleSheets]) { try { unwrap(sheet); } catch (e) {} } return 'polyfilled'; })()`;

for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  await evalOn(session, POLYFILL);
}

// ---- hover reads via real pointer moves ----
async function hoverRead(session, selectorExpr, readExpr) {
  await evalOn(session, selectorExpr); // moves the pointer via el.scrollIntoView + mouseover synth
  await new Promise(r => setTimeout(r, 350));
  return evalOn(session, readExpr);
}

// social Google button hover
const gHoverSel = `(() => { const b = [...document.querySelectorAll('button')].find(b => /google/i.test(b.textContent||'')); const r = b.getBoundingClientRect(); const x = r.x + r.width/2, y = r.y + r.height/2; const el = document.elementFromPoint(x, y); el.dispatchEvent(new MouseEvent('mouseover', {bubbles:true, clientX:x, clientY:y})); el.dispatchEvent(new MouseEvent('mouseenter', {bubbles:false, clientX:x, clientY:y})); return true; })()`;
const gRead = `(() => { const b = [...document.querySelectorAll('button')].find(b => /google/i.test(b.textContent||'')); const cs = getComputedStyle(b); return { bg: cs.backgroundColor, bColor: cs.borderColor, shadow: cs.boxShadow.slice(0,80) }; })()`;
rec("google hover", await hoverRead("ref", gHoverSel, gRead), await hoverRead("loc", gHoverSel, gRead));

// Sign up link hover
const linkSel = `(() => { const a = [...document.querySelectorAll('a')].find(a => /sign up/i.test(a.textContent||'')); if (!a) return false; const r = a.getBoundingClientRect(); const el = document.elementFromPoint(r.x + r.width/2, r.y + r.height/2); el.dispatchEvent(new MouseEvent('mouseover', {bubbles:true})); return true; })()`;
const linkRead = `(() => { const a = [...document.querySelectorAll('a')].find(a => /sign up/i.test(a.textContent||'')); const cs = getComputedStyle(a); return { color: cs.color, decoration: cs.textDecorationLine }; })()`;
rec("sign up link hover", await hoverRead("ref", linkSel, linkRead), await hoverRead("loc", linkSel, linkRead));

// Sign in active/pressed read
const signinActive = `(() => { const b = [...document.querySelectorAll('button')].find(b => (b.textContent||'').trim()==='Sign in'); b.dispatchEvent(new MouseEvent('mousedown', {bubbles:true})); const cs = getComputedStyle(b); const out = { scale: cs.transform, bg: cs.backgroundColor }; b.dispatchEvent(new MouseEvent('mouseup', {bubbles:true})); return out; })()`;
rec("Sign in pressed", await evalOn("ref", signinActive), await evalOn("loc", signinActive));

// the input hover state (bg + border at hover)
const inputHover = `(() => { const i = document.querySelector('input[type=email]'); const r = i.getBoundingClientRect(); const el = document.elementFromPoint(r.x + r.width/2, r.y + r.height/2); el.dispatchEvent(new MouseEvent('mouseover', {bubbles:true})); const cs = getComputedStyle(i); return { bg: cs.backgroundColor, bColor: cs.borderColor }; })()`;
rec("email input hover", await evalOn("ref", inputHover), await evalOn("loc", inputHover));

const sum = results.filter(r => r.match).length;
console.log(`\n${sum}/${results.length} hover/press dimensions MATCH`);
