#!/usr/bin/env node
// probe-r48-rows.mjs — session-48 systematic per-page reader: for every
// app route, read on BOTH sides (REF vs zero-tenant LOC, 1440x900):
//   row   = the desktop header row (the flex justify-between div) class + children map
//   hero  = the row's first child class (the hero wrapper)
//   acts  = the actions-zone form (direct button vs wrapper + wrapper class)
//   stats = the first stat-row zone: per-card [valueTag.cls, labelTag.cls]
//   kick  = the kicker h1 class (if the page renders one)
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 250) }; } }

const baseRef = "https://eon.base44.app", baseZero = "http://127.0.0.1:3201";
const ROUTES = process.argv[2] === "1"
  ? ["/leavemanagement", "/expenses", "/loans", "/compliancedashboard", "/performancemanagement", "/assetmanagement", "/organogram", "/surveys", "/announcements", "/companywall", "/chat", "/evaluations", "/templates", "/shiftcalendar", "/hrletters", "/offboarding"]
  : ["/analytics", "/analyticsdashboard", "/attendancedashboard", "/surveyanalytics", "/advancedanalytics", "/hrreports", "/reports", "/payrollreports", "/payrollai", "/payrollengine", "/payrollmodule", "/recruitmentkanban", "/interviewassistant", "/workflowautomation", "/workflowconfigpage", "/notificationpreferences", "/employeeselfservice", "/employeeportal", "/hrassistantchat", "/hrassistant", "/securitysettings", "/requestreports", "/requestsettings", "/shiftswap", "/tenantsetup", "/allleaverequests", "/communications", "/assets", "/home", "/employeedetail"];

const READ = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true };
  const cls = (el) => (typeof el.className === 'string' ? el.className : '').replace(/\\s+/g, ' ').trim();
  const kick = sc.querySelector('div.md\\\\:hidden h1, div[class*=md\\\\:hidden] h1');
  const row = [...sc.querySelectorAll('div')].find(d => /(^| )flex /.test(cls(d)) && /justify-between/.test(cls(d)) && !/items-baseline/.test(cls(d)) && (d.querySelector('h1,h2') || [...d.children].some(c => c.querySelector('h1,h2'))) && cls(d).length < 160);
  let hero = null, acts = null;
  if (row) {
    hero = row.children[0] ? { tag: row.children[0].tagName, cls: cls(row.children[0]).slice(0, 60) } : null;
    const last = row.children[row.children.length - 1];
    acts = last && last !== row.children[0] ? { tag: last.tagName, cls: cls(last).slice(0, 60), kids: [...last.children].map(c => c.tagName).slice(0, 3) } : { bare: true };
  }
  const statGrid = [...sc.querySelectorAll('div')].find(d => /^grid |^grid$/.test(cls(d)) && /grid-cols/.test(cls(d)) && d.querySelectorAll('h3,h2').length === 0);
  let stats = null;
  if (statGrid) {
    stats = [...statGrid.children].slice(0, 4).map(card => {
      const txts = [...card.querySelectorAll('*')].filter(e => e.children.length === 0 && (e.textContent || '').trim());
      const val = txts.find(e => /text-3xl|text-2xl|text-4xl/.test(cls(e)));
      const lab = txts.find(e => /text-sm|text-xs/.test(cls(e)) && e !== val);
      return val || lab ? [val ? val.tagName + '|' + cls(val).slice(0, 40) : null, lab ? lab.tagName + '|' + cls(lab).slice(0, 40) : null] : null;
    }).filter(Boolean);
  }
  return { row: row ? cls(row).slice(0, 130) : null, hero, acts, stats: stats && stats.length ? stats : null, kick: kick ? cls(kick).slice(0, 70) : null };
})()`;

for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 2300));
  const a = await evalOn("ref", READ);
  run(`agent-browser --session loc0 open "${baseZero}${route}"`);
  await new Promise(r => setTimeout(r, 1800));
  const b = await evalOn("loc0", READ);
  console.log(`\n### ${route}`);
  console.log(`REF row: ${a.row}`);
  console.log(`     hero=${JSON.stringify(a.hero)} acts=${JSON.stringify(a.acts)}`);
  console.log(`     stats=${JSON.stringify(a.stats)}`);
  console.log(`     kick=${JSON.stringify(a.kick)}`);
  console.log(`LOC row: ${b.row}`);
  console.log(`     hero=${JSON.stringify(b.hero)} acts=${JSON.stringify(b.acts)}`);
  console.log(`     stats=${JSON.stringify(b.stats)}`);
  console.log(`     kick=${JSON.stringify(b.kick)}`);
}
