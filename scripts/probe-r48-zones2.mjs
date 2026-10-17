#!/usr/bin/env node
// probe-r48-zones2.mjs — batched compact zone reads: the header + first
// content zone of each remaining page, both sides, for contract pinning.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseZero = "http://127.0.0.1:3201";
const ROUTES = process.argv[2] ? JSON.parse(process.argv[2]) : ["/announcements", "/hrletters", "/templates", "/tenantsetup", "/recruitmentkanban", "/home", "/employeedetail", "/requestreports", "/advancedanalytics"];

const TREE = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return ['GONE'];
  const lines = [];
  const walk = (el, d) => {
    if (lines.length >= 60 || d > 10) return;
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').replace(/\\s+/g, ' ').trim();
    const cls = (typeof el.className === 'string' ? el.className : '').split(' ').filter(Boolean).slice(0, 7).join(' ');
    lines.push(' '.repeat(d * 2) + el.tagName + (cls ? '.' + cls : '') + (own ? ' :' + own.slice(0, 40) : ''));
    for (const c of el.children) walk(c, d + 1);
  };
  walk(sc, 0);
  return lines;
})()`;

for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 2400));
  const a = await evalOn("ref", TREE);
  run(`agent-browser --session loc0 open "${baseZero}${route}"`);
  await new Promise(r => setTimeout(r, 1900));
  const b = await evalOn("loc0", TREE);
  console.log(`\n========== ${route} ==========`);
  console.log("--- REF ---");
  for (const l of (Array.isArray(a) ? a.slice(0, 42) : [String(a)])) console.log(l);
  console.log("--- LOC ---");
  for (const l of (Array.isArray(b) ? b.slice(0, 42) : [String(b)])) console.log(l);
}
