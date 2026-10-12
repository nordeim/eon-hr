#!/usr/bin/env node
// capture-r28.mjs — session-29 / parity round 28 screenshots:
// 91 = the round's evidence page (census + verdicts, rendered as HTML)
// 92 = the recruitment within-stage reorder live insertion ring
//      (dragstart on Alpha, dragover on Beta — SEPARATED dispatches, the
//      React-flush lesson — then the screenshot mid-drag)
// + refresh the 02/11 standards (the regression signal).
// 93 (print emulation) is captured by capture-r28-print.mjs — Playwright
// layer (agent-browser's set media supports only dark|light|reduced-motion).
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 200); } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const SHOTS = "/home/z/my-project/eon-hr/docs/screenshots";

run("agent-browser --session loc set viewport 1440 900");

// ---------- 91: the evidence page ----------
const evidence = `<!doctype html>
<html><head><meta charset="utf-8"><title>Round 28 Evidence</title>
<style>
  body { font-family: ui-sans-serif, system-ui, sans-serif; background: #fafafa; color: #0a0a0a; margin: 0; padding: 40px; }
  .wrap { max-width: 980px; margin: 0 auto; }
  h1 { font-size: 28px; margin: 0 0 4px; }
  .sub { color: #64748b; margin: 0 0 28px; font-size: 14px; }
  h2 { font-size: 18px; margin: 28px 0 10px; }
  table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-size: 13px; }
  th { text-align: left; padding: 10px 14px; background: #f8fafc; color: #64748b; font-weight: 500; border-bottom: 1px solid #e2e8f0; }
  td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; }
  tr:last-child td { border-bottom: 0; }
  .pass { color: #16a34a; font-weight: 600; }
  .info { color: #2563eb; font-weight: 600; }
  .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin: 12px 0; font-size: 13px; line-height: 1.7; }
  code { background: #f1f5f9; padding: 1px 6px; border-radius: 4px; font-size: 12px; }
</style></head><body><div class="wrap">
<h1>Parity Round 28 — the within-stage ordering + print dimensions</h1>
<p class="sub">Session 29 evidence report · clone :3200 standalone vs https://eon.base44.app · computed-DOM ground truth</p>

<h2>Standing audits</h2>
<table>
<tr><th>Audit</th><th>Result</th><th>Evidence</th></tr>
<tr><td>Redeploy check (12 canonical routes, viewports pinned 1440×900)</td><td class="pass">12/12 MATCH</td><td>h1 text/font/x/y byte-identical — REF unchanged since round 27</td></tr>
<tr><td>Mobile navigation (user priority)</td><td class="pass">byte-identical</td><td>tabs x=10/79/139/204/313, kicker "Dashboard" y=101 h=28 fs=18px, drawer 288×844 #FAFAFA z-50 — no Tailwind v4 bug; topbar:false / b800 sidebar:false root-caused as REF markup artifacts (REF renders no nav/aside tags — direct 800px geometry check: h1 x=288 on BOTH)</td></tr>
<tr><td>With-data re-check</td><td class="info">blocked</td><td>REF still renders zero data (0 rows on 4 surfaces)</td></tr>
</table>

<h2>The round's census — the two dimensions</h2>
<table>
<tr><th>Surface</th><th>REF</th><th>Clone (before)</th><th>Clone (after)</th></tr>
<tr><td>recruitment within-stage order</td><td>appliedAt desc only, no reorder path (zero draggables)</td><td>round-27 cross-stage DnD; no within-stage ordering</td><td class="pass">Candidate.position + order-array PATCH + card-level insertion targets</td></tr>
<tr><td>print dimension</td><td>zero @media print rules (session-18 census, re-confirmed)</td><td>zero print rules — browser defaults print the sidebar chrome</td><td class="pass">unlayered print block: chrome hidden, portals hidden, padding/min-height reset, break-inside avoid</td></tr>
<tr><td>taskmanager DnD (round-27 regression)</td><td>zero draggables</td><td colspan="2" class="pass">cross-column + within-column E2E still green</td></tr>
</table>

<h2>Live verification (all PASS)</h2>
<div class="card">
<b>Recruitment within-stage reorder round-trip</b> — create job + Alpha + Beta (API, Beta renders above Alpha via
the appliedAt tiebreak) → synthetic drag of Alpha ONTO Beta → order flips to <code>Alpha, Beta</code> →
reload → persisted via the position column → cleanup (job cascade). The order computes over the FULL stage
list (not the filtered view) — job filters and search cannot corrupt persisted positions.
</div>
<div class="card">
<b>Print-media superset</b> — under <code>page.emulateMedia({ media: "print" })</code>: the sidebar computes
<code>display:none</code> (vs <code>flex</code> from <code>md:flex</code> — the unlayered !important cascade
proof), the sidebar nav and mobile header hide, the root drops <code>min-h-screen</code>, cards compute
<code>break-inside: avoid</code>; under <code>screen</code> everything restores (aside <code>flex</code>,
min-height 720px). Pinned permanently by tests/e2e/print-media.spec.ts.
</div>

<h2>Gates</h2>
<table>
<tr><th>Gate</th><th>Result</th></tr>
<tr><td>lint / typecheck</td><td class="pass">0 errors / clean</td></tr>
<tr><td>Unit (Vitest)</td><td class="pass">451/451 (+6 session-29 pins)</td></tr>
<tr><td>Build (standalone)</td><td class="pass">passing</td></tr>
<tr><td>E2E (Playwright)</td><td class="pass">91/91 (+2 first-run passes: recruitment within-stage reorder + print media)</td></tr>
</table>

<h2>Probe-tooling lessons this round</h2>
<div class="card">
1. <b>agent-browser's <code>set media</code> supports only dark|light|reduced-motion</b> — print emulation is NOT
available at the CLI layer (<code>matchMedia("print").matches</code> stays false); it lives in the Playwright
layer via <code>page.emulateMedia({ media: "print" })</code>. This is why the print verification is a permanent
E2E spec rather than a CLI probe.<br>
2. <b>The FIRST body&gt;div is Next.js's hidden bootstrap div</b> — the app root (min-h-screen) is a later
sibling; locate it as <code>body &gt; div.min-h-screen</code>, not <code>body &gt; div</code> (a probe read
the hidden div's min-height 0px as a false-positive proof).<br>
3. <b>Loc session cookie flakes after server restarts</b> — the 12-route sweep read a 0/12 "login page"
signature after a long probe sequence; re-running scripts/auth-r22.mjs restored it (the round-26 cookie-flake
lesson, re-hit). One mobile-audit DRAWER DIFF was a transient (the drawer click did not register that run) —
re-run before diagnosing.
</div>
</div></body></html>`;
writeFileSync(`${SHOTS}/r28-evidence.html`, evidence);
await run(`agent-browser --session loc open "file://${SHOTS}/r28-evidence.html"`);
await sleep(1200);
run(`agent-browser --session loc screenshot ${SHOTS}/91-ordering-print-evidence.png`);
console.log("91 captured (evidence page)");

// ---------- 92: recruitment within-stage reorder live insertion ring ----------
// Navigate back to the app FIRST (the file:// evidence page breaks relative
// in-page fetch() — the round-27 lesson).
await run(`agent-browser --session loc open "http://127.0.0.1:3200/recruitmentkanban"`);
await sleep(2500);
const jobRes = JSON.parse(run(`agent-browser --session loc eval "fetch('/api/jobs', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({title: 'Ordering Probe Role', department: 'QA', openings: 1})}).then(r => r.json())"`).trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
const jobId = jobRes?.data?.job?.id;
await run(`agent-browser --session loc eval "fetch('/api/candidates', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({jobPostingId: '${jobId}', name: 'Ordering Probe Alpha', email: 'opa@example.com'})}).then(r => r.json())"`);
await run(`agent-browser --session loc eval "fetch('/api/candidates', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({jobPostingId: '${jobId}', name: 'Ordering Probe Beta', email: 'opb@example.com'})}).then(r => r.json())"`);
await run(`agent-browser --session loc open "http://127.0.0.1:3200/recruitmentkanban"`);
await sleep(3500);
// SEPARATED dispatches (the React-flush lesson): dragstart on Alpha …
run(`agent-browser --session loc eval "(() => { const p = [...document.querySelectorAll('div[draggable=true] p.font-medium')].find(x => x.textContent.trim() === 'Ordering Probe Alpha'); if (!p) return 'noalpha'; p.closest('div[draggable=true]').dispatchEvent(new DragEvent('dragstart', {bubbles: true, cancelable: true, dataTransfer: new DataTransfer()})); return 'dragging'; })()"`);
await sleep(400);
// … then dragover on Beta (sets dragOverId → the insertion ring renders)
run(`agent-browser --session loc eval "(() => { const p = [...document.querySelectorAll('div[draggable=true] p.font-medium')].find(x => x.textContent.trim() === 'Ordering Probe Beta'); if (!p) return 'nobeta'; p.closest('div[draggable=true]').dispatchEvent(new DragEvent('dragover', {bubbles: true, cancelable: true, dataTransfer: new DataTransfer()})); return 'ring-on-beta'; })()"`);
await sleep(600);
run(`agent-browser --session loc screenshot ${SHOTS}/92-recruitment-reorder-ring.png`);
console.log("92 captured (recruitment insertion ring)");
// end the drag + cleanup
run(`agent-browser --session loc eval "(() => { const p = [...document.querySelectorAll('div[draggable=true] p.font-medium')].find(x => x.textContent.trim() === 'Ordering Probe Alpha'); if (p) p.closest('div[draggable=true]').dispatchEvent(new DragEvent('dragend', {bubbles: true})); return 'ok'; })()"`);
await run(`agent-browser --session loc eval "fetch('/api/jobs?id=${jobId}', {method: 'DELETE'}).then(r => r.json())"`);
console.log("92 cleanup done");

// ---------- standards refresh ----------
await run("agent-browser --session loc set viewport 1440 900");
await run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
await sleep(3200);
run(`agent-browser --session loc screenshot ${SHOTS}/02-dashboard-desktop.png`);
console.log("02 refreshed");
await run("agent-browser --session loc set viewport 390 844");
await sleep(1500);
run(`agent-browser --session loc screenshot ${SHOTS}/11-mobile-dashboard.png`);
console.log("11 refreshed");
