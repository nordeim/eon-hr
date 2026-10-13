#!/usr/bin/env node
// probe-r31-tabs.mjs — session-31 / parity round 30 census: the bottom tab
// bar's ACTIVE-STATE ROUTE MAPPING. The standing audit pins /dashboard only
// (Home active). This sweep hits staff/tasks/attendance/profile-family
// routes on mobile (390x844) and reads which tab is highlighted + the
// kicker text, on both apps.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const TABSTATE = `(() => {
  const nav = [...document.querySelectorAll('nav')].find(n => n.getBoundingClientRect().y > 700);
  if (!nav) return JSON.stringify({found:false});
  const tabs = [...nav.querySelectorAll('a')].map(a => {
    const cs = getComputedStyle(a);
    return { t: (a.querySelector('span')?.textContent || a.textContent || '').trim().slice(0,10), color: cs.color, bg: cs.backgroundColor };
  });
  const h1 = [...document.querySelectorAll('h1')].find(h => h.getBoundingClientRect().y > 60 && h.getBoundingClientRect().y < 160);
  return JSON.stringify({found:true, tabs, kicker: h1 ? h1.textContent.trim().slice(0,26) : null});
})()`;

const ROUTES = ["/dashboard", "/employees", "/payroll", "/leavemanagement", "/expenses", "/recruitment", "/training", "/taskmanager", "/attendance", "/profile", "/settings", "/compliancedashboard", "/analytics", "/organogram", "/staffrequests", "/assets", "/aiassistant", "/employeeselfservice"];

run("agent-browser --session ref set viewport 390 844");
run("agent-browser --session loc set viewport 390 844");

for (const route of ROUTES) {
  const out = {};
  for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    run(`agent-browser --session ${s} open "${base}${route}"`);
    await new Promise(r => setTimeout(r, 3000));
    out[s] = await evalOn(s, TABSTATE);
  }
  const active = (d) => d.tabs ? d.tabs.filter(t => t.bg !== "rgba(0, 0, 0, 0)").map(t => t.t).join("|") : "?";
  const same = JSON.stringify(out.ref) === JSON.stringify(out.loc);
  console.log(`${route.padEnd(24)} ${same ? "MATCH" : "**DIFF**"} refActive=[${active(out.ref)}] kicker=${JSON.stringify(out.ref.kicker)} | locActive=[${active(out.loc)}] kicker=${JSON.stringify(out.loc.kicker)}${same ? "" : "\n  REF " + JSON.stringify(out.ref) + "\n  LOC " + JSON.stringify(out.loc)}`);
}
