#!/usr/bin/env node
// probe-r22-scrollcss.mjs — session-23 / parity round 22: the scroll dimension.
// Stage 1: static CSSOM enumeration (split into compact evals — the documented
// long-eval failure). Usage: node scripts/probe-r22-scrollcss.mjs
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

// part 1: walk all sheets, collect matching rules into a window global
const WALK = `(() => {
  const out = [];
  const walk = (rules, media) => {
    for (const r of rules) {
      if (r.type === 4) { walk(r.cssRules, "@" + (r.conditionText||"").slice(0,34)); continue; }
      if (!r.selectorText || !r.style) continue;
      for (let i = 0; i < r.style.length; i++) {
        const p = r.style[i];
        const hit = (p === "position" && r.style.getPropertyValue("position") === "sticky")
          || p === "overflow" || p === "overflow-x" || p === "overflow-y"
          || p.startsWith("scrollbar") || r.selectorText.includes("scrollbar")
          || p === "overscroll-behavior" || p.startsWith("overscroll")
          || p === "scroll-behavior" || p.startsWith("scroll-snap")
          || p.startsWith("scroll-margin") || p.startsWith("scroll-padding")
          || p === "animation-timeline";
        if (hit) { const v = r.style.getPropertyValue(p); if (v !== "visible") out.push((media?media+" ":"") + r.selectorText.slice(0,72) + " { " + p + ": " + v.slice(0,30) + " }"); }
      }
    }
  };
  for (const s of document.styleSheets) { try { walk(s.cssRules, null); } catch (e) {} }
  window.__scrollRules = out;
  return out.length;
})()`;

const READ = `JSON.stringify(window.__scrollRules || [])`;

for (const [tag, session, base, route] of [
  ["REF", "ref", "https://eon.base44.app", "/settings"],
  ["LOC", "loc", "http://127.0.0.1:3200", "/settings"],
]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}${route}`);
  await new Promise(r => setTimeout(r, 3500));
  const n = await evalOn(session, WALK);
  const rules = await evalOn(session, READ);
  console.log(`===== ${tag} ${route} (${n} rules) =====`);
  for (const r of (Array.isArray(rules) ? rules : [])) console.log("  " + r);
  if (rules && rules.error) console.log("  ERR", rules.error);
}
