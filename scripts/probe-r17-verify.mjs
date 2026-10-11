#!/usr/bin/env node
// probe-r17-verify.mjs — post-fix live verification (session 18 / round 17):
// (1) the 9 rowBreakpoint pages at 700 — REF column vs LOC column (title
// full-width, actions below); (2) the same pages at 1440 (unchanged);
// (3) the profile kicker at 390 (back button + subtitle + 69px);
// (4) the other 7 kickers unchanged (53px, h1 @32).
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 100);
  }
}

const HEADER = `(() => {
  const out = {};
  const h1 = [...document.querySelectorAll("h1")].find(h => h.offsetParent !== null && h.getBoundingClientRect().y > 70);
  if (!h1) return JSON.stringify({ noH1: true });
  const r = h1.getBoundingClientRect();
  out.h1 = { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y) };
  const row = h1.parentElement?.parentElement;
  if (row) { const rcs = getComputedStyle(row);
    out.row = { dir: rcs.flexDirection, w: Math.round(row.getBoundingClientRect().width) }; }
  const btn = [...document.querySelectorAll("main button")].filter(b => b.offsetParent !== null && b.textContent.trim().length > 3 && b.getBoundingClientRect().y < 400).sort((a, b) => a.getBoundingClientRect().y - b.getBoundingClientRect().y)[0];
  if (btn) { const br = btn.getBoundingClientRect(); out.firstBtn = { x: Math.round(br.x), y: Math.round(br.y) }; }
  return JSON.stringify(out);
})()`;

const KICKER = `(() => {
  const out = {};
  const kickers = [...document.querySelectorAll("main div")].filter(d => {
    const cs = getComputedStyle(d); const r = d.getBoundingClientRect();
    return cs.borderBottomWidth === "1px" && cs.backgroundColor === "rgb(255, 255, 255)" && r.y > 70 && r.y < 130 && r.height > 40 && r.height < 90 && cs.display !== "none";
  });
  const k = kickers[0];
  if (!k) return JSON.stringify({ noKicker: true });
  const kr = k.getBoundingClientRect();
  out.kicker = { y: Math.round(kr.y), h: Math.round(kr.height) };
  const btn = k.querySelector("button");
  if (btn) { const br = btn.getBoundingClientRect(); out.btn = { x: Math.round(br.x), y: Math.round(br.y), w: Math.round(br.width), h: Math.round(br.height) }; }
  const h1 = k.querySelector("h1");
  if (h1) { const hr = h1.getBoundingClientRect(); out.h1 = { x: Math.round(hr.x), y: Math.round(hr.y) }; }
  const p = k.querySelector("p");
  if (p) { out.sub = { t: p.textContent.trim().slice(0, 24), x: Math.round(p.getBoundingClientRect().x), y: Math.round(p.getBoundingClientRect().y) }; }
  return JSON.stringify(out);
})()`;

async function evalOn(session, expr) {
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
  } catch {
    return { error: out.slice(0, 90) };
  }
}

async function openAt(session, base, route, vp, settle = 2400) {
  run(`agent-browser --session ${session} set viewport ${vp[0]} ${vp[1]}`);
  run(`agent-browser --session ${session} open "${base}${route}"`);
  await new Promise(r => setTimeout(r, settle));
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const PAGES = ["/payrollmodule", "/documenttracker", "/recruitmentkanban", "/assetmanagement", "/attendance", "/recruitment", "/shiftcalendar", "/staffrequests", "/attendancedashboard"];

console.log("── 1. THE 9 PAGES @700 (expect column/column, title full-width, btn below) ──");
for (const route of PAGES) {
  await openAt("ref", baseRef, route, [700, 844]);
  const ref = await evalOn("ref", HEADER);
  await openAt("loc", baseLoc, route, [700, 844]);
  const loc = await evalOn("loc", HEADER);
  const col = loc.row?.dir === "column";
  const titleOk = loc.h1 && ref.h1 ? loc.h1.h <= ref.h1.h + 4 : false;
  const btnBelow = loc.firstBtn && ref.firstBtn ? Math.abs(loc.firstBtn.y - ref.firstBtn.y) <= 24 : false;
  console.log(`${col && titleOk ? "OK  " : "CHECK"} ${route} | REF ${ref.row?.dir} h1=${JSON.stringify(ref.h1)} btn@${JSON.stringify(ref.firstBtn)} | LOC ${loc.row?.dir} h1=${JSON.stringify(loc.h1)} btn@${JSON.stringify(loc.firstBtn)}${btnBelow ? "" : " (btn y delta > 24)"}`);
}

console.log("\n── 2. THE 9 PAGES @1440 (expect unchanged row/row) ──");
for (const route of PAGES) {
  await openAt("ref", baseRef, route, [1440, 900]);
  const ref = await evalOn("ref", HEADER);
  await openAt("loc", baseLoc, route, [1440, 900]);
  const loc = await evalOn("loc", HEADER);
  const same = ref.row?.dir === loc.row?.dir && ref.h1?.h === loc.h1?.h && Math.abs((ref.h1?.y ?? 0) - (loc.h1?.y ?? 0)) <= 6;
  console.log(`${same ? "OK  " : "DIFF"} ${route} | REF ${ref.row?.dir} h1=${JSON.stringify(ref.h1)} | LOC ${loc.row?.dir} h1=${JSON.stringify(loc.h1)}`);
}

console.log("\n── 3. PROFILE KICKER @390 (expect btn 36@32,105 + h1@80 + sub + kicker 69) ──");
await openAt("ref", baseRef, "/profile", [390, 844]);
const refK = await evalOn("ref", KICKER);
await openAt("loc", baseLoc, "/profile", [390, 844]);
const locK = await evalOn("loc", KICKER);
console.log("REF:", JSON.stringify(refK));
console.log("LOC:", JSON.stringify(locK));

console.log("\n── 4. THE OTHER 7 KICKERS @390 (expect unchanged 53px, h1@32, no btn) ──");
for (const route of ["/dashboard", "/employees", "/payroll", "/taskmanager", "/leavemanagement", "/expenses", "/loans"]) {
  await openAt("loc", baseLoc, route, [390, 844]);
  const loc = await evalOn("loc", KICKER);
  const ok = loc.kicker?.h === 53 && loc.h1?.x === 32 && !loc.btn;
  console.log(`${ok ? "OK  " : "DIFF"} ${route} ${JSON.stringify(loc)}`);
}
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc set viewport 1440 900`);
console.log("\nVERIFY-DONE");
