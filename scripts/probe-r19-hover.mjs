#!/usr/bin/env node
// probe-r19-hover.mjs — round-19 hover/active-state parity audit (the third
// interaction dimension): real agent-browser hovers (CDP mouse moves trigger
// the :hover pseudo-class) on the key interactive surfaces, reading computed
// backgroundColor/backgroundImage/color/borderColor/textDecoration/opacity
// at rest AND under hover, on BOTH apps. Flattened one-line evals (agent-
// browser does not un-escape JSON args); // comments and literal \n kill
// one-lined evals — flatten first.
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
    return { error: out.slice(0, 160) };
  }
}

function findRef(session, re) {
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const m = snap.match(re);
  return m ? m[1] : null;
}

// style reader — takes a one-line DOM query that resolves to the element
const reader = (q) =>
  `(() => { const el = ${q}; if (!el) return JSON.stringify({found:false}); const cs = getComputedStyle(el); ` +
  `return JSON.stringify({found:true, bg: cs.backgroundColor, bgi: cs.backgroundImage.split(")").slice(0,2).join(")").slice(0,72), ` +
  `c: cs.color, bc: cs.borderColor, bw: cs.borderTopWidth, ul: cs.textDecorationLine, op: cs.opacity, sh: cs.boxShadow.slice(0,72)}); })()`;

// read styles: rest → hover → rest-after (mouseleave reset check)
async function measure(session, base, s) {
  run(`agent-browser --session ${session} open "${base}${s.page}"`);
  await new Promise(r => setTimeout(r, s.settle || 2600));
  const ref = findRef(session, s.refRe);
  if (!ref) return { err: "no-ref" };
  const R = reader(s.q);
  const rest = await evalOn(session, R);
  run(`agent-browser --session ${session} hover @${ref}`);
  await new Promise(r => setTimeout(r, 700));
  const hov = await evalOn(session, R);
  return { rest, hov };
}

function fmt(x) {
  if (!x || x.error) return "ERR";
  if (!x.found) return "NOT-FOUND";
  return `bg=${x.bg} bgi=${x.bgi === "none" ? "-" : x.bgi.slice(0, 36)} c=${x.c} bc=${x.bc} ul=${x.ul} op=${x.op}`;
}

// ---- surface definitions ------------------------------------------------
const S = [];

// /dashboard @1440 — sidebar + footer chrome
S.push({ page: "/dashboard", name: "sidebar-active-leaf",
  refRe: /- link "Dashboard" \[ref=(\w+)\]/,
  q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim()==='Dashboard' && a.offsetParent !== null)` });
S.push({ page: "/dashboard", name: "sidebar-inactive-leaf",
  refRe: /- link "Training LMS" \[ref=(\w+)\]/,
  q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim()==='Training LMS' && a.offsetParent !== null)` });
S.push({ page: "/dashboard", name: "sidebar-group-btn",
  refRe: /- button "Employees"[^[]*\[ref=(\w+)\]/,
  q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('Employees') && b.offsetParent !== null && !b.closest('[data-radix-popper-content-wrapper]') && b.getBoundingClientRect().x < 260)` });
S.push({ page: "/dashboard", name: "bell-btn",
  refRe: /- button "Notifications"[^[]*\[ref=(\w+)\]/,
  q: `[...document.querySelectorAll('button')].find(b => (b.getAttribute('aria-label')==='Notifications' || b.textContent.trim()==='Notifications') && b.offsetParent !== null && b.getBoundingClientRect().x < 300)` });
S.push({ page: "/dashboard", name: "moon-btn",
  refRe: /- button "Switch to dark mode"[^[]*\[ref=(\w+)\]/,
  q: `[...document.querySelectorAll('button')].find(b => (b.getAttribute('aria-label')||'').includes('dark mode') && b.offsetParent !== null)` });
S.push({ page: "/dashboard", name: "arabic-btn",
  refRe: /- button "عربي"[^[]*\[ref=(\w+)\]/,
  q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim().includes('عربي') && b.offsetParent !== null)` });
S.push({ page: "/dashboard", name: "user-btn",
  refRe: /- button "sepnetflix2023 sepnetflix2023@outlook\.com"[^[]*\[ref=(\w+)\]/,
  q: `[...document.querySelectorAll('button')].find(b => b.textContent.includes('sepnetflix2023@outlook.com') && b.offsetParent !== null)` });
S.push({ page: "/dashboard", name: "quick-chip-request-leave",
  refRe: /- link "Request Leave" \[ref=(\w+)\]/,
  q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim()==='Request Leave' && a.offsetParent !== null)` });
S.push({ page: "/dashboard", name: "view-all-link",
  refRe: /- link "View all" \[ref=(\w+)\]/,
  q: `[...document.querySelectorAll('a')].find(a => a.textContent.trim()==='View all' && a.offsetParent !== null)` });

// /employees @1440 — buttons + input
S.push({ page: "/employees", name: "import-csv-outline-btn",
  refRe: /- button "Import CSV"[^[]*\[ref=(\w+)\]/,
  q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('Import CSV') && b.offsetParent !== null)` });
S.push({ page: "/employees", name: "add-employee-cta",
  refRe: /- button "Add Employee"[^[]*\[ref=(\w+)\]/,
  q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('Add Employee') && b.offsetParent !== null)` });
S.push({ page: "/employees", name: "search-input",
  refRe: /- textbox [^[]*\[ref=(\w+)\]/,
  q: `document.querySelector('input[placeholder*="Search"], input[type=search], input[placeholder*="search"]')` });

// /settings @1440 — tab triggers + edit button
S.push({ page: "/settings", name: "company-tab-trigger",
  refRe: /- tab "Company"[^[]*\[ref=(\w+)\]/,
  q: `[...document.querySelectorAll('[role=tab]')].find(t => t.textContent.trim()==='Company' && t.offsetParent !== null)` });
S.push({ page: "/settings", name: "edit-btn",
  refRe: /- button "Edit"[^[]*\[ref=(\w+)\]/,
  q: `[...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Edit' && b.offsetParent !== null)` });

// /staffrequests @1440 — the white pill triggers
S.push({ page: "/staffrequests", name: "staffreq-pill-trigger",
  refRe: /- (?:tab|button) "[^"]*My Requests[^"]*"[^[]*\[ref=(\w+)\]/,
  q: `[...document.querySelectorAll('[role=tab]')].find(t => t.textContent.includes('My Requests') && t.offsetParent !== null)` });

// ---- run -----------------------------------------------------------------
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
run(`agent-browser --session loc set viewport 1440 900`);
run(`agent-browser --session ref set viewport 1440 900`);

for (const s of S) {
  const loc = await measure("loc", baseLoc, s);
  const ref = await measure("ref", baseRef, s);
  const same =
    loc.rest && ref.rest && loc.hov && ref.hov &&
    JSON.stringify(loc.rest) === JSON.stringify(ref.rest) &&
    JSON.stringify(loc.hov) === JSON.stringify(ref.hov);
  console.log(`\n== ${s.page} :: ${s.name} ==`);
  console.log(`REF rest: ${fmt(ref.rest)}`);
  console.log(`REF hov : ${fmt(ref.hov)}`);
  console.log(`LOC rest: ${fmt(loc.rest)}`);
  console.log(`LOC hov : ${fmt(loc.hov)}`);
  console.log(same ? "MATCH" : "**CHECK**");
}
console.log("\nHOVER-DESKTOP-DONE");
