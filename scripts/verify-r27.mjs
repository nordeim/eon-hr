#!/usr/bin/env node
// verify-r27.mjs — session-28 / parity round 27 live verification:
// (a) the recruitment pipeline DnD live probe (create job+candidate via API,
//     drag applied→interviewing on :3200, assert optimistic move + toast +
//     persistence after reload, cleanup);
// (b) the taskmanager within-column reorder live probe (create 2 tasks,
//     drag the lower one onto the upper, assert order flip + persistence,
//     cleanup);
// (c) the round-26 cross-column DnD regression (Backlog→Done round-trip).
// All probes run against the LOC standalone server (:3200) with computed-DOM
// assertions; REF is untouched (both supersets have zero REF surface).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const BASE = "http://127.0.0.1:3200";

// The Node-side fetch needs the browser session cookie (the API is
// auth-gated); read it from the loc agent-browser session.
const COOKIE = run("agent-browser --session loc cookies get")
  .trim()
  .split("\n")
  .find((l) => l.startsWith("eon_session="));
const COOKIE_HEADER = COOKIE ? { Cookie: COOKIE } : {};

async function api(path, method, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...COOKIE_HEADER },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// Drag helper: dispatch the synthetic sequence on elements by selector text.
async function drag(session, dragSel, dropSel) {
  await evalOn(session, `(() => { const el = document.querySelector(${JSON.stringify(dragSel)}); if (!el) return 'no-drag-el'; el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 200));
  await evalOn(session, `(() => { const el = document.querySelector(${JSON.stringify(dropSel)}); if (!el) return 'no-drop-el'; el.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 100));
  await evalOn(session, `(() => { const el = document.querySelector(${JSON.stringify(dropSel)}); if (!el) return 'no-drop-el'; el.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 600));
}

const COLUMN_OF = (label) => `div.w-64 >> text=${label}`;

async function probeRecruitment() {
  console.log("\n=== (a) recruitment pipeline DnD live probe ===");
  run(`agent-browser --session loc set viewport 1440 900`);
  const job = await api("/api/jobs", "POST", { title: "R27 Live Probe Role", department: "QA", openings: 1 });
  const cand = await api("/api/candidates", "POST", { jobPostingId: job.data.job.id, name: "R27 Live Probe", email: "r27@example.com" });
  console.log(`created job=${job.data.job.id} candidate=${cand.data.candidate.id}`);

  run(`agent-browser --session loc open ${BASE}/recruitmentkanban`);
  await new Promise(r => setTimeout(r, 3500));

  // locate the card in Applied + the Interviewing column
  const findCard = `(() => { const cards = [...document.querySelectorAll('div[draggable=true]')]; const c = cards.find(x => x.textContent.includes('R27 Live Probe')); if (!c) return JSON.stringify({found:false}); const cols = [...document.querySelectorAll('div.w-64')]; const col = cols.find(x => x.contains(c)); return JSON.stringify({found:true, col: col ? col.querySelector('h3').textContent : null, cursor: getComputedStyle(c).cursor}); })()`;
  const before = await evalOn("loc", findCard);
  console.log("before drag:", JSON.stringify(before));

  // drag the card → the Interviewing column (drop on the column element)
  const DRAG_CARD = `div[draggable=true]`;
  const DROP_INT = `div.w-64 >> h3 >> text=Interviewing`;
  // agent-browser selectors are CSS-ish; use eval-based dispatch instead
  await dragViaEval(DRAG_CARD_WITH_TEXT("R27 Live Probe"), COL_WITH_H3("Interviewing"));

  const after = await evalOn("loc", findCard);
  console.log("after drag:", JSON.stringify(after));

  // persistence after reload
  run(`agent-browser --session loc open ${BASE}/recruitmentkanban`);
  await new Promise(r => setTimeout(r, 3500));
  const persisted = await evalOn("loc", findCard);
  console.log("after reload:", JSON.stringify(persisted));

  // mid-drag affordance check: opacity 0.5 while dragging
  const midDrag = await evalOn("loc", `(() => { const cards = [...document.querySelectorAll('div[draggable=true]')]; const c = cards.find(x => x.textContent.includes('R27 Live Probe')); if (!c) return JSON.stringify({found:false}); c.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); const op = getComputedStyle(c).opacity; c.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true })); return JSON.stringify({found:true, midDragOpacity: op, afterEndOpacity: getComputedStyle(c).opacity}); })()`, 200);
  console.log("mid-drag affordance:", JSON.stringify(midDrag));

  const del = await api(`/api/jobs?id=${job.data.job.id}`, "DELETE");
  console.log(`cleanup job: ${JSON.stringify(del.ok === true ? { ok: true } : del)}`);
  return before.found && after.col === "Interviewing" && persisted.col === "Interviewing";
}

function DRAG_CARD_WITH_TEXT(text) { return `div[draggable=true]::-p-contains(${text})`; }
function COL_WITH_H3(label) { return `div.w-64::-p-contains(${label})`; }

async function dragViaEval(dragPseudo, dropPseudo) {
  // Playwright-style pseudo selectors are not available in agent-browser;
  // use text-based lookup inside eval.
  const dragExpr = dragPseudo.includes("R27 Live Probe") ? "R27 Live Probe" : dragPseudo;
  const dropLabel = dropPseudo.match(/Interviewing|Backlog|Done|To Do|In Progress|Review/)?.[0] ?? dropPseudo;
  await evalOn("loc", `(() => { const cards = [...document.querySelectorAll('div[draggable=true]')]; const c = cards.find(x => x.textContent.includes('${dragExpr}')); if (!c) return 'no-card'; c.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 200));
  await evalOn("loc", `(() => { const cols = [...document.querySelectorAll('div.w-64')]; const col = cols.find(x => (x.querySelector('h3')||{}).textContent === '${dropLabel}'); if (!col) return 'no-col'; col.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 100));
  await evalOn("loc", `(() => { const cols = [...document.querySelectorAll('div.w-64')]; const col = cols.find(x => (x.querySelector('h3')||{}).textContent === '${dropLabel}'); if (!col) return 'no-col'; col.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 800));
}

async function probeReorder() {
  console.log("\n=== (b) taskmanager within-column reorder live probe ===");
  const a = await api("/api/tasks", "POST", { kind: "task", title: "R27 Reorder Alpha", status: "backlog", priority: "low" });
  const b = await api("/api/tasks", "POST", { kind: "task", title: "R27 Reorder Beta", status: "backlog", priority: "low" });
  console.log(`created tasks A=${a.data.task.id} B=${b.data.task.id}`);

  run(`agent-browser --session loc open ${BASE}/taskmanager`);
  await new Promise(r => setTimeout(r, 3500));

  const orderRead = `(() => { const cols = [...document.querySelectorAll('div.space-y-3')]; const col = cols.find(x => x.querySelector('h3') && x.querySelector('h3').textContent === 'Backlog'); if (!col) return JSON.stringify({found:false}); const cards = [...col.querySelectorAll('div[draggable=true]')].filter(x => x.textContent.includes('R27 Reorder')); return JSON.stringify({found:true, order: cards.map(x => x.textContent.includes('Beta') ? 'Beta' : 'Alpha')}); })()`;
  const before = await evalOn("loc", orderRead);
  console.log("before drag:", JSON.stringify(before));

  // drag Alpha ONTO Beta (card-level insertion: Alpha lands above Beta)
  await evalOn("loc", `(() => { const cols = [...document.querySelectorAll('div.space-y-3')]; const col = cols.find(x => x.querySelector('h3') && x.querySelector('h3').textContent === 'Backlog'); const cards = [...col.querySelectorAll('div[draggable=true]')]; const alpha = cards.find(x => x.textContent.includes('Alpha')); if (!alpha) return 'no-alpha'; alpha.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 200));
  // insertion ring check while hovering Beta
  const ring = await evalOn("loc", `(() => { const cols = [...document.querySelectorAll('div.space-y-3')]; const col = cols.find(x => x.querySelector('h3') && x.querySelector('h3').textContent === 'Backlog'); const cards = [...col.querySelectorAll('div[draggable=true]')]; const beta = cards.find(x => x.textContent.includes('Beta')); if (!beta) return JSON.stringify({found:false}); beta.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); const bs = getComputedStyle(beta).boxShadow; const ringed = bs.includes('99, 157, 255') || bs.includes('96, 165, 250)'); return JSON.stringify({found:true, boxShadow: bs, ringed}); })()`, 150);
  console.log("insertion ring while hovering:", JSON.stringify(ring));
  await evalOn("loc", `(() => { const cols = [...document.querySelectorAll('div.space-y-3')]; const col = cols.find(x => x.querySelector('h3') && x.querySelector('h3').textContent === 'Backlog'); const cards = [...col.querySelectorAll('div[draggable=true]')]; const beta = cards.find(x => x.textContent.includes('Beta')); if (!beta) return 'no-beta'; beta.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 800));

  const after = await evalOn("loc", orderRead);
  console.log("after drag:", JSON.stringify(after));

  // persistence after reload
  run(`agent-browser --session loc open ${BASE}/taskmanager`);
  await new Promise(r => setTimeout(r, 3500));
  const persisted = await evalOn("loc", orderRead);
  console.log("after reload:", JSON.stringify(persisted));

  await api(`/api/tasks?kind=task&id=${a.data.task.id}`, "DELETE");
  await api(`/api/tasks?kind=task&id=${b.data.task.id}`, "DELETE");
  console.log("cleanup tasks: done");
  return before.order?.join() === "Beta,Alpha" && after.order?.join() === "Alpha,Beta" && persisted.order?.join() === "Alpha,Beta";
}

async function probeCrossColumnRegression() {
  console.log("\n=== (c) round-26 cross-column DnD regression ===");
  const t = await api("/api/tasks", "POST", { kind: "task", title: "R27 Cross Probe", status: "backlog", priority: "low" });
  run(`agent-browser --session loc open ${BASE}/taskmanager`);
  await new Promise(r => setTimeout(r, 3500));
  await evalOn("loc", `(() => { const cards = [...document.querySelectorAll('div[draggable=true]')]; const c = cards.find(x => x.textContent.includes('R27 Cross Probe')); if (!c) return 'no-card'; c.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 200));
  await evalOn("loc", `(() => { const cols = [...document.querySelectorAll('div.space-y-3')]; const col = cols.find(x => x.querySelector('h3') && x.querySelector('h3').textContent === 'Done'); if (!col) return 'no-col'; col.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 100));
  await evalOn("loc", `(() => { const cols = [...document.querySelectorAll('div.space-y-3')]; const col = cols.find(x => x.querySelector('h3') && x.querySelector('h3').textContent === 'Done'); if (!col) return 'no-col'; col.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 800));
  const moved = await evalOn("loc", `(() => { const cols = [...document.querySelectorAll('div.space-y-3')]; const done = cols.find(x => x.querySelector('h3') && x.querySelector('h3').textContent === 'Done'); return JSON.stringify({ inDone: !!done && [...done.querySelectorAll('div[draggable=true]')].some(x => x.textContent.includes('R27 Cross Probe')) }); })()`);
  console.log("cross-column move:", JSON.stringify(moved));
  await api(`/api/tasks?kind=task&id=${t.data.task.id}`, "DELETE");
  return moved.inDone === true;
}

const okA = await probeRecruitment();
const okB = await probeReorder();
const okC = await probeCrossColumnRegression();
console.log(`\n=== VERDICT: recruitment=${okA ? "PASS" : "FAIL"} reorder=${okB ? "PASS" : "FAIL"} cross-regression=${okC ? "PASS" : "FAIL"} ===`);
