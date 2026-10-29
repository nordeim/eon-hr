#!/usr/bin/env node
// r107-tzts-census.mjs — session 107 / parity round 106: the non-default
// Tz/Ts watch, taken to the real files. For every corpus member, walks the
// decompressed content streams (the corpus-probe pattern: the dict gate +
// the delimiter-matrix stream regex + the EOL-trimmed inflate) and censuses:
//   - every `N Tz` operator (horizontal scaling; PDF default 100) — the
//     non-default values, with the effective TJ-number scaling (a gap of
//     -209 thousandths at Tz 50 reads -104.5 effective em-thousandths)
//   - every `N Ts` operator (text rise; PDF default 0) — the non-zero values
//   - Tc/Tw as a bonus (char/word spacing — the same advance-scaling family)
// A file with ZERO non-default Tz/Ts keeps the watch (no live target). A
// file WITH them gets the drift question: does any pin drift through them?
import { execSync } from "node:child_process";
import fs from "node:fs";

const files = [
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS f1040 (Acrobat)"],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv-2404.16710 (pdfTeX)"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx manual (xdvipdfmx)"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec v2.9h (xdvipdfmx)"],
  // the LO guides re-sourced below land here when present
  ["/tmp/r107-corpus/lo-writer.pdf", "LO Writer guide (LibreOffice)"],
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc guide (LibreOffice)"],
];

const inflateMod = await import("./r101-inflate.ts");
const inflate = inflateMod.inflate;

for (const [path, name] of files) {
  if (!fs.existsSync(path)) { console.log(`\n===== ${name}: NOT PRESENT (${path}) =====`); continue; }
  console.log(`\n===== ${name} =====`);
  const bytes = fs.readFileSync(path);
  const ascii = Buffer.from(bytes).toString("latin1");
  const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
  let m;
  const tzVals = new Map(); // value → count
  const tsVals = new Map();
  const tcVals = new Map();
  const twVals = new Map();
  let streamsWalked = 0;
  while ((m = streamRe.exec(ascii))) {
    if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
    const dictStart = Math.max(0, ascii.lastIndexOf("endobj", m.index) + 6);
    const dictRegion = ascii.slice(dictStart, m.index);
    if (/\/Subtype\s*\/Image\b/.test(dictRegion) || /\/FontFile[23]?\b/.test(dictRegion)) {
      const endSkip = ascii.indexOf("endstream", m.index + m[0].length);
      if (endSkip < 0) break;
      streamRe.lastIndex = endSkip + "endstream".length;
      continue;
    }
    const start = m.index + m[0].length;
    const end = ascii.indexOf("endstream", start);
    if (end < 0) break;
    streamRe.lastIndex = end + "endstream".length;
    let chunkEnd = end;
    if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
    else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
    const chunk = bytes.subarray(start, chunkEnd);
    let text = "";
    for (const trimmed of [chunk, bytes.subarray(start, end)]) {
      try { text = new TextDecoder().decode(await inflate(trimmed)); break; } catch {
        try { text = new TextDecoder().decode(await inflate(trimmed, true)); break; } catch { text = ""; }
      }
    }
    if (!text) continue;
    if (/\/Type\s*\/ObjStm\b/.test(dictRegion)) continue;
    if (text.includes("beginbfchar") || text.includes("beginbfrange")) continue;
    if (!/(?:\)|\]|>)\s*(?:Tj|TJ|'|")/.test(text)) continue;
    streamsWalked++;
    for (const t of text.matchAll(/(-?[\d.]+)\s+Tz\b/g)) {
      const v = parseFloat(t[1]);
      tzVals.set(v, (tzVals.get(v) || 0) + 1);
    }
    for (const t of text.matchAll(/(-?[\d.]+)\s+Ts\b/g)) {
      const v = parseFloat(t[1]);
      tsVals.set(v, (tsVals.get(v) || 0) + 1);
    }
    for (const t of text.matchAll(/(-?[\d.]+)\s+Tc\b/g)) {
      const v = parseFloat(t[1]);
      tcVals.set(v, (tcVals.get(v) || 0) + 1);
    }
    for (const t of text.matchAll(/(-?[\d.]+)\s+Tw\b/g)) {
      const v = parseFloat(t[1]);
      twVals.set(v, (twVals.get(v) || 0) + 1);
    }
  }
  console.log(`content streams walked: ${streamsWalked}`);
  const fmt = (label, map, isDefault) => {
    const entries = [...map.entries()].filter(([v]) => !isDefault(v));
    const all = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    console.log(`  ${label}: ${map.size === 0 ? "none" : all.map(([v, c]) => `${v}×${c}`).join(", ")}`);
    if (entries.length) console.log(`  ${label} NON-DEFAULT: ${entries.map(([v, c]) => `${v}×${c}`).join(", ")}`);
  };
  fmt("Tz (default 100)", tzVals, (v) => v === 100);
  fmt("Ts (default 0)", tsVals, (v) => v === 0);
  fmt("Tc (default 0)", tcVals, (v) => v === 0);
  fmt("Tw (default 0)", twVals, (v) => v === 0);
}
console.log("\nCENSUS DONE");
process.exit(0);
