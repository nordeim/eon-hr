#!/usr/bin/env node
// probe-r32-measure3.mjs — final measurements: /hrassistant header detail,
// mobile (390x844) sweep of the 10 real pages + blank/alias spot-checks.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
const baseRef = "https://eon.base44.app";

console.log("=== /hrassistant header (desktop) ===");
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open "${baseRef}/hrassistant"`);
await new Promise(r => setTimeout(r, 4000));
const HDR = `(() => {
  const h1 = [...document.querySelectorAll('h1')].filter(e => e.getBoundingClientRect().width > 0)[0];
  if (!h1) return { none: true };
  const r = h1.getBoundingClientRect();
  let p = h1.parentElement, chain = [];
  while (p && p.tagName !== 'MAIN' && chain.length < 4) { chain.push({ tag: p.tagName, cls: String(p.className).slice(0, 100) }); p = p.parentElement; }
  const spans = [...document.querySelectorAll('span')].filter(s => { const sr = s.getBoundingClientRect(); return sr.width > 0 && sr.y < r.y + 60 && sr.y > 20 && sr.x > 260; });
  return { h1: { t: h1.textContent.trim(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) }, chain, spans: spans.slice(0, 4).map(s => ({ t: s.textContent.trim().slice(0, 24), x: Math.round(s.getBoundingClientRect().x), y: Math.round(s.getBoundingClientRect().y), w: Math.round(s.getBoundingClientRect().width) })) };
})()`;
console.log(JSON.stringify(await evalOn("ref", HDR), null, 1));

console.log("\n=== mobile sweep (390x844) ===");
run(`agent-browser --session ref set viewport 390 844`);
const ROUTES = ["/careers","/employeeportal","/externaljobapplication","/hrassistant","/payrollai","/payrollreports","/requestreports","/requestsettings","/shiftswap","/tenantsetup"];
const MOB = `(() => {
  const h1 = [...document.querySelectorAll('h1')].filter(e => e.getBoundingClientRect().width > 0)[0];
  const card = document.querySelector('main .rounded-xl');
  const kicker = [...document.querySelectorAll('h1')].find(h => h.getBoundingClientRect().y > 60 && h.getBoundingClientRect().y < 200 && h !== h1);
  const btn = [...document.querySelectorAll('main button')].filter(b => b.getBoundingClientRect().width > 0 && b.getBoundingClientRect().y < 200)[0];
  return { h1: h1 ? { t: h1.textContent.trim().slice(0, 26), y: Math.round(h1.getBoundingClientRect().y), fs: getComputedStyle(h1).fontSize } : null, kickerH1: kicker ? kicker.textContent.trim().slice(0, 20) : null, btn: btn ? { t: btn.textContent.trim().slice(0, 18), y: Math.round(btn.getBoundingClientRect().y) } : null, card: card ? { y: Math.round(card.getBoundingClientRect().y), w: Math.round(card.getBoundingClientRect().width) } : null };
})()`;
for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 3200));
  console.log(`${route}: ${JSON.stringify(await evalOn("ref", MOB))}`);
}
