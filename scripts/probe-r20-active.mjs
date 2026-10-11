#!/usr/bin/env node
// probe-r20-active.mjs — session-21 / parity round 20: the :active (pressed)
// dimension. Real mouse-down-hold via agent-browser `mouse move/down/up`.
// Reads computed styles at rest -> hover (mouse over) -> active (button held),
// plus the element classList (recipe taxonomy ground truth).
// LOC gets the r19 hover polyfill (v4 wraps hover:* in @media (hover: hover);
// active:* rules are BARE on both sides so they apply in the probe directly).
import { execSync } from "node:child_process";

function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 160) }; } }

const POLYFILL = `(() => { if (document.getElementById('hover-probe-polyfill')) return 'already'; const chunks = []; function scan(rules) { for (const r of rules) { if (r.media && /hover:\\s*hover/.test(r.media.mediaText)) { for (const inner of r.cssRules) chunks.push(inner.cssText); } if (r.cssRules) scan(r.cssRules); } } for (const ss of document.styleSheets) { try { scan(ss.cssRules); } catch(e){} } const st = document.createElement('style'); st.id = 'hover-probe-polyfill'; st.textContent = '@layer utilities { ' + chunks.join(' ') + ' }'; document.head.appendChild(st); return 'injected:' + chunks.length; })()`;

// reader: full pressed-relevant computed dump + classList
const READER = (q) => `(() => { const el = ${q}; if (!el) return JSON.stringify({found:false}); const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return JSON.stringify({found:true, bg: cs.backgroundColor, c: cs.color, op: cs.opacity, bc: cs.borderColor, tr: cs.transform, cls: (el.className || '').toString().replace(/\\s+/g, ' ').trim()}); })()`;

async function center(session, q) {
  const out = await evalOn(session, `(() => { const el = ${q}; if (!el) return JSON.stringify(null); const r = el.getBoundingClientRect(); return JSON.stringify({x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2)}); })()`);
  return out;
}

async function measure(session, base, s, polyfill) {
  run(`agent-browser --session ${session} open "${base}${s.page}"`);
  await new Promise(r => setTimeout(r, s.settle || 3000));
  if (polyfill) run(`agent-browser --session ${session} eval ${JSON.stringify(POLYFILL)}`);
  if (s.prep) { await evalOn(session, s.prep); await new Promise(r => setTimeout(r, 1200)); }
  const pos = await center(session, s.q);
  if (!pos || !pos.x) return { err: "no-element", pos };
  const R = READER(s.q);
  const rest = await evalOn(session, R);
  run(`agent-browser --session ${session} mouse move ${pos.x} ${pos.y}`);
  await new Promise(r => setTimeout(r, s.hoverSettle || 2200));
  const hov = await evalOn(session, R);
  run(`agent-browser --session ${session} mouse down`);
  await new Promise(r => setTimeout(r, s.activeSettle || 1600));
  const act = await evalOn(session, R);
  run(`agent-browser --session ${session} mouse up`);
  run(`agent-browser --session ${session} mouse move 5 5`);
  if (s.cleanup) { await evalOn(session, s.cleanup); }
  return { pos, rest, hov, act };
}

function fmt(x, keys) { if (!x || x.error || !x.found) return JSON.stringify(x).slice(0, 80); const o = {}; for (const k of keys) if (x[k] !== undefined) o[k] = x[k]; return JSON.stringify(o); }

const K = ["bg", "c", "op"];

// surfaces: the R19 map re-probed for the active dimension
const S = [
  { page: "/dashboard", name: "sidebar INACTIVE leaf (Training LMS)", q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim()==='Training LMS' && a.offsetParent !== null)` },
  { page: "/dashboard", name: "sidebar ACTIVE leaf (Dashboard)", q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim()==='Dashboard' && a.offsetParent !== null)` },
  { page: "/dashboard", name: "sidebar GROUP button (Employees)", q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Employees' && b.offsetParent !== null)` },
  { page: "/dashboard", name: "footer bell", q: `[...document.querySelectorAll('button')].find(x => x.getAttribute('aria-label')==='Notifications')` },
  { page: "/dashboard", name: "footer moon", q: `[...document.querySelectorAll('button')].find(x => (x.getAttribute('aria-label')||'').includes('dark mode'))` },
  { page: "/dashboard", name: "quick chip (Add Employee)", q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim().startsWith('Add Employee') && a.offsetParent !== null)` },
];

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
for (const s of S) {
  console.log(`\n===== ${s.name} =====`);
  const ref = await measure("ref", baseRef, s, false);
  const loc = await measure("loc", baseLoc, s, true);
  for (const side of [["REF", ref], ["LOC", loc]]) {
    const [n, m] = side;
    if (m.err) { console.log(`${n}: ${m.err}`); continue; }
    console.log(`${n} rest ${fmt(m.rest, K)}`);
    console.log(`${n} hov  ${fmt(m.hov, K)}`);
    console.log(`${n} act  ${fmt(m.act, K)}`);
    console.log(`${n} cls  ${m.act && m.act.cls ? m.act.cls.slice(0, 220) : '?'}`);
  }
  const same = ref.act && loc.act && ref.act.bg === loc.act.bg && ref.act.c === loc.act.c && ref.act.op === loc.act.op;
  console.log(`PRESSED: ${same ? "MATCH" : "**DIFF**"}`);
}
