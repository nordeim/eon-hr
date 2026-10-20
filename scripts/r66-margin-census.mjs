#!/usr/bin/env node
// r66-margin-census.mjs — session-66 / parity round 65: THE MARGIN/GAP CENSUS
// (margin 4 sides + rowGap/columnGap), full-route. The computed-style matrix
// so far: color (fill/text/border × light/dark — r57..r63) + geometry
// (padding + radius, light — r65). NO census has ever read MARGINS or GAPS
// — the r64/r65 lessons recorded that each new dimension surfaces families
// the previous censuses were structurally blind to (the iconed-input
// paddings drifted 51 rounds; the stat-tile p-3 split was invisible to
// every color read). This round reads, for every element in main (buttons
// included), the computed margin (4 sides) + rowGap + columnGap, deduped
// (tag|margin|gap) tuples, all 49 routes, paired live in LIGHT mode
// (margins are authored theme-invariant in this corpus — no dark:mt-*
// members exist; LIGHT is the original cloning baseline).
//
// THE SPACE-Y/SERIALIZATION NORMALIZATION (the rounded-full lesson's
// margin analog — bake it BEFORE the first run or the family drowns the
// real DIFFs): TW v3 (REF) authors space-y-* as margin-TOP on `* + *`;
// TW v4 (the clone) authors it as margin-BLOCK-END on `:not(:last-child)`.
// The SAME visual container therefore distributes opposite-sided margins
// per child: REF reads (N,0) pairs, the clone reads (0,N) pairs. Both
// sides' children-of-space-y margins normalize to a direction-neutral
// token: an (mt,mb) pair with one zero (or both equal) → 'v:N' in BOTH
// slots; space-x children likewise → 'h:N'. Unequal non-zero pairs stay
// LITERAL (the trap-4 forbidden pattern — if it fires, it is REAL signal:
// v3's space-y selector overrides the child's own margin-top while v4's
// :where() does not, so an own-mt/mb on a space-y child renders VISIBLY
// differently across the engines). Variant-prefixed parents (md:space-y-6)
// are matched by the class regex.
// Gap read: 'normal' → '0' (unset gap on block elements).
// Visibility filter (the r61 w:0 lesson): non-zero rect required.
// Signal filter: elements with all-zero margins AND both gaps zero are
// skipped (they trivially match). Auto margins pass through literally.
// Comparison: the deduped SET of (tag|margin|gap) tuples — text-agnostic
// (the seeded LOC vs zero-data REF populations must not generate noise).
// Set comparison can hide inversions — triage probes decompose the DIFFs,
// the E2E pins are the contract.
// Instrument lessons applied: single-quoted password fills (the
// $Abcd1234 shell-expansion trap), mid-run re-auths (REF short TTL),
// login-page detection + retry, content waits (not fixed ms), DIFF dumps
// saved to files mid-batch (the r62 timeout lesson), truncation marker
// (a capped slice could hide a real diff — re-probe any !TRUNC route),
// NO // comments inside the READ eval string (evalOn flattens newlines).
// Usage: node scripts/r66-margin-census.mjs [route ...]  (no args = all 49)
import { execSync, spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r66.log 2>&1`],
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
// LIGHT mode on both sides — explicit darkMode="false" + verify html not .dark
for (const s of ["loc", "ref"]) {
  await evalOn(s, `localStorage.setItem('darkMode','false')`);
  await new Promise(r => setTimeout(r, 2500));
  const v = await evalOn(s, `(() => ({ dark: document.documentElement.classList.contains('dark') }))()`, 0);
  console.log(s, "light:", JSON.stringify(v));
}

// The margin/gap read: every element in main with a margin/gap signal
// (non-zero margin on any side OR non-zero row/column gap), deduped
// (tag|margin|gap) tuples, sorted — the set comparison.
// The space-y normalization, mark II (the batch-1 lesson: v3's `* + *`
// gives margin-TOP to all-but-FIRST while v4's `:not(:last-child)` gives
// margin-BLOCK-END to all-but-LAST — the ZERO therefore lands on
// DIFFERENT elements (first on v3, last on v4), and since the tuple
// bundles the element's own gap, position-equal sets still diverged).
// Mark II parses the parent's space-y-N value (the rem scale mapped to
// px; the LAST matching token wins — responsive variants sort after
// plain ones) and emits 'v:N' for EVERY child whose pair is (0,0),
// (N,0), (0,N) or (N,N) — position-independent on both engines. Pairs
// with any other values (own margins, negatives, auto) stay LITERAL.
// Unparseable parents fall back to the mark-I one-sided/equal rule.
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
const dumpName = process.env.R66_DUMP || "/tmp/r66-census.log";
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
console.log(`\n=== MARGIN/GAP CENSUS (this batch): ${match}/${match + diff} MATCH ===`);
for (const d of diffs) {
  console.log(`\n--- ${d.route} ---`);
  console.log("ref:", JSON.stringify(d.ref).slice(0, 1800));
  console.log("loc:", JSON.stringify(d.loc).slice(0, 1800));
}
console.log(`DIFF dump: ${dumpName}`);
process.exit(0);
