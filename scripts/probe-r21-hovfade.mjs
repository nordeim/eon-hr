#!/usr/bin/env node
// probe-r21-hovfade.mjs — session-22 / parity round 21: sample the group
// button's hover color mid-flight (requestAnimationFrame sampling during the
// settle) to measure the transition DURATION empirically on both apps.
// Click-safe: move away before mouse up; no mouse down at all here.
import { execSync } from "node:child_process";

function run(cmd) {
  try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); }
  catch (e) { return "ERR:" + String(e).slice(0, 200); }
}

async function evalOn(session, expr) {
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    let raw = out.trim();
    try { const once = JSON.parse(raw); if (typeof once === "string") raw = once; } catch {}
    return JSON.parse(raw);
  } catch { return { error: out.slice(0, 200) }; }
}

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
    else window.__hov = samples;
  };
  s();
  return "sampling";
})()
`;

for (const session of ["ref", "loc"]) {
  const pos = await evalOn(session, `(() => { const g = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "Recruitment"); if (!g) return JSON.stringify(null); const r = g.getBoundingClientRect(); return JSON.stringify({ x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) }); })()`);
  if (!pos || !pos.x) { console.log(`${session}: no group found`); continue; }
  // start sampling, then hover
  run(`agent-browser --session ${session} eval ${JSON.stringify(SAMPLER.split("\n").join(" "))}`);
  run(`agent-browser --session ${session} mouse move ${pos.x} ${pos.y}`);
  await new Promise(r => setTimeout(r, 1100));
  const frames = await evalOn(session, `JSON.stringify((window.__hov||[]).filter((v,i) => i % 3 === 0))`);
  console.log(`===== ${session} group hover fade (every 3rd frame) =====`);
  console.log((frames || []).join("\n"));
  run(`agent-browser --session ${session} mouse move 5 5`);
}
