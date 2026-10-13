#!/usr/bin/env node
// probe-r32-orphans2.mjs — deep-dive the edge cases:
// (1) /home + /employeedetail blank? try ?id= params, wait longer
// (2) /organizationsetup + /dynamicdashboard vs /dashboard + /employeeselfservice content diff
// (3) mobile spot-check of the 10 real pages
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
const baseRef = "https://eon.base44.app";

const FINGERPRINT = `(() => {
  const main = document.querySelector('main');
  const cards = [...document.querySelectorAll('main .rounded-xl')].map(c => ({ y: Math.round(c.getBoundingClientRect().y), w: Math.round(c.getBoundingClientRect().width), h: Math.round(c.getBoundingClientRect().height) }));
  const h1 = [...document.querySelectorAll('h1')].filter(e => e.getBoundingClientRect().width > 0)[0];
  const btns = [...document.querySelectorAll('main button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim().slice(0, 22)).filter(Boolean).slice(0, 8);
  const root = document.querySelector('main') ? document.querySelector('main').firstElementChild : null;
  const childCount = main ? main.children.length : -1;
  return { title: document.title, h1: h1 ? h1.textContent.trim().slice(0, 40) : null, childCount, btns, cardCount: cards.length, bodyLen: (main ? main.innerText : '').length };
})()`;

run(`agent-browser --session ref set viewport 1440 900`);
async function probe(route, wait = 4200) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, wait));
  return evalOn("ref", FINGERPRINT);
}

console.log("=== edge cases ===");
console.log("/home: ", JSON.stringify(await probe("/home", 6000)));
console.log("/home (2nd): ", JSON.stringify(await probe("/home", 6000)));
console.log("/employeedetail: ", JSON.stringify(await probe("/employeedetail", 6000)));
console.log("/employeedetail?id=1: ", JSON.stringify(await probe("/employeedetail?id=1", 6000)));
console.log("/employeedetail/1: ", JSON.stringify(await probe("/employeedetail/1", 6000)));
console.log("\n=== alias comparison ===");
console.log("/organizationsetup: ", JSON.stringify(await probe("/organizationsetup")));
console.log("/dynamicdashboard: ", JSON.stringify(await probe("/dynamicdashboard")));
console.log("/dashboard: ", JSON.stringify(await probe("/dashboard")));
console.log("/employeeselfservice: ", JSON.stringify(await probe("/employeeselfservice")));
