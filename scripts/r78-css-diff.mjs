#!/usr/bin/env node
// r78-css-diff.mjs — rule-level classification of the login CSS movement
// (DS1aCkan 902076 -> wkqf_TRn 902111 -> IXVC2MOA 903315 bytes; the
// generations fetched to .tmp-r78/ by the curl step). Splits at rule
// boundaries, diffs the rule sets, sweeps usages of removed names in the
// current entry JS (index-tq_Kql0L.js) + the served login HTML.
import fs from "node:fs";

const dir = "/home/z/my-project/eon-hr/.tmp-r78";
const read = (f) => fs.readFileSync(`${dir}/${f}`, "utf8");
function rules(css) {
  return css.split("}").map(s => s.trim()).filter(Boolean).map(r => r + "}");
}
function ruleName(r) {
  const head = r.split("{")[0].trim();
  const m = head.match(/[.#][A-Za-z0-9_\-[\]!%().:/,#>~ ]+/);
  return (m ? m[0] : head).split(/[,>~ +]/)[0].trim() || r.slice(0, 40);
}

const pairs = [["d41", "mid"], ["mid", "cur"], ["d41", "cur"]];
for (const [a, b] of pairs) {
  const A = rules(read(a + ".css")), B = rules(read(b + ".css"));
  const setB = new Set(B), setA = new Set(A);
  const removed = A.filter(r => !setB.has(r));
  const added = B.filter(r => !setA.has(r));
  console.log(`\n===== ${a}.css (${A.length} rules) -> ${b}.css (${B.length} rules): REMOVED ${removed.length} / ADDED ${added.length} =====`);
  for (const r of removed) console.log("  - " + r.replace(/\s+/g, " ").slice(0, 200));
  for (const r of added) console.log("  + " + r.replace(/\s+/g, " ").slice(0, 200));
  if (a === "d41" && removed.length) {
    const js = fs.existsSync(`${dir}/entry.js`) ? read("entry.js") : "";
    const html = read("login.html");
    console.log("\n  usage sweep (entry JS / login HTML) of the removed names:");
    for (const n of [...new Set(removed.map(ruleName))]) {
      console.log(`    ${n}: entryJS=${js.includes(n.slice(1))} loginHTML=${html.includes(n.slice(1))}`);
    }
  }
}
