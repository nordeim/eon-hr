#!/usr/bin/env node
// verify-r28.mjs — session-29 / parity round 28 live verification:
// (a) the recruitment within-stage reorder live probe (create job + Alpha +
//     Beta via API, drag Alpha ONTO Beta on :3200, assert the order flip +
//     the "Order updated" toast + persistence after reload, cleanup);
// (b) the print-media superset probe — emulated print media on BOTH apps:
//     the clone hides its shell chrome (computed display:none on
//     aside/header/nav), REF keeps its chrome (zero print rules);
// (c) the screen-media regression: under normal screen media the print
//     block must not apply (sidebar visible, main padding intact).
// Computed DOM is the ground truth; dispatch and read in SEPARATE evals
// (the React-flush lesson).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const BASE = "http://127.0.0.1:3200";
const COOKIE = run("agent-browser --session loc cookies get").trim().split("\n").find((l) => l.startsWith("eon_session="));
const COOKIE_HEADER = COOKIE ? { Cookie: COOKIE } : {};

async function api(path, method, body) {
  const res = await fetch(`${BASE}${path}`, { method, headers: { "Content-Type": "application/json", ...COOKIE_HEADER }, body: body ? JSON.stringify(body) : undefined });
  return res.json();
}

async function dispatch(session, selector, type) {
  return evalOn(session, `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return 'no-el'; el.dispatchEvent(new DragEvent('${type}', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`);
}

const readOrder = `(() => { const col = [...document.querySelectorAll('div.w-64')].find(c => c.querySelector('h3') && c.querySelector('h3').textContent.trim() === 'Applied'); if (!col) return JSON.stringify({col:false}); return JSON.stringify({col:true, order: [...col.querySelectorAll('div[draggable=true] p.font-medium')].map(p => p.textContent.trim())}); })()`;

console.log("=== (a) recruitment within-stage reorder live probe ===");
run("agent-browser --session loc set viewport 1440 900");
const job = await api("/api/jobs", "POST", { title: "R28 Live Probe Role", department: "QA", openings: 1 });
const jobId = job.data.job.id;
await api("/api/candidates", "POST", { jobPostingId: jobId, name: "R28 Alpha", email: "alpha28@example.com" });
await api("/api/candidates", "POST", { jobPostingId: jobId, name: "R28 Beta", email: "beta28@example.com" });

run(`agent-browser --session loc open ${BASE}/recruitmentkanban`);
await new Promise(r => setTimeout(r, 3500));
const before = await evalOn("loc", readOrder);
console.log("before:", JSON.stringify(before));

// drag Alpha ONTO Beta — separated dispatches (the React-flush lesson)
const SEL = (name) => `div[draggable=true] p.font-medium >> text=${name}`;
// locate by text via eval instead (agent-browser CSS is limited)
const startOn = async (name) => evalOn("loc", `(() => { const p = [...document.querySelectorAll('div[draggable=true] p.font-medium')].find(x => x.textContent.trim() === '${name}'); if (!p) return 'no-card'; p.closest('div[draggable=true]').dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`);
const overOn = async (name) => evalOn("loc", `(() => { const p = [...document.querySelectorAll('div[draggable=true] p.font-medium')].find(x => x.textContent.trim() === '${name}'); if (!p) return 'no-card'; p.closest('div[draggable=true]').dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`);
const dropOn = async (name) => evalOn("loc", `(() => { const p = [...document.querySelectorAll('div[draggable=true] p.font-medium')].find(x => x.textContent.trim() === '${name}'); if (!p) return 'no-card'; p.closest('div[draggable=true]').dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`);
// mid-drag: the insertion ring on Beta (computed)
const ringOn = async (name) => evalOn("loc", `(() => { const p = [...document.querySelectorAll('div[draggable=true] p.font-medium')].find(x => x.textContent.trim() === '${name}'); if (!p) return 'no-card'; const cs = getComputedStyle(p.closest('div[draggable=true]')); return JSON.stringify({ring: cs.boxShadow, opacity: cs.opacity}); })()`);

console.log("start:", JSON.stringify(await startOn("R28 Alpha")));
await new Promise(r => setTimeout(r, 250));
console.log("mid-drag ring on Beta:", JSON.stringify(await ringOn("R28 Beta")));
console.log("over:", JSON.stringify(await overOn("R28 Beta")));
await new Promise(r => setTimeout(r, 120));
console.log("drop:", JSON.stringify(await dropOn("R28 Beta")));
await new Promise(r => setTimeout(r, 900));

const after = await evalOn("loc", readOrder);
console.log("after drag:", JSON.stringify(after));
const toast = await evalOn("loc", `(() => { const t = [...document.querySelectorAll('ol li, [data-sonner-toast], li')].map(x => x.textContent).filter(x => x && x.includes('Order updated')); return JSON.stringify({toast: t.length > 0 ? t[0].slice(0, 40) : null}); })()`);
console.log("toast:", JSON.stringify(toast));

run(`agent-browser --session loc open ${BASE}/recruitmentkanban`);
await new Promise(r => setTimeout(r, 3500));
const persisted = await evalOn("loc", readOrder);
console.log("after reload:", JSON.stringify(persisted));

// cleanup
await api(`/api/jobs?id=${jobId}`, "DELETE");
console.log("cleanup: job deleted (candidates cascade)");

console.log("\n=== (b) print-media superset probe (BOTH apps) ===");
// LOC under print emulation
run(`agent-browser --session loc open ${BASE}/employees`);
await new Promise(r => setTimeout(r, 3000));
run("agent-browser --session loc set media print");
await new Promise(r => setTimeout(r, 800));
const locPrint = await evalOn("loc", `(() => { const aside = document.querySelector('aside'); const header = document.querySelector('header'); const nav = document.querySelector('nav'); const main = document.querySelector('main'); const root = document.querySelector('body > div'); return JSON.stringify({ aside: aside ? getComputedStyle(aside).display : 'none-in-dom', header: header ? getComputedStyle(header).display : 'none-in-dom', nav: nav ? getComputedStyle(nav).display : 'none-in-dom', mainPad: main ? getComputedStyle(main).paddingBottom : null, rootMinH: root ? getComputedStyle(root).minHeight : null, cardBreak: (() => { const c = document.querySelector('.rounded-xl'); return c ? getComputedStyle(c).breakInside : null; })() }); })()`);
console.log("LOC under print media:", JSON.stringify(locPrint));
// REF under print emulation
run(`agent-browser --session ref open https://eon.base44.app/employees`);
await new Promise(r => setTimeout(r, 3000));
run("agent-browser --session ref set media print");
await new Promise(r => setTimeout(r, 800));
const refPrint = await evalOn("ref", `(() => { const aside = document.querySelector('aside'); const header = document.querySelector('header'); const nav = document.querySelector('nav'); const main = document.querySelector('main'); return JSON.stringify({ aside: aside ? getComputedStyle(aside).display : 'no-aside-el', header: header ? getComputedStyle(header).display : 'no-header-el', nav: nav ? getComputedStyle(nav).display : 'no-nav-el', mainPad: main ? getComputedStyle(main).paddingBottom : null }); })()`);
console.log("REF under print media:", JSON.stringify(refPrint));

console.log("\n=== (c) screen-media regression (print block must not apply) ===");
run("agent-browser --session loc set media screen");
run("agent-browser --session ref set media screen");
await new Promise(r => setTimeout(r, 800));
const locScreen = await evalOn("loc", `(() => { const aside = document.querySelector('aside'); const main = document.querySelector('main'); const h = [...document.querySelectorAll('h1')].find(x => x.offsetParent !== null); return JSON.stringify({ asideDisplay: aside ? getComputedStyle(aside).display : null, mainPad: main ? getComputedStyle(main).paddingBottom : null, h1x: h ? Math.round(h.getBoundingClientRect().x) : null }); })()`);
console.log("LOC under screen media (expect aside flex, h1 x=288):", JSON.stringify(locScreen));
