#!/usr/bin/env node
// r58-fills-final.mjs — the DEFINITIVE fill census: every main-button
// with a non-white/non-transparent fill or gradient, both sides, all
// primary routes. Captures the full REF recipe palette: gradients
// (blue/green/...), solid dark (#171717 bg-primary), solid blue-600,
// solid indigo-600, solid teal-600, destructive, and the tiny icon chips.
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
    const isPlain = bg === 'rgba(0, 0, 0, 0)' || bg === 'rgb(255, 255, 255)';
    if (isGrad || !isPlain) {
      out.push({
        t: (b.textContent || '').trim().slice(0, 20) || '(icon)',
        bg: isGrad ? null : bg,
        grad: isGrad ? bi.replace(/, /g, ',').slice(0, 50) : null,
        h: Math.round(b.getBoundingClientRect().height),
        w: Math.round(b.getBoundingClientRect().width),
      });
    }
  }
  return out;
})()`;

const ROUTES = process.argv.slice(2).length > 0 ? process.argv.slice(2) : [
  "/employees", "/staffrequests", "/companywall", "/profile", "/documenttracker", "/loans",
  "/hrassistant", "/tenantsetup", "/securitysettings", "/notificationpreferences",
  "/workflowconfigpage", "/recruitmentkanban", "/evaluations", "/performancemanagement",
  "/surveyanalytics", "/assets", "/settings", "/taskmanager", "/training", "/payroll",
  "/recruitment", "/announcements", "/hrletters", "/surveys", "/leavemanagement", "/expenses",
];

for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  run(`agent-browser --session loc open "${baseLoc}${route}"`);
  await new Promise(r => setTimeout(r, 4000));
  const ref = await evalOn("ref", READ, 400);
  const loc = await evalOn("loc", READ, 300);
  const same = JSON.stringify(ref) === JSON.stringify(loc);
  console.log(`${same ? "MATCH" : "DIFF "} ${route}`);
  if (!same) {
    console.log(`  ref: ${JSON.stringify(ref).slice(0, 550)}`);
    console.log(`  loc: ${JSON.stringify(loc).slice(0, 550)}`);
  }
}
