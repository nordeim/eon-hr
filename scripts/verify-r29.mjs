#!/usr/bin/env node
// verify-r29.mjs — session-30 / parity round 29 live verification:
// (a) the organogram re-parent live probe (create the A→B→C chain via API,
//     drag C onto A on :3200, assert the optimistic move + the toast +
//     persistence after reload, cycle rejection, cleanup);
// (b) the print color fidelity probe — print media via Playwright is the
//     E2E layer's job; HERE we assert the served CSS carries the
//     print-color-adjust rule + @page (the block ships in the stylesheet).
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

const cardByName = (name) => `[...document.querySelectorAll('div[draggable=true]')].find(c => (c.querySelector('p.font-medium')||{}).textContent === '${name}')`;
const depthOf = (name) => `(() => { const c = ${cardByName(name)}; if (!c) return null; let d = 0, el = c.parentElement; while (el) { if (String(el.className).includes('border-l-2')) d++; el = el.parentElement; } return d; })()`;
const dispatchOn = (name, type) => `(() => { const c = ${cardByName(name)}; if (!c) return 'no-card'; c.dispatchEvent(new DragEvent('${type}', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })); return 'ok'; })()`;

console.log("=== (a) organogram re-parent live probe ===");
run("agent-browser --session loc set viewport 1440 900");
const a = await api("/api/employees", "POST", { firstName: "R29lv", lastName: "Root", email: "r29lv.root@example.com", jobTitle: "Probe" });
const b = await api("/api/employees", "POST", { firstName: "R29lv", lastName: "Mid", email: "r29lv.mid@example.com", jobTitle: "Probe", managerId: a.data.employee.id });
const c = await api("/api/employees", "POST", { firstName: "R29lv", lastName: "Leaf", email: "r29lv.leaf@example.com", jobTitle: "Probe", managerId: b.data.employee.id });
const A = a.data.employee.id, B = b.data.employee.id, C = c.data.employee.id;
console.log(`created chain A=${A.slice(-6)} B=${B.slice(-6)} C=${C.slice(-6)}`);

run(`agent-browser --session loc open ${BASE}/organogram`);
await new Promise(r => setTimeout(r, 3500));
console.log("depths before:", `A=${await evalOn("loc", depthOf("R29lv Root"))} B=${await evalOn("loc", depthOf("R29lv Mid"))} C=${await evalOn("loc", depthOf("R29lv Leaf"))}`);

// drag C onto A — separated dispatches (the React-flush lesson)
console.log("dragstart C:", await evalOn("loc", dispatchOn("R29lv Leaf", "dragstart")));
await new Promise(r => setTimeout(r, 200));
console.log("dragover A:", await evalOn("loc", dispatchOn("R29lv Root", "dragover")));
await new Promise(r => setTimeout(r, 120));
// mid-drag: the ring on A + the opacity on C (computed)
const ring = await evalOn("loc", `(() => { const c = ${cardByName("R29lv Root")}; return c ? getComputedStyle(c).boxShadow : null; })()`);
const opac = await evalOn("loc", `(() => { const c = ${cardByName("R29lv Leaf")}; return c ? getComputedStyle(c).opacity : null; })()`);
console.log("mid-drag ring on A:", JSON.stringify(ring));
console.log("mid-drag opacity on C:", JSON.stringify(opac));
console.log("drop A:", await evalOn("loc", dispatchOn("R29lv Root", "drop")));
await new Promise(r => setTimeout(r, 600));
console.log("depth C after optimistic move (expect 1):", await evalOn("loc", depthOf("R29lv Leaf")));

// reload — persisted?
run(`agent-browser --session loc open ${BASE}/organogram`);
await new Promise(r => setTimeout(r, 3500));
console.log("depth C after reload (expect 1):", await evalOn("loc", depthOf("R29lv Leaf")));
console.log("depth B after reload (expect 1):", await evalOn("loc", depthOf("R29lv Mid")));

// cycle rejection: drag A onto C (its own descendant)
console.log("cycle probe — dragstart A:", await evalOn("loc", dispatchOn("R29lv Root", "dragstart")));
await new Promise(r => setTimeout(r, 200));
console.log("cycle probe — dragover C:", await evalOn("loc", dispatchOn("R29lv Leaf", "dragover")));
await new Promise(r => setTimeout(r, 120));
console.log("cycle probe — drop C:", await evalOn("loc", dispatchOn("R29lv Leaf", "drop")));
await new Promise(r => setTimeout(r, 400));
const cycleToast = await evalOn("loc", `(() => { const t = [...document.querySelectorAll('[data-sonner-toast]')].map(x => x.textContent); return t.length ? t : 'no-toast'; })()`);
console.log("cycle toast:", JSON.stringify(cycleToast));
console.log("depth A after cycle attempt (expect 0):", await evalOn("loc", depthOf("R29lv Root")));

// cleanup
await api(`/api/employees?id=${C}`, "DELETE");
await api(`/api/employees?id=${B}`, "DELETE");
await api(`/api/employees?id=${A}`, "DELETE");
console.log("cleanup done");

// (b) the served CSS carries the print color rules
console.log("\n=== (b) print color fidelity — served CSS ===");
const cssUrl = await evalOn("loc", `(() => { const l = [...document.querySelectorAll('link[rel=stylesheet]')].map(x => x.href); return l.length ? l : 'none'; })()`);
console.log("stylesheets:", JSON.stringify(cssUrl));
if (Array.isArray(cssUrl)) {
  for (const u of cssUrl) {
    const res = await fetch(u);
    const text = await res.text();
    const hasColor = text.includes("print-color-adjust:exact") || text.includes("print-color-adjust: exact");
    const hasPage = text.includes("@page");
    console.log(`${u.split("/").pop().slice(0, 40)}: print-color-adjust=${hasColor} @page=${hasPage}`);
  }
}
