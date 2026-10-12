#!/usr/bin/env node
// capture-r26b.mjs — session-27: re-capture 87 (the live kanban mid-drag
// state). Take-1 bug: the throwaway task was created AFTER the board
// loaded — the page state never saw it. Fix: create → RELOAD → dispatch
// dragstart → screenshot → cleanup.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 200); } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

run("agent-browser --session loc set viewport 1440 900");
await run(`agent-browser --session loc open "http://127.0.0.1:3200/taskmanager"`);
await sleep(2500);
const created = JSON.parse(run(`agent-browser --session loc eval "fetch('/api/tasks', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({kind: 'task', title: 'Drag me to Done', status: 'backlog', priority: 'high'})}).then(r => r.json())"`).trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
const taskId = created?.data?.task?.id;
console.log("task created:", taskId);
// reload so the board fetches the task
await run(`agent-browser --session loc open "http://127.0.0.1:3200/taskmanager"`);
await sleep(3200);
const cardCount = run(`agent-browser --session loc eval "document.querySelectorAll('div[draggable=true]').length"`).trim();
console.log("draggable cards on board:", cardCount);
// dispatch dragstart and HOLD
run(`agent-browser --session loc eval "(() => { const card = [...document.querySelectorAll('div[draggable=true]')].find(d => d.textContent.includes('Drag me to Done')); if (!card) return 'nocard'; card.dispatchEvent(new DragEvent('dragstart', {bubbles: true, cancelable: true, dataTransfer: new DataTransfer()})); return 'dragging'; })()"`);
await sleep(400);
run(`agent-browser --session loc screenshot /home/z/my-project/eon-hr/docs/screenshots/87-kanban-drag-mid-flight.png`);
console.log("87 re-captured");
// cleanup
run(`agent-browser --session loc eval "document.querySelector('div[draggable=true]').dispatchEvent(new DragEvent('dragend', {bubbles: true}))"`);
if (taskId) {
  await run(`agent-browser --session loc eval "fetch('/api/tasks?kind=task&id=${taskId}', {method: 'DELETE'})"`);
  console.log("task deleted — DB restored");
}
