#!/usr/bin/env node
// capture-r14.mjs — screenshot the R14 remediated surfaces + standards.
// Usage: node scripts/capture-r14.mjs
import { execSync } from "node:child_process";

async function shot(name, route, extra = "") {
  try {
    execSync(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`, { stdio: "pipe", timeout: 45000 });
  } catch { }
  await new Promise(r => setTimeout(r, 2000));
  if (extra) {
    try { execSync(extra, { stdio: "pipe", timeout: 30000 }); } catch { }
    await new Promise(r => setTimeout(r, 1200));
  }
  try {
    execSync(`agent-browser --session loc screenshot docs/screenshots/${name}`, { stdio: "pipe", timeout: 30000 });
    console.log("OK", name);
  } catch { console.log("FAIL", name); }
}

// the six R14-fixed pages
const shots = [
  ["40-recruitment-desktop.png", "/recruitment"],
  ["41-training-desktop.png", "/training"],
  ["42-performancemanagement-desktop.png", "/performancemanagement"],
  ["32-staffrequests-desktop.png", "/staffrequests"],
  ["34-profile-desktop.png", "/profile"],
  ["36-compliancedashboard-desktop.png", "/compliancedashboard"],
  // standards refresh
  ["02-dashboard-desktop.png", "/dashboard"],
  ["03-employees-desktop.png", "/employees"],
];
for (const [n, r] of shots) await shot(n, r);

// profile Preferences tab (the R14-E fix)
await shot("43-profile-preferences-desktop.png", "/profile",
  `agent-browser --session loc eval "(() => { const t = [...document.querySelectorAll('[role=tab]')].find(x => /Preferences/.test(x.textContent || '')); if (t) t.click(); return 'ok'; })()"`);

// mobile set refresh (390×844)
execSync(`agent-browser --session loc set viewport 390 844`, { stdio: "pipe", timeout: 30000 });
await new Promise(r => setTimeout(r, 800));
await shot("11-mobile-dashboard.png", "/dashboard");
// drawer open
await shot("12-mobile-drawer-open.png", "/dashboard",
  `agent-browser --session loc click "button[aria-label='Toggle Sidebar']"`);
execSync(`agent-browser --session loc press Escape`, { stdio: "pipe", timeout: 30000 });
await new Promise(r => setTimeout(r, 800));
// mobile training (R14-B on mobile)
await shot("44-mobile-training.png", "/training");

// restore desktop viewport
execSync(`agent-browser --session loc set viewport 1440 900`, { stdio: "pipe", timeout: 30000 });
console.log("CAPTURE-DONE");
