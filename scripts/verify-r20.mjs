#!/usr/bin/env node
// verify-r20.mjs — live dual-browser verification of the session-21 pressed
// fixes. LOC pages get the hover polyfill. Every fixed surface re-pressed:
// group (collapsed) pressed, EXPANDED group hover + press, inactive leaf +
// sub-item pressed, active leaf pressed (blue bg + #18181B text), active
// bottom tab bg pill. Click-safe protocol.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 160) }; } }
function findRef(session, re) { const snap = run(`agent-browser --session ${session} snapshot -i -c`); const m = snap.match(re); return m ? m[1] : null; }
const POLYFILL = `(() => new Promise((resolve) => {
  if (window.__hoverPolyV2) return resolve('already');
  window.__hoverPolyV2 = true;
  /* v2 (session 21): unwrap @media (hover: hover) blocks IN PLACE (fetch each
     same-origin stylesheet, brace-match the media blocks, splice out the
     wrappers, replace the <link> with a <style> at the same DOM position).
     The r19 polyfill appended a second @layer utilities block at the end,
     which moved hover rules AFTER active: rules and broke the pressed-state
     cascade under the probe; on real desktops the original order stands. */
  function unwrap(txt) {
    let out = txt, idx = 0;
    while (true) {
      let i = -1;
      for (const m of ['@media (hover:hover)', '@media (hover: hover)']) {
        const p = out.indexOf(m, idx);
        if (p >= 0 && (i < 0 || p < i)) { i = p; }
      }
      if (i < 0) break;
      const b0 = out.indexOf('{', i);
      let depth = 0, j = b0;
      for (; j < out.length; j++) {
        if (out[j] === '{') depth++;
        else if (out[j] === '}') { depth--; if (depth === 0) break; }
      }
      const inner = out.slice(b0 + 1, j);
      out = out.slice(0, i) + inner + out.slice(j + 1);
      idx = i + inner.length;
    }
    return out;
  }
  const links = [...document.querySelectorAll('link[rel=stylesheet]')];
  let n = links.length;
  if (!n) return resolve('no-links');
  let replaced = 0;
  links.forEach((link) => {
    fetch(link.href).then((r) => r.text()).then((txt) => {
      if (txt.includes('(hover:hover)') || txt.includes('(hover: hover)')) {
        const st = document.createElement('style');
        st.setAttribute('data-hover-polyfill', 'v2');
        st.textContent = unwrap(txt);
        link.replaceWith(st);
        replaced++;
      }
    }).catch(() => {}).finally(() => { if (--n === 0) resolve('replaced:' + replaced); });
  });
}))()`;
const READER = (q) => `(() => { const el = ${q}; if (!el) return JSON.stringify({found:false}); const cs = getComputedStyle(el); return JSON.stringify({found:true, bg: cs.backgroundColor, c: cs.color, op: cs.opacity}); })()`;
async function center(session, q) { return await evalOn(session, `(() => { const el = ${q}; if (!el) return JSON.stringify(null); const r = el.getBoundingClientRect(); return JSON.stringify({x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2)}); })()`); }
async function ensureLocAuth() {
  const p = await evalOn("loc", "location.pathname");
  if (p === "/login" || p === '"/login"') {
    run(`agent-browser --session loc fill 'input[type=email]' "sepnetflix2023@outlook.com"`);
    run(`agent-browser --session loc fill 'input[type=password]' "$Abcd1234"`);
    run(`agent-browser --session loc click 'button[type=submit]'`);
    await new Promise(r => setTimeout(r, 2500));
  }
}
async function measure(session, base, s, polyfill) {
  run(`agent-browser --session ${session} set viewport ${s.vw || 1440} ${s.vh || 900}`);
  run(`agent-browser --session ${session} open "${base}${s.page}"`);
  await new Promise(r => setTimeout(r, 3200));
  if (polyfill) { const p = await evalOn(session, POLYFILL, 400); if (p && p.error) console.log('polyfill-err', JSON.stringify(p).slice(0, 80)); }
  if (s.prepRef) { const ref = findRef(session, s.prepRef); if (ref) run(`agent-browser --session ${session} click @${ref}`); await new Promise(r => setTimeout(r, s.prepSettle || 1500)); }
  if (s.prepEval) { await evalOn(session, s.prepEval); await new Promise(r => setTimeout(r, 1400)); }
  const pos = await center(session, s.q);
  if (!pos || !pos.x) return { err: "no-element" };
  const R = READER(s.q);
  const rest = await evalOn(session, R);
  run(`agent-browser --session ${session} mouse move ${pos.x} ${pos.y}`);
  await new Promise(r => setTimeout(r, 2200));
  const hov = await evalOn(session, R);
  run(`agent-browser --session ${session} mouse down`);
  await new Promise(r => setTimeout(r, 1600));
  const act = await evalOn(session, R);
  run(`agent-browser --session ${session} mouse move 5 5`);
  await new Promise(r => setTimeout(r, 120));
  run(`agent-browser --session ${session} mouse up`);
  return { rest, hov, act };
}
function fmt(x) { if (!x || x.error || !x.found) return JSON.stringify(x ? x : null).slice(0, 80); return JSON.stringify({ bg: x.bg, c: x.c, op: x.op }); }

const S = [
  { page: "/dashboard", name: "R20-A group button PRESSED (expect zinc-100/#18181B)", q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Employees' && b.offsetParent !== null)`, keys: ["bg", "c"] },
  { page: "/dashboard", name: "R20-E EXPANDED group hover (expect zinc-100/#18181B)", prepEval: `(() => { const g = [...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Employees' && b.offsetParent !== null); if (g) g.click(); return 'x'; })()`, q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Employees' && b.offsetParent !== null)` },
  { page: "/dashboard", name: "R20-C inactive leaf PRESSED (expect zinc-100/#18181B/0.8)", q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim()==='Training LMS' && a.offsetParent !== null)` },
  { page: "/dashboard", name: "R20-D active leaf PRESSED (expect blue bg + #18181B text)", q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim()==='Dashboard' && a.offsetParent !== null)` },
  { page: "/dashboard", name: "R20-C sub-item PRESSED (group expanded)", prepEval: `(() => { const g = [...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Employees' && b.offsetParent !== null); if (g) g.click(); return 'x'; })()`, q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim()==='All Employees' && a.offsetParent !== null)` },
  { page: "/dashboard", name: "regression: bell pressed (expect #F5F5F5/#171717)", q: `(() => { return [...document.querySelectorAll('button')].find(b => { const r = b.getBoundingClientRect(); return r.y > 750 && r.x < 50 && Math.round(r.width) === 36 && b.offsetParent !== null; }) || [...document.querySelectorAll('button')].find(x => x.getAttribute('aria-label')==='Notifications'); })()` },
];
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
let pass = 0, total = 0;
for (const s of S) {
  console.log(`\n===== ${s.name} =====`);
  await ensureLocAuth();
  const loc = await measure("loc", baseLoc, s, true);
  const ref = await measure("ref", baseRef, s, false);
  console.log(`REF rest ${fmt(ref.rest)}\nREF hov  ${fmt(ref.hov)}\nREF act  ${fmt(ref.act)}`);
  console.log(`LOC rest ${fmt(loc.rest)}\nLOC hov  ${fmt(loc.hov)}\nLOC act  ${fmt(loc.act)}`);
  total++;
  const ok = ref.act && loc.act && ref.act.bg === loc.act.bg && ref.act.c === loc.act.c && ref.act.op === loc.act.op;
  if (ok) pass++;
  console.log(`PRESSED: ${ok ? "MATCH" : "**DIFF**"}`);
}

// R20-B bottom tab pill (mobile viewport, rest state)
console.log(`\n===== R20-B active bottom tab pill (390x844, rest) =====`);
await ensureLocAuth();
run(`agent-browser --session loc set viewport 390 844`);
run(`agent-browser --session loc open "${baseLoc}/dashboard"`);
await new Promise(r => setTimeout(r, 3000));
const locTab = await evalOn("loc", `(() => { const a = [...document.querySelectorAll('a')].find(x => x.textContent.trim()==='Home' && x.getBoundingClientRect().y > 700); const cs = getComputedStyle(a); return JSON.stringify({bg: cs.backgroundColor, c: cs.color}); })()`);
run(`agent-browser --session ref set viewport 390 844`);
run(`agent-browser --session ref open "${baseRef}/dashboard"`);
await new Promise(r => setTimeout(r, 3000));
const refTab = await evalOn("ref", `(() => { const a = [...document.querySelectorAll('a')].find(x => x.textContent.trim()==='Home' && x.getBoundingClientRect().y > 700); const cs = getComputedStyle(a); return JSON.stringify({bg: cs.backgroundColor, c: cs.color}); })()`);
console.log(`REF ${JSON.stringify(refTab)}\nLOC ${JSON.stringify(locTab)}`);
total++;
if (refTab.bg === locTab.bg && refTab.c === locTab.c) pass++;
console.log(`PILL: ${refTab.bg === locTab.bg && refTab.c === locTab.c ? "MATCH" : "**DIFF**"}`);
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc set viewport 1440 900`);
console.log(`\n${pass}/${total} MATCH`);
