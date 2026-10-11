#!/usr/bin/env node
// probe-r18-select.mjs — locate the Radix select triggers in the LOC tab
// order and dump their focus rings (R18-F verification).
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 30000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 120);
  }
}

async function evalOn(session, expr, ms = 150) {
  await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
  } catch {
    return { error: out.slice(0, 150) };
  }
}

const STOP = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return JSON.stringify({ s: "body" });
  const cs = getComputedStyle(el);
  return JSON.stringify({
    tag: el.tagName.toLowerCase(),
    role: el.getAttribute("role") || "",
    t: (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 14),
    ring: cs.boxShadow === "none" ? "none" : cs.boxShadow.split(", ").filter(l => !/rgba\\(0, 0, 0, 0\\) 0px 0px 0px 0px/.test(l)).join(" | "),
  });
})()`;

run(`agent-browser --session loc set viewport 390 844`);
run(`agent-browser --session loc open "http://127.0.0.1:3200/shiftcalendar"`);
await new Promise(r => setTimeout(r, 2500));
run(`agent-browser --session loc eval "document.body.focus(); 'x'"`);
for (let i = 1; i <= 24; i++) {
  run(`agent-browser --session loc press Tab`);
  const st = await evalOn("loc", STOP, 120);
  console.log(`#${i} ${JSON.stringify(st)}`);
}
console.log("SELECT-SCAN-DONE");
