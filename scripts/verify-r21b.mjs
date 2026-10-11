#!/usr/bin/env node
// verify-r21b.mjs — the two corrected measurements: drawer close via Escape,
// user dropdown via snapshot-ref click (JS .click() doesn't open it).
import { execSync } from "node:child_process";

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

// ---------- drawer close via Escape ----------
console.log("── DRAWER CLOSE via Escape (expect ~300ms slide-out + fade) ──");
run("agent-browser --session loc set viewport 390 844");
run("agent-browser --session loc open http://127.0.0.1:3200/dashboard");
await new Promise(r => setTimeout(r, 2800));
let p = await evalOn("loc", "location.pathname");
if (String(p).includes("login")) {
  run("agent-browser --session loc fill 'input[type=email]' 'sepnetflix2023@outlook.com'");
  run("agent-browser --session loc fill 'input[type=password]' '$Abcd1234'");
  const snap = run("agent-browser --session loc snapshot -i -c");
  const m = snap.match(/button "Sign in" \[ref=(\w+)/);
  if (m) run(`agent-browser --session loc click @${m[1]}`);
  await new Promise(r => setTimeout(r, 4000));
}
await evalOn("loc", `(() => { const b = [...document.querySelectorAll("button")].find(x => (x.getAttribute("aria-label")||"") === "Toggle Sidebar"); if (b) b.click(); return "opened"; })()`);
await new Promise(r => setTimeout(r, 900));
await evalOn("loc", `(() => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); const samples = []; const t0 = performance.now(); const s = () => { const panel = [...document.querySelectorAll("div")].find(d => { const rr = d.getBoundingClientRect(); return rr.width >= 280 && rr.width <= 296 && rr.height > 700; }); const ov = [...document.querySelectorAll("div")].find(d => (d.getAttribute("class")||"").includes("bg-[rgba(0,0,0,0.8)]")); samples.push(Math.round(performance.now()-t0) + " x=" + (panel ? Math.round(panel.getBoundingClientRect().x) : "gone") + " op=" + (ov ? Number(getComputedStyle(ov).opacity).toFixed(2) : "gone")); if (performance.now() - t0 < 800) requestAnimationFrame(s); else window.__esc = samples; }; s(); return "esc"; })()`);
await new Promise(r => setTimeout(r, 1400));
const esc = await evalOn("loc", `JSON.stringify((window.__esc||[]).filter((v,i) => i % 2 === 0))`);
console.log((esc || []).join("\n"));

// ---------- user dropdown via ref click ----------
console.log("── USER DROPDOWN via ref-click (expect enter 0.15s mid-flight) ──");
run("agent-browser --session loc set viewport 1440 900");
run("agent-browser --session loc open http://127.0.0.1:3200/dashboard");
await new Promise(r => setTimeout(r, 2800));
p = await evalOn("loc", "location.pathname");
if (String(p).includes("login")) {
  run("agent-browser --session loc fill 'input[type=email]' 'sepnetflix2023@outlook.com'");
  run("agent-browser --session loc fill 'input[type=password]' '$Abcd1234'");
  const snap = run("agent-browser --session loc snapshot -i -c");
  const m = snap.match(/button "Sign in" \[ref=(\w+)/);
  if (m) run(`agent-browser --session loc click @${m[1]}`);
  await new Promise(r => setTimeout(r, 4000));
}
const snap2 = run("agent-browser --session loc snapshot -i -c");
const um = snap2.match(/button "sepnetflix2023[^"]*" \[[^\]]*ref=(\w+)/);
if (um) {
  // click and immediately sample in the SAME eval so we catch the mid-flight state
  await evalOn("loc", `(() => { const samples = []; const t0 = performance.now(); const s = () => { const menu = document.querySelector("[role=menu]"); const cs = menu ? getComputedStyle(menu) : null; samples.push(Math.round(performance.now()-t0) + " " + (cs ? cs.animationName + " " + cs.animationDuration + " op=" + cs.opacity + " tf=" + cs.transform.slice(0,24) : "-")); if (performance.now() - t0 < 600) requestAnimationFrame(s); else window.__dd21 = samples; }; s(); return "sampling"; })()`);
  run(`agent-browser --session loc click @${um[1]}`);
  await new Promise(r => setTimeout(r, 1200));
  const dd = await evalOn("loc", `JSON.stringify((window.__dd21||[]).filter((v,i) => i % 4 === 0))`);
  console.log((dd || []).join("\n"));
} else {
  console.log("no user button ref found");
}
console.log("VERIFY-R21B-DONE");
