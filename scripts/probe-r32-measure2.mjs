#!/usr/bin/env node
// probe-r32-measure2.mjs — follow-ups: shell presence per route, /careers job
// data, /hrassistant internals, /employeeportal + /tenantsetup wrappers,
// mobile spot-checks.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
const baseRef = "https://eon.base44.app";

const SHELL = `(() => {
  const navItems = [...document.querySelectorAll('button, a')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.x >= 0 && r.x < 260 && r.y > 100 && r.y < 900; });
  const main = document.querySelector('main');
  const mr = main ? main.getBoundingClientRect() : null;
  return { navItems: navItems.length, mainX: mr ? Math.round(mr.x) : null, title: document.title };
})()`;

run(`agent-browser --session ref set viewport 1440 900`);
const ROUTES = ["/careers","/employeeportal","/externaljobapplication","/hrassistant","/payrollai","/payrollreports","/requestreports","/requestsettings","/shiftswap","/tenantsetup","/home","/employeedetail","/organizationsetup","/dynamicdashboard"];
console.log("=== shell presence ===");
for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 3000));
  console.log(`${route}: ${JSON.stringify(await evalOn("ref", SHELL))}`);
}

console.log("\n=== /careers job data ===");
run(`agent-browser --session ref open "${baseRef}/careers"`);
await new Promise(r => setTimeout(r, 4500));
const CAREERS = `(() => {
  const cards = [...document.querySelectorAll('.rounded-xl')];
  const jobs = cards.map(c => c.textContent.trim().replace(/\\s+/g, ' ').slice(0, 200));
  const btns = [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().y > 300 && b.getBoundingClientRect().y < 500).map(b => ({ t: b.textContent.trim(), w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height), y: Math.round(b.getBoundingClientRect().y) }));
  const hero = document.querySelector('h1') ? document.querySelector('h1').parentElement : null;
  return { heroCls: hero ? String(hero.className).slice(0, 150) : null, jobCount: cards.length, jobs, companyBtns: btns, bodyLen: document.body.innerText.length };
})()`;
console.log(JSON.stringify(await evalOn("ref", CAREERS)).slice(0, 2200));

console.log("\n=== /hrassistant internals ===");
run(`agent-browser --session ref open "${baseRef}/hrassistant"`);
await new Promise(r => setTimeout(r, 4000));
const CHAT = `(() => {
  const h1 = [...document.querySelectorAll('h1')].filter(e => e.getBoundingClientRect().width > 0)[0];
  const kicker = h1 ? [...document.querySelectorAll('span')].find(s => { const sr = s.getBoundingClientRect(); const hr = h1.getBoundingClientRect(); return sr.width > 0 && sr.y < hr.y && hr.y - sr.y < 30 && sr.x < hr.x + 8; }) : null;
  const h1r = h1 ? h1.getBoundingClientRect() : null;
  const card = document.querySelector('main .rounded-xl');
  const input = document.querySelector('main textarea, main input[type=text]');
  const msgs = [...document.querySelectorAll('main .space-y-4 > div, main [class*=message]')].length;
  return { kicker: kicker ? { t: kicker.textContent.trim(), x: Math.round(kicker.getBoundingClientRect().x), y: Math.round(kicker.getBoundingClientRect().y) } : null, h1: h1r ? { x: Math.round(h1r.x), y: Math.round(h1r.y) } : null, cardCls: card ? String(card.className).slice(0, 120) : null, input: input ? { tag: input.tagName, ph: input.placeholder, x: Math.round(input.getBoundingClientRect().x), y: Math.round(input.getBoundingClientRect().y), w: Math.round(input.getBoundingClientRect().width) } : null, msgCount: msgs };
})()`;
console.log(JSON.stringify(await evalOn("ref", CHAT)));

console.log("\n=== /employeeportal + /tenantsetup wrappers ===");
for (const route of ["/employeeportal", "/tenantsetup"]) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 3500));
  const W = `(() => {
    const card = document.querySelector('main .rounded-xl');
    const main = document.querySelector('main');
    let n = card, chain = [];
    while (n && n !== main && chain.length < 6) { chain.push(String(n.className).slice(0, 90)); n = n.parentElement; }
    return { cardY: card ? Math.round(card.getBoundingClientRect().y) : null, cardW: card ? Math.round(card.getBoundingClientRect().width) : null, cardX: card ? Math.round(card.getBoundingClientRect().x) : null, chain };
  })()`;
  console.log(`${route}: ${JSON.stringify(await evalOn("ref", W))}`);
}
