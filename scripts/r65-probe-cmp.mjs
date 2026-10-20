#!/usr/bin/env node
// r65-probe-cmp.mjs — symmetric element-level tuple diff over the probe dump
// (/tmp/r65-probe.log): for each route, the REF-only and LOC-only
// (tag|pad|radius) tuples with their concrete elements (class, text, rect).
import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync(process.argv[2] || "/tmp/r65-probe.log", "utf8"));
for (const { route, ref, loc } of data) {
  if (!Array.isArray(ref) || !Array.isArray(loc)) { console.log(`\n=== ${route} === (bad read: ${JSON.stringify(ref).slice(0,80)} / ${JSON.stringify(loc).slice(0,80)})`); continue; }
  const refSet = new Set(ref.map(e => `${e.tg}|${e.p}|${e.r}`));
  const locSet = new Set(loc.map(e => `${e.tg}|${e.p}|${e.r}`));
  const refOnly = ref.filter(e => !locSet.has(`${e.tg}|${e.p}|${e.r}`));
  const locOnly = loc.filter(e => !refSet.has(`${e.tg}|${e.p}|${e.r}`));
  if (!refOnly.length && !locOnly.length) { console.log(`\n=== ${route} === SYMMETRIC (tuple sets equal)`); continue; }
  console.log(`\n=== ${route} ===`);
  const dump = (label, arr) => {
    console.log(`${label} (${arr.length}):`);
    const seen = new Set();
    for (const e of arr) {
      const k = `${e.tg}|${e.p}|${e.r}`;
      if (seen.has(k)) continue;
      seen.add(k);
      const examples = arr.filter(x => `${x.tg}|${x.p}|${x.r}` === k).slice(0, 4);
      console.log(`  ${k}`);
      for (const x of examples) console.log(`    @(${x.x},${x.y} ${x.w}x${x.h}) cls="${(x.cls || "").slice(0, 78)}" t="${x.t}"`);
    }
  };
  dump("REF-ONLY", refOnly);
  dump("LOC-ONLY", locOnly);
}
