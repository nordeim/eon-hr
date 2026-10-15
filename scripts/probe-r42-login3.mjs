#!/usr/bin/env node
// probe-r42-login3.mjs — full class strings (object-wrapped evals), the
// doc scrollHeight, and the input focus-ring rendering under focus.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
}

// full class strings — object wrapped
const probes = {
  "email input": `(() => { const i = document.querySelector('input[type=email]'); return { cls: i?.className || 'NONE', w: i ? Math.round(i.getBoundingClientRect().width) : null }; })()`,
  "password input": `(() => { const i = document.querySelector('input[type=password]'); return { cls: i?.className || 'NONE', w: i ? Math.round(i.getBoundingClientRect().width) : null }; })()`,
  "Sign in button": `(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent||'').trim() === 'Sign in'); return { cls: b?.className || 'NONE' }; })()`,
  "subtitle p": `(() => { const h = [...document.querySelectorAll('h1,h2')].find(e => /welcome/i.test(e.textContent||'')); const p = h?.nextElementSibling; return { cls: p?.className || 'NONE', mt: p ? getComputedStyle(p).marginTop : null }; })()`,
  "title h1": `(() => { const h = [...document.querySelectorAll('h1,h2')].find(e => /welcome/i.test(e.textContent||'')); return { cls: h?.className || 'NONE', mb: h ? getComputedStyle(h).marginBottom : null }; })()`,
  "docH": `(() => ({ docH: document.documentElement.scrollHeight })()`.replace("})()", "}))()"),
  "logo img": `(() => { const img = document.querySelector('img[alt*="logo"], img[alt*="Eon"]'); return { src: img?.src.split('/').pop(), w: img ? Math.round(img.getBoundingClientRect().width) : null, cls: img?.className || 'NONE' }; })()`,
  "remember/extra row": `(() => { const cb = document.querySelector('input[type=checkbox]'); return { hasCheckbox: !!cb, cbCls: cb?.className?.slice(0,120) || null, label: cb?.closest('label')?.textContent?.trim().slice(0,30) || null }; })()`,
};
for (const [name, expr] of Object.entries(probes)) {
  const ref = await evalOn("ref", expr);
  const loc = await evalOn("loc", expr);
  const match = JSON.stringify(ref) === JSON.stringify(loc);
  console.log(`${match ? "MATCH" : "DIFF "} ${name}`);
  console.log(`  ref: ${JSON.stringify(ref)}`);
  if (!match) console.log(`  loc: ${JSON.stringify(loc)}`);
}

// focused ring rendering — focus the Sign in button via CDP and read the ring
console.log("\n--- focus ring rendering (keyboard focus on Sign in) ---");
for (const s of ["ref", "loc"]) {
  const r = await evalOn(s, `(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent||'').trim() === 'Sign in'); if (!b) return {found:false}; b.focus(); const cs = getComputedStyle(b); return { found:true, shadow: cs.boxShadow, outline: cs.outlineStyle + ' ' + cs.outlineWidth, outlineColor: cs.outlineColor }; })()`);
  console.log(`[${s}] Sign in focused: ${JSON.stringify(r)}`);
}
// focused email input ring
for (const s of ["ref", "loc"]) {
  const r = await evalOn(s, `(() => { const i = document.querySelector('input[type=email]'); i.focus(); const cs = getComputedStyle(i); return { shadow: cs.boxShadow, outline: cs.outlineStyle + ' ' + cs.outlineWidth }; })()`);
  console.log(`[${s}] email focused: ${JSON.stringify(r)}`);
}
