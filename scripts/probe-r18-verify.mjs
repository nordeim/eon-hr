#!/usr/bin/env node
// probe-r18-verify.mjs — final LOC verification of the tab-trigger (R18-G)
// and select-trigger (R18-F) focus recipes against REF's measured values.
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 30000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 120);
  }
}

async function evalOn(session, expr, ms = 300) {
  await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
  } catch {
    return { error: out.slice(0, 200) };
  }
}

const ACTIVE_FULL = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return JSON.stringify({ stop: "body" });
  const cs = getComputedStyle(el);
  return JSON.stringify({
    tag: el.tagName.toLowerCase(),
    t: (el.textContent || el.getAttribute("aria-label") || "").trim().replace(/\\s+/g, " ").slice(0, 22),
    boxShadow: cs.boxShadow,
  });
})()`;

async function tabTo(session, base, route, targetIdx, label) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open "${base}${route}"`);
  await new Promise(r => setTimeout(r, 2600));
  run(`agent-browser --session ${session} eval "document.body.focus(); 'x'"`);
  for (let i = 0; i < targetIdx; i++) run(`agent-browser --session ${session} press Tab`);
  const st = await evalOn(session, ACTIVE_FULL, 200);
  console.log(`  [${label}] ${JSON.stringify(st)}`);
}

const baseLoc = "http://127.0.0.1:3200";

console.log("── LOC /settings tab trigger (stop #21) — REF: white 2px + rgb(10,10,10) 4px ──");
await tabTo("loc", baseLoc, "/settings", 21, "LOC s21");

console.log("── LOC /hrreports select triggers (stops #22, #23) — REF: rgb(10,10,10) 1px no offset ──");
await tabTo("loc", baseLoc, "/hrreports", 22, "LOC h22");
await tabTo("loc", baseLoc, "/hrreports", 23, "LOC h23");

console.log("── LOC /dashboard sidebar group button (stop #2) — REF: rgb(59,130,246) 2px ──");
await tabTo("loc", baseLoc, "/dashboard", 2, "LOC grp#2");

console.log("LOC-VERIFY-DONE");
