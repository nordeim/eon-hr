#!/usr/bin/env node
// probe-r20-active2.mjs — batch 2: footer buttons (geometry-located on REF),
// sub-items (group expanded first), عربي, user trigger, dropdown menu items,
// quick chips (inner-div query), and CTAs. Same rest->hover->active protocol.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 160) }; } }
const POLYFILL = `(() => { if (document.getElementById('hover-probe-polyfill')) return 'already'; const chunks = []; function scan(rules) { for (const r of rules) { if (r.media && /hover:\\s*hover/.test(r.media.mediaText)) { for (const inner of r.cssRules) chunks.push(inner.cssText); } if (r.cssRules) scan(r.cssRules); } } for (const ss of document.styleSheets) { try { scan(ss.cssRules); } catch(e){} } const st = document.createElement('style'); st.id = 'hover-probe-polyfill'; st.textContent = '@layer utilities { ' + chunks.join(' ') + ' }'; document.head.appendChild(st); return 'injected:' + chunks.length; })()`;
const READER = (q) => `(() => { const el = ${q}; if (!el) return JSON.stringify({found:false}); const cs = getComputedStyle(el); return JSON.stringify({found:true, bg: cs.backgroundColor, c: cs.color, op: cs.opacity, bc: cs.borderColor, cls: (el.className || '').toString().replace(/\\s+/g, ' ').trim()}); })()`;

async function center(session, q) {
  return await evalOn(session, `(() => { const el = ${q}; if (!el) return JSON.stringify(null); const r = el.getBoundingClientRect(); return JSON.stringify({x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2)}); })()`);
}
async function measure(session, base, s, polyfill) {
  run(`agent-browser --session ${session} open "${base}${s.page}"`);
  await new Promise(r => setTimeout(r, s.settle || 3000));
  if (polyfill) run(`agent-browser --session ${session} eval ${JSON.stringify(POLYFILL)}`);
  if (s.prep) { await evalOn(session, s.prep); await new Promise(r => setTimeout(r, s.prepSettle || 1500)); }
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
  run(`agent-browser --session ${session} mouse up`);
  run(`agent-browser --session ${session} mouse move 5 5`);
  return { rest, hov, act };
}
function fmt(x, keys) { if (!x || x.error || !x.found) return JSON.stringify(x).slice(0, 80); const o = {}; for (const k of keys) if (x[k] !== undefined) o[k] = x[k]; return JSON.stringify(o); }
const K = ["bg", "c", "op"];

// geometry-located footer button finder (REF's bell/moon lack aria-labels):
// 36x36 buttons inside the sidebar footer (last border-top cluster)
const FOOT36 = `(() => { const btns = [...document.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(); return Math.round(r.width) === 36 && Math.round(r.height) === 36 && r.x < 260 && r.y > 600 && b.offsetParent !== null; }); return btns; })`;

const S = [
  { page: "/dashboard", name: "footer bell (36px, geometry)", q: `(() => { const btns = ${FOOT36}; return btns.find(b => b.querySelector('svg') && (b.textContent||'').trim()===''); })()` },
  { page: "/dashboard", name: "footer moon (36px, geometry)", q: `(() => { const btns = ${FOOT36}; return btns[1] || btns[btns.length-1]; })()` },
  { page: "/dashboard", name: "arabic toggle", q: `[...document.querySelectorAll('button')].find(b => (b.textContent||'').trim() === String.fromCharCode(1593,1585,1576,1610) && b.offsetParent !== null)` },
  { page: "/dashboard", name: "user trigger", q: `(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('sepnetflix') || (x.querySelector('svg.lucide-circle-user'))); return b; })()` },
  { page: "/dashboard", name: "SUB-ITEM (All Employees, group expanded)", prep: `(() => { const g = [...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Employees' && b.offsetParent !== null); if (g) g.click(); return 'clicked'; })()`, prepSettle: 1600, q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim()==='All Employees' && a.offsetParent !== null)` },
  { page: "/dashboard", name: "dropdown item My Profile (menu open)", prep: `(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('sepnetflix')); if (b) b.click(); return 'clicked'; })()`, prepSettle: 1400, q: `[...document.querySelectorAll('[role=menuitem]')].find(m => m.textContent.trim()==='My Profile')` },
  { page: "/dashboard", name: "dropdown item Logout (menu open)", prep: `(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('sepnetflix')); if (b) b.click(); return 'clicked'; })()`, prepSettle: 1400, q: `[...document.querySelectorAll('[role=menuitem]')].find(m => m.textContent.trim()==='Logout')` },
  { page: "/dashboard", name: "quick chip inner (Add Employee)", q: `(() => { const a = [...document.querySelectorAll('a')].find(x => x.textContent.trim().includes('Add Employee') && x.offsetParent !== null); return a ? (a.querySelector('div') || a) : null; })()` },
  { page: "/employees", name: "Import CSV", q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('Import CSV') && b.offsetParent !== null)` },
  { page: "/employees", name: "Add Employee CTA", q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Add Employee' && b.offsetParent !== null)` },
  { page: "/payrollmodule", name: "Generate All CTA", q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('Generate All') && b.offsetParent !== null)` },
  { page: "/taskmanager", name: "New Project CTA", q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim()==='New Project' && b.offsetParent !== null)` },
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
    console.log(`${n} cls  ${m.act && m.act.cls ? m.act.cls.slice(0, 200) : '?'}`);
  }
  const same = ref.act && loc.act && ref.act.bg === loc.act.bg && ref.act.c === loc.act.c && ref.act.op === loc.act.op;
  console.log(`PRESSED: ${same ? "MATCH" : "**DIFF**"}`);
}
