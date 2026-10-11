#!/usr/bin/env node
// probe-r18-settle.mjs — settle-check REF at sub-390 widths where the sweep
// showed suspicious readings (dashboard 430/110 at BOTH 344 and 389; the 61px
// bar + card-w=40 pattern). Reads twice with a long settle to separate the
// mid-hydration artifact family from real sub-390 behavior.
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 140);
  }
}

async function evalOn(session, expr, ms) {
  await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
  } catch {
    return { error: out.slice(0, 150) };
  }
}

const PROBE = `(() => {
  const out = { url: location.pathname };
  out.docW = document.documentElement.scrollWidth;
  out.vw = window.innerWidth;
  const bar = [...document.querySelectorAll("header,div")].find(d => {
    if (d.tagName !== "HEADER" && !(d.getBoundingClientRect().height > 55 && d.getBoundingClientRect().height < 95)) return false;
    const r = d.getBoundingClientRect(); const cs = getComputedStyle(d);
    return r.y < 10 && r.width > 250 && r.width <= out.vw + 5 && (d.tagName === "HEADER" || cs.position === "sticky" || cs.position === "fixed");
  });
  if (bar) { const r = bar.getBoundingClientRect(); out.topBar = { w: Math.round(r.width), h: Math.round(r.height) }; }
  const h1s = [...document.querySelectorAll("h1")].filter(h => h.offsetParent !== null);
  out.h1s = h1s.map(h => { const r = h.getBoundingClientRect(); return { t: h.textContent.trim().slice(0, 24), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), fs: getComputedStyle(h).fontSize }; });
  const kick = [...document.querySelectorAll("div")].find(d => {
    const cs = getComputedStyle(d); const r = d.getBoundingClientRect();
    return cs.display !== "none" && r.y >= 80 && r.y <= 125 && r.height >= 45 && r.height <= 75 && cs.backgroundColor === "rgb(255, 255, 255)" && cs.borderBottomWidth === "1px";
  });
  out.kicker = kick ? Math.round(kick.getBoundingClientRect().height) : null;
  return JSON.stringify(out);
})()`;

const baseRef = "https://eon.base44.app";

for (const [w, route] of [[344, "/dashboard"], [389, "/dashboard"], [344, "/employees"], [389, "/staffrequests"]]) {
  run(`agent-browser --session ref set viewport ${w} 844`);
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  const t1 = await evalOn("ref", PROBE, 5000);
  const t2 = await evalOn("ref", PROBE, 3000);
  const stable = JSON.stringify(t1) === JSON.stringify(t2) ? "STABLE" : "CHANGED(re-settling)";
  console.log(`REF @${w} ${route} [${stable}]`);
  console.log(`  t1: ${JSON.stringify(t1)}`);
  console.log(`  t2: ${JSON.stringify(t2)}`);
}
run(`agent-browser --session ref set viewport 1440 900`);
console.log("SETTLE-CHECK-DONE");
