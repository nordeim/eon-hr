#!/usr/bin/env node
// r63-lighttext-census.mjs — session-63 / parity round 62: THE LIGHT-MODE
// TEXT-COLOR CENSUS, full-route. The computed-color census families so far:
// r57 CTA/button fills (light), r58 badge/chip leaf fills (light),
// r59 the union fill read (dark), r60 non-button text + placeholders (dark),
// r61 borders (dark). The recorded gap: NO text-color census ever ran in
// LIGHT mode, and BUTTON text colors were never computed-censused in ANY
// theme (the r60/r61 reads skipped el.closest('button')). This round reads
// the computed `color` of every text-bearing element in `main` — headings,
// text leaves, svgs, PLACEHOLDERS, and BUTTONS (text + icon color,
// included this time) — all 49 routes, paired live in LIGHT mode.
// This is also the census vehicle for the documented byte-parity backlog:
// REF's --muted-foreground = neutral-500 #737373 light (the clone's token
// pins slate-500 #64748b) and REF's --primary = #171717 light (the clone's
// token is the nav-blue #1877f2 repurposing) — every un-compensated
// token-riding text surface will DIFF in computed color.
// Comparison: the deduped SET of (tag|color) pairs — text-agnostic (the
// seeded LOC vs zero-data REF populations must not generate noise; the
// r60 lesson 5 notes set-comparison can hide inversions — triage probes
// decompose the DIFFs, the E2E pins are the contract).
// Instrument lessons applied: single-quoted password fills (the
// $Abcd1234 shell-expansion trap), mid-run re-auths (REF short TTL),
// login-page detection + retry, content waits (not fixed ms), DIFF dumps
// saved to files mid-batch (the r62 timeout lesson), truncation marker
// (a capped slice could hide a real diff — re-probe any !TRUNC route).
import { execSync, spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r63.log 2>&1`],
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
// LIGHT mode on both apps — explicit, then verified.
for (const s of ["loc", "ref"]) {
  await evalOn(s, `localStorage.setItem('darkMode','false')`);
  const st = await evalOn(s, `(() => ({ dark: document.documentElement.classList.contains('dark') }))()`, 0);
  console.log(s, "light:", JSON.stringify(st));
}

// The text-color read: headings + text-bearing leaves + svgs + button
// text/icon colors + input/textarea ::placeholder colors — NOTHING skipped.
// Deduped (tag|color) pairs, sorted — the set comparison. Truncation marker:
// the slice cap could hide pairs — any route that hits it gets re-probed.
const READ = `(() => {
  const out = [];
  const seen = new Set();
  let truncated = false;
  const push = (tag, color) => {
    if (!color || color === 'rgba(0, 0, 0, 0)') return;
    const c = color.replace(/, /g, ',');
    const key = tag + '|' + c;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ tg: tag, c });
  };
  for (const el of document.querySelectorAll('main h1, main h2, main h3, main h4, main h5, main h6')) {
    push(el.tagName.toLowerCase(), getComputedStyle(el).color);
  }
  for (const el of document.querySelectorAll('main span, main div, main td, main th, main label, main a, main p, main li')) {
    if (el.children.length > 0) continue;
    const txt = (el.textContent || '').trim();
    if (!txt) continue;
    push(el.tagName.toLowerCase(), getComputedStyle(el).color);
  }
  for (const el of document.querySelectorAll('main svg')) {
    push(el.closest('button') ? 'button-svg' : 'svg', getComputedStyle(el).color);
  }
  for (const el of document.querySelectorAll('main button')) {
    push('button', getComputedStyle(el).color);
  }
  for (const el of document.querySelectorAll('main input, main textarea')) {
    const ph = getComputedStyle(el, '::placeholder').color;
    push('placeholder', ph);
  }
  out.sort((a, b) => (a.tg + a.c).localeCompare(b.tg + b.c));
  if (out.length > 90) { truncated = true; out.length = 90; }
  if (truncated) out.push({ tg: '!TRUNC', c: 'capped' });
  return out;
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
for (let i = 0; i < ROUTES.length; i++) {
  const route = ROUTES[i];
  if (i > 0 && i % 15 === 0) { await authedRef(); await evalOn("ref", `localStorage.setItem('darkMode','false')`); }
  run(`agent-browser --session ref open "https://eon.base44.app${route}"`);
  run(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`);
  await new Promise(r => setTimeout(r, 4200));
  let ref = await evalOn("ref", READ, 2200);
  if (LOGINISH(ref)) { await authedRef(); await evalOn("ref", `localStorage.setItem('darkMode','false')`); run(`agent-browser --session ref open "https://eon.base44.app${route}"`); await new Promise(r => setTimeout(r, 4200)); ref = await evalOn("ref", READ, 2200); }
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
  }
}
console.log(`\n=== LIGHT TEXT-COLOR CENSUS: ${match}/${match + diff} MATCH ===`);
const dumpPath = process.env.R63_DUMP || "/tmp/r63-census-diffs.log";
if (diffs.length) {
  const dump = diffs.map(d => `\n--- ${d.route} ---\nref: ${JSON.stringify(d.ref)}\nloc: ${JSON.stringify(d.loc)}`).join("\n");
  writeFileSync(dumpPath, dump);
  console.log(`DIFF dump saved to ${dumpPath}`);
}
process.exit(0);
