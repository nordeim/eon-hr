#!/usr/bin/env node
// probe-r21-dom.mjs — session-22 / parity round 21: which elements carry
// transition/animation classes in the DOM? classList-level audit on both apps.
// Usage: node scripts/probe-r21-dom.mjs <session> <base> <label> [page]
import { execSync } from "node:child_process";

const session = process.argv[2] || "ref";
const base = process.argv[3] || "https://eon.base44.app";
const label = process.argv[4] || session;
const page = process.argv[5] || "/dashboard";

function run(cmd) {
  try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); }
  catch (e) { return "ERR:" + String(e).slice(0, 200); }
}

const EXPR = `
(() => {
  const res = [];
  const RE = /(animate|transition|duration-|ease-|base44|badge-spin|fade|slideIn|scale-in)/;
  for (const el of document.querySelectorAll("*")) {
    const cls = (el.getAttribute("class") || "");
    if (!RE.test(cls)) continue;
    const hits = cls.split(" ").filter(c => RE.test(c));
    const desc = el.tagName.toLowerCase() + "[" + hits.join(" ") + "]";
    const existing = res.find(r => r.k === desc);
    if (existing) existing.n++;
    else {
      const cs = getComputedStyle(el);
      res.push({ k: desc, n: 1,
        tr: (cs.transitionDuration !== "0s" ? cs.transitionDuration + "/" + cs.transitionTimingFunction.slice(0,24) : "-"),
        an: (cs.animationName !== "none" ? cs.animationName + " " + cs.animationDuration : "-") });
    }
  }
  return JSON.stringify(res.slice(0, 60));
})()
`;

run(`agent-browser --session ${session} open "${base}${page}"`);
await new Promise(r => setTimeout(r, 3500));
const out = run(`agent-browser --session ${session} eval ${JSON.stringify(EXPR.split("\n").join(" "))}`);
try {
  let raw = out.trim();
  try { const once = JSON.parse(raw); if (typeof once === "string") raw = once; } catch {}
  const data = JSON.parse(raw);
  console.log(`===== ${label} ${page}: elements carrying transition/animation classes =====`);
  data.forEach(d => console.log(`  ${String(d.n).padStart(3)}x ${d.k.padEnd(72)} tr=${d.tr} an=${d.an}`));
  console.log(`total groups: ${data.length}`);
} catch (e) {
  console.log("PARSE-FAIL: " + out.slice(0, 500));
}
