#!/usr/bin/env node
// capture-r18.mjs — session-19 screenshot captures: focus-ring evidence
// (the round's fixed surfaces, rings made visible via real Tab focus) +
// standards refresh. Saves to docs/screenshots/.
import { execSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 140);
  }
}

const DIR = "docs/screenshots";
const shot = (name) => `docs/screenshots/${name}.png`;

async function capture(name, setup, tabs = 0) {
  await setup();
  for (let i = 0; i < tabs; i++) run(`agent-browser --session loc press Tab`);
  await new Promise(r => setTimeout(r, 500));
  const out = run(`agent-browser --session loc screenshot ${shot(name)}`);
  console.log(`${name}: ${out.includes("Screenshot") || out.trim() === "" ? "saved" : out.trim().slice(0, 60)}`);
}

// 59: sidebar link focused — the blue sidebar-ring (R18-C)
await capture("59-sidebar-focus-ring-blue", async () => {
  run(`agent-browser --session loc set viewport 1440 900`);
  run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
  await new Promise(r => setTimeout(r, 2600));
  run(`agent-browser --session loc eval "document.body.focus(); 'x'"`);
}, 1);

// 60: CTA focused — the 1px button ring (R18-A) on /employees
await capture("60-cta-focus-ring-1px", async () => {
  run(`agent-browser --session loc open "http://127.0.0.1:3200/employees"`);
  await new Promise(r => setTimeout(r, 2600));
  run(`agent-browser --session loc eval "document.body.focus(); 'x'"`);
}, 25);

// 61: login email input focused — slate-400 ring (R18-E)
await capture("61-login-input-focus-slate400", async () => {
  run(`agent-browser --session loc open "http://127.0.0.1:3200/login"`);
  await new Promise(r => setTimeout(r, 2600));
  run(`agent-browser --session loc eval "document.body.focus(); 'x'"`);
}, 4);

// 62: settings Company tab focused — the 4px tab ring (R18-G)
await capture("62-tab-focus-ring-offset2", async () => {
  run(`agent-browser --session loc open "http://127.0.0.1:3200/settings"`);
  await new Promise(r => setTimeout(r, 2600));
  run(`agent-browser --session loc eval "document.body.focus(); 'x'"`);
}, 21);

// standards refresh (post-fix state)
await capture("02-dashboard", async () => {
  run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
  await new Promise(r => setTimeout(r, 2600));
}, 0);

await capture("06-employees", async () => {
  run(`agent-browser --session loc open "http://127.0.0.1:3200/employees"`);
  await new Promise(r => setTimeout(r, 2600));
}, 0);

await capture("33-settings", async () => {
  run(`agent-browser --session loc open "http://127.0.0.1:3200/settings"`);
  await new Promise(r => setTimeout(r, 2600));
}, 0);

await capture("00-login", async () => {
  run(`agent-browser --session loc open "http://127.0.0.1:3200/login"`);
  await new Promise(r => setTimeout(r, 2600));
}, 0);

const files = existsSync(DIR) ? readdirSync(DIR).filter(f => f.endsWith(".png")) : [];
console.log(`total: ${files.length}`);
console.log("CAPTURE-R18-DONE");
