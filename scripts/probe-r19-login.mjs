#!/usr/bin/env node
// probe-r19-login.mjs — round-19 hover audit: the LOGIN page (logged-out
// surface) on fresh sessions locL/refL. LOC gets the hover polyfill.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
function findRef(session, re) { const snap = run(`agent-browser --session ${session} snapshot -i -c`); const m = snap.match(re); return m ? m[1] : null; }
const POLYFILL = `(() => { if (document.getElementById('hover-probe-polyfill')) return 'already'; const chunks = []; function scan(rules) { for (const r of rules) { if (r.media && r.media.mediaText === '(hover: hover)') { for (const inner of r.cssRules) chunks.push(inner.cssText); } if (r.cssRules) scan(r.cssRules); } } for (const ss of document.styleSheets) { try { scan(ss.cssRules); } catch(e){} } const st = document.createElement('style'); st.id = 'hover-probe-polyfill'; st.textContent = '@layer utilities { ' + chunks.join(' ') + ' }'; document.head.appendChild(st); return 'ok'; })()`;
const reader = (q) => `(() => { const el = ${q}; if (!el) return JSON.stringify({found:false}); const cs = getComputedStyle(el); return JSON.stringify({found:true, bg: cs.backgroundColor, bgi: cs.backgroundImage, c: cs.color, bc: cs.borderColor, ul: cs.textDecorationLine, op: cs.opacity, sh: cs.boxShadow}); })()`;

async function measure(session, base, s, polyfill) {
  run(`agent-browser --session ${session} open "${base}${s.page}"`);
  await new Promise(r => setTimeout(r, 2600));
  if (polyfill) run(`agent-browser --session ${session} eval ${JSON.stringify(POLYFILL)}`);
  const ref = findRef(session, s.refRe);
  if (!ref) return { err: "no-ref" };
  const R = reader(s.q);
  const rest = await evalOn(session, R);
  run(`agent-browser --session ${session} hover @${ref}`);
  await new Promise(r => setTimeout(r, 2000));
  const hov = await evalOn(session, R);
  return { rest, hov };
}
function short(x) { if (!x) return "NULL"; if (x.error) return "EVAL-ERR"; if (!x.found) return "NOT-FOUND"; return `bg=${x.bg} c=${x.c} bc=${x.bc} ul=${x.ul} sh=${(x.sh || "-").slice(0, 44)}`; }

const S = [
  { page: "/login", name: "google-social-btn",
    refRe: /- button "Google"[^\[]*\[ref=(\w+)/,
    q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Google' && b.offsetParent !== null)` },
  { page: "/login", name: "microsoft-social-btn",
    refRe: /- button "Microsoft"[^\[]*\[ref=(\w+)/,
    q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Microsoft' && b.offsetParent !== null)` },
  { page: "/login", name: "sign-in-btn",
    refRe: /- button "Sign in"[^\[]*\[ref=(\w+)/,
    q: `[...document.querySelectorAll('button[type=submit], button').find(b => b.textContent.trim()==='Sign in')` },
  { page: "/login", name: "forgot-password-link",
    refRe: /- link "Forgot password\?"[^\[]*\[ref=(\w+)/,
    q: `[...document.querySelectorAll('a')].find(a => /forgot/i.test(a.textContent) && a.offsetParent !== null)` },
  { page: "/login", name: "create-account-link",
    refRe: /- link "Create one"[^\[]*\[ref=(\w+)/,
    q: `[...document.querySelectorAll('a')].find(a => /create/i.test(a.textContent) && a.offsetParent !== null)` },
];

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
run(`agent-browser --session locL set viewport 1440 900`);
run(`agent-browser --session refL set viewport 1440 900`);
for (const s of S) {
  const loc = await measure("locL", baseLoc, s, true);
  const ref = await measure("refL", baseRef, s, false);
  const same = loc.rest && ref.rest && loc.hov && ref.hov && !loc.rest.error && !ref.rest.error &&
    JSON.stringify(loc.rest) === JSON.stringify(ref.rest) && JSON.stringify(loc.hov) === JSON.stringify(ref.hov);
  console.log(`\n== /login :: ${s.name} ==`);
  console.log(`REF rest: ${short(ref.rest)}\nREF hov : ${short(ref.hov)}`);
  console.log(`LOC rest: ${short(loc.rest)}\nLOC hov : ${short(loc.hov)}`);
  console.log(same ? "MATCH" : "**CHECK**");
}
console.log("\nHOVER-LOGIN-DONE");
