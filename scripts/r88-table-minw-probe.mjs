#!/usr/bin/env node
// r88-table-minw-probe.mjs — scan REF vs LOC for <table> elements with
// explicit min-width styles (the shiftcalendar find: REF authors a hard
// min-width that drives whole-page mobile overflow chains). Reports every
// table's class + style + width on both sides for the structural routes.
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const ROUTES = process.argv.length > 2 ? process.argv.slice(2) : [
  "surveys", "chat", "tenantsetup", "companywall", "hrassistantchat",
  "shiftswap", "hrreports", "interviewassistant", "careers", "staffrequests",
  "attendancedashboard", "analyticsdashboard", "employeeselfservice",
];
const PROBE = `(() => {
  const tables = [...document.querySelectorAll('table')].map(t => ({ cls: (t.getAttribute('class')||'').slice(0,60), style: t.getAttribute('style'), w: Math.round(t.getBoundingClientRect().width) }));
  return JSON.stringify({ docScrollW: document.documentElement.scrollWidth, tables });
})()`;

for (const route of ROUTES) {
  run(`agent-browser --session ref88t set viewport 390 844`);
  run(`agent-browser --session ref88t open ${baseRef}/${route}`);
  await new Promise(r => setTimeout(r, 3200));
  const ref = await evalOn("ref88t", PROBE);
  run(`agent-browser --session loc88t set viewport 390 844`);
  run(`agent-browser --session loc88t open ${baseLoc}/${route}`);
  await new Promise(r => setTimeout(r, 3200));
  const loc = await evalOn("loc88t", PROBE);
  console.log(`\n## ${route}`);
  console.log(`  REF scrollW=${ref.docScrollW} tables=${JSON.stringify(ref.tables)}`);
  console.log(`  LOC scrollW=${loc.docScrollW} tables=${JSON.stringify(loc.tables)}`);
}
process.exit(0);
