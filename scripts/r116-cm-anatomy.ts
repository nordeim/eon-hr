// r116-cm-anatomy.ts — session 116 / parity round 115: decode the Typst
// resume's content-stream anatomy around the line boundaries — where the
// `cm` translations sit, what device-space deltas they carry between shows,
// and the exact piece sequence at a known line boundary ("Smith" → "Senior").
// Usage: bun scripts/r116-cm-anatomy.ts
import { readFileSync } from "node:fs";
import zlib from "node:zlib";

const raw = readFileSync("/tmp/typst-cv/resume.pdf");
const rawStr = raw.toString("latin1");
// find all stream objects, inflate, find the ones containing BT
const streamRe = /stream\r?\n/g;
let m: RegExpExecArray | null;
const streams: string[] = [];
while ((m = streamRe.exec(rawStr))) {
  const start = m.index + m[0].length;
  const end = rawStr.indexOf("endstream", start);
  if (end < 0) continue;
  const chunk = rawStr.slice(start, end);
  for (const attempt of [() => zlib.inflateSync(Buffer.from(chunk, "latin1")), () => zlib.inflateRawSync(Buffer.from(chunk, "latin1"))]) {
    try {
      const out = attempt().toString("latin1");
      if (out.includes("BT")) streams.push(out);
      break;
    } catch { /* try next */ }
  }
}
console.log("content streams with BT:", streams.length);

// the operator walk over ALL streams concatenated (the extractor reads them
// per-page; here we want the resume's page 1). Focus: the q/cm/BT blocks.
// Print the first stream's operator skeleton (first 120 operators).
const ops = streams[0].match(/\/\S+\s+[\d.+-]+\s+Tf|-?[\d.]+\s+-?[\d.]+\s+T[dD]|T\*|\bBT\b|\bET\b|-?[\d.]+\s+-?[\d.]+\s+-?[\d.]+\s+-?[\d.]+\s+-?[\d.]+\s+-?[\d.]+\s+(?:Tm|cm)|\bq\b|\bQ\b|\(((?:\\.|[^\\()])*)\)\s*(?:Tj|TJ|'|")|<([0-9A-Fa-f\s]+)>\s*(?:Tj|TJ|'|")/g) || [];
console.log("operators in stream[0]:", ops.length);
let shown = 0;
for (const op of ops) {
  if (/^q$/.test(op) || /^Q$/.test(op) || /^BT$/.test(op) || /^ET$/.test(op) || /cm$/.test(op) || /Tf$/.test(op) || /T[dD]$/.test(op) || /T\*$/.test(op) || /Tm$/.test(op)) {
    if (shown++ < 90) console.log("  " + op.replace(/\n/g, "⏎").slice(0, 100));
  }
}
console.log("\n=== the q/cm/BT block pattern count ===");
const qcmBlocks = streams[0].match(/q\s+[\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+ ([\d.-]+) ([\d.-]+) cm\s+BT/g) || [];
console.log("q+cm+BT blocks:", qcmBlocks.length);
for (const b of qcmBlocks.slice(0, 14)) {
  const mm = b.match(/([\d.-]+) ([\d.-]+) cm/);
  console.log(`  cm tx=${mm![1]} ty=${mm![2]}`);
}
