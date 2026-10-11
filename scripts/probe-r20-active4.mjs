#!/usr/bin/env node
// probe-r20-active4.mjs — batch 4: CTAs + Logout menu item + settings Edit +
// staffrequests trigger + Kanban toggle. Click-safe protocol.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 160) }; } }
function findRef(session, re) { const snap = run(`agent-browser --session ${session} snapshot -i -c`); const m = snap.match(re); return m ? m[1] : null; }
const POLYFILL = `(() => { if (document.getElementById('hover-probe-polyfill')) return 'already'; const chunks = []; function scan(rules) { for (const r of rules) { if (r.media && /hover:\\s*hover/.test(r.media.mediaText)) { for (const inner of r.cssRules) chunks.push(inner.cssText); } if (r.cssRules) scan(r.cssRules); } } for (const ss of document.styleSheets) { try { scan(ss.cssRules); } catch(e){} } const st = document.createElement('style'); st.id = 'hover-probe-polyfill'; st.textContent = '@layer utilities { ' + chunks.join(' ') + ' }'; document.head.appendChild(st); return 'injected:' + chunks.length; })()`;
const READER = (q) => `(() => { const el = ${q}; if (!el) return JSON.stringify({found:false}); const cs = getComputedStyle(el); return JSON.stringify({found:true, bg: cs.backgroundColor, bgi: cs.backgroundImage.slice(0, 60), c: cs.color, op: cs.opacity, cls: (el.className || '').toString().replace(/\\s+/g, ' ').trim()}); })()`;
async function center(session, q) { return await evalOn(session, `(() => { const el = ${q}; if (!el) return JSON.stringify(null); const r = el.getBoundingClientRect(); return JSON.stringify({x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2)}); })()`); }
async function measure(session, base, s, polyfill) {
  run(`agent-browser --session ${session} open "${base}${s.page}"`);
  await new Promise(r => setTimeout(r, s.settle || 3000));
  if (polyfill) run(`agent-browser --session ${session} eval ${JSON.stringify(POLYFILL)}`);
  if (s.prepRef) { const ref = findRef(session, s.prepRef); if (ref) run(`agent-browser --session ${session} click @${ref}`); await new Promise(r => setTimeout(r, s.prepSettle || 1400)); }
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
function fmt(x, keys) { if (!x || x.error || !x.found) return JSON.stringify(x).slice(0, 90); const o = {}; for (const k of keys) if (x[k] !== undefined) o[k] = x[k]; return JSON.stringify(o); }
const K = ["bg", "bgi", "c", "op"];

const S = [
  { page: "/employees", name: "Import CSV", q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('Import CSV') && b.offsetParent !== null)` },
  { page: "/employees", name: "Add Employee CTA", q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Add Employee' && b.offsetParent !== null)` },
  { page: "/payrollmodule", name: "Generate All CTA", q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('Generate All') && b.offsetParent !== null)` },
  { page: "/taskmanager", name: "New Project CTA", q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim()==='New Project' && b.offsetParent !== null)` },
  { page: "/taskmanager", name: "Kanban toggle", q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Kanban' && b.offsetParent !== null)` },
  { page: "/settings", name: "Edit button (Company tab)", q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Edit' && b.offsetParent !== null)` },
  { page: "/staffrequests", name: "My Requests trigger", q: `(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('My Requests')); return b; })()` },
  { page: "/dashboard", name: "menu item Logout (re-verify)", prepRef: /- button "sepnetflix2023[^\"]*" \[expanded=false[^\]]*ref=(\w+)/, prepSettle: 1500, q: `[...document.querySelectorAll('[role=menuitem]')].find(m => m.textContent.trim()==='Logout')` },
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
  }
  const same = ref.act && loc.act && ref.act.bg === loc.act.bg && ref.act.bgi === loc.act.bgi && ref.act.c === loc.act.c && ref.act.op === loc.act.op;
  console.log(`PRESSED: ${same ? "MATCH" : "**DIFF**"}`);
}
