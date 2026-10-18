#!/usr/bin/env node
// r58-cta-map.mjs — maps REF's primary-fill button recipes (solid
// bg-primary #171717, solid bg-blue-600, gradient) per route, and the
// clone's, to enumerate the full CTA-fill drift family.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const ROUTES = ["/employees", "/staffrequests", "/companywall", "/profile", "/documenttracker", "/loans", "/leavemanagement", "/expenses", "/onboarding", "/offboarding", "/compliancedashboard", "/templates", "/workflowautomation", "/workflowconfigpage", "/organogram", "/chat", "/hrassistant", "/assets", "/shiftcalendar", "/shiftswap", "/evaluations", "/performancemanagement", "/hrletters", "/hrreports", "/surveys", "/announcements", "/reports", "/requestsettings", "/securitysettings", "/notificationpreferences", "/assetmanagement", "/payrollreports", "/payrollai", "/surveyanalytics", "/analyticsdashboard", "/advancedanalytics", "/dynamicdashboard", "/attendancedashboard", "/allleaverequests", "/employeeselfservice", "/employeeportal", "/interviewassistant", "/recruitmentkanban", "/hrassistantchat", "/communications", "/organizationsetup", "/tenantsetup", "/careers", "/externaljobapplication", "/home"];

// primary-ish fill reader: buttons whose bg is the dark primary
// (23,23,23), solid blue-600 (37,99,235), or a gradient
const FILLS = `(() => {
  const btns = [...document.querySelectorAll('main button')];
  const out = [];
  for (const b of btns) {
    const cs = getComputedStyle(b);
    const bg = cs.backgroundColor;
    const bi = cs.backgroundImage;
    const isGrad = bi && bi !== 'none' && bi.includes('gradient');
    const isDark = bg === 'rgb(23, 23, 23)';
    const isBlue = bg === 'rgb(37, 99, 235)';
    if (isGrad || isDark || isBlue) {
      out.push({
        text: (b.textContent || '').trim().slice(0, 22) || '(icon)',
        fill: isGrad ? 'GRADIENT' : (isDark ? 'DARK' : 'BLUE600'),
        h: Math.round(b.getBoundingClientRect().height),
      });
    }
  }
  return out.slice(0, 14);
})()`;

for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  run(`agent-browser --session loc open "${baseLoc}${route}"`);
  await new Promise(r => setTimeout(r, 2600));
  const refF = await evalOn("ref", FILLS, 500);
  const locF = await evalOn("loc", FILLS, 300);
  const refS = JSON.stringify(refF);
  const locS = JSON.stringify(locF);
  console.log(`${refS === locS ? "MATCH" : "DIFF "} ${route}`);
  if (refS !== locS) {
    console.log(`  ref: ${refS.slice(0, 460)}`);
    console.log(`  loc: ${locS.slice(0, 460)}`);
  }
}
