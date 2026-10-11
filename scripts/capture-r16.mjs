#!/usr/bin/env node
// capture-r16.mjs — screenshot the R16 remediated surfaces + standards.
// Surfaces changed this round: surveys (0% value), workflowautomation
// (zero-render), chat (sidebar + right pane recipes), analytics (tile
// shrink @768), employees (filter fit @768). Usage:
// node scripts/capture-r16.mjs
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

// R16-A/B/C desktop surfaces
const shots = [
  ["38-surveys-desktop.png", "/surveys"],
  ["43-workflowautomation-desktop.png", "/workflowautomation"],
  ["13-chat-desktop.png", "/chat"],
  ["02-dashboard-desktop.png", "/dashboard"],
  ["03-employees-desktop.png", "/employees"],
];
for (const [n, r] of shots) await shot(n, r);

// R16-D/E tablet-band captures (768px) — the fitting surfaces
execSync(`agent-browser --session loc set viewport 768 844`, { stdio: "pipe", timeout: 30000 });
await new Promise(r => setTimeout(r, 800));
await shot("50-analytics-tablet-768.png", "/analytics");
await shot("51-employees-tablet-768.png", "/employees");

// mobile chat (sidebar hidden below md — right pane recipe visible)
execSync(`agent-browser --session loc set viewport 390 844`, { stdio: "pipe", timeout: 30000 });
await new Promise(r => setTimeout(r, 800));
await shot("52-chat-mobile.png", "/chat");
await shot("11-mobile-dashboard.png", "/dashboard");

// restore desktop viewport
execSync(`agent-browser --session loc set viewport 1440 900`, { stdio: "pipe", timeout: 30000 });
console.log("CAPTURE-DONE");
