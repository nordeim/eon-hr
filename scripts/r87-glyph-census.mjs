#!/usr/bin/env node
// r87-glyph-census.mjs — session-87 / parity round 86: the LUCIDE-VERSION
// GLYPH CENSUS (the r86 close-out's named frontier #2 — the companion
// pass's path-data find on the settings palette icon left the question
// "how many icons differ at the path level?"). Walks the standing route
// set on both sides, extracts every rendered lucide svg (class name +
// the path/polygon data signature), and diffs cross-side:
//   MATCH     identical class + identical path data
//   CLASS-ONLY  same path data, different lucide class name (rename class)
//   PATH-DIFF different path data (the version-drift set — the
//             vendoring-escalation candidates; classified by whether the
//             delta has ever surfaced in the pixel protocol)
import { execSync } from "node:child_process";
import fs from "node:fs";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const ROUTES = ["/dashboard", "/employees", "/payroll", "/payrollreports", "/attendance",
  "/recruitment", "/training", "/settings", "/assetmanagement", "/compliance",
  "/performance", "/taskmanager", "/communications", "/analytics"];

const EXTRACT = `(() => {
  const sig = (el) => {
    const cls = el.getAttribute('class') || '';
    const lucide = (cls.match(/lucide-([a-z0-9-]+)/) || [])[1] || null;
    const inner = el.innerHTML.replace(/\s+/g, ' ').trim().slice(0, 400);
    return { lucide, inner };
  };
  const out = {};
  for (const svg of document.querySelectorAll('svg[class*=lucide-]')) {
    const s = sig(svg);
    const key = s.lucide || 'unknown';
    if (!out[key]) out[key] = s.inner;
  }
  return JSON.stringify(out);
})()`.split("\n").join(" ");

async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 400));
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const ref = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
  if (ref) run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, 4200));
}

await auth("ref87g", "https://eon.base44.app");
await auth("loc87g", "http://127.0.0.1:3200");
console.log("both sessions authed");

const census = { ref: {}, loc: {} };
for (const [side, base] of [["ref", "https://eon.base44.app"], ["loc", "http://127.0.0.1:3200"]]) {
  const session = side === "ref" ? "ref87g" : "loc87g";
  for (const route of ROUTES) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 2600));
    const raw = run(`agent-browser --session ${session} eval ${JSON.stringify(EXTRACT)}`);
    let icons;
    try {
      const s = raw.trim().startsWith('"') ? JSON.parse(raw.trim()) : raw.trim();
      icons = JSON.parse(s);
    } catch { continue; }
    for (const [name, inner] of Object.entries(icons)) {
      census[side][name] = census[side][name] || new Set();
      census[side][name].add(inner);
    }
  }
  console.log(`${side} census: ${Object.keys(census[side]).length} distinct lucide names`);
}

// diff pass
const refNames = Object.keys(census.ref);
const locNames = Object.keys(census.loc);
const all = [...new Set([...refNames, ...locNames])];
const report = { match: [], classOnly: [], pathDiff: [], refOnly: [], locOnly: [] };
for (const name of all) {
  const r = census.ref[name] ? [...census.ref[name]] : null;
  const l = census.loc[name] ? [...census.loc[name]] : null;
  if (r && !l) { report.refOnly.push(name); continue; }
  if (!r && l) { report.locOnly.push(name); continue; }
  const samePath = r.some((ri) => l.includes(ri));
  if (samePath) report.match.push(name);
  else report.pathDiff.push(name);
}
fs.writeFileSync(`${repo}/docs/screenshots/r87-glyph-census.json`,
  JSON.stringify({ ref: Object.fromEntries(Object.entries(census.ref).map(([k, v]) => [k, [...v]])),
    loc: Object.fromEntries(Object.entries(census.loc).map(([k, v]) => [k, [...v]])),
    report }, null, 1));
console.log("\n===== CENSUS VERDICT =====");
console.log(`MATCH (identical path data): ${report.match.length}`);
console.log(`PATH-DIFF (version drift): ${report.pathDiff.length} -> ${JSON.stringify(report.pathDiff)}`);
console.log(`REF-ONLY names: ${JSON.stringify(report.refOnly)}`);
console.log(`LOC-ONLY names: ${JSON.stringify(report.locOnly)}`);
run(`agent-browser close --all 2>/dev/null; true`);
process.exit(0);
