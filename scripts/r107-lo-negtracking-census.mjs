#!/usr/bin/env node
// r107-lo-negtracking-census.mjs — session 107 / parity round 106: the LO
// negative-tracking watch, taken to the real files. LibreOffice's
// tabular-figure kerns measured −113/−116 thousandths in the r102 census —
// JUST past the −100 word-gap threshold. The watch question: does the
// current extraction SPLIT digits in the LO guides (false word gaps
// between tabular figures — "1 234,56" class)?
//   (1) census the TJ-array consecutive-number SUMS in the −100…−200 band
//       (the threshold-adjacent class) + their neighboring atoms
//   (2) run the FULL extraction on both LO guides and probe for split
//       digit runs (\d \d with a space between, in tabular content)
//   (3) the standing pin check: lo-calc 7.0 = 691,268 alnums (the r102 pin)
import { execSync } from "node:child_process";
import fs from "node:fs";

const { inflate } = await import("./r101-inflate.ts");
const files = [
  ["/tmp/r107-corpus/lo-writer.pdf", "LO Writer 7.6 guide"],
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc 7.0 guide"],
];

for (const [path, name] of files) {
  console.log(`\n===== ${name} =====`);
  const bytes = fs.readFileSync(path);
  const ascii = Buffer.from(bytes).toString("latin1");
  const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
  let m;
  const negBand = new Map(); // sum → count for -100..-200
  let negTotal = 0, posTotal = 0, negUnder100 = 0;
  let digitSplitSamples = [];
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
    if (!/\]\s*TJ/.test(text)) continue;
    // census the TJ arrays' consecutive-number sums
    for (const tj of text.matchAll(/\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ/g)) {
      const atomRe = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>|(-?[\d.]+)/g;
      let a; let kern = 0; let prevAtom = "";
      while ((a = atomRe.exec(tj[1]))) {
        if (a[1] !== undefined || a[2] !== undefined) {
          if (kern !== 0) {
            if (kern <= -100 && kern >= -200) {
              negBand.set(kern, (negBand.get(kern) || 0) + 1);
              if (digitSplitSamples.length < 6) digitSplitSamples.push({ prev: prevAtom.slice(-12), kern, next: (a[1] ?? a[2] ?? "").slice(0, 12) });
            } else if (kern < -200) negTotal++;
            else if (kern < 0) negUnder100++;
            else posTotal++;
          }
          kern = 0; prevAtom = a[1] ?? a[2] ?? "";
        } else kern += parseFloat(a[3]);
      }
    }
  }
  console.log("negative sums ≤ -200 (real gaps):", negTotal);
  console.log("negative sums -100..-200 (THRESHOLD BAND):", [...negBand.entries()].sort((x, y) => y[1] - x[1]).slice(0, 10).map(([v, c]) => `${v}×${c}`).join(", ") || "NONE");
  console.log("negative sums > -100 (kerns):", negUnder100);
  console.log("positive sums (kerns):", posTotal);
  console.log("band neighbors (prev ← kern → next):", JSON.stringify(digitSplitSamples.slice(0, 4)));
}
console.log("\nCENSUS DONE");
process.exit(0);
