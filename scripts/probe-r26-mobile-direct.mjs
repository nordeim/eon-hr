#!/usr/bin/env node
// probe-r26-mobile-direct.mjs — session-27 / parity round 26: the direct
// hamburger/top-strip measurement (the r24/r25 probe artifact bypass — REF's
// hamburger carries its accessible name as visually-hidden TEXT, no aria-label,
// no lucide-menu svg; REF's sidebar is div-based). Measures: the top strip
// (transparent 342×40 @ 24,16), the hamburger button (28×28 @ 24,22), and the
// 800px sidebar brand H2 (x=76 y=25 18px/700).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const HAMBURGER = `(() => {
  const btn = [...document.querySelectorAll('button')].find(b => (b.textContent || '').includes('Toggle Sidebar') || (b.getAttribute('aria-label') || '') === 'Toggle Sidebar');
  if (!btn) return JSON.stringify({found:false});
  const r = btn.getBoundingClientRect(); const cs = getComputedStyle(btn);
  let strip = btn.parentElement; let best = null;
  for (let el = btn.parentElement; el && el !== document.body; el = el.parentElement) {
    const rr = el.getBoundingClientRect();
    if (rr.width > 300 && rr.height <= 60) { best = { w: Math.round(rr.width), h: Math.round(rr.height), x: Math.round(rr.x), y: Math.round(rr.y), bg: getComputedStyle(el).backgroundColor }; break; }
  }
  return JSON.stringify({found:true, btn:{x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height)}, strip: best});
})()`;

const BRAND = `(() => {
  const h2 = [...document.querySelectorAll('h2')].find(h => (h.textContent || '').trim().length > 0 && h.getBoundingClientRect().y < 60);
  if (!h2) return JSON.stringify({found:false});
  const r = h2.getBoundingClientRect(); const cs = getComputedStyle(h2);
  return JSON.stringify({found:true, t: h2.textContent.trim().slice(0,12), x: Math.round(r.x), y: Math.round(r.y), fs: cs.fontSize, fw: cs.fontWeight});
})()`;

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
async function measure(session, base) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3200));
  const ham = await evalOn(session, HAMBURGER);
  run(`agent-browser --session ${session} set viewport 800 900`);
  await new Promise(r => setTimeout(r, 1500));
  const brand = await evalOn(session, BRAND);
  return { ham, brand };
}
const ref = await measure("ref", baseRef);
const loc = await measure("loc", baseLoc);
console.log("REF:", JSON.stringify(ref));
console.log("LOC:", JSON.stringify(loc));
const hs = JSON.stringify(ref.ham) === JSON.stringify(loc.ham);
const bs = ref.brand.found && loc.brand.found && ref.brand.x === loc.brand.x && ref.brand.y === loc.brand.y && ref.brand.fs === loc.brand.fs && ref.brand.fw === loc.brand.fw;
console.log(`\nHAMBURGER+STRIP: ${hs ? "MATCH" : "**DIFF**"} (expect strip 342x40 @(24,16), btn 28x28 @(24,22))`);
console.log(`800px BRAND H2:  ${bs ? "MATCH" : "**DIFF**"} (expect x=76 y=25 18px/700)`);
