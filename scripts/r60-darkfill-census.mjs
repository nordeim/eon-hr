#!/usr/bin/env node
// r60-darkfill-census.mjs — session-60 / parity round 59: THE DARK-MODE
// FILL CENSUS, full-route. The r57 census covered every CTA/button fill
// and the r58 census the non-button badge/chip fills — both in LIGHT
// mode. This census takes the same union read into DARK mode (html.dark,
// the localStorage darkMode="true" contract both apps share). All 49
// routes, paired live (REF @1440×900 vs the seeded LOC :3200 in this
// process tree). Instrument lessons applied: single-quoted password
// fills (the $Abcd1234 shell-expansion trap), mid-run re-auths (the REF
// short-TTL), login-page detection + retry, and the 90deg/to-right
// gradient serialization normalization.
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r60.log 2>&1`],
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
  // the ref cookie expires mid-run; verify cheaply and re-auth when dead
  const url = run(`agent-browser --session ref get url`).trim();
  if (url.includes("/login")) { await auth("ref", "https://eon.base44.app"); }
}
await auth("loc", "http://127.0.0.1:3200");
await auth("ref", "https://eon.base44.app");
for (const s of ["loc", "ref"]) {
  await evalOn(s, `localStorage.setItem('darkMode','true')`);
  const st = await evalOn(s, `(() => ({ dark: document.documentElement.classList.contains('dark') }))()`, 0);
  console.log(s, "dark:", JSON.stringify(st));
}

// The union read: button fills (r58 family) + non-button leaf fills
// (r59 family), computed, in dark mode. Gradients serialized to their
// rgb() triple list (the 90deg/to-right equivalence).
const READ = `(() => {
  const out = [];
  const seen = new Set();
  const norm = (img) => { const m = (img.match(/rgb\\(\\d+, \\d+, \\d+\\)/g) || []).join('|'); return m; };
  const push = (el, kind) => {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    const bgi = cs.backgroundImage === 'none' ? '' : norm(cs.backgroundImage);
    const txt = (el.textContent || '').trim();
    const key = kind + '|' + txt + '|' + bg + '|' + bgi;
    if (seen.has(key)) return;
    seen.add(key);
    const r = el.getBoundingClientRect();
    if (r.width === 0) return;
    out.push({ k: kind, t: txt.slice(0, 20), bg: bg.replace(/, /g, ','), bgi, c: cs.color.replace(/, /g, ','), h: Math.round(r.height) });
  };
  for (const el of document.querySelectorAll('main button')) {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    const plain = bg === 'rgba(0, 0, 0, 0)';
    const bgi = cs.backgroundImage !== 'none';
    if (plain && !bgi) continue;
    push(el, 'btn');
  }
  for (const el of document.querySelectorAll('main span, main div, main td, main a, main p')) {
    if (el.closest('button')) continue;
    if (el.children.length > 0) continue;
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    const isPlain = bg === 'rgba(0, 0, 0, 0)' || bg === 'rgb(255, 255, 255)' || bg === 'rgb(250, 250, 250)';
    if (isPlain) continue;
    const txt = (el.textContent || '').trim();
    if (!txt || txt.length > 24) continue;
    push(el, 'leaf');
  }
  return out.slice(0, 44);
})()`;

const LOGINISH = (arr) => Array.isArray(arr) && arr.some(x => (x.t || '').includes("Continue with") || (x.t || "").includes("Sign in"));

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
  if (i > 0 && i % 15 === 0) { await auth("ref", "https://eon.base44.app"); await evalOn("ref", `localStorage.setItem('darkMode','true')`); }
  run(`agent-browser --session ref open "https://eon.base44.app${route}"`);
  run(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`);
  await new Promise(r => setTimeout(r, 4200));
  let ref = await evalOn("ref", READ, 2200);
  if (LOGINISH(ref)) { await auth("ref", "https://eon.base44.app"); await evalOn("ref", `localStorage.setItem('darkMode','true')`); run(`agent-browser --session ref open "https://eon.base44.app${route}"`); await new Promise(r => setTimeout(r, 4200)); ref = await evalOn("ref", READ, 2200); }
  // LOC: content waits, not fixed milliseconds (the r59 lesson) — the
  // client-rendered 404 boots its Go Home button after hydration; poll
  // until the read stabilizes (two equal reads 600ms apart) or 3.6s.
  let loc = await evalOn("loc", READ, 500);
  for (let i = 0; i < 5 && JSON.stringify(loc) === "[]"; i++) {
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
console.log(`\n=== DARK FILL CENSUS: ${match}/${match + diff} MATCH ===`);
for (const d of diffs) {
  console.log(`\n--- ${d.route} ---`);
  console.log("ref:", JSON.stringify(d.ref).slice(0, 1200));
  console.log("loc:", JSON.stringify(d.loc).slice(0, 1200));
}
// restore light
for (const s of ["loc", "ref"]) await evalOn(s, `localStorage.setItem('darkMode','false')`);
process.exit(0);
