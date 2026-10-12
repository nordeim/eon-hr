#!/usr/bin/env node
// probe-r26-reduced-motion.mjs — session-27 / parity round 26: the reduced-motion
// dimension audit. With `set media reduced-motion` emulated on both sessions,
// measure the animation/transition family on the surfaces where motion lives:
// the sidebar group trigger, a nav leaf, the mobile drawer panel + overlay,
// and the user dropdown content. REF's CSSOM is unreadable (cross-origin) so
// computed DOM census is the ground truth (the r23 lesson).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

// Surface 1: sidebar group trigger + nav leaf transitions (desktop)
const NAVFAM = `(() => {
  const groups = [...document.querySelectorAll('button')].filter(b => b.querySelector('svg.lucide-chevron-down') || (b.getAttribute('data-state') !== null && b.querySelector('svg') && b.textContent.trim().length > 0 && b.closest('nav, aside, [class*=sidebar]')));
  const g = groups[0];
  const leaf = [...document.querySelectorAll('a')].find(a => a.getAttribute('href') && a.querySelector('svg') && a.closest('nav, aside, [class*=sidebar]') && a.getBoundingClientRect().height > 30);
  return JSON.stringify({
    group: g ? { t: g.textContent.trim().slice(0, 12), transition: getComputedStyle(g).transitionDuration + ' ' + getComputedStyle(g).transitionProperty } : null,
    leaf: leaf ? { t: leaf.textContent.trim().slice(0, 12), transition: getComputedStyle(leaf).transitionDuration + ' ' + getComputedStyle(leaf).transitionProperty } : null
  });
})()`;

// Surface 2: mobile drawer panel + overlay (open state)
const DRAWER = `(() => {
  const panel = [...document.querySelectorAll('div')].find(x => x.getBoundingClientRect().width >= 280 && x.getBoundingClientRect().width <= 296 && x.getBoundingClientRect().height >= 700);
  const overlay = [...document.querySelectorAll('div')].find(x => x.getBoundingClientRect().width >= 380 && getComputedStyle(x).position === 'fixed' && parseFloat(getComputedStyle(x).opacity) < 1 && getComputedStyle(x).backgroundColor !== 'rgba(0, 0, 0, 0)');
  return JSON.stringify({
    panel: panel ? { transition: getComputedStyle(panel).transitionDuration + ' ' + getComputedStyle(panel).transitionProperty, animation: getComputedStyle(panel).animationName + ' ' + getComputedStyle(panel).animationDuration } : null,
    overlay: overlay ? { transition: getComputedStyle(overlay).transitionDuration + ' ' + getComputedStyle(overlay).transitionProperty, animation: getComputedStyle(overlay).animationName + ' ' + getComputedStyle(overlay).animationDuration, opacity: getComputedStyle(overlay).opacity } : null
  });
})()`;

// Surface 3: user dropdown content (open state)
const DROPDOWN = `(() => {
  const c = document.querySelector('[role=menu]');
  return JSON.stringify({
    menu: c ? { animation: getComputedStyle(c).animationName + ' ' + getComputedStyle(c).animationDuration, transition: getComputedStyle(c).transitionDuration } : null
  });
})()`;

async function audit(session, base) {
  const out = {};
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3200));
  out.nav = await evalOn(session, NAVFAM);
  // mobile drawer
  run(`agent-browser --session ${session} set viewport 390 844`);
  await new Promise(r => setTimeout(r, 1500));
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const m = snap.match(/- button "Toggle Sidebar" \[[^\]]*ref=(\w+)/);
  if (m) { run(`agent-browser --session ${session} click @${m[1]}`); await new Promise(r => setTimeout(r, 1600)); }
  out.drawer = await evalOn(session, DRAWER);
  run(`agent-browser --session ${session} press Escape`);
  await new Promise(r => setTimeout(r, 700));
  // user dropdown — back to desktop, click the footer user trigger
  run(`agent-browser --session ${session} set viewport 1440 900`);
  await new Promise(r => setTimeout(r, 1000));
  const snap2 = run(`agent-browser --session ${session} snapshot -i -c`);
  const u = snap2.match(/- button "[^"]*(sepnetflix|user)[^"]*" \[[^\]]*ref=(\w+)/i);
  if (u) { run(`agent-browser --session ${session} click @${u[2]}`); await new Promise(r => setTimeout(r, 1200)); }
  out.dropdown = await evalOn(session, DROPDOWN);
  return out;
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const ref = await audit("ref", baseRef);
const loc = await audit("loc", baseLoc);
console.log("REF (reduced-motion):", JSON.stringify(ref, null, 1));
console.log("LOC (reduced-motion):", JSON.stringify(loc, null, 1));
