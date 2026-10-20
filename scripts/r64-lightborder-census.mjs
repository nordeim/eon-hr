#!/usr/bin/env node
// r64-lightborder-census.mjs — session-64 / parity round 63: THE LIGHT-MODE
// BORDER-COLOR CENSUS, full-route. The computed-color census families so far:
// r57 CTA/button fills (light), r58 badge/chip leaf fills (light), r59 the
// union fill read (dark), r60 non-button text + placeholders (dark), r61
// borders (DARK ONLY), r62 the light text + buttons read. The recorded gap:
// NO border-color census ever ran in LIGHT mode — the r61 border census read
// DARK only, and the light recipes were pinned member-level in rounds 1–58
// (byte comparisons, not computed reads). This round reads the computed
// border-color of every VISIBLY-BORDERED element in main, buttons INCLUDED
// (button borders were read only in dark at r61), all 49 routes, paired
// live in LIGHT mode (html NOT .dark, localStorage darkMode="false").
// This is the LAST uncensured cell of the computed-color matrix
// (fill r57-59 light+dark, text r60/r62 dark+light, border r61 dark).
// Visibility filter (the r61 w:0 lesson): the element rect must be non-zero
// AND at least one border side must carry width > 0 with style != none;
// transparent sides are skipped as invisible.
// Comparison: the deduped SET of (tag|color) pairs — text-agnostic (the
// seeded LOC vs zero-data REF populations must not generate noise; the
// set comparison can hide inversions — triage probes decompose the DIFFs,
// the E2E pins are the contract).
// Instrument lessons applied: single-quoted password fills (the
// $Abcd1234 shell-expansion trap), mid-run re-auths (REF short TTL),
// login-page detection + retry, content waits (not fixed ms), DIFF dumps
// saved to files mid-batch (the r62 timeout lesson), truncation marker
// (a capped slice could hide a real diff — re-probe any !TRUNC route).
// Usage: node scripts/r64-lightborder-census.mjs [route ...]  (no args = all 49)
import { execSync, spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r64.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200");

async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 2200));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 350));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 350));
  run(`agent-browser --session ${session} click 'button[type=submit]'`);
  await new Promise(r => setTimeout(r, 5000));
}
async function authedRef() {
  const url = run(`agent-browser --session ref get url`).trim();
  if (url.includes("/login")) { await auth("ref", "https://eon.base44.app"); }
}
await auth("loc", "http://127.0.0.1:3200");
await auth("ref", "https://eon.base44.app");
// LIGHT mode on both sides — explicit darkMode="false" + verify html not .dark
for (const s of ["loc", "ref"]) {
  await evalOn(s, `localStorage.setItem('darkMode','false')`);
  const st = await evalOn(s, `(() => { location.reload(); return true; })()`);
  await new Promise(r => setTimeout(r, 2500));
  const v = await evalOn(s, `(() => ({ dark: document.documentElement.classList.contains('dark'), bg: getComputedStyle(document.body).backgroundColor }))()`, 0);
  console.log(s, "light:", JSON.stringify(v), st === true ? "" : String(st).slice(0, 60));
}

// The border-color read: every visibly-bordered element in main (all
// four sides, width>0 + style!=none), buttons included, transparent
// sides skipped, deduped (tag|color) pairs, sorted — the set comparison.
const READ = `(() => {
  const out = [];
  const seen = new Set();
  const push = (tag, color) => {
    if (!color || color === 'rgba(0, 0, 0, 0)' || color === 'transparent') return;
    const c = color.replace(/, /g, ',');
    const key = tag + '|' + c;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ tg: tag, c });
  };
  for (const el of document.querySelectorAll('main, main *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const cs = getComputedStyle(el);
    const sides = [
      [cs.borderTopWidth, cs.borderTopStyle, cs.borderTopColor],
      [cs.borderRightWidth, cs.borderRightStyle, cs.borderRightColor],
      [cs.borderBottomWidth, cs.borderBottomStyle, cs.borderBottomColor],
      [cs.borderLeftWidth, cs.borderLeftStyle, cs.borderLeftColor],
    ];
    let hasBorder = false;
    for (const [w, st, col] of sides) {
      if (parseFloat(w) > 0 && st !== 'none') { hasBorder = true; push(el.tagName.toLowerCase(), col); }
    }
    if (!hasBorder) continue;
  }
  out.sort((a, b) => (a.tg + a.c).localeCompare(b.tg + b.c));
  return out.length > 80 ? out.slice(0, 80).concat([{ tg: '!TRUNC', c: String(out.length) }]) : out;
})()`;

const LOGINISH = (arr) => Array.isArray(arr) && arr.some(x => (x.tg || '') === 'h1');

const ROUTES = process.argv.slice(2).length > 0 ? process.argv.slice(2) : [
  "/dashboard", "/employees", "/payroll", "/taskmanager", "/leavemanagement",
  "/expenses", "/loans", "/recruitment", "/training", "/compliancedashboard",
  "/evaluations", "/assetmanagement", "/staffrequests", "/companywall", "/chat",
  "/announcements", "/documenttracker", "/offboarding", "/surveys", "/settings",
  "/profile", "/workflowautomation", "/attendance", "/hrreports", "/analytics",
  "/recruitmentkanban", "/interviewassistant", "/notificationpreferences",
  "/securitysettings", "/templates", "/organogram", "/payrollmodule", "/payrollengine",
  "/shiftcalendar", "/hrassistant", "/hrassistantchat", "/payrollai", "/surveyanalytics",
  "/advancedanalytics", "/hrletters", "/requestreports", "/requestsettings",
  "/shiftswap", "/tenantsetup", "/workflowconfigpage", "/communications",
  "/performancemanagement", "/onboardingtemplates", "/careers",
];
let match = 0, diff = 0;
const diffs = [];
const dumpName = process.env.R64_DUMP || "/tmp/r64-census.log";
for (let i = 0; i < ROUTES.length; i++) {
  const route = ROUTES[i];
  if (i > 0 && i % 15 === 0) { await auth("ref", "https://eon.base44.app"); await evalOn("ref", `localStorage.setItem('darkMode','false')`); }
  run(`agent-browser --session ref open "https://eon.base44.app${route}"`);
  run(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`);
  await new Promise(r => setTimeout(r, 4200));
  let ref = await evalOn("ref", READ, 2200);
  if (LOGINISH(ref)) { await auth("ref", "https://eon.base44.app"); await evalOn("ref", `localStorage.setItem('darkMode','false')`); run(`agent-browser --session ref open "https://eon.base44.app${route}"`); await new Promise(r => setTimeout(r, 4200)); ref = await evalOn("ref", READ, 2200); }
  let loc = await evalOn("loc", READ, 500);
  for (let k = 0; k < 5 && JSON.stringify(loc) === "[]"; k++) {
    await new Promise(r => setTimeout(r, 600));
    loc = await evalOn("loc", READ, 0);
  }
  const same = JSON.stringify(ref) === JSON.stringify(loc);
  if (same) { match++; console.log(`MATCH ${route}`); }
  else {
    diff++;
    console.log(`DIFF  ${route}`);
    diffs.push({ route, ref, loc });
    // the r62 timeout lesson — dump DIFFs to file mid-batch
    writeFileSync(dumpName, diffs.map(d => `--- ${d.route} ---\nref: ${JSON.stringify(d.ref)}\nloc: ${JSON.stringify(d.loc)}`).join("\n\n"));
  }
}
console.log(`\n=== LIGHT BORDER-COLOR CENSUS (this batch): ${match}/${match + diff} MATCH ===`);
for (const d of diffs) {
  console.log(`\n--- ${d.route} ---`);
  console.log("ref:", JSON.stringify(d.ref).slice(0, 1600));
  console.log("loc:", JSON.stringify(d.loc).slice(0, 1600));
}
console.log(`DIFF dump: ${dumpName}`);
process.exit(0);
