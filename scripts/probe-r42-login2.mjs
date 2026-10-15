#!/usr/bin/env node
// probe-r42-login2.mjs — session-43 / round 42 follow-up: full class strings,
// the title-block margin question, the ring token value, and the CSS delta.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
}

// full class strings — email input
for (const s of ["ref", "loc"]) {
  const cls = await evalOn(s, `(() => document.querySelector('input[type=email]')?.className || 'NONE' )()`);
  console.log(`[${s}] email input FULL class:\n  ${cls}`);
}
console.log("");
// full class strings — Sign in button
for (const s of ["ref", "loc"]) {
  const cls = await evalOn(s, `(() => [...document.querySelectorAll('button')].find(b => (b.textContent||'').trim() === 'Sign in')?.className || 'NONE' )()`);
  console.log(`[${s}] Sign in FULL class:\n  ${cls}`);
}
console.log("");
// password input classes
for (const s of ["ref", "loc"]) {
  const cls = await evalOn(s, `(() => document.querySelector('input[type=password]')?.className || 'NONE' )()`);
  console.log(`[${s}] password FULL class:\n  ${cls}`);
}
console.log("");
// title block + next sibling spacing
for (const s of ["ref", "loc"]) {
  const t = await evalOn(s, `(() => { const h = [...document.querySelectorAll('h1,h2')].find(e => /welcome/i.test(e.textContent||'')); if (!h) return {found:false}; const cs = getComputedStyle(h); const next = h.nextElementSibling; const ncs = next ? getComputedStyle(next) : null; const hr = h.getBoundingClientRect(); const nr = next ? next.getBoundingClientRect() : null; return { found:true, t:(h.textContent||'').trim(), hCls:h.className.slice(0,120), hMB:cs.marginBottom, nextTag: next?.tagName, nextCls: next?.className.slice(0,120), nextMT: ncs?.marginTop, nextMB: ncs?.marginBottom, gap: nr ? Math.round(nr.y - (hr.y + hr.height)) : null, nextH: nr ? Math.round(nr.height) : null }; })()`);
  console.log(`[${s}] title block: ${JSON.stringify(t)}`);
}
console.log("");
// what element follows the title (text content)
for (const s of ["ref", "loc"]) {
  const t = await evalOn(s, `(() => { const h = [...document.querySelectorAll('h1,h2')].find(e => /welcome/i.test(e.textContent||'')); const next = h?.nextElementSibling; return { nextText: (next?.textContent||'').trim().slice(0,80), nextNext: (next?.nextElementSibling?.textContent||'').trim().slice(0,40) }; })()`);
  console.log(`[${s}] after title: ${JSON.stringify(t)}`);
}
console.log("");
// the --ring token + focused ring color (computed on focus)
for (const s of ["ref", "loc"]) {
  const ring = await evalOn(s, `(() => { const root = getComputedStyle(document.documentElement); const btn = [...document.querySelectorAll('button')].find(b => (b.textContent||'').trim() === 'Sign in'); return { ringVar: root.getPropertyValue('--ring').trim(), cardFgVar: root.getPropertyValue('--card-foreground').trim(), signRingClass: btn?.className.includes('ring-ring') ? 'ring-ring-token' : (btn?.className.match(/ring-\\[[^\\]]+\\]/) || ['none'])[0] }; })()`);
  console.log(`[${s}] tokens: ${JSON.stringify(ring)}`);
}
console.log("");
// doc scrollHeight desktop
for (const s of ["ref", "loc"]) {
  const d = await evalOn(s, `(() => ({ docH: document.documentElement.scrollHeight })()`);
  console.log(`[${s}] desktop docH: ${JSON.stringify(d)}`);
}
