#!/usr/bin/env node
// r67-dark-geometry-census.mjs — session-67 / parity round 66: THE DARK-MODE
// GEOMETRY RE-CENSUS (padding + border-radius), full-route. The computed-style
// matrix: color (fill r57-59 × both themes, text r60 dark + r62 light, border
// r61 dark + r63 light — every cell censused), geometry (padding + radius,
// LIGHT — r65, 44/49 post-fix), spacing (margin + gap, LIGHT — r66, 45/49
// post-fix). The frontier per the round-65 completion record: the DARK-mode
// re-census of the geometry + spacing axes — theme-invariant BY AUTHORING (no
// dark:padding/dark:rounded members exist in the corpus), but never
// computed-verified in the dark cascade. A dark: geometry member, a
// dark-cascade-only preflight divergence, or an inherited-geometry family that
// resolves differently under html.dark would ONLY be visible in this read.
// This instrument re-reads the r65 population (every element in main with a
// geometry signal — non-zero padding on any side OR non-zero radius; buttons
// included), deduped (tag|pad|radius) tuples, all 49 routes, paired live in
// DARK mode (localStorage darkMode="true" + html.dark verified on both sides).
// The rad() normalization: TW v4 authors rounded-full as calc(infinity * 1px)
// which Chrome serializes as 33554432px (2^25) while REF's v3-era 9999px stays
// 9999px — any radius >= 9999 normalizes to 'full' so the serialization split
// cannot mask real radius DIFFs.
// Instrument lessons applied: single-quoted password fills (the
// $Abcd1234 shell-expansion trap), mid-run re-auths (REF short TTL),
// login-page detection + retry, content waits (not fixed ms), DIFF dumps
// saved to files mid-batch (the r62 timeout lesson), truncation marker
// (a capped slice could hide a real diff — re-probe any !TRUNC route).
// Usage: node scripts/r67-dark-geometry-census.mjs [route ...]  (no args = all 49)
import { execSync, spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r67.log 2>&1`],
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
await auth("loc", "http://127.0.0.1:3200");
await auth("ref", "https://eon.base44.app");
// DARK mode on both sides — explicit darkMode="true" + verify html.dark
for (const s of ["loc", "ref"]) {
  await evalOn(s, `localStorage.setItem('darkMode','true')`);
  await new Promise(r => setTimeout(r, 2500));
  const v = await evalOn(s, `(() => ({ dark: document.documentElement.classList.contains('dark'), href: location.href }))()`, 0);
  console.log(s, "dark:", JSON.stringify(v));
}

// The geometry read: every element in main with a geometry signal (non-zero
// padding on any side OR non-zero radius), deduped (tag|pad|radius) tuples,
// sorted — the set comparison. NOTE: no // comments inside the READ string —
// evalOn flattens newlines and a // comment would swallow the rest of the
// one-liner. The rad() normalization: any radius >= 9999 → 'full' (the v4
// calc(infinity*1px)→33554432px vs v3 9999px serialization split).
const READ = `(() => {
  const out = [];
  const seen = new Set();
  const px = (v) => {
    const m = String(v).match(/^-?\\d+(?:\\.\\d+)?px$/);
    return m ? String(parseFloat(v)) : String(v);
  };
  const rad = (v) => {
    const n = parseFloat(v);
    return (!isNaN(n) && n >= 9999) ? 'full' : String(v);
  };
  for (const el of document.querySelectorAll('main, main *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const cs = getComputedStyle(el);
    const pt = px(cs.paddingTop), pr = px(cs.paddingRight), pb = px(cs.paddingBottom), pl = px(cs.paddingLeft);
    const br = rad(px(cs.borderRadius));
    const noPad = pt === '0' && pr === '0' && pb === '0' && pl === '0';
    const noRad = br === '0';
    if (noPad && noRad) continue;
    const key = el.tagName.toLowerCase() + '|' + pt + ',' + pr + ',' + pb + ',' + pl + '|' + br;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ tg: el.tagName.toLowerCase(), p: pt + ',' + pr + ',' + pb + ',' + pl, r: br });
  }
  out.sort((a, b) => (a.tg + a.p + a.r).localeCompare(b.tg + b.p + b.r));
  return out.length > 110 ? out.slice(0, 110).concat([{ tg: '!TRUNC', p: String(out.length), r: '' }]) : out;
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
const dumpName = process.env.R67_DUMP || "/tmp/r67-darkgeo-census.log";
for (let i = 0; i < ROUTES.length; i++) {
  const route = ROUTES[i];
  if (i > 0 && i % 15 === 0) { await auth("ref", "https://eon.base44.app"); await evalOn("ref", `localStorage.setItem('darkMode','true')`); }
  run(`agent-browser --session ref open "https://eon.base44.app${route}"`);
  run(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`);
  await new Promise(r => setTimeout(r, 4200));
  let ref = await evalOn("ref", READ, 2200);
  if (LOGINISH(ref)) { await auth("ref", "https://eon.base44.app"); await evalOn("ref", `localStorage.setItem('darkMode','true')`); run(`agent-browser --session ref open "https://eon.base44.app${route}"`); await new Promise(r => setTimeout(r, 4200)); ref = await evalOn("ref", READ, 2200); }
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
console.log(`\n=== DARK GEOMETRY CENSUS (this batch): ${match}/${match + diff} MATCH ===`);
for (const d of diffs) {
  console.log(`\n--- ${d.route} ---`);
  console.log("ref:", JSON.stringify(d.ref).slice(0, 1800));
  console.log("loc:", JSON.stringify(d.loc).slice(0, 1800));
}
console.log(`DIFF dump: ${dumpName}`);
process.exit(0);
