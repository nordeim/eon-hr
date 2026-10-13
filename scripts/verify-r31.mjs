#!/usr/bin/env node
// verify-r31.mjs — session-32 / parity round 31 live verification:
// the 14 orphan routes on both apps (h1/text contract comparison), then
// the standing regression sweeps (12-route redeploy + mobile chrome).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
let fails = 0;
const check = (label, ref, loc) => {
  const same = JSON.stringify(ref) === JSON.stringify(loc);
  if (!same) fails++;
  console.log(`${same ? "MATCH" : "**DIFF**"} ${label}: ref=${JSON.stringify(ref).slice(0, 160)} loc=${JSON.stringify(loc).slice(0, 160)}`);
};

// ---- 1) the 10 real pages: h1 + subtitle + empty-line contract ----
const ROUTES = ["/careers","/employeeportal","/externaljobapplication","/hrassistant","/payrollai","/payrollreports","/requestreports","/requestsettings","/shiftswap","/tenantsetup"];
const PAGE = `(() => {
  const h1 = [...document.querySelectorAll('h1')].filter(e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().y > 50)[0];
  const out = { h1: h1 ? { t: h1.textContent.trim().slice(0, 30), fs: getComputedStyle(h1).fontSize, fw: getComputedStyle(h1).fontWeight, y: Math.round(h1.getBoundingClientRect().y), col: getComputedStyle(h1).color } : null, lines: [] };
  const find = (txt) => [...document.querySelectorAll('main p, main h3, main h2')].find(e => e.children.length === 0 && e.textContent.trim().startsWith(txt) && e.getBoundingClientRect().width > 0);
  for (const key of ['Explore opportunities','No Onboarding','You don', 'Join our team','No Open Positions','We don','Ask me anything about HR','AI-powered','Generate, export','Analytics and reporting','Configure approvers','Request, approve',"Let's set up",'Check back later']) {
    const el = find(key);
    if (el) out.lines.push({ t: el.textContent.trim().slice(0, 40), fs: getComputedStyle(el).fontSize, y: Math.round(el.getBoundingClientRect().y) });
  }
  return out;
})()`;
console.log("=== 1) the 10 real pages (1440x900) ===");
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc set viewport 1440 900`);
for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  run(`agent-browser --session loc open "${baseLoc}${route}"`);
  await new Promise(r => setTimeout(r, 3400));
  check(route, await evalOn("ref", PAGE), await evalOn("loc", PAGE));
}

// ---- 2) the aliases + blanks ----
const ALIAS = `(() => {
  const h1 = [...document.querySelectorAll('h1')].filter(e => e.getBoundingClientRect().width > 0)[0];
  const main = document.querySelector('main');
  return { title: document.title, h1: h1 ? h1.textContent.trim().slice(0, 26) : null, bodyLen: main ? main.innerText.trim().length : -1 };
})()`;
console.log("\n=== 2) aliases + blanks ===");
for (const route of ["/organizationsetup", "/dynamicdashboard", "/home", "/employeedetail"]) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  run(`agent-browser --session loc open "${baseLoc}${route}"`);
  await new Promise(r => setTimeout(r, 3200));
  check(route, await evalOn("ref", ALIAS), await evalOn("loc", ALIAS));
}

console.log(`\n${fails === 0 ? "ALL LIVE CHECKS MATCH" : fails + " DIFF(S) FOUND"}`);
