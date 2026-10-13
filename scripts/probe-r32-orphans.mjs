#!/usr/bin/env node
// probe-r32-orphans.mjs — the round-31 systematic orphan-route hunt.
// The REF bundle's page registry (VKe={...61 keys}) + We(name)=/lowercase
// yields 14 routes the clone does not serve. Probe each on REF (and LOC):
// status, h1, kicker, body-text sample, 404?
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const ROUTES = ["/careers","/employeedetail","/employeeportal","/externaljobapplication","/hrassistant","/home","/organizationsetup","/payrollai","/payrollreports","/requestreports","/requestsettings","/shiftswap","/tenantsetup","/dynamicdashboard"];

const PAGE = `(() => {
  const h1 = [...document.querySelectorAll('h1')].filter(e => e.getBoundingClientRect().width > 0)[0];
  const kicker = [...document.querySelectorAll('main span, span')].find(e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height < 30 && e.children.length === 0 && /^[A-Z][a-z]/.test(e.textContent.trim()) && e.textContent.trim().length > 3 && e.textContent.trim().length < 30);
  const is404 = document.body.innerText.includes('Page Not Found') || document.body.innerText.includes('404');
  const main = document.querySelector('main');
  const txt = (main ? main.innerText : document.body.innerText).replace(/\\s+/g, ' ').trim().slice(0, 140);
  const btns = [...document.querySelectorAll('main button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()).filter(Boolean).slice(0, 5);
  return { title: document.title, h1: h1 ? h1.textContent.trim().slice(0, 40) : null, kicker: kicker ? kicker.textContent.trim() : null, is404, txt, btns };
})()`;

run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc set viewport 1440 900`);
for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 3200));
  const ref = await evalOn("ref", PAGE);
  console.log(`REF ${route}: ${JSON.stringify(ref).slice(0, 320)}`);
}
