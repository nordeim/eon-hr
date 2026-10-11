#!/usr/bin/env node
// capture-r15.mjs — screenshot the R15 remediated surfaces + standards.
// Usage: node scripts/capture-r15.mjs
import { execSync } from "node:child_process";

async function shot(name, route, extra = "") {
  try {
    execSync(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`, { stdio: "pipe", timeout: 45000 });
  } catch { }
  await new Promise(r => setTimeout(r, 2200));
  if (extra) {
    try { execSync(extra, { stdio: "pipe", timeout: 30000 }); } catch { }
    await new Promise(r => setTimeout(r, 1400));
  }
  try {
    execSync(`agent-browser --session loc screenshot docs/screenshots/${name}`, { stdio: "pipe", timeout: 30000 });
    console.log("OK", name);
  } catch { console.log("FAIL", name); }
}

// R15-D organogram rebuild + R15-E staffrequests + the pill-color pages (R15-A)
const shots = [
  ["21-organogram-desktop.png", "/organogram"],
  ["32-staffrequests-desktop.png", "/staffrequests"],
  ["33-settings-desktop.png", "/settings"],
  ["34-profile-desktop.png", "/profile"],
  ["35-attendance-desktop.png", "/attendance"],
  ["36-compliancedashboard-desktop.png", "/compliancedashboard"],
  ["37-reports-desktop.png", "/reports"],
  ["40-recruitment-desktop.png", "/recruitment"],
  ["20-evaluations-desktop.png", "/evaluations"],
  ["42-performancemanagement-desktop.png", "/performancemanagement"],
  // standards refresh (sidebar footer colors — R15-B — visible on every shot)
  ["02-dashboard-desktop.png", "/dashboard"],
];
for (const [n, r] of shots) await shot(n, r);

// mobile drawer footer colors (R15-B applies to the shared component)
execSync(`agent-browser --session loc set viewport 390 844`, { stdio: "pipe", timeout: 30000 });
await new Promise(r => setTimeout(r, 800));
await shot("11-mobile-dashboard.png", "/dashboard");
await shot("12-mobile-drawer-open.png", "/dashboard",
  `agent-browser --session loc click "button[aria-label='Toggle Sidebar']"`);
execSync(`agent-browser --session loc press Escape`, { stdio: "pipe", timeout: 30000 });

// restore desktop viewport
execSync(`agent-browser --session loc set viewport 1440 900`, { stdio: "pipe", timeout: 30000 });
console.log("CAPTURE-DONE");
