#!/usr/bin/env node
// probe-r19-hover3.mjs — round-19 hover audit part 3: remaining desktop
// surfaces (search input, staffrequests pill, green CTA payrollmodule,
// taskmanager CTAs). LOC pages get the hover polyfill.
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 140);
  }
}
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
  } catch {
    return { error: out.slice(0, 200) };
  }
}
function findRef(session, re) {
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const m = snap.match(re);
  return m ? m[1] : null;
}
const POLYFILL = `(() => { if (document.getElementById('hover-probe-polyfill')) return 'already'; const chunks = []; function scan(rules) { for (const r of rules) { if (r.media && r.media.mediaText === '(hover: hover)') { for (const inner of r.cssRules) chunks.push(inner.cssText); } if (r.cssRules) scan(r.cssRules); } } for (const ss of document.styleSheets) { try { scan(ss.cssRules); } catch(e){} } const st = document.createElement('style'); st.id = 'hover-probe-polyfill'; st.textContent = '@layer utilities { ' + chunks.join(' ') + ' }'; document.head.appendChild(st); return 'injected:' + chunks.length; })()`;
const reader = (q) =>
  `(() => { const el = ${q}; if (!el) return JSON.stringify({found:false}); const cs = getComputedStyle(el); ` +
  `return JSON.stringify({found:true, bg: cs.backgroundColor, bgi: cs.backgroundImage, c: cs.color, bc: cs.borderColor, ul: cs.textDecorationLine, op: cs.opacity, sh: cs.boxShadow}); })()`;

async function measure(session, base, s, polyfill) {
  run(`agent-browser --session ${session} open "${base}${s.page}"`);
  await new Promise(r => setTimeout(r, s.settle || 2600));
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
function short(x) {
  if (!x) return "NULL";
  if (x.error) return "EVAL-ERR:" + x.error.slice(0, 50);
  if (!x.found) return "NOT-FOUND";
  const bgi = x.bgi === "none" ? "-" : x.bgi.replace(/linear-gradient\(to right/g, "LG(toR").replace(/linear-gradient\(90deg/g, "LG(90").slice(0, 55);
  return `bg=${x.bg} ${bgi !== "-" ? bgi + " " : ""}c=${x.c} bc=${x.bc} op=${x.op}`;
}

const S = [];
S.push({ page: "/employees", name: "search-input",
  refRe: /- textbox [^[]*\[ref=(\w+)\]/,
  q: `document.querySelector('input[placeholder]')` });
S.push({ page: "/staffrequests", name: "pill-trigger",
  refRe: /- (?:tab|button) "[^"]*My Requests[^"]*"\[[^\]]*ref=(\w+)\]/,
  q: `[...document.querySelectorAll('[role=tab]')].find(t => t.textContent.includes('My Requests') && t.offsetParent !== null)` });
S.push({ page: "/staffrequests", name: "pill-second-trigger",
  refRe: /- (?:tab|button) "[^"]*All[^"]*Requests[^"]*"\[[^\]]*ref=(\w+)\]/,
  q: `[...document.querySelectorAll('[role=tab]')].find(t => /all/i.test(t.textContent) && t.offsetParent !== null)` });
S.push({ page: "/payrollmodule", name: "generate-all-green-cta",
  refRe: /- button "Generate All"[^\[]*\[ref=(\w+)\]/,
  q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('Generate All') && b.offsetParent !== null)` });
S.push({ page: "/taskmanager", name: "new-project-btn",
  refRe: /- button "New Project"[^\[]*\[ref=(\w+)\]/,
  q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('New Project') && b.offsetParent !== null)` });

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
for (const s of S) {
  const loc = await measure("loc", baseLoc, s, true);
  const ref = await measure("ref", baseRef, s, false);
  const same = loc.rest && ref.rest && loc.hov && ref.hov && !loc.rest.error && !ref.rest.error &&
    JSON.stringify(loc.rest) === JSON.stringify(ref.rest) && JSON.stringify(loc.hov) === JSON.stringify(ref.hov);
  console.log(`\n== ${s.page} :: ${s.name} ==`);
  console.log(`REF rest: ${short(ref.rest)}\nREF hov : ${short(ref.hov)}`);
  console.log(`LOC rest: ${short(loc.rest)}\nLOC hov : ${short(loc.hov)}`);
  console.log(same ? "MATCH" : "**CHECK**");
}
console.log("\nHOVER-DESKTOP-V3-DONE");
