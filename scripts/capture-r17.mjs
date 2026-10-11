#!/usr/bin/env node
// capture-r17.mjs — screenshot the R17 remediated surfaces + standards.
// Surfaces changed this round: the 9 rowBreakpoint="md" pages (column
// headers in the 640–767 band) and the profile mobile kicker (back button
// + subtitle). Usage: node scripts/capture-r17.mjs
import { execSync } from "node:child_process";

async function shot(name, route, settle = 2200) {
  try {
    execSync(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`, { stdio: "pipe", timeout: 45000 });
  } catch { }
  await new Promise(r => setTimeout(r, settle));
  try {
    execSync(`agent-browser --session loc screenshot docs/screenshots/${name}`, { stdio: "pipe", timeout: 30000 });
    console.log("OK", name);
  } catch { console.log("FAIL", name); }
}

async function setVp(w, h) {
  execSync(`agent-browser --session loc set viewport ${w} ${h}`, { stdio: "pipe", timeout: 30000 });
  await new Promise(r => setTimeout(r, 800));
}

// R17-A: the 640–767 band (captured at 700) — column headers, title
// full-width, actions below. Three representative pages + the contrast
// page (templates — the always-row page that KEEPS the row at 700).
await setVp(700, 844);
await shot("53-payrollmodule-band-700.png", "/payrollmodule");
await shot("54-staffrequests-band-700.png", "/staffrequests");
await shot("55-attendancedashboard-band-700.png", "/attendancedashboard");
await shot("56-templates-band-700.png", "/templates");

// R17-B: the profile mobile kicker (back button + subtitle, 69px bar)
await setVp(390, 844);
await shot("57-profile-kicker-mobile-390.png", "/profile");
// a standard kicker for contrast (53px, no button)
await shot("58-employees-kicker-mobile-390.png", "/employees");

// standards refresh (desktop)
await setVp(1440, 900);
await shot("02-dashboard-desktop.png", "/dashboard");
await shot("35-attendance-desktop.png", "/attendance");
await shot("40-recruitment-desktop.png", "/recruitment");
await shot("44-payrollmodule-desktop.png", "/payrollmodule");
await shot("42-attendancedashboard-desktop.png", "/attendancedashboard");

console.log("CAPTURE-DONE");
