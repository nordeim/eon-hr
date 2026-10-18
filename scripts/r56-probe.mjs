#!/usr/bin/env node
// r56-probe.mjs — session-56 reconnaissance: pin the DOM contracts the
// history-journey census needs on BOTH sides:
//   1. the sidebar active-leaf marker (aria-current / data-active / color)
//   2. the scrolling element (window vs the overflow container)
//   3. the drawer's data-state carrier
//   4. the settings tab structure
//   5. what back/forward do to URL + active leaf (a first smoke)
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const settle = (ms) => new Promise(r => setTimeout(r, ms));
function evalStr(expr) { return JSON.stringify(expr.split("\n").join(" ")); }
async function ev(session, expr) {
  const out = run(`agent-browser --session ${session} eval ${evalStr(expr)}`);
  try { return JSON.parse(JSON.parse(out.trim())); } catch { return "ERR:" + out.slice(0, 300); }
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// 1) the sidebar active-leaf markers — dump every desktop-sidebar link
//    with its attributes + computed color
const SIDEBAR = `JSON.stringify((() => {
  const nav = document.querySelector('nav');
  if (!nav) return { noNav: true };
  const links = [...nav.querySelectorAll('a[href]')].slice(0, 12).map(a => {
    const cs = getComputedStyle(a);
    return { href: a.getAttribute('href'), text: (a.textContent||'').trim().slice(0,18), ac: a.getAttribute('aria-current'), da: a.getAttribute('data-active'), color: cs.color };
  });
  return links;
})())`;

// 2) the scrolling element: which container actually scrolls
const SCROLLER = `JSON.stringify((() => {
  const se = document.scrollingElement;
  const cands = [];
  document.querySelectorAll('main, [class*=overflow-auto], [class*=overflow-y]').forEach(el => {
    if (el.scrollHeight > el.clientHeight + 40 && el.clientHeight > 200) cands.push({ cls: (el.className||'').toString().slice(0,60), sh: el.scrollHeight, ch: el.clientHeight, st: el.scrollTop });
  });
  return { docSt: se ? se.scrollTop : null, docSh: se ? se.scrollHeight : null, bodyH: document.body.scrollHeight, cands: cands.slice(0,4) };
})())`;

// 3) the drawer carrier (mobile only — probed at 390 in the census)
// 4) the settings tabs
const TABS = `JSON.stringify((() => {
  const ts = [...document.querySelectorAll('[role=tab]')].map(t => ({ text: (t.textContent||'').trim().slice(0,20), state: t.getAttribute('data-state') }));
  return { count: ts.length, tabs: ts.slice(0,8) };
})())`;

async function probeSide(session, base, tag) {
  console.log(`\n===== ${tag} =====`);
  // land on the root (dashboard) — the fresh post-login state
  run(`agent-browser --session ${session} open ${base}/`);
  await settle(3000);
  const url1 = run(`agent-browser --session ${session} get url`).trim();
  console.log("root url:", url1);
  console.log("sidebar:", JSON.stringify(await ev(session, SIDEBAR)).slice(0, 700));
  console.log("scroller:", JSON.stringify(await ev(session, SCROLLER)).slice(0, 500));

  // click Employees via the sidebar link (visible-link rule)
  const ok = run(`agent-browser --session ${session} eval ${evalStr(`(() => { const a = [...document.querySelectorAll('nav a[href]')].find(a => /employees/i.test(a.textContent) && a.offsetParent !== null); if (a) { a.click(); return a.getAttribute('href'); } return 'NOTFOUND'; })()`)}`).trim();
  await settle(2500);
  console.log("clicked employees →", ok, "url now:", run(`agent-browser --session ${session} get url`).trim());
  console.log("sidebar after nav:", JSON.stringify(await ev(session, SIDEBAR)).slice(0, 700));

  // back smoke
  run(`agent-browser --session ${session} back`);
  await settle(2500);
  console.log("after back url:", run(`agent-browser --session ${session} get url`).trim());
  console.log("sidebar after back:", JSON.stringify(await ev(session, SIDEBAR)).slice(0, 700));

  // settings tabs
  run(`agent-browser --session ${session} open ${base}/settings`);
  await settle(3000);
  console.log("tabs:", JSON.stringify(await ev(session, TABS)).slice(0, 500));
  console.log("scroller(settings):", JSON.stringify(await ev(session, SCROLLER)).slice(0, 500));
}

await probeSide("ref56", baseRef, "REF");
await probeSide("loc", baseLoc, "LOC");
process.exit(0);
