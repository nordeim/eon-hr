#!/usr/bin/env node
// r79-css-delta.mjs — session 79 / parity round 78: classify the FIFTH
// login CSS movement of the cadence era (index-o5aKXf2B → index-C36NwD0S,
// detected by the r79 deploy-watch opening read; the login pair already
// PNG-proven BYTE-IDENTICAL on this generation — the 69aa4241… baseline).
// Protocol (r77/r78): fetch both generations live from the REF origin
// under /static/ (the old hashed assets remain served — the forensic
// archive), byte-compare, split at rule boundaries, diff the rule sets,
// then sweep the CURRENT entry JS bundle + the served login HTML for
// usages of any removed/added rule name. Also fetches the CURRENT entry
// JS for the chunk-graph size signature, and the previous generation's
// entry (t01Y3EV6) when still served.
import { execSync } from "node:child_process";
import fs from "node:fs";

const repo = "/home/z/my-project/eon-hr";
const scratch = `${repo}/.tmp-r79`;
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }

fs.mkdirSync(scratch, { recursive: true });
const origin = "https://eon.base44.app";

// Generations via CLI args (default: the fifth movement o5aKXf2B -> C36NwD0S).
const OLD = process.argv[2] || "o5aKXf2B";
const CUR = process.argv[3] || "C36NwD0S";

// Fetch the two generations live from the REF origin.
const gens = [["old", `${origin}/static/index-${OLD}.css`], ["cur", `${origin}/static/index-${CUR}.css`]];
for (const [tag, url] of gens) {
  run(`curl -sf --max-time 20 -o ${scratch}/${tag}.css "${url}"`);
  const ok = fs.existsSync(`${scratch}/${tag}.css`);
  const size = ok ? fs.statSync(`${scratch}/${tag}.css`).size : 0;
  console.log(`${tag}: ${url.split("/").pop()} -> ${ok ? size + " bytes" : "NOT SERVED"}`);
}

// Entry JS: the current generation (read live from the login page) + the
// prior generation when still served.
const jsCurName = process.argv[4] || "index-Cyrjqt_z.js";
const jsOldName = process.argv[5] || "index-t01Y3EV6.js";
for (const [tag, name] of [["js-cur", name0(jsCurName)], ["js-old", name0(jsOldName)]]) {
  run(`curl -sf --max-time 30 -o ${scratch}/${tag}.js "${origin}/static/${name}"`);
  const ok = fs.existsSync(`${scratch}/${tag}.js`);
  console.log(`entry ${name}: ${ok ? fs.statSync(`${scratch}/${tag}.js`).size + " bytes" : "NOT SERVED"}`);
}
function name0(n) { return n.startsWith("index-") ? n : "index-" + n + ".js"; }

// The served login HTML for the usage sweep (already fetched if present).
run(`curl -sf --max-time 20 -o ${scratch}/login.html "${origin}/login"`);

// Rule-level diff: old (o5aKXf2B) vs current (C36NwD0S).
function rules(file) {
  const css = fs.readFileSync(file, "utf8");
  return css.split("}").map(s => s.trim()).filter(Boolean).map(r => r + "}");
}
if (fs.existsSync(`${scratch}/old.css`) && fs.existsSync(`${scratch}/cur.css`)) {
  const cur = rules(`${scratch}/cur.css`), old = rules(`${scratch}/old.css`);
  console.log(`\nrule counts: ${OLD} ${old.length} -> ${CUR} ${cur.length}`);
  const curSet = new Set(cur), oldSet = new Set(old);
  const removed = old.filter(r => !curSet.has(r));
  const added = cur.filter(r => !oldSet.has(r));
  console.log(`REMOVED ${removed.length}:`);
  for (const r of removed) console.log("  - " + r.slice(0, 200));
  console.log(`ADDED ${added.length}:`);
  for (const r of added) console.log("  + " + r.slice(0, 200));

  // Usage sweep: do the moved rule NAMES appear in the current entry
  // bundle or the served login HTML? (dead code = zero usages)
  const js = fs.existsSync(`${scratch}/js-cur.js`) ? fs.readFileSync(`${scratch}/js-cur.js`, "utf8") : "";
  const html = fs.existsSync(`${scratch}/login.html`) ? fs.readFileSync(`${scratch}/login.html`, "utf8") : "";
  const moved = [...new Set([...removed, ...added].map(r => {
    const head = r.split("{")[0].trim();
    const m = head.match(/[.#][A-Za-z0-9_\-[\]!%().:/,#>~ ]+/);
    return (m ? m[0] : head).split(/[,>~ +]/)[0].trim() || r.slice(0, 40);
  }))];
  console.log("\nusage sweep of the moved rule names (current entry JS + login HTML):");
  for (const n of moved) {
    const inJs = js.includes(n.slice(1));
    const inHtml = html.includes(n.slice(1));
    console.log(`  ${n}: entryJS=${inJs} loginHTML=${inHtml}`);
  }
} else {
  console.log("\ncannot diff — one or both generations unavailable");
}
console.log("\nscratch dir:", scratch);
