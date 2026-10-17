#!/usr/bin/env node
// probe-r48-census-b2.mjs — session-48 continuation: the routes that
// crashed or never ran in batch B (payrollengine, payrollmodule,
// recruitmentkanban, interviewassistant, workflowautomation,
// workflowconfigpage, notificationpreferences) + batch C's remainder.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseZero = "http://127.0.0.1:3201";

const ROUTES = process.argv[2] === "c"
  ? ["/employeeselfservice", "/employeeportal", "/hrassistantchat", "/hrassistant", "/securitysettings", "/requestreports", "/requestsettings", "/shiftswap", "/dynamicdashboard", "/organizationsetup", "/tenantsetup", "/allleaverequests", "/home", "/employeedetail", "/communications", "/assets"]
  : ["/payrollengine", "/payrollmodule", "/recruitmentkanban", "/interviewassistant", "/workflowautomation", "/workflowconfigpage", "/notificationpreferences"];

const INTERIOR = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true };
  const tags = {};
  for (const el of sc.querySelectorAll('*')) tags[el.tagName] = (tags[el.tagName] || 0) + 1;
  const lines = [];
  const walk = (el, d) => {
    if (lines.length >= 70 || d > 9) return;
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').replace(/\\s+/g, ' ').trim();
    if (own) lines.push(' '.repeat(d * 2) + el.tagName + ':' + own.slice(0, 58));
    for (const c of el.children) walk(c, d + 1);
  };
  walk(sc, 0);
  return { els: sc.querySelectorAll('*').length, tags, lines: lines.slice(0, 70) };
})()`;

for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 2400));
  const a = await evalOn("ref", INTERIOR);
  run(`agent-browser --session loc0 open "${baseZero}${route}"`);
  await new Promise(r => setTimeout(r, 1900));
  const b = await evalOn("loc0", INTERIOR);
  const same = JSON.stringify(a) === JSON.stringify(b);
  console.log(`\n=== ${route} ${same ? "MATCH" : "DIFF"} ===`);
  if (!same) {
    if (a.gone || b.gone || !a.tags || !b.tags) { console.log(`  raw ref=${JSON.stringify(a).slice(0, 140)} loc=${JSON.stringify(b).slice(0, 140)}`); continue; }
    const tagDiff = {};
    for (const k of new Set([...Object.keys(a.tags || {}), ...Object.keys(b.tags || {})])) {
      if ((a.tags[k] || 0) !== (b.tags[k] || 0)) tagDiff[k] = `${a.tags[k] || 0}/${b.tags[k] || 0}`;
    }
    console.log(`  els ${a.els}/${b.els} tagDiff(r/l) ${JSON.stringify(tagDiff)}`);
    const A = a.lines || [], B = b.lines || [];
    const setA = new Set(A), setB = new Set(B);
    const onlyR = A.filter(l => !setB.has(l)).slice(0, 14);
    const onlyL = B.filter(l => !setA.has(l)).slice(0, 14);
    console.log("  REF-only:"); for (const l of onlyR) console.log("    " + l);
    console.log("  LOC-only:"); for (const l of onlyL) console.log("    " + l);
  }
}
