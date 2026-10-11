#!/usr/bin/env node
// probe-r13-buttons.mjs — enumerate every iconed button (svg + text) in the
// header zone on both sides across routes; report width deltas.
// Usage: node scripts/probe-r13-buttons.mjs [routes...]
const { execSync } = await import("node:child_process");

const PROBE = `(() => {
  const btns = [...document.querySelectorAll("main button")].filter(b => b.querySelector("svg") && b.textContent.trim().length > 0);
  return JSON.stringify(btns.map(b => {
    const r = b.getBoundingClientRect();
    const svg = b.querySelector("svg");
    const cs = getComputedStyle(svg);
    return { t: b.textContent.trim().replace(/ +/g, " ").slice(0, 18), w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y), mR: cs.marginRight, svgW: Math.round(svg.getBoundingClientRect().width) };
  }).filter(x => x.h >= 28 && x.h <= 44).slice(0, 12));
})()`;

async function measure(session, base, route) {
  const url = base + route;
  try { execSync(`agent-browser --session ${session} open "${url}"`, { stdio: "pipe", timeout: 45000 }); } catch { }
  await new Promise(r => setTimeout(r, 1400));
  const oneLine = PROBE.split("\n").join(" ");
  try {
    const out = execSync(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 30000 });
    return JSON.parse(out.toString().trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
  } catch (e) { return [{ error: String(e).slice(0, 50) }]; }
}

const ROUTES = process.argv.length > 2 ? process.argv.slice(2) : ["/employees","/payroll","/payrollmodule","/payrollengine","/taskmanager","/attendance","/attendancedashboard","/shiftcalendar","/documenttracker","/surveyanalytics","/analyticsdashboard","/reports","/settings","/hrletters","/surveys","/announcements","/compliancedashboard","/offboarding","/profile","/advancedanalytics","/analytics"];

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
for (const route of ROUTES) {
  const ref = await measure("ref", baseRef, route);
  const loc = await measure("loc", baseLoc, route);
  console.log(`--- ${route}`);
  const max = Math.max(ref.length, loc.length);
  for (let i = 0; i < max; i++) {
    const a = ref[i], b = loc[i];
    if (!a || !b) { console.log(`  [${i}] MISSING ref=${a?.t} loc=${b?.t}`); continue; }
    const d = a.w - b.w;
    const flag = d === 0 ? "==" : (d === 8 && a.mR !== "0px" && b.mR === "0px" ? "MR2-MISSING" : "DIFF");
    if (d !== 0 || a.h !== b.h) console.log(`  [${i}] ${a.t}: w ${a.w} vs ${b.w} (d${d}) h ${a.h} vs ${b.h} mR ${a.mR}/${b.mR} y ${a.y}/${b.y} ${flag}`);
  }
}
