#!/usr/bin/env node
// r66-analyze.mjs — parse a census dump and count REF-only / clone-only
// tuple frequencies across routes (the family-frequency view).
// Usage: node scripts/r66-analyze.mjs /tmp/r66-b1.log
import { readFileSync } from "node:fs";
const raw = readFileSync(process.argv[2], "utf8");
const blocks = raw.split(/^--- (.+) ---$/m).filter(Boolean);
const refOnly = {}, locOnly = {};
let n = 0;
for (let i = 0; i + 1 < blocks.length; i += 2) {
  const route = blocks[i].trim();
  const body = blocks[i + 1];
  const refM = body.match(/ref: (\[.*?\])\nloc: (\[.*?\])(?:\n|$)/s) || body.match(/ref: (\[.*\])\nloc: (\[.*\])/s);
  if (!refM) continue;
  n++;
  let ref, loc;
  try { ref = JSON.parse(refM[1]); loc = JSON.parse(refM[2]); } catch { continue; }
  const rk = new Set(ref.map(x => JSON.stringify(x)));
  const lk = new Set(loc.map(x => JSON.stringify(x)));
  for (const k of rk) if (!lk.has(k)) refOnly[k] = (refOnly[k] || []).concat(route);
  for (const k of lk) if (!rk.has(k)) locOnly[k] = (locOnly[k] || []).concat(route);
}
console.log(`parsed ${n} route dumps`);
const fmt = (o, label) => {
  const keys = Object.keys(o).sort((a, b) => o[b].length - o[a].length);
  for (const k of keys.slice(0, 24)) {
    const routes = o[k].length;
    console.log(`${label} ×${routes}  ${k}`);
    if (routes <= 6) console.log(`      routes: ${o[k].join(", ")}`);
  }
};
console.log(`\n===== REF-only tuples (top 24 of ${Object.keys(refOnly).length}) =====`);
fmt(refOnly, "REF");
console.log(`\n===== LOC-only tuples (top 24 of ${Object.keys(locOnly).length}) =====`);
fmt(locOnly, "LOC");
