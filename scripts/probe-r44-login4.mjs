#!/usr/bin/env node
// probe-r44-login4.mjs — session-45 / parity round 44: (1) the full card
// DOM tree pair (the round-43 tree-pair method, login-scoped), (2) the
// social buttons' keyboard-focused ring renders (they precede the email
// input in tab order), (3) the logo group-hover renders.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
const press = (session, key) => run(`agent-browser --session ${session} press ${key}`);

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b) { const match = JSON.stringify(a) === JSON.stringify(b); results.push({ name, match }); console.log(`${match ? "MATCH" : "DIFF "} ${name}`); if (!match) { console.log(`  ref: ${JSON.stringify(a).slice(0, 800)}`); console.log(`  loc: ${JSON.stringify(b).slice(0, 800)}`); } }

for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
}

// ---- (1) the card DOM tree pair ----
const TREE = `(() => { const card = document.querySelector('main form')?.closest('div.rounded-2xl') || document.querySelector('.rounded-2xl'); const lines = []; const walk = (el, d) => { const r = el.getBoundingClientRect(); const tag = el.tagName.toLowerCase(); const cls = (el.className && typeof el.className === 'string') ? el.className : ''; lines.push('  '.repeat(d) + tag + (cls ? ' [' + cls.slice(0,100) + ']' : '') + (r.width ? ' w' + Math.round(r.width) + ' h' + Math.round(r.height) : '')); for (const c of [...el.children].slice(0, 40)) walk(c, d+1); }; walk(card, 0); return lines.join('\\n'); })()`;
const refTree = await evalOn("ref", TREE), locTree = await evalOn("loc", TREE);
rec("card DOM tree", refTree, locTree);

// ---- (2) the social buttons' keyboard-focused rings ----
async function socialFocus(session) {
  await press(session, "Tab"); await press(session, "Tab"); await press(session, "Tab"); // Google (1st tabbable in card after logo? measure directly)
  await new Promise(r => setTimeout(r, 600));
  return evalOn(session, `(() => { const el = document.activeElement; const cs = getComputedStyle(el); return { tag: el.tagName, txt: (el.textContent||'').trim().slice(0,16), fv: el.matches(':focus-visible'), shadow: cs.boxShadow.slice(0,120), outline: cs.outlineWidth + ' ' + cs.outlineStyle }; })()`);
}
rec("3rd-Tab focused element (Google?)", await socialFocus("ref"), await socialFocus("loc"));

// ---- (3) the logo group-hover renders (glow + circle shadow) ----
const LOGOHOVER = `(() => { const img = document.querySelector('img[alt*="logo"]'); const circle = img.closest('span'); const glow = circle.parentElement.querySelector('div.absolute'); const r = circle.getBoundingClientRect(); const el = document.elementFromPoint(r.x + r.width/2, r.y + r.height/2); el.dispatchEvent(new MouseEvent('mouseover', {bubbles:true})); const cg = getComputedStyle(glow), cc = getComputedStyle(circle); return { glowOpacity: cg.opacity, glowTransition: cg.transitionProperty + ' ' + cg.transitionDuration, circleShadow: cc.boxShadow.slice(0,80), circleTransition: cc.transitionProperty }; })()`;
rec("logo group-hover", await evalOn("ref", LOGOHOVER), await evalOn("loc", LOGOHOVER));

const sum = results.filter(r => r.match).length;
console.log(`\n${sum}/${results.length} dimensions MATCH`);
