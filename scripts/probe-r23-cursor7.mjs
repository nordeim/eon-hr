#!/usr/bin/env node
// probe-r23-cursor7.mjs — chrome precision: header + sidebar-footer buttons
// with FULL classes + parent context on both apps; login page census via
// throwaway sessions (unauthed); verify the 8-page scope structure on LOC.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; }
}

// 1. chrome dump: every button outside main (header + sidebar) with full class + parent
const CHROME = `(() => {
  const out = [];
  for (const b of document.querySelectorAll('button')) {
    if (b.offsetParent === null) continue;
    if (b.closest('main')) continue;
    const cs = getComputedStyle(b);
    const parent = b.parentElement;
    out.push({ t: (b.textContent || b.getAttribute('aria-label') || '(icon)').trim().slice(0, 16), cur: cs.cursor, us: cs.userSelect, cls: String(b.getAttribute('class') || '').slice(0, 130), pcls: String(parent.getAttribute('class') || '').slice(0, 60) });
  }
  return JSON.stringify(out);
})()`;
console.log("── CHROME BUTTONS (outside main) /dashboard ──");
run("agent-browser --session ref set viewport 1440 900");
run("agent-browser --session ref open https://eon.base44.app/dashboard");
await new Promise(r => setTimeout(r, 3200));
const refC = await evalOn("ref", CHROME);
for (const b of refC) console.log(`R [${b.t}] ${b.cur}/${b.us} parent=${b.pcls}\n   cls=${b.cls}`);
run("agent-browser --session loc open http://127.0.0.1:3200/dashboard");
await new Promise(r => setTimeout(r, 2800));
const locC = await evalOn("loc", CHROME);
for (const b of locC) console.log(`L [${b.t}] ${b.cur}/${b.us} parent=${b.pcls}\n   cls=${b.cls}`);

// 2. login page (throwaway sessions, unauthed)
console.log("\n── LOGIN PAGE census ──");
const LOGIN = `(() => {
  const out = [];
  for (const el of document.querySelectorAll('button, a, input')) {
    if (!el.offsetParent) continue;
    const cs = getComputedStyle(el);
    out.push({ k: el.tagName.toLowerCase() + (el.type ? ':' + el.type : ''), t: (el.textContent || el.getAttribute('placeholder') || '').trim().slice(0, 18), cur: cs.cursor, us: cs.userSelect });
  }
  return JSON.stringify(out);
})()`;
run("agent-browser --session loginref open https://eon.base44.app/login");
await new Promise(r => setTimeout(r, 3200));
console.log("REF login: " + JSON.stringify(await evalOn("loginref", LOGIN)));
run("agent-browser --session loginloc open http://127.0.0.1:3200/login");
await new Promise(r => setTimeout(r, 2600));
console.log("LOC login: " + JSON.stringify(await evalOn("loginloc", LOGIN)));

// 3. LOC page-root structure of the 8 select-none routes (confirm the root div + its classes)
const ROOT = `(() => {
  const h1 = [...document.querySelectorAll('h1')].find(h => h.offsetParent);
  if (!h1) return 'no-h1';
  let p = h1;
  while (p && p.tagName !== 'MAIN' && p.tagName !== 'BODY') {
    const cls = String(p.getAttribute('class') || '');
    if (cls.includes('min-h-screen') || cls.includes('p-4') || cls.includes('p-6')) return p.tagName + '.' + cls.slice(0, 100);
    p = p.parentElement;
  }
  return 'not-found';
})()`;
console.log("\n── LOC PAGE ROOTS (8 routes) ──");
for (const route of ["/dashboard", "/employees", "/payroll", "/attendance", "/leavemanagement", "/expenses", "/loans", "/taskmanager"]) {
  run(`agent-browser --session loc open http://127.0.0.1:3200${route}`);
  await new Promise(r => setTimeout(r, 2400));
  console.log(`${route}: ` + await evalOn("loc", ROOT));
}
console.log("\nCURSOR7-DONE");
