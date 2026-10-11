#!/usr/bin/env node
// probe-r20-active3.mjs — batch 3 (click-safe protocol: mouse move AWAY
// before mouse up so no click fires on the probed element). Covers: REF
// footer bell/moon (geometry y>750), quick chips (Submit Request inner div),
// sub-items (group expanded via REAL agent-browser click), dropdown menu
// items (menu opened via REAL click on the trigger), plus a re-verify of the
// group button with the safe protocol.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 160) }; } }
function findRef(session, re) { const snap = run(`agent-browser --session ${session} snapshot -i -c`); const m = snap.match(re); return m ? m[1] : null; }
const POLYFILL = `(() => { if (document.getElementById('hover-probe-polyfill')) return 'already'; const chunks = []; function scan(rules) { for (const r of rules) { if (r.media && /hover:\\s*hover/.test(r.media.mediaText)) { for (const inner of r.cssRules) chunks.push(inner.cssText); } if (r.cssRules) scan(r.cssRules); } } for (const ss of document.styleSheets) { try { scan(ss.cssRules); } catch(e){} } const st = document.createElement('style'); st.id = 'hover-probe-polyfill'; st.textContent = '@layer utilities { ' + chunks.join(' ') + ' }'; document.head.appendChild(st); return 'injected:' + chunks.length; })()`;
const READER = (q) => `(() => { const el = ${q}; if (!el) return JSON.stringify({found:false}); const cs = getComputedStyle(el); return JSON.stringify({found:true, bg: cs.backgroundColor, c: cs.color, op: cs.opacity, cls: (el.className || '').toString().replace(/\\s+/g, ' ').trim()}); })()`;

async function center(session, q) {
  return await evalOn(session, `(() => { const el = ${q}; if (!el) return JSON.stringify(null); const r = el.getBoundingClientRect(); return JSON.stringify({x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2)}); })()`);
}
// click-safe: move away BEFORE mouse up (no click lands on the element)
async function measure(session, base, s, polyfill) {
  run(`agent-browser --session ${session} open "${base}${s.page}"`);
  await new Promise(r => setTimeout(r, s.settle || 3000));
  if (polyfill) run(`agent-browser --session ${session} eval ${JSON.stringify(POLYFILL)}`);
  if (s.prepRef) {
    const ref = findRef(session, s.prepRef);
    if (ref) run(`agent-browser --session ${session} click @${ref}`);
    await new Promise(r => setTimeout(r, s.prepSettle || 1400));
  }
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
function fmt(x, keys) { if (!x || x.error || !x.found) return JSON.stringify(x).slice(0, 80); const o = {}; for (const k of keys) if (x[k] !== undefined) o[k] = x[k]; return JSON.stringify(o); }
const K = ["bg", "c", "op"];

const S = [
  { page: "/dashboard", name: "group button (safe protocol)", q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Employees' && b.offsetParent !== null)` },
  { page: "/dashboard", name: "footer bell (y>750 geometry)", q: `(() => { return [...document.querySelectorAll('button')].find(b => { const r = b.getBoundingClientRect(); return r.y > 750 && r.x < 50 && Math.round(r.width) === 36 && b.offsetParent !== null; }); })()` },
  { page: "/dashboard", name: "footer moon (y>750 geometry)", q: `(() => { return [...document.querySelectorAll('button')].find(b => { const r = b.getBoundingClientRect(); return r.y > 750 && r.x >= 50 && r.x < 100 && Math.round(r.width) === 36 && b.offsetParent !== null; }); })()` },
  { page: "/dashboard", name: "quick chip Submit Request (inner div)", q: `(() => { const a = [...document.querySelectorAll('a')].find(x => x.textContent.trim()==='Submit Request' && x.offsetParent !== null); return a ? (a.querySelector('div') || a) : null; })()` },
  { page: "/dashboard", name: "View all link", q: `(() => { const a = [...document.querySelectorAll('a')].find(x => x.textContent.trim()==='View all' && x.offsetParent !== null); return a ? (a.querySelector('div') || a) : null; })()` },
  { page: "/dashboard", name: "SUB-ITEM All Employees (real-click expand)", prepRef: /- button "Employees" \[expanded=false[^\]]*ref=(\w+)/, prepSettle: 1600, q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim()==='All Employees' && a.offsetParent !== null)` },
  { page: "/dashboard", name: "menu item My Profile (real-click open)", prepRef: /- button "sepnetflix2023[^\"]*" \[expanded=false[^\]]*ref=(\w+)/, prepSettle: 1500, q: `[...document.querySelectorAll('[role=menuitem]')].find(m => m.textContent.trim()==='My Profile')` },
  { page: "/dashboard", name: "menu item Logout (real-click open)", prepRef: /- button "sepnetflix2023[^\"]*" \[expanded=false[^\]]*ref=(\w+)/, prepSettle: 1500, q: `[...document.querySelectorAll('[role=menuitem]')].find(m => m.textContent.trim()==='Logout')` },
];

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
for (const s of S) {
  console.log(`\n===== ${s.name} =====`);
  const ref = await measure("ref", baseRef, s, false);
  const loc = await measure("loc", baseLoc, s, true);
  for (const [n, m] of [["REF", ref], ["LOC", loc]]) {
    if (m.err) { console.log(`${n}: ${m.err}`); continue; }
    console.log(`${n} rest ${fmt(m.rest, K)}`);
    console.log(`${n} hov  ${fmt(m.hov, K)}`);
    console.log(`${n} act  ${fmt(m.act, K)}`);
    console.log(`${n} cls  ${m.act && m.act.cls ? m.act.cls.slice(0, 190) : '?'}`);
  }
  const same = ref.act && loc.act && ref.act.bg === loc.act.bg && ref.act.c === loc.act.c && ref.act.op === loc.act.op;
  console.log(`PRESSED: ${same ? "MATCH" : "**DIFF**"}`);
}
