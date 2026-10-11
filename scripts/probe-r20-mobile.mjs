#!/usr/bin/env node
// probe-r20-mobile.mjs — mobile pressed states @390×844: hamburger, bottom
// tabs (Home + Staff), drawer link (Training LMS), drawer group button.
// Click-safe protocol (move away before mouse up). NO polyfill on LOC for
// the drawer-link touch story check (v4 hover rules are media-wrapped —
// measuring what the press genuinely changes on each side).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 160) }; } }
function findRef(session, re) { const snap = run(`agent-browser --session ${session} snapshot -i -c`); const m = snap.match(re); return m ? m[1] : null; }
const READER = (q) => `(() => { const el = ${q}; if (!el) return JSON.stringify({found:false}); const cs = getComputedStyle(el); return JSON.stringify({found:true, bg: cs.backgroundColor, c: cs.color, op: cs.opacity, cls: (el.className || '').toString().replace(/\\s+/g, ' ').trim()}); })()`;
async function center(session, q) { return await evalOn(session, `(() => { const el = ${q}; if (!el) return JSON.stringify(null); const r = el.getBoundingClientRect(); return JSON.stringify({x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2)}); })()`); }

async function measure(session, base, s) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open "${base}${s.page}"`);
  await new Promise(r => setTimeout(r, 3200));
  if (s.openDrawer) {
    const ref = findRef(session, s.openDrawer);
    if (ref) run(`agent-browser --session ${session} click @${ref}`);
    await new Promise(r => setTimeout(r, 1400));
  }
  const pos = await center(session, s.q);
  if (!pos || !pos.x) return { err: "no-element" };
  const R = READER(s.q);
  const rest = await evalOn(session, R);
  run(`agent-browser --session ${session} mouse move ${pos.x} ${pos.y}`);
  await new Promise(r => setTimeout(r, 2000));
  const hov = await evalOn(session, R);
  run(`agent-browser --session ${session} mouse down`);
  await new Promise(r => setTimeout(r, 1500));
  const act = await evalOn(session, R);
  run(`agent-browser --session ${session} mouse move 5 5`);
  await new Promise(r => setTimeout(r, 120));
  run(`agent-browser --session ${session} mouse up`);
  return { rest, hov, act };
}
function fmt(x) { if (!x || x.error || !x.found) return JSON.stringify(x ? x : null).slice(0, 90); return JSON.stringify({ bg: x.bg, c: x.c, op: x.op }); }

// hamburger via snapshot (REF's carries no aria-label — r17 lesson)
const S = [
  { page: "/dashboard", name: "hamburger (mobile)", openDrawer: /- button "Toggle Sidebar" \[[^\]]*ref=(\w+)/, drawerClose: true, q: `(() => { const b = [...document.querySelectorAll('button')].find(x => (x.getAttribute('aria-label')||'') === 'Toggle Sidebar' || (x.querySelector('svg.lucide-menu') && x.getBoundingClientRect().y < 100)); return b; })()` },
  { page: "/dashboard", name: "bottom tab Home", q: `(() => { const a = [...document.querySelectorAll('a')].find(x => x.textContent.trim()==='Home' && x.getBoundingClientRect().y > 700); return a; })()` },
  { page: "/dashboard", name: "bottom tab Staff (inactive)", q: `(() => { const a = [...document.querySelectorAll('a')].find(x => x.textContent.trim()==='Staff' && x.getBoundingClientRect().y > 700); return a; })()` },
  { page: "/dashboard", name: "drawer link Training LMS", openDrawer: /- button "Toggle Sidebar" \[[^\]]*ref=(\w+)/, q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim()==='Training LMS' && a.getBoundingClientRect().x < 300)` },
  { page: "/dashboard", name: "drawer group button Employees", openDrawer: /- button "Toggle Sidebar" \[[^\]]*ref=(\w+)/, q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Employees' && b.getBoundingClientRect().x < 300 && b.getBoundingClientRect().y > 200)` },
];

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
// auto-reauth guard for the LOC session (documented Secure-cookie flake)
async function ensureLocAuth() {
  const p = await evalOn("loc", "location.pathname");
  if (p === "/login" || p === '"/login"') {
    run(`agent-browser --session loc fill 'input[type=email]' "sepnetflix2023@outlook.com"`);
    run(`agent-browser --session loc fill 'input[type=password]' "$Abcd1234"`);
    run(`agent-browser --session loc click 'button[type=submit]'`);
    await new Promise(r => setTimeout(r, 2500));
  }
}
for (const s of S) {
  console.log(`\n===== ${s.name} =====`);
  const ref = await measure("ref", baseRef, s);
  await ensureLocAuth();
  const loc = await measure("loc", baseLoc, s);
  console.log(`REF rest ${fmt(ref.rest)}\nREF hov  ${fmt(ref.hov)}\nREF act  ${fmt(ref.act)}`);
  console.log(`LOC rest ${fmt(loc.rest)}\nLOC hov  ${fmt(loc.hov)}\nLOC act  ${fmt(loc.act)}`);
  const same = ref.act && loc.act && ref.act.bg === loc.act.bg && ref.act.c === loc.act.c && ref.act.op === loc.act.op;
  console.log(`PRESSED: ${same ? "MATCH" : "**DIFF**"}`);
  console.log(`REF cls ${(ref.act && ref.act.cls || '').slice(0, 170)}`);
  console.log(`LOC cls ${(loc.act && loc.act.cls || '').slice(0, 170)}`);
}
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc set viewport 1440 900`);
