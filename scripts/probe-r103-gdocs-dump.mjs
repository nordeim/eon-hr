// probe-r103-gdocs-dump.mjs — dump the inflated content streams of the Google
// Docs (Skia) export to see the exact operator form driving the word-per-line
// soup.
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const path = process.argv[2];
const buf = readFileSync(path);
const ascii = Buffer.from(buf).toString("latin1");
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m;
let n = 0;
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
  if (!text) continue;
  if (/Tj|TJ/.test(text)) {
    n++;
    if (n <= 3) {
      console.log(`--- content stream ${n} (len ${text.length}) first 1600 chars ---`);
      console.log(JSON.stringify(text.slice(0, 1600)));
    }
  }
}
console.log(`streams with text ops: ${n}`);
