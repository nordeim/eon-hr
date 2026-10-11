#!/usr/bin/env node
// probe-r15-fit.mjs — LOC mid-viewport fitting audit: which pages overflow
// horizontally at 1100/1280 (the attendance shrink-0 cluster finding).
// Usage: node scripts/probe-r15-fit.mjs
const { execSync } = await import("node:child_process");

const PROBE = `(() => {
  const out = { path: location.pathname, vw: window.innerWidth, docW: document.documentElement.scrollWidth };
  const wide = [...document.querySelectorAll("main *")].filter(e => { const r = e.getBoundingClientRect(); return r.right > window.innerWidth + 1 && r.width > 50 && e.children.length < 10; }).slice(0, 2);
  out.overflow = wide.map(e => { const r = e.getBoundingClientRect(); return { cls: String(e.className).slice(0, 50), w: Math.round(r.width), right: Math.round(r.right), t: (e.textContent || "").trim().slice(0, 18) }; });
  return JSON.stringify(out);
})()`;

const ROUTES = [
  "/attendance", "/employees", "/payroll", "/taskmanager", "/settings",
  "/hrreports", "/compliancedashboard", "/recruitment", "/leavemanagement",
  "/expenses", "/reports", "/analytics", "/profile",
];

async function measure(viewport) {
  execSync(`agent-browser --session loc set viewport ${viewport} 800`, { stdio: "pipe", timeout: 30000 });
  await new Promise(r => setTimeout(r, 1200));
  for (const route of ROUTES) {
    try {
      execSync(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`, { stdio: "pipe", timeout: 45000 });
    } catch { /* continue */ }
    await new Promise(r => setTimeout(r, 1500));
    const oneLine = PROBE.split("\n").join(" ");
    try {
      const out = execSync(`agent-browser --session loc eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 30000 });
      const j = JSON.parse(out.toString().trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
      const overflows = j.docW > j.vw + 1;
      console.log(`${viewport} ${route} | docW ${j.docW} vs vw ${j.vw} ${overflows ? "**OVERFLOW** " + JSON.stringify(j.overflow) : "fit"}`);
    } catch (e) {
      console.log(`${viewport} ${route} | ERR ${String(e).slice(0, 50)}`);
    }
  }
}

await measure(1280);
await measure(1100);
execSync(`agent-browser --session loc set viewport 1440 900`, { stdio: "pipe", timeout: 30000 });
