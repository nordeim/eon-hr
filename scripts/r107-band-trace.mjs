#!/usr/bin/env node
// r107-band-trace.mjs — trace the −113..−154 band TJ arrays: where do they
// live, what does the walk do with their streams, and why doesn't the
// extraction show split digits? The census found the atoms; the extraction
// doesn't show the damage — the gate ladder must be swallowing the stream.
import { execSync } from "node:child_process";
import fs from "node:fs";

const { inflate } = await import("./r101-inflate.ts");
const path = "/tmp/r107-corpus/lo-calc.pdf";
const bytes = fs.readFileSync(path);
const ascii = Buffer.from(bytes).toString("latin1");
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m;
let found = 0;
while ((m = streamRe.exec(ascii)) && found < 8) {
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
  // find the band kerns in THIS stream (literal AND hex atoms; the numbers
  // may be multiple consecutive values summing into the band)
  const bandRe = /(\((?:\\.|[^\\()])*\)|<[0-9A-Fa-f\s]+>)((?:\s*-?[\d.]+\s*)+)(\((?:\\.|[^\\()])*\)|<[0-9A-Fa-f\s]+>)/g;
  let b;
  const hits = [];
  const atomStr = (s) => s.slice(1, -1);
  while ((b = bandRe.exec(text))) {
    const nums = b[2].trim().split(/\s+/);
    const kern = nums.reduce((s, x) => s + parseFloat(x), 0);
    if (kern <= -100 && kern >= -200) hits.push({ prev: atomStr(b[1]), kern, next: atomStr(b[3]), form: b[1].startsWith("(") ? "lit" : "hex" });
  }
  if (!hits.length) continue;
  found++;
  // now run the extractor's gate ladder on this stream
  const isObjStm = /\/Type\s*\/ObjStm\b/.test(dictRegion);
  const isCMap = text.includes("beginbfchar") || text.includes("beginbfrange");
  const hasTextOp = /(?:\)|\]|>)\s*(?:Tj|TJ|'|")/.test(text);
  let printable = 0;
  const samples = Math.min(text.length, 4096);
  const stride = Math.max(1, Math.floor(text.length / samples));
  let taken = 0;
  for (let i = 0; i < text.length; i += stride) { taken++; const c = text.charCodeAt(i); if ((c >= 32 && c < 127) || c === 10 || c === 13 || c === 9) printable++; }
  const printRatio = printable / taken;
  console.log(`\n--- stream @${m.index} (len ${text.length}) ---`);
  console.log("dict:", dictRegion.trim().slice(0, 120).replace(/\s+/g, " "));
  console.log("gates: objStm=" + isObjStm + " cmap=" + isCMap + " textOp=" + hasTextOp + " printable=" + printRatio.toFixed(3));
  console.log("band hits (" + hits.length + "):", JSON.stringify(hits.slice(0, 5)));
  if (printRatio < 0.6 || !hasTextOp || isObjStm || isCMap) {
    console.log(">>> THIS STREAM IS SKIPPED BY THE EXTRACTOR — the band kerns ride a skipped stream");
    // what else is in this stream?
    console.log("stream head:", JSON.stringify(text.slice(0, 200)));
  }
}
console.log("\nTRACE DONE — streams with band kerns found:", found);
process.exit(0);
