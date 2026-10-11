#!/usr/bin/env node
// probe-r21-locate.mjs — locate the REF elements carrying specific transition
// classes and describe their context (text, geometry, parent chain).
// Usage: node scripts/probe-r21-locate.mjs <session> <base> <label> <page> <match-re>
import { execSync } from "node:child_process";

const session = process.argv[2] || "ref";
const base = process.argv[3] || "https://eon.base44.app";
const label = process.argv[4] || session;
const page = process.argv[5] || "/dashboard";
const matchRe = process.argv[6] || "transition-";

function run(cmd) {
  try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); }
  catch (e) { return "ERR:" + String(e).slice(0, 300); }
}

const EXPR = `
(() => {
  const out = [];
  for (const el of document.querySelectorAll("*")) {
    const cls = el.getAttribute("class") || "";
    if (!cls.includes("${matchRe}")) continue;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    let chain = [];
    let p = el.parentElement;
    for (let i = 0; i < 3 && p; i++) { chain.push(p.tagName.toLowerCase() + (p.getAttribute("class")||"").split(" ").slice(0,2).join(".")); p = p.parentElement; }
    out.push({
      tag: el.tagName.toLowerCase(),
      txt: (el.textContent || "").trim().slice(0, 40),
      cls: cls.split(" ").filter(c => c.includes("transition") || c.includes("duration") || c.includes("ease")).join(" "),
      rect: Math.round(r.x) + "," + Math.round(r.y) + " " + Math.round(r.width) + "x" + Math.round(r.height),
      pos: cs.position,
      tr: cs.transitionDuration + " " + cs.transitionTimingFunction.slice(0, 20),
      chain: chain.join(" < ")
    });
  }
  return JSON.stringify(out.slice(0, 25));
})()
`;

run(`agent-browser --session ${session} open "${base}${page}"`);
await new Promise(r => setTimeout(r, 3500));
const out = run(`agent-browser --session ${session} eval ${JSON.stringify(EXPR.split("\n").join(" "))}`);
try {
  let raw = out.trim();
  try { const once = JSON.parse(raw); if (typeof once === "string") raw = once; } catch {}
  const data = JSON.parse(raw);
  console.log(`===== ${label} ${page}: elements matching "${matchRe}" =====`);
  data.forEach((d, i) => {
    console.log(`  ${i + 1}. ${d.tag} "${d.txt}" @${d.rect} pos=${d.pos}`);
    console.log(`     cls: ${d.cls}`);
    console.log(`     tr: ${d.tr}`);
    console.log(`     parents: ${d.chain}`);
  });
} catch (e) {
  console.log("PARSE-FAIL: " + out.slice(0, 500));
}
