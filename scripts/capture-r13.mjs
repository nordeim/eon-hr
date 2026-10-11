#!/usr/bin/env node
// capture-r13.mjs — screenshot the R13 remediated surfaces + standards.
const { execSync } = await import("node:child_process");
const shots = [
  ["33-settings-desktop.png", "/settings"],
  ["34-profile-desktop.png", "/profile"],
  ["35-attendance-desktop.png", "/attendance"],
  ["36-compliancedashboard-desktop.png", "/compliancedashboard"],
  ["37-reports-desktop.png", "/reports"],
  ["38-offboarding-desktop.png", "/offboarding"],
  ["39-advancedanalytics-desktop.png", "/advancedanalytics"],
  ["02-dashboard-desktop.png", "/dashboard"],
  ["03-employees-desktop.png", "/employees"],
  ["10-taskmanager-desktop.png", "/taskmanager"],
  ["16-allleaverequests-desktop.png", "/allleaverequests"],
  ["25-securitysettings-desktop.png", "/securitysettings"],
  ["26-hrreports-desktop.png", "/hrreports"],
  ["30-notificationpreferences-desktop.png", "/notificationpreferences"],
  ["31-analytics-desktop.png", "/analytics"],
  ["32-staffrequests-desktop.png", "/staffrequests"],
];
for (const [name, route] of shots) {
  try {
    execSync(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`, { stdio: "pipe", timeout: 45000 });
  } catch { }
  await new Promise(r => setTimeout(r, 1800));
  try {
    execSync(`agent-browser --session loc screenshot docs/screenshots/${name}`, { stdio: "pipe", timeout: 30000 });
    console.log("OK", name);
  } catch (e) { console.log("FAIL", name); }
}
// mobile set
const mobile = [
  ["11-mobile-dashboard.png", "/dashboard"],
  ["12-mobile-drawer-open.png", "/dashboard"],
  ["13-mobile-after-drawer-nav.png", "/settings"],
];
