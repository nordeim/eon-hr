#!/usr/bin/env node
// verify-r19.mjs — live dual-browser verification of the session-20 hover
// fixes. LOC pages get the (hover: hover) polyfill. Every fixed surface is
// compared rest + settled-hover (2.5s) against REF.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
function findRef(session, re) { const snap = run(`agent-browser --session ${session} snapshot -i -c`); const m = snap.match(re); return m ? m[1] : null; }
const POLYFILL = `(() => { if (document.getElementById('hover-probe-polyfill')) return 'already'; const chunks = []; function scan(rules) { for (const r of rules) { if (r.media && r.media.mediaText === '(hover: hover)') { for (const inner of r.cssRules) chunks.push(inner.cssText); } if (r.cssRules) scan(r.cssRules); } } for (const ss of document.styleSheets) { try { scan(ss.cssRules); } catch(e){} } const st = document.createElement('style'); st.id = 'hover-probe-polyfill'; st.textContent = '@layer utilities { ' + chunks.join(' ') + ' }'; document.head.appendChild(st); return 'ok'; })()`;
const reader = (q) => `(() => { const el = ${q}; if (!el) return JSON.stringify({found:false}); const cs = getComputedStyle(el); return JSON.stringify({found:true, bg: cs.backgroundColor, c: cs.color, bc: cs.borderColor, ul: cs.textDecorationLine, op: cs.opacity, sh: cs.boxShadow}); })()`;

async function measure(session, base, s, polyfill) {
  run(`agent-browser --session ${session} open "${base}${s.page}"`);
  await new Promise(r => setTimeout(r, s.settle || 2800));
  if (polyfill) run(`agent-browser --session ${session} eval ${JSON.stringify(POLYFILL)}`);
  const ref = findRef(session, s.refRe);
  if (!ref) return { err: "no-ref" };
  const R = reader(s.q);
  const rest = await evalOn(session, R);
  run(`agent-browser --session ${session} hover @${ref}`);
  await new Promise(r => setTimeout(r, 2500));
  const hov = await evalOn(session, R);
  return { rest, hov };
}
function pick(x, keys) { if (!x || x.error || !x.found) return x ? JSON.stringify(x).slice(0, 60) : "NULL"; const o = {}; for (const k of keys) if (x[k] !== undefined) o[k] = x[k]; return JSON.stringify(o); }

const K = ["bg", "c", "bc", "ul", "op"];
const S = [
  { page: "/dashboard", name: "R19-A/B active-leaf", refRe: /- link "Dashboard" \[[^\]]*ref=(\w+)/, q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim()==='Dashboard' && a.offsetParent !== null)`, keys: ["bg", "c", "op"] },
  { page: "/dashboard", name: "R19-A inactive-leaf", refRe: /- link "Training LMS" \[[^\]]*ref=(\w+)/, q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim()==='Training LMS' && a.offsetParent !== null)`, keys: ["bg", "c", "op"] },
  { page: "/dashboard", name: "R19-C bell (button+svg)", refRe: /- button "Notifications" \[[^\]]*ref=(\w+)/, q: `(() => { const b = [...document.querySelectorAll('button')].find(x => x.getAttribute('aria-label')==='Notifications'); return b; })()`, keys: ["bg", "c"] },
  { page: "/dashboard", name: "R19-C2 moon", refRe: /- button "Switch to dark mode" \[[^\]]*ref=(\w+)/, q: `[...document.querySelectorAll('button')].find(x => (x.getAttribute('aria-label')||'').includes('dark mode'))`, keys: ["bg", "c"] },
  { page: "/employees", name: "R19-F import-csv", refRe: /- button "Import CSV" \[[^\]]*ref=(\w+)/, q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('Import CSV') && b.offsetParent !== null)`, keys: ["bg", "c", "bc"] },
];
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
let pass = 0, total = 0;
for (const s of S) {
  const loc = await measure("loc", baseLoc, s, true);
  const ref = await measure("ref", baseRef, s, false);
  const same = loc.rest && ref.rest && loc.hov && ref.hov && !loc.rest.error && !ref.rest.error &&
    JSON.stringify(loc.rest) === JSON.stringify(ref.rest) && JSON.stringify(loc.hov) === JSON.stringify(ref.hov);
  total++;
  if (same) pass++;
  console.log(`\n== ${s.name} == ${same ? "MATCH" : "**DIFF**"}`);
  console.log(`REF rest ${pick(ref.rest, s.keys)}\nREF hov  ${pick(ref.hov, s.keys)}`);
  console.log(`LOC rest ${pick(loc.rest, s.keys)}\nLOC hov  ${pick(loc.hov, s.keys)}`);
}

// R19-C bell SVG color under hover (must STAY slate-600)
async function bellSvg(session, base, polyfill) {
  run(`agent-browser --session ${session} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 2800));
  if (polyfill) run(`agent-browser --session ${session} eval ${JSON.stringify(POLYFILL)}`);
  const ref = findRef(session, /- button "Notifications" \[[^\]]*ref=(\w+)/);
  run(`agent-browser --session ${session} hover @${ref}`);
  await new Promise(r => setTimeout(r, 2500));
  return evalOn(session, reader(`(() => { const b = [...document.querySelectorAll('button')].find(x => x.getAttribute('aria-label')==='Notifications'); return b.querySelector('svg'); })()`));
}
const refSvg = await bellSvg("ref", baseRef, false);
const locSvg = await bellSvg("loc", baseLoc, true);
const svgSame = JSON.stringify(refSvg) === JSON.stringify(locSvg);
total++; if (svgSame) pass++;
console.log(`\n== R19-C bell SVG under hover == ${svgSame ? "MATCH" : "**DIFF**"}\nREF ${pick(refSvg, ["c"])}\nLOC ${pick(locSvg, ["c"])}`);

// R19-L user menu items (open + hover)
async function menuItems(session, base, polyfill) {
  run(`agent-browser --session ${session} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 2800));
  if (polyfill) run(`agent-browser --session ${session} eval ${JSON.stringify(POLYFILL)}`);
  const ub = findRef(session, /- button "sepnetflix2023 sepnetflix2023@outlook\.com" \[[^\]]*ref=(\w+)/);
  run(`agent-browser --session ${session} click @${ub}`);
  await new Promise(r => setTimeout(r, 1600));
  const items = {};
  for (const label of ["My Profile", "Logout"]) {
    const mref = findRef(session, new RegExp(`- menuitem "${label}" \\[[^\\]]*ref=(\\w+)`));
    if (!mref) { items[label] = "no-ref"; continue; }
    run(`agent-browser --session ${session} hover @${mref}`);
    await new Promise(r => setTimeout(r, 2000));
    items[label] = await evalOn(session, reader(`[...document.querySelectorAll('[role=menuitem]')].find(x => x.textContent.trim()==='${label}' && x.offsetParent !== null)`));
  }
  return items;
}
const refMenu = await menuItems("ref", baseRef, false);
const locMenu = await menuItems("loc", baseLoc, true);
const menuSame = JSON.stringify(refMenu) === JSON.stringify(locMenu);
total++; if (menuSame) pass++;
console.log(`\n== R19-L menu items under hover == ${menuSame ? "MATCH" : "**DIFF**"}\nREF ${JSON.stringify(refMenu).slice(0, 260)}\nLOC ${JSON.stringify(locMenu).slice(0, 260)}`);

// R19-D user name span at rest
async function nameSpan(session, base) {
  run(`agent-browser --session ${session} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 2800));
  return evalOn(session, reader(`(() => { const ub = [...document.querySelectorAll('button')].find(b => b.textContent.includes('sepnetflix2023@outlook.com')); return ub.querySelector('p'); })()`));
}
const refName = await nameSpan("ref", baseRef);
const locName = await nameSpan("loc", baseLoc);
const nameSame = refName.c === locName.c;
total++; if (nameSame) pass++;
console.log(`\n== R19-D user name span == ${nameSame ? "MATCH" : "**DIFF**"}\nREF ${pick(refName, ["c"])}\nLOC ${pick(locName, ["c"])}`);

// R19-G placeholder
async function placeholder(session, base) {
  run(`agent-browser --session ${session} open "${base}/staffrequests"`);
  await new Promise(r => setTimeout(r, 2800));
  return evalOn(session, `document.querySelector('input[placeholder]').placeholder`);
}
const refPh = await placeholder("ref", baseRef);
const locPh = await placeholder("loc", baseLoc);
const phSame = refPh === locPh;
total++; if (phSame) pass++;
console.log(`\n== R19-G placeholder == ${phSame ? "MATCH" : "**DIFF**"}\nREF ${JSON.stringify(refPh)}\nLOC ${JSON.stringify(locPh)}`);

console.log(`\nVERIFY-DESKTOP: ${pass}/${total} MATCH`);
