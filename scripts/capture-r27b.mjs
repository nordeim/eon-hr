#!/usr/bin/env node
// capture-r27b.mjs — re-capture 90 (the taskmanager insertion ring): take-1
// bug = dragstart + dragover dispatched in the SAME eval — React state had
// not flushed, so the dragover handler's dragTaskId guard returned early
// and the ring never rendered. Fix: separate evals with settle delays.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 200); } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const SHOTS = "/home/z/my-project/eon-hr/docs/screenshots";

run("agent-browser --session loc set viewport 1440 900");
await run(`agent-browser --session loc open "http://127.0.0.1:3200/taskmanager"`);
await sleep(2500);

const aRes = JSON.parse(run(`agent-browser --session loc eval "fetch('/api/tasks', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({kind: 'task', title: 'Reorder Me Above', status: 'backlog', priority: 'high'})}).then(r => r.json())"`).trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
const idA = aRes?.data?.task?.id;
await run(`agent-browser --session loc eval "fetch('/api/tasks', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({kind: 'task', title: 'Insertion Target', status: 'backlog', priority: 'medium'})}).then(r => r.json())"`);
await run(`agent-browser --session loc open "http://127.0.0.1:3200/taskmanager"`);
await sleep(3500);

// step 1: dragstart (state flushes)
run(`agent-browser --session loc eval "(() => { const cols = [...document.querySelectorAll('div.space-y-3')]; const col = cols.find(x => x.querySelector('h3') && x.querySelector('h3').textContent === 'Backlog'); const cards = [...col.querySelectorAll('div[draggable=true]')]; const dragged = cards.find(x => x.textContent.includes('Reorder Me Above')); if (!dragged) return 'nocard'; dragged.dispatchEvent(new DragEvent('dragstart', {bubbles: true, cancelable: true, dataTransfer: new DataTransfer()})); return 'dragging'; })()"`);
await sleep(400);
// step 2: dragover on the target card (separate eval — the guard now passes)
run(`agent-browser --session loc eval "(() => { const cols = [...document.querySelectorAll('div.space-y-3')]; const col = cols.find(x => x.querySelector('h3') && x.querySelector('h3').textContent === 'Backlog'); const cards = [...col.querySelectorAll('div[draggable=true]')]; const target = cards.find(x => x.textContent.includes('Insertion Target')); if (!target) return 'notarget'; target.dispatchEvent(new DragEvent('dragover', {bubbles: true, cancelable: true, dataTransfer: new DataTransfer()})); return 'hovering'; })()"`);
await sleep(400);
// confirm the ring in the DOM before shooting
const ringCheck = run(`agent-browser --session loc eval "(() => { const cols = [...document.querySelectorAll('div.space-y-3')]; const col = cols.find(x => x.querySelector('h3') && x.querySelector('h3').textContent === 'Backlog'); const cards = [...col.querySelectorAll('div[draggable=true]')]; const target = cards.find(x => x.textContent.includes('Insertion Target')); const dragged = cards.find(x => x.textContent.includes('Reorder Me Above')); if (!target) return 'notarget'; return JSON.stringify({ targetShadow: getComputedStyle(target).boxShadow, draggedOpacity: dragged ? getComputedStyle(dragged).opacity : 'none' }); })()"`);
console.log("ring pre-check:", ringCheck.trim().slice(0, 220));
run(`agent-browser --session loc screenshot ${SHOTS}/90-taskmanager-insertion-ring.png`);
console.log("90 re-captured");

// cleanup
run(`agent-browser --session loc eval "(() => { const cols = [...document.querySelectorAll('div.space-y-3')]; const col = cols.find(x => x.querySelector('h3') && x.querySelector('h3').textContent === 'Backlog'); const cards = [...col.querySelectorAll('div[draggable=true]')]; const dragged = cards.find(x => x.textContent.includes('Reorder Me Above')); if (dragged) dragged.dispatchEvent(new DragEvent('dragend', {bubbles: true})); return 'ok'; })()"`);
await run(`agent-browser --session loc eval "fetch('/api/tasks?kind=task&id=${idA}', {method: 'DELETE'}).then(r => r.json())"`);
await run(`agent-browser --session loc eval "fetch('/api/tasks').then(r => r.json()).then(j => { const t = j.data.tasks.find(x => x.title === 'Insertion Target'); if (t) return fetch('/api/tasks?kind=task&id=' + t.id, {method: 'DELETE'}).then(r => r.json()); return null; })"`);
console.log("90 cleanup done");
