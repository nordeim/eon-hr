#!/usr/bin/env node
// r63-probe-cmp.mjs — symmetric inventory diff for the probe dump.
// Splits hidden (h:1) from visible, compares (tg|c) member sets with the
// signatures attached, prints what each side lacks (visible first, then
// hidden — the kicker data).
import { readFileSync } from "node:fs";
const all = JSON.parse(readFileSync(process.argv[2] || "/tmp/r63-probe.json", "utf8"));
const key = (e) => `${e.tg}|${e.c}`;
for (const [route, { ref, loc }] of Object.entries(all)) {
  const refV = new Map((ref || []).filter(e => !e.h).map(e => [key(e), e]));
  const locV = new Map((loc || []).filter(e => !e.h).map(e => [key(e), e]));
  const refH = new Map((ref || []).filter(e => e.h).map(e => [key(e), e]));
  const locH = new Map((loc || []).filter(e => e.h).map(e => [key(e), e]));
  const cmp = (name, A, B) => {
    const onlyA = [...A.keys()].filter(k => !B.has(k));
    const onlyB = [...B.keys()].filter(k => !A.has(k));
    if (onlyA.length || onlyB.length) {
      console.log(`\n### ${route} — ${name}`);
      for (const k of onlyA) console.log(`  REF-ONLY  ${k}  sig=${JSON.stringify(A.get(k).s).slice(0, 60)} kicker=${A.get(k).k}`);
      for (const k of onlyB) console.log(`  LOC-ONLY  ${k}  sig=${JSON.stringify(B.get(k).s).slice(0, 60)} kicker=${B.get(k).k}`);
    }
  };
  cmp("VISIBLE", refV, locV);
  cmp("HIDDEN", refH, locH);
}
console.log("\n(done)");
