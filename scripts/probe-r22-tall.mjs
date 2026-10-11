#!/usr/bin/env node
// probe-r22-tall.mjs — session-23 / parity round 22: the scroll dimension.
// Tall-page DOM census + empirical sticky-pin verification during real scroll:
// - /advancedanalytics @1440x900 (tall chart stack) — scroll census
// - mobile @390x844: scroll to y=500, verify top bar pinned + kicker scrolled
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    let raw = out.trim();
    try { const once = JSON.parse(raw); if (typeof once === "string") raw = once; } catch {}
    return JSON.parse(raw);
  } catch { return { error: out.slice(0, 300) }; }
}

// ---- 1. tall page census: every scrollable or sticky element ----
const CENSUS = `(() => {
  const out = [];
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    const stick = cs.position === "sticky" || cs.position === "fixed";
    const canScroll = (cs.overflowY === "auto" || cs.overflowY === "scroll") || (cs.overflowX === "auto" || cs.overflowX === "scroll");
    if (!stick && !canScroll) continue;
    const r = el.getBoundingClientRect();
    const scrolls = el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2;
    out.push({ tag: el.tagName + "." + (el.getAttribute("class")||"").split(" ").slice(0,2).join(".").slice(0,50), pos: cs.position, oy: cs.overflowY, sbw: cs.scrollbarWidth !== "auto" ? cs.scrollbarWidth : "", sh: el.scrollHeight, ch: el.clientHeight, scr: scrolls ? "SCROLLS" : "", rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)].join(",") });
    if (out.length >= 14) break;
  }
  return JSON.stringify({ docH: document.documentElement.scrollHeight, rows: out });
})()`;

for (const [tag, session, base] of [
  ["REF", "ref", "https://eon.base44.app"],
  ["LOC", "loc", "http://127.0.0.1:3200"],
]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/advancedanalytics`);
  await new Promise(r => setTimeout(r, 4500));
  const res = await evalOn(session, CENSUS);
  console.log(`===== ${tag} /advancedanalytics @1440x900 =====`);
  if (res.error) { console.log("ERR", res.error); continue; }
  console.log(`docH=${res.docH}`);
  for (const r of res.rows) console.log(`  ${r.tag.padEnd(52)} pos=${r.pos} oy=${r.oy} ${r.sbw} sh=${r.sh}/${r.ch} ${r.scr} rect=[${r.rect}]`);
}

// ---- 2. empirical mobile scroll: sticky pin + kicker scroll-away ----
const SCROLLTEST = `(() => {
  window.scrollTo(0, 500);
  return "scrolled";
})()`;
const READSTICKY = `(() => {
  const bar = [...document.querySelectorAll("header,div")].find(e => { const r = e.getBoundingClientRect(); return r.y >= -1 && r.y <= 2 && r.height >= 70 && r.height <= 76 && r.width > 300; });
  const h1 = [...document.querySelectorAll("h1")].find(h => h.offsetParent !== null);
  return JSON.stringify({ scrollY: Math.round(scrollY), bar: bar ? { y: Math.round(bar.getBoundingClientRect().y), h: Math.round(bar.getBoundingClientRect().height), pos: getComputedStyle(bar).position } : null, h1: h1 ? { y: Math.round(h1.getBoundingClientRect().y) } : null, docH: document.documentElement.scrollHeight });
})()`;

for (const [tag, session, base] of [
  ["REF", "ref", "https://eon.base44.app"],
  ["LOC", "loc", "http://127.0.0.1:3200"],
]) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/employees`);
  await new Promise(r => setTimeout(r, 4000));
  await evalOn(session, SCROLLTEST);
  await new Promise(r => setTimeout(r, 700));
  const res = await evalOn(session, READSTICKY);
  console.log(`===== ${tag} /employees @390x844 scrolled to 500 =====`);
  console.log(JSON.stringify(res));
}
