// probe-r101-stream-dump.mjs — dump the text-bearing content streams of a
// real PDF around specific words, to see the exact writer shapes (the r100
// content-dump pattern, targeted at the r101 defect classes).
// Usage: node scripts/probe-r101-stream-dump.mjs file.pdf [needle]
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const path = process.argv[2];
const needle = process.argv[3] ?? "Career";
const buf = readFileSync(path);
const ascii = Buffer.from(buf).toString("latin1");

const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m; let shown = 0;
while ((m = streamRe.exec(ascii))) {
  if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
  const start = m.index + m[0].length;
  const end = ascii.indexOf("endstream", start);
  if (end < 0) break;
  streamRe.lastIndex = end + "endstream".length;
  let chunkEnd = end;
  if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
  else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
  const chunk = buf.subarray(start, chunkEnd);
  let text = "";
  try { text = new TextDecoder().decode(await inflate(chunk)); } catch {
    try { text = new TextDecoder().decode(await inflate(chunk, true)); } catch { continue; }
  }
  if (!text || !/\)\s*Tj|\]\s*TJ/.test(text)) continue;
  // find the needle's first fragment (e.g. "Car" for "Career")
  const frag = needle.slice(0, 3);
  const idx = text.indexOf(`(${frag}`);
  if (idx < 0 && !text.includes(frag)) continue;
  const lo = Math.max(0, (idx < 0 ? text.indexOf(frag) : idx) - 500);
  console.log(`\n=== stream @${m.index} (text ${text.length} chars) around "${frag}" ===`);
  console.log(JSON.stringify(text.slice(lo, lo + 1100)));
  if (++shown >= 3) break;
}
if (!shown) console.log("no text stream matched the needle");
