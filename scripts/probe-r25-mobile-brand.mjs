#!/usr/bin/env node
// probe-r25-mobile-brand.mjs — the brand-anchored mobile chrome verification
// (round-24 lesson: the button/nav heuristics mis-read REF's div-based
// shell; anchor on the sidebar brand text instead).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

// At 390: measure the TOP STRIP (the element containing the hamburger svg)
const TOPSTRIP = `(() => {
  const menu = document.querySelector('svg.lucide-menu');
  if (!menu) return JSON.stringify({strip:false});
  const btn = menu.closest('button');
  const strip = btn.parentElement.parentElement;
  const r = strip.getBoundingClientRect(); const cs = getComputedStyle(strip);
  const b = btn.getBoundingClientRect();
  return JSON.stringify({strip:true, w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, pos: cs.position, ham: {w: Math.round(b.width), h: Math.round(b.height), x: Math.round(b.x), y: Math.round(b.y)}});
})()`;
// At 800: the sidebar brand position (proves the sidebar is where both apps put it)
const BRAND = `(() => {
  const el = [...document.querySelectorAll('span, div, a')].find(e => e.children.length <= 1 && /^EonHR$/.test(e.textContent.trim()) && e.getBoundingClientRect().width < 120 && e.getBoundingClientRect().width > 30);
  if (!el) return JSON.stringify({brand:false});
  const r = el.getBoundingClientRect();
  return JSON.stringify({brand:true, x: Math.round(r.x), y: Math.round(r.y), visible: r.width > 0});
})()`;

for (const [label, session, base] of [["REF", "ref", "https://eon.base44.app"], ["LOC", "loc", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3200));
  const strip = await evalOn(session, TOPSTRIP);
  run(`agent-browser --session ${session} set viewport 800 600`);
  await new Promise(r => setTimeout(r, 1200));
  const brand = await evalOn(session, BRAND);
  console.log(`${label}: topStrip=${JSON.stringify(strip)} brand@800=${JSON.stringify(brand)}`);
}
