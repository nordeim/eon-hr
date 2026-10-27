// r104-xetex-dump.mjs — dump the XeTeX file's content stream (the
// word-per-line mechanism hunt: BT=379/TJ=383/Tf=380/Td=0/Tm=0 — every
// word its own BT block with NO Td/Tm; where does the positioning live?)
// Usage: node scripts/r104-xetex-dump.mjs <file.pdf>
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const path = process.argv[2];
const buf = readFileSync(path);
const ascii = Buffer.from(buf).toString("latin1");
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m;
while ((m = streamRe.exec(ascii))) {
  if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
  const start = m.index + m[0].length;
  const end = ascii.indexOf("endstream", start);
  if (end < 0) break;
  streamRe.lastIndex = end + "endstream".length;
  let chunkEnd = end;
  if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
  else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
  let text = "";
  try { text = new TextDecoder().decode(await inflate(buf.subarray(start, chunkEnd))); } catch {
    try { text = new TextDecoder().decode(await inflate(buf.subarray(start, chunkEnd), true)); } catch { continue; }
  }
  if (!/BT/.test(text) || !/T[Jj]/.test(text)) continue;
  console.log(`--- content stream (${text.length} chars), first 2600: ---`);
  console.log(text.slice(0, 2600));
  console.log("--- a mid-section (chars 6000-8000): ---");
  console.log(text.slice(6000, 8000));
  break;
}
