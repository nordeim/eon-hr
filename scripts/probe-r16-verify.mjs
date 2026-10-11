#!/usr/bin/env node
// probe-r16-verify.mjs — live verification of the five R16 fixes:
// A) surveys "0 %" value, B) workflowautomation zero-render, C) chat sidebar
// recipe, D) analytics tile shrink @768 (docW), E) employees filter fit @768.
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 100);
  }
}

async function evalOn(session, base, route, probe, vp) {
  if (vp) run(`agent-browser --session ${session} set viewport ${vp} 844`);
  run(`agent-browser --session ${session} open "${base}${route}"`);
  await new Promise(r => setTimeout(r, 2300));
  const oneLine = probe.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
  } catch {
    return { parseErr: out.slice(0, 90) };
  }
}

// A) surveys stat values
const SURVEYS = `(() => {
  const vals = [...document.querySelectorAll("main .grid p, main .grid div")].filter(e => e.offsetParent !== null && /^[%0-9 ]+$/.test((e.textContent || "").trim()) && (e.textContent || "").trim().length > 0 && e.getBoundingClientRect().height > 30);
  return JSON.stringify({ vals: vals.map(v => ({ t: (v.textContent || "").trim(), w: Math.round(v.getBoundingClientRect().width), y: Math.round(v.getBoundingClientRect().y) })) });
})()`;

// B) workflowautomation below-stat content
const WF = `(() => {
  const main = document.querySelector("main");
  const cards = [...document.querySelectorAll("main .grid > div")].filter(c => c.offsetParent !== null);
  const h3 = [...document.querySelectorAll("main h3")].filter(h => h.offsetParent !== null).map(h => (h.textContent || "").trim());
  const wrapper = [...document.querySelectorAll("main div")].find(d => String(d.className).includes("max-w-7xl"));
  return JSON.stringify({ statCards: cards.length, h3, wrapperH: wrapper ? Math.round(wrapper.getBoundingClientRect().height) : null });
})()`;

// C) chat sidebar zero state
const CHAT = `(() => {
  const p = [...document.querySelectorAll("main p")].find(e => (e.textContent || "").includes("No conversations yet"));
  if (!p) return JSON.stringify({ found: false });
  const holder = p.parentElement;
  const svg = holder.querySelector("svg");
  const hr = holder.getBoundingClientRect();
  const pr = p.getBoundingClientRect();
  const cs = getComputedStyle(p);
  return JSON.stringify({ found: true, holderCls: String(holder.className), holderH: Math.round(hr.height), holderW: Math.round(hr.width), pY: Math.round(pr.y), pW: Math.round(pr.width), pFs: cs.fontSize, pColor: cs.color, icon: svg ? { w: Math.round(svg.getBoundingClientRect().width), h: Math.round(svg.getBoundingClientRect().height) } : null });
})()`;

// D+E) docW overflow check
const DOCW = `(() => JSON.stringify({ vw: window.innerWidth, docW: document.documentElement.scrollWidth }))()`;

console.log("== A) /surveys stat values ==");
console.log("REF:", JSON.stringify(await evalOn("ref", "https://eon.base44.app", "/surveys", SURVEYS, 1440)));
console.log("LOC:", JSON.stringify(await evalOn("loc", "http://127.0.0.1:3200", "/surveys", SURVEYS, 1440)));

console.log("\n== B) /workflowautomation zero-render ==");
console.log("REF:", JSON.stringify(await evalOn("ref", "https://eon.base44.app", "/workflowautomation", WF, 1440)));
console.log("LOC:", JSON.stringify(await evalOn("loc", "http://127.0.0.1:3200", "/workflowautomation", WF, 1440)));

console.log("\n== C) /chat sidebar zero state ==");
console.log("REF:", JSON.stringify(await evalOn("ref", "https://eon.base44.app", "/chat", CHAT, 1440)));
console.log("LOC:", JSON.stringify(await evalOn("loc", "http://127.0.0.1:3200", "/chat", CHAT, 1440)));

console.log("\n== D) /analytics docW @768 ==");
console.log("REF:", JSON.stringify(await evalOn("ref", "https://eon.base44.app", "/analytics", DOCW, 768)));
console.log("LOC:", JSON.stringify(await evalOn("loc", "http://127.0.0.1:3200", "/analytics", DOCW, 768)));

console.log("\n== E) /employees docW @768 ==");
console.log("REF:", JSON.stringify(await evalOn("ref", "https://eon.base44.app", "/employees", DOCW, 768)));
console.log("LOC:", JSON.stringify(await evalOn("loc", "http://127.0.0.1:3200", "/employees", DOCW, 768)));

console.log("\n== E2) /employees + /analytics + /chat @900/1024 spot ==");
for (const vp of [900, 1024]) {
  for (const route of ["/employees", "/analytics"]) {
    console.log(`${route} @${vp} REF:`, JSON.stringify(await evalOn("ref", "https://eon.base44.app", route, DOCW, vp)));
    console.log(`${route} @${vp} LOC:`, JSON.stringify(await evalOn("loc", "http://127.0.0.1:3200", route, DOCW, vp)));
  }
}
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc set viewport 1440 900`);
