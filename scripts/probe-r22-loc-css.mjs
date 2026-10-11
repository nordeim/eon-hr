#!/usr/bin/env node
// probe-r22-loc-css.mjs — LOC static scroll-rule enumeration, constructor-
// agnostic (recurses into ANY grouping rule via .cssRules presence).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }

const WALK = `(() => {
  const out = [];
  const seen = new Set();
  const walk = (rules, ctx) => {
    for (const r of rules) {
      if (seen.has(r)) continue; seen.add(r);
      const name = r.constructor && r.constructor.name ? r.constructor.name : "?";
      if (r.selectorText && r.style) {
        for (let i = 0; i < r.style.length; i++) {
          const p = r.style[i];
          if (p === "scroll-behavior" || p.startsWith("scroll-snap") || p.startsWith("scrollbar") || r.selectorText.includes("scrollbar") || p === "overscroll-behavior" || p.startsWith("overscroll") || p.startsWith("scroll-margin") || p.startsWith("scroll-padding") || p.startsWith("scroll-timeline") || p === "animation-timeline") {
            out.push((ctx?ctx+" ":"") + r.selectorText.slice(0,70) + " { " + p + ": " + r.style.getPropertyValue(p).slice(0,26) + " }");
          }
        }
      }
      if (r.cssRules) walk(r.cssRules, (ctx?ctx+" ":"") + name.replace("CSS","").replace("Rule","").slice(0,12));
    }
  };
  for (const s of document.styleSheets) { try { walk(s.cssRules, null); } catch (e) {} }
  return JSON.stringify(out);
})()`;

run("agent-browser --session loc set viewport 1440 900");
run("agent-browser --session loc open http://127.0.0.1:3200/settings");
await new Promise(r => setTimeout(r, 3500));
const out = run(`agent-browser --session loc eval ${JSON.stringify(WALK.split("\n").join(" "))}`);
let rules = [];
try {
  let raw = out.trim();
  try { const once = JSON.parse(raw); if (typeof once === "string") raw = once; } catch {}
  rules = JSON.parse(raw);
} catch { console.log("PARSE-ERR", out.slice(0, 300)); }
console.log(`LOC scroll-special rules (${rules.length}):`);
for (const r of rules) console.log("  " + r);
