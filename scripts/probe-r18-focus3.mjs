#!/usr/bin/env node
// probe-r18-focus3.mjs — targeted focus-style verification for the r18 gap
// family: (a) REF sidebar GROUP button ring color, (b) REF --ring var on
// login vs dashboard, (c) REF /employees search input ring, (d) REF tab +
// select trigger rings (/settings, /hrreports), (e) clone-side counterparts.
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
    cls: (el.className && typeof el.className === "string") ? el.className.split(" ").filter(c => /focus|ring/.test(c)).join("|") : "(svg)",
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

const RINGVAR = `(() => {
  const cs = getComputedStyle(document.documentElement);
  return JSON.stringify({ ring: cs.getPropertyValue("--ring").trim(), sidebarRing: cs.getPropertyValue("--sidebar-ring").trim() });
})()`;

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

console.log("── (a) sidebar GROUP buttons (stops #2, #3) /dashboard @1440 ──");
await tabTo("ref", baseRef, "/dashboard", [1440, 900], 2, "REF grp#2");
await tabTo("ref", baseRef, "/dashboard", [1440, 900], 3, "REF grp#3");

console.log("── (b) --ring var: login vs dashboard ──");
run(`agent-browser --session ref open "${baseRef}/login"`);
await new Promise(r => setTimeout(r, 2200));
console.log("  REF login:", JSON.stringify(await evalOn("ref", RINGVAR, 200)));
run(`agent-browser --session ref open "${baseRef}/dashboard"`);
await new Promise(r => setTimeout(r, 2200));
console.log("  REF dashboard:", JSON.stringify(await evalOn("ref", RINGVAR, 200)));
run(`agent-browser --session loc open "${baseLoc}/login"`);
await new Promise(r => setTimeout(r, 2200));
console.log("  LOC login:", JSON.stringify(await evalOn("loc", RINGVAR, 200)));

console.log("── (c) /employees search input (stops #22, #23) ──");
await tabTo("ref", baseRef, "/employees", [1440, 900], 22, "REF e22");
await tabTo("ref", baseRef, "/employees", [1440, 900], 23, "REF e23");

console.log("── (d) tab trigger (/settings — stops #21..#24) ──");
await tabTo("ref", baseRef, "/settings", [1440, 900], 21, "REF s21");
await tabTo("ref", baseRef, "/settings", [1440, 900], 22, "REF s22");
await tabTo("ref", baseRef, "/settings", [1440, 900], 23, "REF s23");

console.log("── (d2) select trigger (/hrreports — stops #21..#26) ──");
await tabTo("ref", baseRef, "/hrreports", [1440, 900], 22, "REF h22");
await tabTo("ref", baseRef, "/hrreports", [1440, 900], 23, "REF h23");
await tabTo("ref", baseRef, "/hrreports", [1440, 900], 24, "REF h24");

console.log("VERIFY-PROBES-DONE");
