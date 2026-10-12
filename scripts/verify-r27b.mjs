#!/usr/bin/env node
// verify-r27b.mjs — the mid-drag affordance + insertion ring, re-verified
// with SEPARATE eval calls (React state needs a tick to flush — the
// single-eval synchronous read is the documented round-26 probe artifact).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const BASE = "http://127.0.0.1:3200";
const COOKIE = run("agent-browser --session loc cookies get").trim().split("\n").find((l) => l.startsWith("eon_session="));
async function api(path, method, body) {
  const res = await fetch(`${BASE}${path}`, { method, headers: { "Content-Type": "application/json", Cookie: COOKIE }, body: body ? JSON.stringify(body) : undefined });
  return res.json();
}

run("agent-browser --session loc set viewport 1440 900");

// --- recruitment mid-drag opacity ---
const job = await api("/api/jobs", "POST", { title: "R27b Probe Role", openings: 1 });
await api("/api/candidates", "POST", { jobPostingId: job.data.job.id, name: "R27b Probe", email: "r27b@example.com" });
run(`agent-browser --session loc open ${BASE}/recruitmentkanban`);
await new Promise(r => setTimeout(r, 3500));

await evalOn("loc", `(() => { const cards = [...document.querySelectorAll('div[draggable=true]')]; const c = cards.find(x => x.textContent.includes('R27b Probe')); if (!c) return 'no-card'; c.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 250));
const midR = await evalOn("loc", `(() => { const cards = [...document.querySelectorAll('div[draggable=true]')]; const c = cards.find(x => x.textContent.includes('R27b Probe')); if (!c) return JSON.stringify({found:false}); return JSON.stringify({found:true, opacity: getComputedStyle(c).opacity, cursor: getComputedStyle(c).cursor}); })()`);
console.log("recruitment mid-drag:", JSON.stringify(midR));
await evalOn("loc", `(() => { const cards = [...document.querySelectorAll('div[draggable=true]')]; const c = cards.find(x => x.textContent.includes('R27b Probe')); if (c) c.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true })); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 200));
const endR = await evalOn("loc", `(() => { const cards = [...document.querySelectorAll('div[draggable=true]')]; const c = cards.find(x => x.textContent.includes('R27b Probe')); if (!c) return JSON.stringify({found:false}); return JSON.stringify({found:true, opacity: getComputedStyle(c).opacity}); })()`);
console.log("recruitment after dragend:", JSON.stringify(endR));
await api(`/api/jobs?id=${job.data.job.id}`, "DELETE");

// --- taskmanager mid-drag opacity + insertion ring ---
const a = await api("/api/tasks", "POST", { kind: "task", title: "R27b Alpha", status: "backlog", priority: "low" });
const b = await api("/api/tasks", "POST", { kind: "task", title: "R27b Beta", status: "backlog", priority: "low" });
run(`agent-browser --session loc open ${BASE}/taskmanager`);
await new Promise(r => setTimeout(r, 3500));

await evalOn("loc", `(() => { const cols = [...document.querySelectorAll('div.space-y-3')]; const col = cols.find(x => x.querySelector('h3') && x.querySelector('h3').textContent === 'Backlog'); const cards = [...col.querySelectorAll('div[draggable=true]')]; const alpha = cards.find(x => x.textContent.includes('R27b Alpha')); if (!alpha) return 'no-alpha'; alpha.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 250));
const midT = await evalOn("loc", `(() => { const cols = [...document.querySelectorAll('div.space-y-3')]; const col = cols.find(x => x.querySelector('h3') && x.querySelector('h3').textContent === 'Backlog'); const cards = [...col.querySelectorAll('div[draggable=true]')]; const alpha = cards.find(x => x.textContent.includes('R27b Alpha')); if (!alpha) return JSON.stringify({found:false}); return JSON.stringify({found:true, opacity: getComputedStyle(alpha).opacity}); })()`);
console.log("taskmanager mid-drag opacity:", JSON.stringify(midT));

// hover Beta → insertion ring
await evalOn("loc", `(() => { const cols = [...document.querySelectorAll('div.space-y-3')]; const col = cols.find(x => x.querySelector('h3') && x.querySelector('h3').textContent === 'Backlog'); const cards = [...col.querySelectorAll('div[draggable=true]')]; const beta = cards.find(x => x.textContent.includes('R27b Beta')); if (!beta) return 'no-beta'; beta.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 250));
const ringT = await evalOn("loc", `(() => { const cols = [...document.querySelectorAll('div.space-y-3')]; const col = cols.find(x => x.querySelector('h3') && x.querySelector('h3').textContent === 'Backlog'); const cards = [...col.querySelectorAll('div[draggable=true]')]; const beta = cards.find(x => x.textContent.includes('R27b Beta')); if (!beta) return JSON.stringify({found:false}); const bs = getComputedStyle(beta).boxShadow; return JSON.stringify({found:true, boxShadow: bs, ringed: bs.includes('96, 165, 250')}); })()`);
console.log("insertion ring on hover:", JSON.stringify(ringT));

// cleanup without dropping (dragend)
await evalOn("loc", `(() => { const cols = [...document.querySelectorAll('div.space-y-3')]; const col = cols.find(x => x.querySelector('h3') && x.querySelector('h3').textContent === 'Backlog'); const cards = [...col.querySelectorAll('div[draggable=true]')]; const alpha = cards.find(x => x.textContent.includes('R27b Alpha')); if (alpha) alpha.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true })); return 'ok'; })()`);
await api(`/api/tasks?kind=task&id=${a.data.task.id}`, "DELETE");
await api(`/api/tasks?kind=task&id=${b.data.task.id}`, "DELETE");
console.log("cleanup done");
