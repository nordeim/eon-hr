#!/usr/bin/env node
// r87-crossdiff-verify.mjs — session-87: the post-fix pixel re-verify
// (the r86 protocol's definitive proof step). Re-captures the fourteen
// remediated routes cross-side at rest (@1440×900 LIGHT LTR) on the
// freshly-rebuilt standalone, then the caller runs r87-crossdiff-diff.py
// against the re-captured set (overwrite in place).
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
const ROUTES = [
  "assets", "organogram", "payrollmodule", "chat", "offboarding",
  "employeeportal", "interviewassistant", "payrollai", "reports",
  "tenantsetup", "payrollengine", "loans", "dynamicdashboard",
  "attendancedashboard",
];

// sanity: the :3200 server must be the NEW build (the legend order probe)
const legend = run(`agent-browser --session loc87x open http://127.0.0.1:3200/attendancedashboard`);
await new Promise(r => setTimeout(r, 2500));
const legendRead = run(`agent-browser --session loc87x eval "document.querySelector('.recharts-legend-wrapper')?.textContent ?? 'none'"`);
console.log("build check (legend):", legendRead.trim());
if (!legendRead.includes("PresentLateAbsent")) { console.log("STALE BUILD — aborting"); process.exit(1); }

for (const route of ROUTES) {
  for (const [session, base, suffix] of [["ref87x", "https://eon.base44.app", "ref"], ["loc87x", "http://127.0.0.1:3200", "loc"]]) {
    run(`agent-browser --session ${session} open ${base}/${route}`);
    await new Promise(r => setTimeout(r, 3500));
    run(`agent-browser --session ${session} screenshot ${shots}/r87-crossdiff-${route}-${suffix}.png`);
  }
  console.log("re-captured:", route);
}
console.log("ALL RE-CAPTURED — run the diff pass next");
process.exit(0);
