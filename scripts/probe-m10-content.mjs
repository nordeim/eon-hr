#!/usr/bin/env node
// probe-m10-content.mjs — deep content diff: visible text nodes + geometry in main (base64 transport)
// Usage: node scripts/probe-m10-content.mjs <base_ref> <base_loc> <route>
import { execSync } from "node:child_process";

const [, , baseRef, baseLoc, route] = process.argv;

const PROBE = `(() => {
  const main = document.querySelector("main");
  if (!main) return JSON.stringify({ error: "no main" });
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  const items = [];
  while (walker.nextNode()) {
    const n = walker.currentNode;
    const t = (n.textContent || "").trim();
    if (!t) continue;
    const el = n.parentElement;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    items.push({ t: t.slice(0, 40), y: Math.round(r.y), x: Math.round(r.x), fs: cs.fontSize, fw: cs.fontWeight, c: cs.color });
  }
  const seen = new Set();
  const out = items.filter(i => { const k = i.t + "@" + i.y; if (seen.has(k)) return false; seen.add(k); return true; });
  return JSON.stringify(out.slice(0, 90));
})()`;

const B64 = Buffer.from(PROBE).toString("base64");
const CMD = `atob(${JSON.stringify(B64)}).then ? 0 : 0`; // noop

function run(session, base) {
  try {
    execSync(`agent-browser --session ${session} open "${base}${route}"`, { stdio: "pipe", timeout: 30000 });
  } catch { /* nav */ }
  return new Promise(r => setTimeout(r, 1500)).then(() => {
    try {
      const out = execSync(
        `agent-browser --session ${session} eval "eval(atob('${B64}'))"`,
        { stdio: "pipe", timeout: 30000, maxBuffer: 20 * 1024 * 1024 }
      );
      const raw = out.toString().trim();
      return JSON.parse(JSON.parse(raw));
    } catch (e) { return [{ t: "PROBE_ERROR: " + String(e).slice(0, 80) }]; }
  });
}

const [ref, loc] = await Promise.all([run("ref", baseRef), run("loc", baseLoc)]);

const diffs = [];
for (const r of ref) {
  const match = loc.find(l => l.t === r.t && Math.abs(l.y - r.y) <= 6 && l.fs === r.fs);
  if (!match) {
    const near = loc.find(l => l.t === r.t);
    diffs.push(`REF-ONLY "${r.t}" y=${r.y} fs=${r.fs}${near ? ` (loc: y=${near.y} fs=${near.fs})` : " (MISSING in loc)"}`);
  }
}
for (const l of loc) {
  const match = ref.find(r => r.t === l.t && Math.abs(r.y - l.y) <= 6 && r.fs === l.fs);
  if (!match) {
    const near = ref.find(r => r.t === l.t);
    diffs.push(`LOC-ONLY "${l.t}" y=${l.y} fs=${l.fs}${near ? ` (ref: y=${near.y} fs=${near.fs})` : " (MISSING in ref)"}`);
  }
}
console.log(`### ${route}: ref=${ref.length} loc=${loc.length} text nodes; ${diffs.length} diffs`);
if (diffs.length) diffs.slice(0, 24).forEach(d => console.log("  " + d));
