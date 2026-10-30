#!/usr/bin/env bun
// r109-a85-trace.ts — why does the prototype still read 0 chars from the
// ReportLab file? Trace the stream walk: dictRegion contents, hasA85,
// ascii85Decode success/failure, inflate success/failure.
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

// inline copy of the proto decoder (same logic)
function ascii85Decode(input: Uint8Array): Uint8Array {
  const out: number[] = [];
  let group: number[] = [];
  let started = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === 32 || c === 9 || c === 10 || c === 13 || c === 12 || c === 0) continue;
    if (!started && c === 60) {
      if (i + 1 < input.length && input[i + 1] === 126) { i++; started = true; continue; }
    }
    if (c === 126) break;
    if (c === 122 && group.length === 0) { out.push(0, 0, 0, 0); continue; }
    if (c < 33 || c > 117) throw new Error("ascii85: bad char " + c);
    group.push(c - 33);
    if (group.length === 5) {
      let v = group[0] * 52200625 + group[1] * 614125 + group[2] * 7225 + group[3] * 85 + group[4];
      out.push((v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff);
      group = [];
    }
  }
  if (group.length) {
    const n = group.length;
    while (group.length < 5) group.push(84);
    const v = group[0] * 52200625 + group[1] * 614125 + group[2] * 7225 + group[3] * 85 + group[4];
    const bytes = [(v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff];
    for (let i = 0; i < n - 1; i++) out.push(bytes[i]);
  }
  return Uint8Array.from(out);
}

const raw = readFileSync("/tmp/r109-hunt/rl-userguide.pdf");
const bytes = new Uint8Array(raw);
const ascii = new TextDecoder("latin1").decode(bytes);
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m: RegExpExecArray | null;
let total = 0, a85 = 0, a85fail = 0, inflateOk = 0, btj = 0, skipped = 0;
while ((m = streamRe.exec(ascii))) {
  if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
  const dictStart = Math.max(0, ascii.lastIndexOf("endobj", m.index) + 6);
  const dictRegion = ascii.slice(dictStart, m.index);
  total++;
  if (/\/Subtype\s*\/Image\b/.test(dictRegion) || /\/FontFile[23]?\b/.test(dictRegion)) { skipped++; continue; }
  const hasA85 = /\/ASCII85Decode|\/A85\b/.test(dictRegion);
  const hasFlate = /\/FlateDecode/.test(dictRegion);
  if (!hasA85) continue;
  a85++;
  const start = m.index + m[0].length;
  const end = ascii.indexOf("endstream", start);
  if (end < 0) break;
  let chunkEnd = end;
  if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
  else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
  const chunk = bytes.subarray(start, chunkEnd);
  try {
    const payload = ascii85Decode(chunk);
    try {
      const text = new TextDecoder("latin1").decode(inflateSync(payload));
      inflateOk++;
      if (/BT/.test(text) && /Tj|TJ/.test(text)) btj++;
    } catch (e) {
      console.log(`stream @${start}: a85 ok (${payload.length}B) but inflate FAILED: ${String(e).slice(0, 60)}`);
    }
  } catch (e) {
    a85fail++;
    if (a85fail <= 3) console.log(`stream @${start}: a85 FAILED: ${String(e).slice(0, 80)}`);
  }
  streamRe.lastIndex = end + "endstream".length;
}
console.log(`\ntotal streams: ${total}, image/font skipped: ${skipped}, a85-declared: ${a85}, a85 failures: ${a85fail}, inflate ok: ${inflateOk}, with BT+Tj: ${btj}`);
