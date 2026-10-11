#!/usr/bin/env node
// verify-r21.mjs — session-22 / parity round 21 live verification:
// 1. drawer open/close slide timing on LOC (expect ~500ms/~300ms + overlay fade)
// 2. user-dropdown + select animation during open (expect enter 0.15s)
// 3. group hover fade with the hover polyfill v2 (expect ~200ms settle)
// 4. chevron instant (no motion classes)
// 5. post-fix regression: canonical pressed/hover spot-checks
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

function run(cmd) {
  try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); }
  catch (e) { return "ERR:" + String(e).slice(0, 200); }
}
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    let raw = out.trim();
    try { const once = JSON.parse(raw); if (typeof once === "string") raw = once; } catch {}
    return JSON.parse(raw);
  } catch { return { error: out.slice(0, 250) }; }
}

const v20 = readFileSync("scripts/verify-r20.mjs", "utf8");
const POLYFILL = v20.match(/const POLYFILL = `([\s\S]*?)`;/)[1];

async function ensureLocAuth() {
  const p = await evalOn("loc", "location.pathname");
  if (String(p).includes("login")) {
    run("agent-browser --session loc open http://127.0.0.1:3200/login");
    await new Promise(r => setTimeout(r, 2000));
    run("agent-browser --session loc fill 'input[type=email]' 'sepnetflix2023@outlook.com'");
    run("agent-browser --session loc fill 'input[type=password]' '$Abcd1234'");
    const snap = run("agent-browser --session loc snapshot -i -c");
    const m = snap.match(/button "Sign in" \[ref=(\w+)/);
    if (m) run(`agent-browser --session loc click @${m[1]}`);
    await new Promise(r => setTimeout(r, 4000));
  }
}

// ---------- 1. drawer slide timing ----------
console.log("── 1. DRAWER OPEN TIMING (LOC, expect ~500ms slide + ~150ms overlay) ──");
run("agent-browser --session loc set viewport 390 844");
run("agent-browser --session loc open http://127.0.0.1:3200/dashboard");
await new Promise(r => setTimeout(r, 3000));
await ensureLocAuth();
await evalOn("loc", `(() => { const b = [...document.querySelectorAll("button")].find(x => (x.getAttribute("aria-label")||"") === "Toggle Sidebar"); if (!b) return "no-burger"; b.click(); const samples = []; const t0 = performance.now(); const s = () => { const panel = [...document.querySelectorAll("div")].find(d => { const rr = d.getBoundingClientRect(); return rr.width >= 280 && rr.width <= 296 && rr.height > 700; }); const ov = [...document.querySelectorAll("div")].find(d => (d.getAttribute("class")||"").includes("bg-[rgba(0,0,0,0.8)]")); samples.push(Math.round(performance.now()-t0) + " x=" + (panel ? Math.round(panel.getBoundingClientRect().x) : "-") + " op=" + (ov ? Number(getComputedStyle(ov).opacity).toFixed(2) : "-")); if (performance.now() - t0 < 950) requestAnimationFrame(s); else window.__d21 = samples; }; s(); return "sampling"; })()`);
await new Promise(r => setTimeout(r, 1600));
const openFrames = await evalOn("loc", `JSON.stringify((window.__d21||[]).filter((v,i) => i % 3 === 0))`);
console.log((openFrames || []).join("\n"));

console.log("── drawer CLOSE timing (expect ~300ms) ──");
await evalOn("loc", `(() => { const ov = [...document.querySelectorAll("div")].find(d => (d.getAttribute("class")||"").includes("bg-[rgba(0,0,0,0.8)]")); if (ov) ov.click(); return "closed"; })()`);
await new Promise(r => setTimeout(r, 1200));
await evalOn("loc", `(() => { const b = [...document.querySelectorAll("button")].find(x => (x.getAttribute("aria-label")||"") === "Toggle Sidebar"); if (!b) return "no-burger"; b.click(); const samples = []; const t0 = performance.now(); const s = () => { const panel = [...document.querySelectorAll("div")].find(d => { const rr = d.getBoundingClientRect(); return rr.width >= 280 && rr.width <= 296 && rr.height > 700; }); const ov = [...document.querySelectorAll("div")].find(d => (d.getAttribute("class")||"").includes("bg-[rgba(0,0,0,0.8)]")); samples.push(Math.round(performance.now()-t0) + " x=" + (panel ? Math.round(panel.getBoundingClientRect().x) : "gone") + " op=" + (ov ? Number(getComputedStyle(ov).opacity).toFixed(2) : "gone")); if (performance.now() - t0 < 800) requestAnimationFrame(s); else window.__d21c = samples; }; s(); return "sampling"; })()`);
await new Promise(r => setTimeout(r, 1400));
const closeFrames = await evalOn("loc", `JSON.stringify((window.__d21c||[]).filter((v,i) => i % 2 === 0))`);
console.log((closeFrames || []).join("\n"));

// ---------- 2. dropdown + select animation ----------
console.log("── 2. USER DROPDOWN + SELECT ANIMATION (LOC, expect enter 0.15s) ──");
run("agent-browser --session loc set viewport 1440 900");
run("agent-browser --session loc open http://127.0.0.1:3200/dashboard");
await new Promise(r => setTimeout(r, 2800));
await ensureLocAuth();
await evalOn("loc", `(() => { const b = [...document.querySelectorAll("button")].find(x => x.textContent.includes("sepnetflix2023")); if (!b) return "no-btn"; b.click(); return "clicked"; })()`);
await new Promise(r => setTimeout(r, 120));
const ddAnim = await evalOn("loc", `(() => { const menu = document.querySelector("[role=menu]"); if (!menu) return JSON.stringify({found:false}); const cs = getComputedStyle(menu); return JSON.stringify({found:true, an: cs.animationName, dur: cs.animationDuration, ease: cs.animationTimingFunction.slice(0,20), op: cs.opacity}); })()`);
console.log("user dropdown @120ms:", JSON.stringify(ddAnim));
await new Promise(r => setTimeout(r, 800));
run("agent-browser --session loc eval 'document.body.click()'");
await new Promise(r => setTimeout(r, 600));

run("agent-browser --session loc open http://127.0.0.1:3200/attendancedashboard");
await new Promise(r => setTimeout(r, 2800));
await ensureLocAuth();
await evalOn("loc", `(() => { const t = document.querySelector("[role=combobox]"); if (!t) return "no-select"; t.click(); return "clicked"; })()`);
await new Promise(r => setTimeout(r, 120));
const selAnim = await evalOn("loc", `(() => { const l = document.querySelector("[role=listbox]"); if (!l) return JSON.stringify({found:false}); const cs = getComputedStyle(l); return JSON.stringify({found:true, an: cs.animationName, dur: cs.animationDuration, op: cs.opacity}); })()`);
console.log("select content @120ms:", JSON.stringify(selAnim));

// ---------- 3. group hover fade (polyfilled) ----------
console.log("── 3. GROUP HOVER FADE (LOC polyfilled, expect ~200ms settle like REF) ──");
run("agent-browser --session loc open http://127.0.0.1:3200/dashboard");
await new Promise(r => setTimeout(r, 2800));
await ensureLocAuth();
const poly = await evalOn("loc", POLYFILL, 2500);
console.log("polyfill:", JSON.stringify(poly).slice(0, 60));
const gpos = await evalOn("loc", `(() => { const g = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "Recruitment"); if (!g) return JSON.stringify(null); const r = g.getBoundingClientRect(); return JSON.stringify({ x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) }); })()`);
if (gpos && gpos.x) {
  await evalOn("loc", `(() => { const g = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "Recruitment"); const samples = []; const t0 = performance.now(); const s = () => { const cs = getComputedStyle(g); samples.push(Math.round(performance.now() - t0) + " " + cs.backgroundColor + " " + cs.color); if (performance.now() - t0 < 700) requestAnimationFrame(s); else window.__h21 = samples; }; s(); return "sampling"; })()`);
  run(`agent-browser --session loc mouse move ${gpos.x} ${gpos.y}`);
  await new Promise(r => setTimeout(r, 1100));
  const hf = await evalOn("loc", `JSON.stringify((window.__h21||[]).filter((v,i) => i % 3 === 0))`);
  console.log((hf || []).join("\n"));
  run("agent-browser --session loc mouse move 5 5");
}

// ---------- 4. chevron instant ----------
console.log("── 4. CHEVRON (expect NO motion classes, computed 0s) ──");
const chev = await evalOn("loc", `(() => { const g = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "Recruitment"); const svg = g ? g.querySelector("svg:last-of-type") : null; if (!svg) return JSON.stringify(null); const cs = getComputedStyle(svg); return JSON.stringify({ cls: (svg.getAttribute("class")||"").trim(), tr: cs.transitionDuration }); })()`);
console.log("chevron:", JSON.stringify(chev));

console.log("\nVERIFY-R21-DONE");
