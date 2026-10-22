#!/usr/bin/env node
// r80-css-usage-sweep.mjs — session 80 / parity round 79: the PRECISE
// full-name usage sweep for a CSS movement's added/removed utilities
// (the r78 lesson — the coarse truncated-name sweep is too broad: ".sm",
// ".align-", ".dark", "@media" all false-positive). For each moved
// utility, checks the RAW class form and the escaped CSS form plus
// targeted substring probes against the CURRENT entry JS bundle and the
// served login HTML (re-fetched live). Zero usages everywhere = the
// utility is DEAD on the login surface → design-system staging.
// Usage: node scripts/r80-css-usage-sweep.mjs <entryJsName> [names...]
//   (defaults to the seventh movement's set + the index-BSFaMTna entry)
import { execSync } from "node:child_process";
import fs from "node:fs";

const repo = "/home/z/my-project/eon-hr";
const scratch = `${repo}/.tmp-r80`;
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
fs.mkdirSync(scratch, { recursive: true });
const origin = "https://eon.base44.app";

const entryName = process.argv[2] || "index-BSFaMTna.js";
const DEFAULT_NAMES = [
  "me-1",
  "max-w-[1312px]",
  "align-[-0.125em]",
  "mix-blend-color",
  "transition-[left,top,transform]",
  "transition-[opacity,box-shadow]",
  "supports-[align-items:safe_flex-end]",
  "dark:bg-red-600",
  "motion-reduce:[*]:!translate-x-0",
  "sm:right-3", // the removed utility
];
const names = process.argv.length > 3 ? process.argv.slice(3) : DEFAULT_NAMES;

// Fetch the current entry JS + the served login HTML live.
run(`curl -sf --max-time 30 -o ${scratch}/entry.js "${origin}/static/${entryName}"`);
run(`curl -sf --max-time 20 -o ${scratch}/login.html "${origin}/login"`);
const js = fs.existsSync(`${scratch}/entry.js`) ? fs.readFileSync(`${scratch}/entry.js`, "utf8") : "";
const html = fs.existsSync(`${scratch}/login.html`) ? fs.readFileSync(`${scratch}/login.html`, "utf8") : "";
console.log(`entry ${entryName}: ${js.length} bytes; login.html: ${html.length} bytes\n`);

// The escaped-CSS form of a utility name (what appears in the stylesheet).
const esc = (n) => n.replace(/:/g, "\\:").replace(/[/\[\]().,!*&]/g, (c) => "\\" + c);

let anyUsage = false;
for (const n of names) {
  const probes = [
    ["raw", n],
    ["escaped", esc(n)],
    // substring probes — catch partial/prefixed usages (e.g. "translate-x-0"
    // under a different variant chain, "bg-red-600" under another variant)
    ...(/\[/.test(n) ? [] : []),
  ];
  const subs = [];
  if (n.includes("translate-x-0")) subs.push("translate-x-0");
  if (n.includes("bg-red-600")) subs.push("bg-red-600");
  if (n.includes("right-3")) subs.push("right-3");
  if (n.includes("1312px")) subs.push("1312px");
  if (n.includes("me-1") && n !== "me-1") subs.push("me-1");
  const results = [];
  for (const [tag, probe] of probes) {
    const inJs = js.includes(probe);
    const inHtml = html.includes(probe);
    if (inJs || inHtml) anyUsage = true;
    results.push(`${tag}: entryJS=${inJs} loginHTML=${inHtml}`);
  }
  for (const s of [...new Set(subs)]) {
    const inJs = js.includes(s);
    const inHtml = html.includes(s);
    if (inJs || inHtml) anyUsage = true;
    results.push(`sub[${s}]: entryJS=${inJs} loginHTML=${inHtml}`);
  }
  console.log(`  ${n}\n    ${results.join("\n    ")}`);
}
console.log(anyUsage
  ? "\nVERDICT: LIVE USAGE FOUND — the movement touches rendered surfaces; audit further"
  : "\nVERDICT: ZERO USAGES — every moved utility is DEAD on the login surface (design-system staging)");
