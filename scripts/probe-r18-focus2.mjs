#!/usr/bin/env node
// probe-r18-focus2.mjs — full-string focus-style dump for key elements on
// both apps (the r18 keyboard audit truncated box-shadow at 40 chars, hiding
// the visible ring layer). Tab to each target and dump the COMPLETE outline
// + box-shadow + the className driving it.
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
    outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, outlineOffset: cs.outlineOffset,
    boxShadow: cs.boxShadow,
    cls: (el.className && typeof el.className === "string") ? el.className.split(" ").filter(c => /focus|ring|outline/.test(c)).join("|") : "(svg)",
  });
})()`;

async function tabTo(session, base, route, vp, targetIdx, label) {
  run(`agent-browser --session ${session} set viewport ${vp[0]} ${vp[1]}`);
  run(`agent-browser --session ${session} open "${base}${route}"`);
  await new Promise(r => setTimeout(r, 2600));
  run(`agent-browser --session ${session} eval "document.body.focus(); 'x'"`);
  for (let i = 0; i < targetIdx; i++) run(`agent-browser --session ${session} press Tab`);
  const st = await evalOn(session, ACTIVE_FULL, 200);
  console.log(`  [${label}] ${JSON.stringify(st)}`);
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

console.log("── 1. DESKTOP sidebar link (stop #1, /dashboard @1440) ──");
await tabTo("ref", baseRef, "/dashboard", [1440, 900], 1, "REF");
await tabTo("loc", baseLoc, "/dashboard", [1440, 900], 1, "LOC");

console.log("── 2. MOBILE hamburger (stop #1, /dashboard @390) ──");
await tabTo("ref", baseRef, "/dashboard", [390, 844], 1, "REF");
await tabTo("loc", baseLoc, "/dashboard", [390, 844], 1, "LOC");

console.log("── 3. LOGIN email input (stop #4) + Sign in button (stop #6) ──");
await tabTo("ref", baseRef, "/login", [1440, 900], 4, "REF input");
await tabTo("loc", baseLoc, "/login", [1440, 900], 4, "LOC input");
await tabTo("ref", baseRef, "/login", [1440, 900], 6, "REF signin");
await tabTo("loc", baseLoc, "/login", [1440, 900], 6, "LOC signin");

console.log("── 4. /employees: search input + Add Employee CTA (find by index) ──");
// employees desktop: sidebar stops ~1-20; the search + CTA come after. Use 24/25.
await tabTo("ref", baseRef, "/employees", [1440, 900], 24, "REF e24");
await tabTo("loc", baseLoc, "/employees", [1440, 900], 24, "LOC e24");
await tabTo("ref", baseRef, "/employees", [1440, 900], 25, "REF e25");
await tabTo("loc", baseLoc, "/employees", [1440, 900], 25, "LOC e25");

console.log("── 5. MOBILE bottom tab (stop #9, /dashboard @390) ──");
await tabTo("ref", baseRef, "/dashboard", [390, 844], 9, "REF");
await tabTo("loc", baseLoc, "/dashboard", [390, 844], 9, "LOC");

console.log("FOCUS-FULL-DUMP-DONE");
