#!/usr/bin/env node
// r67-dark-margin-census.mjs — session-67 / parity round 66: THE DARK-MODE
// MARGIN/GAP RE-CENSUS (margin 4 sides + rowGap/columnGap), full-route.
// The computed-style matrix: color complete × both themes (r57..r63),
// geometry LIGHT (r65), spacing LIGHT (r66). This round completes the two
// remaining verification cells: geometry + spacing in DARK — theme-invariant
// BY AUTHORING (no dark:mt-*/dark:p-* members exist in the corpus), but
// never computed-verified in the dark cascade. Paired live in DARK mode
// (localStorage darkMode="true" + html.dark verified on both sides).
//
// THE SPACE-Y/SERIALIZATION NORMALIZATION (mark II, unchanged from r66):
// TW v3 (REF) authors space-y-* as margin-TOP on `* + *`; TW v4 (the clone)
// authors it as margin-BLOCK-END on `:not(:last-child)`. The ZERO lands on
// DIFFERENT elements (first on v3, last on v4), and the tuple bundles the
// element's own gap. Mark II parses the parent's space-y-N value (the rem
// scale → px; the LAST matching token wins) and emits 'v:N' for EVERY child
// whose pair is (0,0), (N,0), (0,N) or (N,N) — position-independent on both
// engines. Pairs with any other values stay LITERAL (real signal). Unparseable
// parents fall back to the mark-I one-sided/equal rule.
// Gap read: 'normal' → '0' (unset gap on block elements).
// Visibility filter (the r61 w:0 lesson): non-zero rect required.
// Signal filter: all-zero margins AND both gaps zero are skipped.
// Comparison: the deduped SET of (tag|margin|gap) tuples — text-agnostic.
// Set comparison can hide inversions — triage probes decompose the DIFFs,
// the E2E pins are the contract.
// Instrument lessons applied: single-quoted password fills (the
// $Abcd1234 shell-expansion trap), mid-run re-auths (REF short TTL),
// login-page detection + retry, content waits (not fixed ms), DIFF dumps
// saved to files mid-batch (the r62 timeout lesson), truncation marker
// (a capped slice could hide a real diff — re-probe any !TRUNC route),
// NO // comments inside the READ eval string (evalOn flattens newlines).
// Usage: node scripts/r67-dark-margin-census.mjs [route ...]  (no args = all 49)
import { execSync, spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r67m.log 2>&1`],
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

// The margin/gap read: every element in main with a margin/gap signal,
// deduped (tag|margin|gap) tuples, sorted — the set comparison.
// The space-y normalization, mark II (position-independent on both engines).
const READ = `(() => {
  const out = [];
  const seen = new Set();
  const px = (v) => {
    const m = String(v).match(/^-?\\d+(?:\\.\\d+)?px$/);
    return m ? String(parseFloat(v)) : String(v);
  };
  const gp = (v) => { const s = px(v); return s === 'normal' ? '0' : s; };
  const syScale = { '0': 0, '0.5': 2, '1': 4, '1.5': 6, '2': 8, '2.5': 10, '3': 12, '3.5': 14, '4': 16, '5': 20, '6': 24, '7': 28, '8': 32, '9': 36, '10': 40, '11': 44, '12': 48, '14': 56, '16': 64, '20': 80, '24': 96, '28': 112, '32': 128, 'px': 1 };
  const tokVal = (pcls, axis) => {
    let v = null;
    for (const t of pcls.split(/\\s+/)) {
      const m = t.match(new RegExp('^(?:[a-z0-9]+:)?space-' + axis + '-([a-z0-9.]+)$'));
      if (m && (m[1] in syScale)) v = syScale[m[1]];
    }
    return v;
  };
  const normPairV = (a, b, N) => {
    const na = parseFloat(a), nb = parseFloat(b);
    if (isNaN(na) || isNaN(nb)) return [a, b];
    if ((na === 0 && nb === 0 && N !== null) || (N !== null && ((na === N && nb === 0) || (na === 0 && nb === N) || (na === N && nb === N)))) return ['v:' + N, 'v:' + N];
    if (na === nb) return ['v:' + na, 'v:' + na];
    if (na === 0) return ['v:' + nb, 'v:' + nb];
    if (nb === 0) return ['v:' + na, 'v:' + na];
    return [a, b];
  };
  for (const el of document.querySelectorAll('main, main *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const cs = getComputedStyle(el);
    let mt = px(cs.marginTop), mr = px(cs.marginRight), mb = px(cs.marginBottom), ml = px(cs.marginLeft);
    const rg = gp(cs.rowGap), cg = gp(cs.columnGap);
    const pcls = (el.parentElement && el.parentElement.getAttribute('class')) || '';
    const isSy = /(^|\\s)\\S*space-y-/.test(pcls);
    const isSx = /(^|\\s)\\S*space-x-/.test(pcls);
    if (isSy) { const p = normPairV(mt, mb, tokVal(pcls, 'y')); mt = p[0]; mb = p[1]; }
    if (isSx) { const p = normPairV(ml, mr, tokVal(pcls, 'x')); ml = p[0]; mr = p[1]; }
    if (mt === '0' && mr === '0' && mb === '0' && ml === '0' && rg === '0' && cg === '0') continue;
    const key = el.tagName.toLowerCase() + '|' + mt + ',' + mr + ',' + mb + ',' + ml + '|' + rg + ',' + cg;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ tg: el.tagName.toLowerCase(), m: mt + ',' + mr + ',' + mb + ',' + ml, g: rg + ',' + cg });
  }
  out.sort((a, b) => (a.tg + a.m + a.g).localeCompare(b.tg + b.m + b.g));
  return out.length > 130 ? out.slice(0, 130).concat([{ tg: '!TRUNC', m: String(out.length), g: '' }]) : out;
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
const dumpName = process.env.R67_DUMP || "/tmp/r67-darkmargin-census.log";
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
    writeFileSync(dumpName, diffs.map(d => `--- ${d.route} ---\nref: ${JSON.stringify(d.ref)}\nloc: ${JSON.stringify(d.loc)}`).join("\n\n"));
  }
}
console.log(`\n=== DARK MARGIN/GAP CENSUS (this batch): ${match}/${match + diff} MATCH ===`);
for (const d of diffs) {
  console.log(`\n--- ${d.route} ---`);
  console.log("ref:", JSON.stringify(d.ref).slice(0, 1800));
  console.log("loc:", JSON.stringify(d.loc).slice(0, 1800));
}
console.log(`DIFF dump: ${dumpName}`);
process.exit(0);
