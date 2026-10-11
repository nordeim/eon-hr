#!/usr/bin/env node
// probe-r15-pills.mjs — tab-pill inactive-trigger color audit (the R15 find:
// REF inactive trigger text = neutral-500 #737373, LOC = slate-500 #64748B).
// Usage: node scripts/probe-r15-pills.mjs
const { execSync } = await import("node:child_process");

const PROBE = `(() => {
  const out = { path: location.pathname };
  const pills = [...document.querySelectorAll("[role=tablist]")].slice(0, 4);
  out.pills = pills.map(p => {
    const triggers = [...p.querySelectorAll("[role=tab]")];
    const pr = p.getBoundingClientRect();
    const inactive = triggers.find(t => t.getAttribute("data-state") !== "active") || triggers[1] || triggers[0];
    const active = triggers.find(t => t.getAttribute("data-state") === "active") || triggers[0];
    return { w: Math.round(pr.width), bg: getComputedStyle(p).backgroundColor,
      inactiveColor: inactive ? getComputedStyle(inactive).color : null,
      activeColor: active ? getComputedStyle(active).color : null,
      inactiveFs: inactive ? getComputedStyle(inactive).fontSize : null };
  });
  return JSON.stringify(out);
})()`;

const ROUTES = [
  "/settings", "/profile", "/attendance", "/compliancedashboard",
  "/recruitment", "/performancemanagement", "/evaluations", "/staffrequests",
];

async function measure(session, base, route) {
  try {
    execSync(`agent-browser --session ${session} open "${base + route}"`, { stdio: "pipe", timeout: 45000 });
  } catch { /* continue */ }
  await new Promise(r => setTimeout(r, 2200));
  const oneLine = PROBE.split("\n").join(" ");
  try {
    const out = execSync(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 30000 });
    return JSON.parse(out.toString().trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
  } catch (e) {
    return { error: String(e).slice(0, 80) };
  }
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
for (const route of ROUTES) {
  const ref = await measure("ref", baseRef, route);
  const loc = await measure("loc", baseLoc, route);
  const rp = ref.pills || [], lp = loc.pills || [];
  let line = `${route} | REF ${rp.length} pill(s)`;
  for (let i = 0; i < Math.max(rp.length, lp.length); i++) {
    const r = rp[i], l = lp[i];
    if (!r || !l) { line += ` | pill${i}: MISSING`; continue; }
    const colorMatch = r.inactiveColor === l.inactiveColor;
    line += ` | pill${i} ${r.w} vs ${l.w}px, inactive ${r.inactiveColor} vs ${l.inactiveColor} ${colorMatch ? "MATCH" : "**COLOR-DIFF**"}`;
  }
  console.log(line);
}
