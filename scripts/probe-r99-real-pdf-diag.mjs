// R99-B diagnosis: dump the inflated content of a real PDF's streams and
// census the text-operator forms present (Tj/TJ with literal vs HEX strings,
// BT/ET blocks) to find why the extraction yields nothing.
import { readFileSync } from "node:fs";

const path = process.argv[2] ?? "/home/z/my-project/tmp-r99/pdf-test.pdf";
const buf = readFileSync(path);
const bytes = new Uint8Array(buf);
const ascii = Buffer.from(buf).toString("latin1");

async function inflate(b, format) {
  const stream = new Blob([b]).stream().pipeThrough(new DecompressionStream(format));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

const streamRe = /stream\r?\n/g;
let m;
let n = 0;
while ((m = streamRe.exec(ascii)) && n < 5) {
  const start = m.index + m[0].length;
  const end = ascii.indexOf("endstream", start);
  if (end < 0) break;
  streamRe.lastIndex = end + 9;
  let chunkEnd = end;
  if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
  else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
  const chunk = bytes.subarray(start, chunkEnd);
  let text = "";
  for (const trimmed of [chunk, bytes.subarray(start, end)]) {
    try { text = new TextDecoder().decode(await inflate(trimmed, "deflate")); break; }
    catch { try { text = new TextDecoder().decode(await inflate(trimmed, "deflate-raw")); break; } catch { text = ""; } }
  }
  if (text) {
    n++;
    console.log(`--- stream #${n} (${text.length} chars) ---`);
    console.log(JSON.stringify(text.slice(0, 500)));
    // census of text-op forms
    const lit = (text.match(/\([^)]*\)\s*Tj/g) ?? []).length;
    const litTJ = (text.match(/\[[^\]]*\]\s*TJ/g) ?? []).length;
    const hex = (text.match(/<[0-9A-Fa-f\s]*>\s*Tj/g) ?? []).length;
    const hexTJ = (text.match(/<[^>]*>\s*TJ/g) ?? []).length;
    const bt = (text.match(/BT/g) ?? []).length;
    console.log(`  census: literal-Tj=${lit} literal-TJ-array=${litTJ} hex-Tj=${hex} hex-TJ=${hexTJ} BT=${bt}`);
  }
}
if (n === 0) console.log("NO STREAM INFLATED — all failed");
