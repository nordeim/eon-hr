#!/usr/bin/env node
// probe-r21-hovfade2.mjs — re-run the group hover-fade sampling on LOC with
// the r19/r20 polyfill v2 injected (unwraps @media (hover: hover) in place).
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
  } catch { return { error: out.slice(0, 200) }; }
}

// reuse polyfill v2 from verify-r20.mjs
const v20 = readFileSync("scripts/verify-r20.mjs", "utf8");
const POLYFILL = v20.match(/const POLYFILL = `([\s\S]*?)`;/)[1];

const SAMPLER = `
(() => {
  const g = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "Recruitment");
  if (!g) return "no-group";
  const samples = [];
  const t0 = performance.now();
  const s = () => {
    const cs = getComputedStyle(g);
    samples.push(Math.round(performance.now() - t0) + " " + cs.backgroundColor + " " + cs.color);
    if (performance.now() - t0 < 700) requestAnimationFrame(s);
    else window.__hov2 = samples;
  };
  s();
  return "sampling";
})()
`;

run("agent-browser --session loc set viewport 1440 900");
run("agent-browser --session loc open http://127.0.0.1:3200/dashboard");
await new Promise(r => setTimeout(r, 3000));
// auth guard
const p = await evalOn("loc", "location.pathname");
if (String(p).includes("login")) {
  run("agent-browser --session loc fill 'input[type=email]' 'sepnetflix2023@outlook.com'");
  run("agent-browser --session loc fill 'input[type=password]' '$Abcd1234'");
  const snap = run("agent-browser --session loc snapshot -i -c");
  const m = snap.match(/button "Sign in" \[ref=(\w+)/);
  if (m) run(`agent-browser --session loc click @${m[1]}`);
  await new Promise(r => setTimeout(r, 4000));
}
const poly = await evalOn("loc", POLYFILL, 2500);
console.log("polyfill:", JSON.stringify(poly));
const pos = await evalOn("loc", `(() => { const g = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "Recruitment"); if (!g) return JSON.stringify(null); const r = g.getBoundingClientRect(); return JSON.stringify({ x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) }); })()`);
console.log("group pos:", JSON.stringify(pos));
if (pos && pos.x) {
  run(`agent-browser --session loc eval ${JSON.stringify(SAMPLER.split("\n").join(" "))}`);
  run(`agent-browser --session loc mouse move ${pos.x} ${pos.y}`);
  await new Promise(r => setTimeout(r, 1100));
  const frames = await evalOn("loc", `JSON.stringify((window.__hov2||[]).filter((v,i) => i % 3 === 0))`);
  console.log("===== LOC (polyfilled) group hover fade =====");
  console.log((frames || []).join("\n"));
  run("agent-browser --session loc mouse move 5 5");
}
