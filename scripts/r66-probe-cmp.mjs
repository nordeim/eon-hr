#!/usr/bin/env node
// r66-probe-cmp.mjs — the symmetric element-level diff of the probe dumps:
// for each route, list REF-only and LOC-only (m,g,tg) tuples with their
// class/text/rect attribution — the verdict instrument (set equality is
// the alarm; per-element attribution is the verdict — the r65 lesson).
// Usage: node scripts/r66-probe-cmp.mjs /tmp/r66-probe-b1.log
import { readFileSync } from "node:fs";
const files = process.argv.slice(2);
const data = [];
for (const f of files) data.push(...JSON.parse(readFileSync(f, "utf8")));
for (const { route, ref, loc } of data) {
  if (!Array.isArray(ref) || !Array.isArray(loc)) { console.log(`\n=== ${route} === (probe read failed)`); continue; }
  const key = x => JSON.stringify([x.tg, x.m, x.g]);
  const rk = new Set(ref.map(key));
  const lk = new Set(loc.map(key));
  const ro = ref.filter(x => !lk.has(key(x)));
  const lo = loc.filter(x => !rk.has(key(x)));
  if (!ro.length && !lo.length) continue;
  console.log(`\n=== ${route} ===`);
  const show = (arr, s) => {
    const seen = new Set();
    for (const x of arr) {
      const k = key(x);
      if (seen.has(k)) continue;
      seen.add(k);
      console.log(`  ${s} ${x.tg} m=[${x.m}] g=[${x.g}] @${x.x},${x.y} ${x.w}x${x.h} cls=[${x.cls}] "${x.t}"`);
    }
  };
  show(ro, "REF>");
  show(lo, "LOC>");
}
