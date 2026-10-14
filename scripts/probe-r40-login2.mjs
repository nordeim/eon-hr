#!/usr/bin/env node
// probe-r40-login2.mjs — the login re-audit, split reads (the big single
// JSON overflows the eval pipe). Inputs / sign-in / socials / h1 / fonts.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 500) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const INPUTS = `(() => {
  const email = document.querySelector('input[type=email]');
  const pw = document.querySelector('input[type=password]');
  const cs = getComputedStyle(email);
  return { emailCls: email.className, emailH: Math.round(email.getBoundingClientRect().height), size: cs.fontSize, font: cs.fontFamily.slice(0, 60), bg: cs.backgroundColor, ph: cs.getPropertyValue('placeholder-color') !== '' ? cs.getPropertyValue('placeholder-color') : getComputedStyle(email, '::placeholder').color, pwH: Math.round(pw.getBoundingClientRect().height), pwSize: getComputedStyle(pw).fontSize, label: email.previousElementSibling ? email.previousElementSibling.className.slice(0, 120) : null };
})()`;

const FOCUS = `(() => {
  const email = document.querySelector('input[type=email]');
  email.focus();
  const cs = getComputedStyle(email);
  const r = { focusedShadow: cs.boxShadow.slice(0, 110), focusedRing: cs.getPropertyValue('--tw-ring-shadow') !== '' ? 'var-based' : 'n/a' };
  email.blur();
  return r;
})()`;

const SIGNIN = `(() => {
  const sign = [...document.querySelectorAll('button')].find(b => /^sign in$/i.test((b.textContent||'').trim()));
  const cs = getComputedStyle(sign);
  const r = sign.getBoundingClientRect();
  return { type: sign.getAttribute('type'), cls: sign.className, h: Math.round(r.height), w: Math.round(r.width), size: cs.fontSize, font: cs.fontFamily.slice(0, 60), bg: cs.backgroundColor, radius: cs.borderRadius };
})()`;

const SOCIALS = `(() => {
  const socials = [...document.querySelectorAll('button')].filter(b => /google|microsoft|apple/i.test(b.textContent || ''));
  return socials.map(b => { const r = b.getBoundingClientRect(); const ic = b.querySelector('div'); return { type: b.getAttribute('type'), cls: b.className, t: (b.textContent||'').trim().slice(0, 26), h: Math.round(r.height), size: getComputedStyle(b).fontSize, iconML: ic ? getComputedStyle(ic).marginLeft : null, iconCls: ic ? ic.className.slice(0, 90) : null }; });
})()`;

const TITLE = `(() => {
  const h1 = document.querySelector('h1');
  const sub = h1 ? h1.parentElement.querySelector('p') : null;
  const block = h1 ? h1.closest('div[class*=text-center], div[class*=space-y]') || h1.parentElement : null;
  return { h1Cls: h1 ? h1.className : null, h1T: h1 ? h1.textContent.trim().slice(0, 40) : null, h1Size: h1 ? getComputedStyle(h1).fontSize : null, h1Font: h1 ? getComputedStyle(h1).fontFamily.slice(0, 60) : null, blockCls: block ? block.className.slice(0, 140) : null, blockW: block ? Math.round(block.getBoundingClientRect().width) : null, sub: sub ? { t: sub.textContent.slice(0, 60), cls: sub.className.slice(0, 140), size: getComputedStyle(sub).fontSize, color: getComputedStyle(sub).color } : null };
})()`;

for (const [label, session, base] of [["REF", "ref", baseRef], ["LOC", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  console.log(`\n===== ${label} =====`);
  console.log("inputs:", JSON.stringify(await evalOn(session, INPUTS)));
  console.log("focus :", JSON.stringify(await evalOn(session, FOCUS)));
  console.log("signin:", JSON.stringify(await evalOn(session, SIGNIN)));
  console.log("social:", JSON.stringify(await evalOn(session, SOCIALS)));
  console.log("title :", JSON.stringify(await evalOn(session, TITLE)));
}
