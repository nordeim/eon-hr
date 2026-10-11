#!/usr/bin/env node
// probe-r18-focus4.mjs — REF switch + checkbox focus recipes (completing the
// interaction dimension). /notificationpreferences carries switches; the
// wizard/employees pages carry checkboxes (probe via direct .focus() is NOT
// valid for focus-visible — use Tab traversal).
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
    role: el.getAttribute("role") || "",
    t: (el.textContent || el.getAttribute("aria-label") || "").trim().replace(/\\s+/g, " ").slice(0, 22),
    boxShadow: cs.boxShadow,
    cls: (el.className && typeof el.className === "string") ? el.className.split(" ").filter(c => /focus|ring/.test(c)).join("|") : "(svg)",
  });
})()`;

async function tabScan(session, base, route, vp, stops) {
  run(`agent-browser --session ${session} set viewport ${vp[0]} ${vp[1]}`);
  run(`agent-browser --session ${session} open "${base}${route}"`);
  await new Promise(r => setTimeout(r, 2600));
  run(`agent-browser --session ${session} eval "document.body.focus(); 'x'"`);
  const found = [];
  for (let i = 0; i < stops; i++) {
    run(`agent-browser --session ${session} press Tab`);
    const st = await evalOn(session, ACTIVE_FULL, 130);
    if (st.role === "switch" || st.role === "checkbox" || /switch|checkbox/i.test(st.cls || "")) found.push(st);
  }
  return found;
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

console.log("── REF /notificationpreferences switches (18 stops) ──");
const refSw = await tabScan("ref", baseRef, "/notificationpreferences", [390, 844], 30);
console.log(JSON.stringify(refSw, null, 1));

console.log("── LOC /notificationpreferences switches (18 stops) ──");
const locSw = await tabScan("loc", baseLoc, "/notificationpreferences", [390, 844], 30);
console.log(JSON.stringify(locSw, null, 1));

console.log("SWITCH-PROBE-DONE");
