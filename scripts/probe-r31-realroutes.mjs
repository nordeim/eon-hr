#!/usr/bin/env node
// probe-r31-realroutes.mjs — probe the REAL routes (/assetmanagement,
// /hrassistantchat, /staffrequests, /training) on both apps + dump REF's
// /employeeselfservice main content (h1 census showed an empty stub).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const PAGE = `(() => {
  const main = document.querySelector('main') || [...document.querySelectorAll('div')].find(d => d.className.toString().includes('flex-1'));
  const h1 = [...document.querySelectorAll('h1')].find(h => h.getBoundingClientRect().y > 50);
  const txt = (main ? main.innerText : document.body.innerText).replace(/\\n+/g, ' | ').slice(0, 220);
  return JSON.stringify({ url: location.pathname, h1: h1 ? { t: h1.textContent.trim().slice(0,30), y: Math.round(h1.getBoundingClientRect().y), fs: getComputedStyle(h1).fontSize } : null, txt });
})()`;

const ROUTES = ["/assetmanagement", "/hrassistantchat", "/staffrequests", "/training", "/employeeselfservice"];

run("agent-browser --session ref set viewport 1440 900");
run("agent-browser --session loc set viewport 1440 900");

for (const route of ROUTES) {
  const out = {};
  for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    run(`agent-browser --session ${s} open "${base}${route}"`);
    await new Promise(r => setTimeout(r, 3200));
    out[s] = await evalOn(s, PAGE);
  }
  console.log(`\n=== ${route} ===`);
  console.log(`REF: ${JSON.stringify(out.ref)}`);
  console.log(`LOC: ${JSON.stringify(out.loc)}`);
}
