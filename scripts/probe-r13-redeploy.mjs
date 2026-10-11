#!/usr/bin/env node
// probe-r13-redeploy.mjs — redeploy check: compare route h1 text/metrics
// between REF (eon.base44.app) and LOC (:3200).
// Usage: node scripts/probe-r13-redeploy.mjs
const { execSync } = await import("node:child_process");

const PROBE = `(() => {
  const out = { url: location.pathname };
  const h1 = [...document.querySelectorAll("h1")].find(h => h.offsetParent !== null);
  if (h1) {
    const r = h1.getBoundingClientRect();
    const cs = getComputedStyle(h1);
    out.h1 = { t: h1.textContent.trim().split(String.fromCharCode(10)).join(" ").replace(/ +/g, " ").slice(0, 30),
      x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), fs: cs.fontSize, fw: cs.fontWeight };
  }
  return JSON.stringify(out);
})()`;

async function measure(session, base, route) {
  const url = base + route;
  try {
    execSync(`agent-browser --session ${session} open "${url}"`, { stdio: "pipe", timeout: 45000 });
  } catch { /* continue */ }
  await new Promise(r => setTimeout(r, 1500));
  // NB: agent-browser eval does NOT un-escape JSON string args — flatten to one line first
  const oneLine = PROBE.split("\n").join(" ");
  try {
    const out = execSync(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 30000 });
    return JSON.parse(out.toString().trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
  } catch (e) {
    return { error: String(e).slice(0, 80) };
  }
}

const ROUTES = [
  "/dashboard", "/employees", "/payroll", "/taskmanager",
  "/settings", "/hrreports", "/analytics", "/notificationpreferences",
  "/staffrequests", "/leavemanagement", "/expenses",
];

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
for (const route of ROUTES) {
  const ref = await measure("ref", baseRef, route);
  const loc = await measure("loc", baseLoc, route);
  const rt = ref.h1 ? ref.h1.t : "ERR", lt = loc.h1 ? loc.h1.t : "ERR";
  const m = rt === lt && ref.h1 && loc.h1 && ref.h1.fs === loc.h1.fs && ref.h1.fw === loc.h1.fw && ref.h1.x === loc.h1.x;
  console.log(`${route} | REF "${rt}" ${ref.h1 ? ref.h1.fs + "/" + ref.h1.fw + " @" + ref.h1.x + "," + ref.h1.y : ""} | LOC "${lt}" ${loc.h1 ? loc.h1.fs + "/" + loc.h1.fw + " @" + loc.h1.x + "," + loc.h1.y : ""} | ${m ? "MATCH" : "**DIFF**"}`);
}
