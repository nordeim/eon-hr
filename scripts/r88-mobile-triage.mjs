#!/usr/bin/env node
// r88-mobile-triage.mjs — session-88 / parity round 87: the first-pass
// automated triage of the mobile-band cross-side diffs. For every route:
// read both sides' normalized body text digest + elementFromPoint probes at
// the diff-cluster centers, then classify: SAME-TEXT (a pure geometry/recipe
// defect — the actionable class) vs DIFF-TEXT (content divergence — data-
// driven or a clone-authored invention needing deeper probing).
// Usage: node scripts/r88-mobile-triage.mjs [route ...]   (no args = all)
import { execSync } from "node:child_process";
import fs from "node:fs";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const ROUTES = process.argv.length > 2 ? process.argv.slice(2) : [
  "payroll", "employees", "attendance", "recruitment", "settings",
  "assetmanagement", "advancedanalytics", "allleaverequests", "analytics",
  "analyticsdashboard", "assets", "attendancedashboard", "careers", "chat",
  "companywall", "compliancedashboard", "documenttracker", "employeedetail",
  "employeeselfservice", "evaluations", "hrassistantchat", "hrreports",
  "interviewassistant", "offboarding", "payrollengine", "profile",
  "recruitmentkanban", "reports", "requestsettings", "shiftcalendar",
  "shiftswap", "staffrequests", "surveyanalytics", "surveys", "taskmanager",
  "templates", "tenantsetup", "workflowautomation", "workflowconfigpage",
];

const DIGEST = `(() => {
  const t = (document.body.innerText || '').replace(/\\s+/g, ' ').trim();
  return t.slice(0, 1200);
})()`;
const AT = (x, y) => `(() => {
  const el = document.elementFromPoint(${x}, ${y});
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { tag: el.tagName, cls: (el.className + '').slice(0, 90), txt: (el.textContent || '').replace(/\\s+/g, ' ').slice(0, 60), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
})()`;

const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();

// auth the two fresh sessions
async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 400));
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const ref = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
  if (ref) run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, 4200));
}
await auth("ref88t", baseRef);
await auth("loc88t", baseLoc);

for (const route of ROUTES) {
  const refDigest = await evalOn("ref88t", DIGEST, 0, );
  run(`agent-browser --session ref88t open ${baseRef}/${route}`);
  await new Promise(r => setTimeout(r, 3200));
  const rd = await evalOn("ref88t", DIGEST);
  run(`agent-browser --session loc88t open ${baseLoc}/${route}`);
  await new Promise(r => setTimeout(r, 3200));
  const ld = await evalOn("loc88t", DIGEST);
  const same = norm(rd) === norm(ld);
  console.log(`\n===== ${route} — ${same ? "SAME-TEXT (geometry/recipe class)" : "DIFF-TEXT (content divergence)"}`);
  if (!same) {
    // word-level diff summary: first 3 divergence points
    const rw = norm(rd).split(" "), lw = norm(ld).split(" ");
    let i = 0; const divs = [];
    while (i < Math.max(rw.length, lw.length) && divs.length < 4) {
      if (rw[i] !== lw[i]) divs.push({ at: i, ref: rw.slice(i, i + 5).join(" "), loc: lw.slice(i, i + 5).join(" ") });
      i++;
    }
    console.log("  first divergences:", JSON.stringify(divs).slice(0, 600));
  } else {
    // geometry class: probe the mobile chrome + first content row both sides
    const probes = {};
    for (const [sess, name] of [["ref88t", "ref"], ["loc88t", "loc"]]) {
      probes[name] = {
        topbar: await evalOn(sess, AT(195, 36)),
        belowTop: await evalOn(sess, AT(195, 100)),
        content: await evalOn(sess, AT(195, 300)),
        bottom: await evalOn(sess, AT(195, 800)),
      };
    }
    for (const k of ["topbar", "belowTop", "content", "bottom"]) {
      const a = probes.ref[k], b = probes.loc[k];
      const sameEl = a && b && a.tag === b.tag && norm(a.txt) === norm(b.txt) && Math.abs((a.y || 0) - (b.y || 0)) <= 2 && Math.abs((a.h || 0) - (b.h || 0)) <= 2;
      console.log(`  ${k}: ${sameEl ? "MATCH" : "ref=" + JSON.stringify(a) + " loc=" + JSON.stringify(b)}`.slice(0, 300));
    }
  }
}
console.log("\nTRIAGE COMPLETE");
process.exit(0);
