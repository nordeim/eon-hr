#!/usr/bin/env node
// capture-r27.mjs — session-28 / parity round 27 screenshots:
// 88 = the round's evidence page (census + verdicts, rendered as HTML)
// 89 = the recruitment pipeline live mid-drag (opacity-50 card + column ring)
// 90 = the taskmanager live insertion ring (dragged card + ring on Beta)
// + refresh the 02/11 standards (the regression signal).
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 200); } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const SHOTS = "/home/z/my-project/eon-hr/docs/screenshots";

run("agent-browser --session loc set viewport 1440 900");

// ---------- 88: the evidence page ----------
const evidence = `<!doctype html>
<html><head><meta charset="utf-8"><title>Round 27 Evidence</title>
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
<h1>Parity Round 27 — the DnD depth dimension</h1>
<p class="sub">Session 28 evidence report · clone :3200 standalone vs https://eon.base44.app · computed-DOM ground truth</p>

<h2>Standing audits</h2>
<table>
<tr><th>Audit</th><th>Result</th><th>Evidence</th></tr>
<tr><td>Redeploy check (12 canonical routes)</td><td class="pass">12/12 MATCH</td><td>h1 text/font/x/y byte-identical — REF unchanged since round 26</td></tr>
<tr><td>Mobile navigation (user priority)</td><td class="pass">byte-identical</td><td>strip 342×40 @(24,16), hamburger 28×28 @(24,22), tabs x=10/79/139/204/313, kicker y=101 h=28 fs=18px, drawer overlay 390×844 z-50 — no Tailwind v4 bug</td></tr>
<tr><td>With-data re-check</td><td class="info">blocked</td><td>REF still renders zero data (0 rows on 4 surfaces)</td></tr>
</table>

<h2>The round's census — DnD depth</h2>
<table>
<tr><th>Surface</th><th>REF</th><th>Clone (before)</th><th>Clone (after)</th></tr>
<tr><td>taskmanager cross-column DnD</td><td>zero draggables</td><td>round-26 superset</td><td class="pass">regression PASS</td></tr>
<tr><td>taskmanager within-column order</td><td>n/a (no DnD)</td><td>createdAt desc only — no reorder path</td><td class="pass">drag-on-card insertion + persistent positions</td></tr>
<tr><td>recruitment pipeline DnD</td><td>zero draggables, no cursor-grab</td><td>dropdown-only move path</td><td class="pass">HTML5 DnD on the existing stage PATCH</td></tr>
</table>

<h2>Live verification (all PASS)</h2>
<div class="card">
<b>Recruitment pipeline round-trip</b> — create job + candidate (API) → synthetic dragstart/dragover/drop on
<code>Applied → Interviewing</code> → optimistic move + toast <code>R27 Live Probe → Interviewing</code> →
reload → persisted in Interviewing → cleanup (job cascade).<br>
<b>Mid-drag affordance</b> — opacity <code>0.5</code> while dragging, restored to <code>1</code> after dragend; cursor <code>grab</code>.
</div>
<div class="card">
<b>Taskmanager within-column reorder</b> — create Alpha + Beta (API, Beta renders above Alpha via the createdAt
tiebreak) → synthetic drag of Alpha ONTO Beta → order flips to <code>Alpha, Beta</code> + toast
<code>Order updated</code> → reload → persisted (position column) → cleanup.<br>
<b>Insertion ring</b> — the hovered card computes <code>lab(54.6 8.76 -65.79 / 0.4) 0 0 0 2px inset</code>
(= <code>ring-2 ring-inset ring-blue-500/40</code>; Chrome serializes the sRGB blue as lab()).
</div>
<div class="card">
<b>Round-26 regression</b> — the cross-column Backlog → Done round-trip still PASSes through the unified
reorderTask path (same visual, now with persistent positions).
</div>

<h2>Gates</h2>
<table>
<tr><th>Gate</th><th>Result</th></tr>
<tr><td>lint / typecheck</td><td class="pass">0 errors / clean</td></tr>
<tr><td>Unit (Vitest)</td><td class="pass">445/445 (+7 session-28 pins)</td></tr>
<tr><td>Build (standalone)</td><td class="pass">passing</td></tr>
<tr><td>E2E (Playwright)</td><td class="pass">89/89 (+2 first-run passes: recruitment DnD + within-column reorder)</td></tr>
</table>

<h2>Probe-tooling lessons this round</h2>
<div class="card">
1. <b>Always pin viewports before sweeping</b> — the ref session defaulted to 800×900 and produced two phantom
DIFFs (/payroll y=136 vs 116, /profile x=288 vs 336): at 800px the payroll title column shrinks to min-content
(186px — badge wraps to 56px, subtitle to 3 lines) and the centered profile header re-centers. Both are pure
viewport artifacts; the pinned 1440×900 sweep reads 12/12.<br>
2. <b>React state does not flush inside a single eval</b> — dispatching dragstart and reading the opacity/boxShadow
in the SAME eval reads the pre-state (the round-26 lesson, re-hit); split the dispatch and the read into separate
eval calls with a settle delay.<br>
3. <b>Chrome serializes modern colors as lab()</b> — the ring-blue-500/40 shadow reads
<code>lab(54.6 8.76 -65.79 / 0.4)</code>, not <code>rgba(96,165,250,.4)</code>; match on the geometry
(<code>2px inset</code>) or parse tolerantly.
</div>
</div></body></html>`;
writeFileSync(`${SHOTS}/r27-evidence.html`, evidence);
await run(`agent-browser --session loc open "file://${SHOTS}/r27-evidence.html"`);
await sleep(1200);
run(`agent-browser --session loc screenshot ${SHOTS}/88-dnd-depth-evidence.png`);
console.log("88 captured (evidence page)");

// ---------- 89: recruitment live mid-drag ----------
// NOTE: navigate back to the app first — the evidence page is a file://
// document and relative fetch() calls resolve against file:/// (fails).
await run(`agent-browser --session loc open "http://127.0.0.1:3200/recruitmentkanban"`);
await sleep(2500);
const jobRes = JSON.parse(run(`agent-browser --session loc eval "fetch('/api/jobs', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({title: 'Pipeline Probe Role', department: 'QA', openings: 1})}).then(r => r.json())"`).trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
const jobId = jobRes?.data?.job?.id;
await run(`agent-browser --session loc eval "fetch('/api/candidates', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({jobPostingId: '${jobId}', name: 'Pipeline Probe', email: 'pipe@example.com'})}).then(r => r.json())"`);
await run(`agent-browser --session loc open "http://127.0.0.1:3200/recruitmentkanban"`);
await sleep(3500);
run(`agent-browser --session loc eval "(() => { const card = [...document.querySelectorAll('div[draggable=true]')].find(d => d.textContent.includes('Pipeline Probe')); if (!card) return 'nocard'; card.dispatchEvent(new DragEvent('dragstart', {bubbles: true, cancelable: true, dataTransfer: new DataTransfer()})); const cols = [...document.querySelectorAll('div.w-64')]; const col = cols.find(x => (x.querySelector('h3')||{}).textContent === 'Interviewing'); if (col) col.dispatchEvent(new DragEvent('dragover', {bubbles: true, cancelable: true, dataTransfer: new DataTransfer()})); return 'dragging-with-ring'; })()"`);
await sleep(500);
run(`agent-browser --session loc screenshot ${SHOTS}/89-recruitment-drag-mid-flight.png`);
console.log("89 captured (recruitment mid-drag)");
run(`agent-browser --session loc eval "(() => { const card = [...document.querySelectorAll('div[draggable=true]')].find(d => d.textContent.includes('Pipeline Probe')); if (card) card.dispatchEvent(new DragEvent('dragend', {bubbles: true})); return 'ok'; })()"`);
await run(`agent-browser --session loc eval "fetch('/api/jobs?id=${jobId}', {method: 'DELETE'}).then(r => r.json())"`);
console.log("89 cleanup done");

// ---------- 90: taskmanager live insertion ring ----------
const aRes = JSON.parse(run(`agent-browser --session loc eval "fetch('/api/tasks', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({kind: 'task', title: 'Reorder Me Above', status: 'backlog', priority: 'high'})}).then(r => r.json())"`).trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
const idA = aRes?.data?.task?.id;
await run(`agent-browser --session loc eval "fetch('/api/tasks', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({kind: 'task', title: 'Insertion Target', status: 'backlog', priority: 'medium'})}).then(r => r.json())"`);
await run(`agent-browser --session loc open "http://127.0.0.1:3200/taskmanager"`);
await sleep(3500);
run(`agent-browser --session loc eval "(() => { const cols = [...document.querySelectorAll('div.space-y-3')]; const col = cols.find(x => x.querySelector('h3') && x.querySelector('h3').textContent === 'Backlog'); const cards = [...col.querySelectorAll('div[draggable=true]')]; const dragged = cards.find(x => x.textContent.includes('Reorder Me Above')); const target = cards.find(x => x.textContent.includes('Insertion Target')); if (!dragged || !target) return 'nocards'; dragged.dispatchEvent(new DragEvent('dragstart', {bubbles: true, cancelable: true, dataTransfer: new DataTransfer()})); target.dispatchEvent(new DragEvent('dragover', {bubbles: true, cancelable: true, dataTransfer: new DataTransfer()})); return 'dragging-with-ring'; })()"`);
await sleep(500);
run(`agent-browser --session loc screenshot ${SHOTS}/90-taskmanager-insertion-ring.png`);
console.log("90 captured (insertion ring)");
run(`agent-browser --session loc eval "(() => { const cols = [...document.querySelectorAll('div.space-y-3')]; const col = cols.find(x => x.querySelector('h3') && x.querySelector('h3').textContent === 'Backlog'); const cards = [...col.querySelectorAll('div[draggable=true]')]; const dragged = cards.find(x => x.textContent.includes('Reorder Me Above')); if (dragged) dragged.dispatchEvent(new DragEvent('dragend', {bubbles: true})); return 'ok'; })()"`);
await run(`agent-browser --session loc eval "fetch('/api/tasks?kind=task&id=${idA}', {method: 'DELETE'}).then(r => r.json())"`);
// also delete the Insertion Target task (find its id via the API list)
await run(`agent-browser --session loc eval "fetch('/api/tasks').then(r => r.json()).then(j => { const t = j.data.tasks.find(x => x.title === 'Insertion Target'); if (t) return fetch('/api/tasks?kind=task&id=' + t.id, {method: 'DELETE'}).then(r => r.json()); return null; })"`);
console.log("90 cleanup done");

// ---------- refresh the standards ----------
await run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
await sleep(3500);
run(`agent-browser --session loc screenshot ${SHOTS}/02-dashboard-desktop.png`);
run(`agent-browser --session loc set viewport 390 844`);
await sleep(1200);
await run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
await sleep(3500);
run(`agent-browser --session loc screenshot ${SHOTS}/11-mobile-dashboard.png`);
run(`agent-browser --session loc set viewport 1440 900`);
console.log("02/11 standards refreshed");
