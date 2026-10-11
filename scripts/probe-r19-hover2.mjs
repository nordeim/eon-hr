#!/usr/bin/env node
// probe-r19-hover2.mjs — round-19 hover-parity audit v2 (fixed):
//  - injects a PROBE-SIDE CSS polyfill on LOC pages that unwraps Tailwind v4's
//    @media (hover: hover) rules into @layer utilities (the probe browser
//    reports hover:none, so v4 hover variants never apply headless — REF is
//    v3-era and unwrapped, hence the asymmetry). Real desktops match the media
//    query, so the polyfill only restores probe parity; it never ships.
//  - single-quoted browser JS ONLY (double quotes break execSync sh escaping)
//  - fixed snapshot regexes ([expanded=false, ref=eN] form)
//  - geometry queries for REF's unnamed bell/moon buttons
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

// the hover polyfill — unwrap @media (hover: hover) rules into @layer utilities
const POLYFILL = `(() => { if (document.getElementById('hover-probe-polyfill')) return 'already'; const chunks = []; function scan(rules) { for (const r of rules) { if (r.media && r.media.mediaText === '(hover: hover)') { for (const inner of r.cssRules) chunks.push(inner.cssText); } if (r.cssRules) scan(r.cssRules); } } for (const ss of document.styleSheets) { try { scan(ss.cssRules); } catch(e){} } const st = document.createElement('style'); st.id = 'hover-probe-polyfill'; st.textContent = '@layer utilities { ' + chunks.join(' ') + ' }'; document.head.appendChild(st); return 'injected:' + chunks.length; })()`;

const reader = (q) =>
  `(() => { const el = ${q}; if (!el) return JSON.stringify({found:false}); const cs = getComputedStyle(el); ` +
  `return JSON.stringify({found:true, bg: cs.backgroundColor, bgi: cs.backgroundImage, ` +
  `c: cs.color, bc: cs.borderColor, ul: cs.textDecorationLine, op: cs.opacity, sh: cs.boxShadow}); })()`;

async function measure(session, base, s, polyfill) {
  run(`agent-browser --session ${session} open "${base}${s.page}"`);
  await new Promise(r => setTimeout(r, s.settle || 2600));
  if (polyfill) run(`agent-browser --session ${session} eval ${JSON.stringify(POLYFILL)}`);
  const ref = findRef(session, s.refRe);
  if (!ref) return { err: "no-ref" };
  const R = reader(s.q);
  const rest = await evalOn(session, R);
  run(`agent-browser --session ${session} hover @${ref}`);
  await new Promise(r => setTimeout(r, 750));
  const hov = await evalOn(session, R);
  return { rest, hov };
}

function short(x) {
  if (!x) return "NULL";
  if (x.error) return "EVAL-ERR:" + x.error.slice(0, 60);
  if (!x.found) return "NOT-FOUND";
  const bgi = x.bgi === "none" ? "-" : x.bgi.replace(/linear-gradient\(to right/g, "LG(toR").replace(/linear-gradient\(90deg/g, "LG(90").slice(0, 58);
  return `bg=${x.bg} ${bgi !== "-" ? bgi + " " : ""}c=${x.c} bc=${x.bc} ul=${x.ul} op=${x.op}`;
}

const S = [];
// /dashboard @1440 — sidebar chrome
S.push({ page: "/dashboard", name: "sidebar-active-leaf",
  refRe: /- link "Dashboard" \[[^\]]*ref=(\w+)/,
  q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim()==='Dashboard' && a.offsetParent !== null)` });
S.push({ page: "/dashboard", name: "sidebar-inactive-leaf",
  refRe: /- link "Training LMS" \[[^\]]*ref=(\w+)/,
  q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim()==='Training LMS' && a.offsetParent !== null)` });
S.push({ page: "/dashboard", name: "sidebar-group-btn",
  refRe: /- button "Employees" \[[^\]]*ref=(\w+)/,
  q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('Employees') && b.offsetParent !== null && b.getBoundingClientRect().x < 260)` });
S.push({ page: "/dashboard", name: "bell-btn (geometry)",
  refRe: /- button \[expanded=false, ref=(\w+)\]/,
  q: `[...document.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(); return b.offsetParent !== null && r.y > 700 && r.x < 240 && r.width < 60; })[0]` });
S.push({ page: "/dashboard", name: "moon-btn (geometry)",
  refRe: /- button \[ref=(\w+)\]/,
  q: `[...document.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(); return b.offsetParent !== null && r.y > 700 && r.x < 240 && r.width < 60; })[1]` });
S.push({ page: "/dashboard", name: "arabic-btn",
  refRe: /- button "عربي" \[[^\]]*ref=(\w+)/,
  q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim().includes('عربي') && b.offsetParent !== null)` });
S.push({ page: "/dashboard", name: "user-btn",
  refRe: /- button "sepnetflix2023 sepnetflix2023@outlook\.com" \[[^\]]*ref=(\w+)/,
  q: `[...document.querySelectorAll('button')].find(b => b.textContent.includes('sepnetflix2023@outlook.com') && b.offsetParent !== null)` });
S.push({ page: "/dashboard", name: "customize-btn",
  refRe: /- button "Customize" \[[^\]]*ref=(\w+)/,
  q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Customize' && b.offsetParent !== null)` });
S.push({ page: "/dashboard", name: "quick-chip-request-leave",
  refRe: /- link "Request Leave" \[[^\]]*ref=(\w+)/,
  q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim()==='Request Leave' && a.offsetParent !== null)` });
S.push({ page: "/dashboard", name: "view-all-link",
  refRe: /- link "View all" \[[^\]]*ref=(\w+)/,
  q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim()==='View all' && a.offsetParent !== null)` });

// /employees @1440
S.push({ page: "/employees", name: "import-csv-btn",
  refRe: /- button "Import CSV" \[[^\]]*ref=(\w+)/,
  q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('Import CSV') && b.offsetParent !== null)` });
S.push({ page: "/employees", name: "add-employee-cta",
  refRe: /- button "Add Employee" \[[^\]]*ref=(\w+)/,
  q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('Add Employee') && b.offsetParent !== null)` });
S.push({ page: "/employees", name: "search-input",
  refRe: /- textbox \[[^\]]*ref=(\w+)/,
  q: `document.querySelector('input[placeholder]')` });

// /settings @1440
S.push({ page: "/settings", name: "company-tab-trigger",
  refRe: /- tab "Company" \[[^\]]*ref=(\w+)/,
  q: `[...document.querySelectorAll('[role=tab]')].find(t => t.textContent.trim()==='Company' && t.offsetParent !== null)` });
S.push({ page: "/settings", name: "edit-btn",
  refRe: /- button "Edit" \[[^\]]*ref=(\w+)/,
  q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Edit' && b.offsetParent !== null)` });

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
run(`agent-browser --session loc set viewport 1440 900`);
run(`agent-browser --session ref set viewport 1440 900`);

for (const s of S) {
  const loc = await measure("loc", baseLoc, s, true);
  const ref = await measure("ref", baseRef, s, false);
  const same =
    loc.rest && ref.rest && loc.hov && ref.hov && !loc.rest.error && !ref.rest.error &&
    JSON.stringify(loc.rest) === JSON.stringify(ref.rest) &&
    JSON.stringify(loc.hov) === JSON.stringify(ref.hov);
  console.log(`\n== ${s.page} :: ${s.name} ==`);
  console.log(`REF rest: ${short(ref.rest)}`);
  console.log(`REF hov : ${short(ref.hov)}`);
  console.log(`LOC rest: ${short(loc.rest)}`);
  console.log(`LOC hov : ${short(loc.hov)}`);
  console.log(same ? "MATCH" : "**CHECK**");
}
console.log("\nHOVER-DESKTOP-V2-DONE");
