// r106-debug-pages.mjs — dump the first few ObjStm page bodies verbatim.
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const path = process.argv[2] || "/tmp/r106-corpus/fontspec.pdf";
const buf = readFileSync(path);
const ascii = Buffer.from(buf).toString("latin1");
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m;
let shown = 0;
while ((m = streamRe.exec(ascii)) && shown < 5) {
  if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
  const dictRegion = ascii.slice(Math.max(0, ascii.lastIndexOf("endobj", m.index) + 6), m.index);
  if (/\/Subtype\s*\/Image\b/.test(dictRegion) || /\/FontFile[23]?\b/.test(dictRegion)) {
    const endSkip = ascii.indexOf("endstream", m.index + m[0].length);
    if (endSkip < 0) break;
    streamRe.lastIndex = endSkip + "endstream".length;
    continue;
  }
  if (!/\/Type\s*\/ObjStm\b/.test(dictRegion)) continue;
  const start = m.index + m[0].length;
  const end = ascii.indexOf("endstream", start);
  if (end < 0) break;
  streamRe.lastIndex = end + "endstream".length;
  let chunkEnd = end;
  if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
  else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
  let text = "";
  try { text = new TextDecoder().decode(await inflate(buf.subarray(start, chunkEnd))); } catch {
    try { text = new TextDecoder().decode(await inflate(buf.subarray(start, end))); } catch { continue; }
  }
  const firstMatch = dictRegion.match(/\/First\s+(\d+)/);
  const hdr = text.match(/^\s*((?:\d+\s+\d+\s+)+)/);
  if (!firstMatch || !hdr) { console.log("ObjStm unparseable at", m.index); continue; }
  const first = parseInt(firstMatch[1], 10);
  const nums = hdr[1].trim().split(/\s+/).map(Number);
  const entries = [];
  for (let i = 0; i + 1 < nums.length; i += 2) entries.push({ obj: nums[i], off: nums[i + 1] });
  for (let i = 0; i < entries.length && shown < 5; i++) {
    const s = first + entries[i].off;
    const e = i + 1 < entries.length ? first + entries[i + 1].off : text.length;
    if (s > e || e > text.length) continue;
    const body = text.slice(s, e);
    if (/\/Type\s*\/Page\b/.test(body)) {
      shown++;
      console.log(`--- page obj ${entries[i].obj} ---`);
      console.log(body.replace(/\s+/g, " ").slice(0, 300));
    }
  }
}
process.exit(0);
