#!/usr/bin/env node
// probe-r21-transcss.mjs — session-22 / parity round 21 (transitions/animations).
// Static enumeration: collect every transition-* / animation / @keyframes rule
// from a page's stylesheets (both same-origin and inline), grouped by selector.
// Usage: node scripts/probe-r21-transcss.mjs <session> <label>
import { execSync } from "node:child_process";

const session = process.argv[2] || "ref";
const label = process.argv[3] || session;

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 200);
  }
}

// Browser JS: walk document.styleSheets; for same-origin sheets read rules;
// for cross-origin sheets fetch() the href. Collect transition/animation info.
const EXPR = `
(async () => {
  const out = { links: [], trans: [], anims: [], keyframes: [] };
  const sheets = [...document.styleSheets];
  const ruleLists = [];
  for (const sh of sheets) {
    let rules = null;
    try { rules = sh.cssRules; } catch { rules = null; }
    if (!rules && sh.href) {
      try {
        const txt = await (await fetch(sh.href)).text();
        const tmp = document.createElement("style");
        tmp.textContent = txt;
        document.head.appendChild(tmp);
        ruleLists.push([...tmp.sheet.cssRules]);
        out.links.push(sh.href.split("/").pop());
        tmp.remove();
      } catch (e) { out.links.push("FETCH-FAIL " + sh.href.split("/").pop()); }
    } else if (rules) {
      ruleLists.push([...rules]);
    }
  }
  const walk = (rules) => {
    for (const r of rules) {
      if (!r) continue;
      if (r.type === 1 && r.style && (r.style.transitionProperty !== "none" || r.style.animationName !== "none" || r.style.transitionDuration !== "0s")) {
        const tr = r.style.transitionProperty + " " + r.style.transitionDuration + " " + r.style.transitionTimingFunction + " " + r.style.transitionDelay;
        out.trans.push({ sel: r.selectorText.slice(0, 110), tr: tr.slice(0, 150), an: (r.style.animationName !== "none" ? r.style.animationName + " " + r.style.animationDuration : "") });
      }
      if (r.type === 1 && r.style && r.style.animationName && r.style.animationName !== "none") {
        out.anims.push(r.selectorText.slice(0, 110) + " => " + r.style.animationName);
      }
      if (r.type === 7) out.keyframes.push(r.name);
      if (r.cssRules) walk([...r.cssRules]);
    }
  };
  for (const rl of ruleLists) walk(rl);
  return JSON.stringify(out);
})()
`;

const out = run(`agent-browser --session ${session} eval ${JSON.stringify(EXPR.split("\n").join(" "))}`);
console.log(`===== ${label} transitions/animations =====`);
try {
  let raw = out.trim();
  try { const once = JSON.parse(raw); if (typeof once === "string") raw = once; } catch { /* not json-quoted */ }
  const data = JSON.parse(raw);
  const real = (data.trans || []).filter(t => t.tr && t.tr.replace(/ /g, "").length > 3);
  console.log(`fetched sheets: ${(data.links || []).join(", ") || "(none cross-origin)"}`);
  console.log(`\n-- keyframes (${data.keyframes.length}): ${data.keyframes.join(", ")}`);
  console.log(`\n-- animation rules (${data.anims.length}):`);
  (data.anims || []).forEach(a => console.log("  " + a));
  console.log(`\n-- transition rules (${real.length}):`);
  real.forEach(t => console.log("  " + t.sel + " { " + t.tr + (t.an ? " | anim: " + t.an : "") + " }"));
} catch (e) {
  console.log("PARSE-FAIL: " + out.slice(0, 600));
}
