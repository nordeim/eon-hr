#!/usr/bin/env node
// probe-r48-rootmap.mjs — the r46 ROOTMAP extended to ALL unmapped routes:
// the scroller-first-child (page root) class + the second level (content
// wrapper) class, REF vs zero-tenant LOC. Produces the round's root-fix map.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 250) }; } }

const baseRef = "https://eon.base44.app", baseZero = "http://127.0.0.1:3201";
const ROUTES = ["/payroll", "/taskmanager", "/attendance", "/recruitment", "/training", "/documenttracker", "/profile", "/settings", "/staffrequests", "/leavemanagement", "/expenses", "/loans", "/employees", "/dashboard"];

const ROOTMAP = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true };
  const cls = (el) => (el && typeof el.className === 'string' ? el.className.replace(/\\s+/g, ' ').trim() : '');
  const first = sc.children[0];
  const panY = first ? [...first.querySelectorAll(':scope > div')].find(d => /touch-pan-y/.test(cls(d))) : null;
  const grad = first && /gradient|min-h-screen/.test(cls(first)) ? first : (panY ? [...panY.querySelectorAll(':scope > div')].find(d => /gradient|min-h-screen/.test(cls(d)) || !/absolute/.test(cls(d))) : null);
  const inner = grad ? [...grad.children].find(d => !/^h-20$/.test(cls(d)) && !/absolute/.test(cls(d))) : null;
  return {
    root: cls(first).slice(0, 95),
    trio: !!panY,
    grad: grad ? cls(grad).slice(0, 95) : null,
    inner: inner ? cls(inner).slice(0, 75) : null,
  };
})()`;

for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 2100));
  const a = await evalOn("ref", ROOTMAP);
  run(`agent-browser --session loc0 open "${baseZero}${route}"`);
  await new Promise(r => setTimeout(r, 1650));
  const b = await evalOn("loc0", ROOTMAP);
  const rj = JSON.stringify, same = rj(a) === rj(b);
  console.log(`${same ? "MATCH" : "DIFF "} ${route}`);
  if (!same) {
    console.log(`  REF ${rj(a)}`);
    console.log(`  LOC ${rj(b)}`);
  }
}
