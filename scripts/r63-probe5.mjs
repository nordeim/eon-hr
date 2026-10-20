#!/usr/bin/env node
// r63-probe5.mjs — the DARK-theme pairs for the round-62 fix surfaces:
// (1) shiftcalendar summary header div + assign button (dark)
// (2) recruitment AI Score th + its icon (dark)
// (3) attendance restricted h3 + ShieldAlert (dark)
// Method: set darkMode THEN navigate (the app reads it at boot).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
const wait = (ms) => new Promise(r => setTimeout(r, ms));

await evalOn("ref", `localStorage.setItem('darkMode','true')`);

// (1) shiftcalendar dark
run('agent-browser --session ref open "https://eon.base44.app/shiftcalendar"');
await wait(4200);
const s = await evalOn("ref", `(() => {
  const out = {};
  const sum = [...document.querySelectorAll('main div')].find(d => (d.textContent||'').includes('Employee Schedule Summary') && d.children.length === 0);
  out.summary = sum ? { c: getComputedStyle(sum).color, cls: (sum.getAttribute('class')||'').slice(0,70) } : 'none';
  const ab = [...document.querySelectorAll('main button')].find(b => /text-slate-300/.test(b.getAttribute('class')||''));
  out.assign = ab ? { c: getComputedStyle(ab).color, cls: (ab.getAttribute('class')||'').slice(0,80), iconCls: ab.querySelector('svg') ? (ab.querySelector('svg').getAttribute('class')||'') : null, iconC: ab.querySelector('svg') ? getComputedStyle(ab.querySelector('svg')).color : null } : 'none';
  out.dark = document.documentElement.classList.contains('dark');
  return out;
})()`, 2200);
console.log("(1) REF shiftcalendar DARK:", JSON.stringify(s));

// (2) recruitment AI Score th dark
run('agent-browser --session ref open "https://eon.base44.app/recruitment"');
await wait(4200);
const r = await evalOn("ref", `(() => {
  const th = [...document.querySelectorAll('main th')].find(t => (t.textContent||'').includes('AI Score'));
  if (!th) return 'none';
  const svg = th.querySelector('svg');
  return { thC: getComputedStyle(th).color, thCls: (th.getAttribute('class')||'').slice(0,70), svgCls: svg ? (svg.getAttribute('class')||'').slice(0,60) : null, svgC: svg ? getComputedStyle(svg).color : null, wrapCls: svg && svg.parentElement ? (svg.parentElement.getAttribute('class')||'') : null, dark: document.documentElement.classList.contains('dark') };
})()`, 2200);
console.log("(2) REF recruitment AI Score th DARK:", JSON.stringify(r));

// (3) attendance restricted h3 + icon dark
run('agent-browser --session ref open "https://eon.base44.app/attendance"');
await wait(4200);
const a = await evalOn("ref", `(() => {
  const h3 = [...document.querySelectorAll('main h3')].find(t => /restricted/i.test(t.textContent||''));
  if (!h3) return 'none';
  const card = h3.closest('div');
  const svg = h3.parentElement ? h3.parentElement.querySelector('svg') : (card ? card.querySelector('svg') : null);
  return { h3C: getComputedStyle(h3).color, h3Cls: (h3.getAttribute('class')||'').slice(0,70), svgC: svg ? getComputedStyle(svg).color : null, svgCls: svg ? (svg.getAttribute('class')||'').slice(0,60) : null, dark: document.documentElement.classList.contains('dark') };
})()`, 2200);
console.log("(3) REF attendance restricted DARK:", JSON.stringify(a));

// restore light
await evalOn("ref", `localStorage.setItem('darkMode','false')`);
process.exit(0);
