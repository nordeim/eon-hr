#!/usr/bin/env node
// r58-cta-verify.mjs — one-by-one verification of the CTA-fill drift
// candidates (the node evalOn path — the bash $(...) loop mangles the
// nested template strings; false MATCHes resulted).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const READ = `(() => {
  const btns = [...document.querySelectorAll('main button')];
  const out = [];
  for (const b of btns) {
    const cs = getComputedStyle(b);
    const bg = cs.backgroundColor;
    const bi = cs.backgroundImage || '';
    const isGrad = bi.includes('gradient');
    const isDark = bg === 'rgb(23, 23, 23)';
    const isBlue = bg === 'rgb(37, 99, 235)';
    if (isGrad || isDark || isBlue) {
      out.push({
        t: (b.textContent || '').trim().slice(0, 20) || '(icon)',
        fill: isGrad ? 'GRAD' : (isDark ? 'DARK' : 'BLUE'),
        h: Math.round(b.getBoundingClientRect().height),
        w: Math.round(b.getBoundingClientRect().width),
        grad: isGrad ? bi.slice(0, 55) : undefined,
      });
    }
  }
  return out;
})()`;

const ROUTES = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ["/evaluations", "/performancemanagement", "/surveyanalytics", "/hrassistant", "/securitysettings", "/notificationpreferences", "/tenantsetup", "/recruitmentkanban", "/workflowconfigpage", "/assets"];

for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  run(`agent-browser --session loc open "${baseLoc}${route}"`);
  await new Promise(r => setTimeout(r, 4000));
  const ref = await evalOn("ref", READ, 400);
  const loc = await evalOn("loc", READ, 300);
  const same = JSON.stringify(ref) === JSON.stringify(loc);
  console.log(`${same ? "MATCH" : "DIFF "} ${route}`);
  if (!same) {
    console.log(`  ref: ${JSON.stringify(ref).slice(0, 500)}`);
    console.log(`  loc: ${JSON.stringify(loc).slice(0, 500)}`);
  }
}
