#!/usr/bin/env node
// probe-r20-login.mjs — login-page pressed states on FRESH logged-out
// sessions (locL/refL): Sign in, Google social, forgot link, signup link.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 160) }; } }
const POLYFILL = `(() => { if (document.getElementById('hover-probe-polyfill')) return 'already'; const chunks = []; function scan(rules) { for (const r of rules) { if (r.media && /hover:\\s*hover/.test(r.media.mediaText)) { for (const inner of r.cssRules) chunks.push(inner.cssText); } if (r.cssRules) scan(r.cssRules); } } for (const ss of document.styleSheets) { try { scan(ss.cssRules); } catch(e){} } const st = document.createElement('style'); st.id = 'hover-probe-polyfill'; st.textContent = '@layer utilities { ' + chunks.join(' ') + ' }'; document.head.appendChild(st); return 'injected:' + chunks.length; })()`;
const READER = (q) => `(() => { const el = ${q}; if (!el) return JSON.stringify({found:false}); const cs = getComputedStyle(el); return JSON.stringify({found:true, bg: cs.backgroundColor, c: cs.color, ul: cs.textDecorationLine, sh: cs.boxShadow.slice(0, 60), op: cs.opacity}); })()`;
async function center(session, q) { return await evalOn(session, `(() => { const el = ${q}; if (!el) return JSON.stringify(null); const r = el.getBoundingClientRect(); return JSON.stringify({x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2)}); })()`); }
async function measure(session, base, s, polyfill) {
  run(`agent-browser --session ${session} open "${base}${s.page}"`);
  await new Promise(r => setTimeout(r, s.settle || 3000));
  if (polyfill) run(`agent-browser --session ${session} eval ${JSON.stringify(POLYFILL)}`);
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
function fmt(x) { if (!x || x.error || !x.found) return JSON.stringify(x ? x : null).slice(0, 90); return JSON.stringify({ bg: x.bg, c: x.c, ul: x.ul, sh: x.sh }); }

const S = [
  { page: "/login", name: "Sign in button", q: `(() => { return [...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Sign in'); })()` },
  { page: "/login", name: "Google social", q: `(() => { return [...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Continue with Google'); })()` },
  { page: "/login", name: "forgot link", q: `(() => { return [...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Forgot password?'); })()` },
  { page: "/login", name: "signup link", q: `(() => { return [...document.querySelectorAll('button, a')].find(b => b.textContent.trim().includes('Sign up')); })()` },
];
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
for (const s of S) {
  console.log(`\n===== ${s.name} =====`);
  const ref = await measure("refL", baseRef, s, false);
  const loc = await measure("locL", baseLoc, s, true);
  console.log(`REF rest ${fmt(ref.rest)}\nREF hov  ${fmt(ref.hov)}\nREF act  ${fmt(ref.act)}`);
  console.log(`LOC rest ${fmt(loc.rest)}\nLOC hov  ${fmt(loc.hov)}\nLOC act  ${fmt(loc.act)}`);
  const same = ref.act && loc.act && ref.act.bg === loc.act.bg && ref.act.c === loc.act.c && ref.act.ul === loc.act.ul;
  console.log(`PRESSED: ${same ? "MATCH" : "**DIFF**"}`);
}
