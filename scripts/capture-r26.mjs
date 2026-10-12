#!/usr/bin/env node
// capture-r26.mjs — session-27 / parity round 26 evidence captures:
// 86 (the round's census evidence page), 87 (the live kanban mid-drag
// state — dragstart dispatched, no drop), + 2 refreshed standards.
// A throwaway task powers the drag capture; deleted after (DB pristine).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const SS = "docs/screenshots";
await (async () => {
  // 86 — the evidence page
  run("agent-browser --session loc set viewport 1280 1400");
  run(`agent-browser --session loc open "file:///home/z/my-project/eon-hr/${SS}/r26-evidence.html"`);
  await sleep(1200);
  run(`agent-browser --session loc screenshot /home/z/my-project/eon-hr/${SS}/86-reduced-motion-dnd-evidence.png --full-page`);
  console.log("86 captured");

  // 87 — the live mid-drag state (desktop board)
  run("agent-browser --session loc set viewport 1440 900");
  // throwaway task via the API (from the page context — authed)
  await run(`agent-browser --session loc open "http://127.0.0.1:3200/taskmanager"`);
  await sleep(3000);
  const created = JSON.parse(run(`agent-browser --session loc eval "fetch('/api/tasks', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({kind: 'task', title: 'Drag me to Done', status: 'backlog', priority: 'high'})}).then(r => r.json())"`).trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
  const taskId = created?.data?.task?.id;
  console.log("task:", taskId);
  await sleep(1500);
  // dispatch dragstart and HOLD (no drop) — the card renders opacity-50 and
  // the non-source columns render the ring highlight
  await run(`agent-browser --session loc eval "(() => { const card = [...document.querySelectorAll('div[draggable=true]')].find(d => d.textContent.includes('Drag me to Done')); card.dispatchEvent(new DragEvent('dragstart', {bubbles: true, cancelable: true, dataTransfer: new DataTransfer()})); })()"`);
  await sleep(400);
  run(`agent-browser --session loc screenshot /home/z/my-project/eon-hr/${SS}/87-kanban-drag-mid-flight.png`);
  console.log("87 captured");
  // cleanup: end the drag + delete the task
  await run(`agent-browser --session loc eval "document.querySelector('div[draggable=true]').dispatchEvent(new DragEvent('dragend', {bubbles: true}))"`);
  if (taskId) {
    await run(`agent-browser --session loc eval "fetch('/api/tasks?kind=task&id=${taskId}', {method: 'DELETE'})"`);
    console.log("task deleted");
  }

  // standards refresh
  run("agent-browser --session loc set viewport 1440 900");
  await run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
  await sleep(3000);
  run(`agent-browser --session loc screenshot /home/z/my-project/eon-hr/${SS}/02-dashboard-desktop.png`);
  run("agent-browser --session loc set viewport 390 844");
  await sleep(1500);
  run(`agent-browser --session loc screenshot /home/z/my-project/eon-hr/${SS}/11-mobile-dashboard.png`);
  console.log("standards refreshed");
})();
