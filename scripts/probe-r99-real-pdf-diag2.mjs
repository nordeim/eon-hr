// R99-B diagnosis 2: dump each stream's preceding object dict (filter,
// subtype, length) and the inflate outcome; check the trailer for /Encrypt.
import { readFileSync } from "node:fs";

const path = process.argv[2] ?? "/home/z/my-project/tmp-r99/pdf-test.pdf";
const buf = readFileSync(path);
const bytes = new Uint8Array(buf);
const ascii = Buffer.from(buf).toString("latin1");

console.log("has /Encrypt:", /\/Encrypt\s+\d+\s+\d+\s+R/.test(ascii));
console.log("has /FlateDecode:", ascii.includes("/FlateDecode"));
console.log("has /LZWDecode:", ascii.includes("/LZWDecode"));
console.log("has /DCTDecode:", ascii.includes("/DCTDecode"));
console.log("has /ObjStm:", ascii.includes("/ObjStm"));
console.log("has /Type0 fonts:", ascii.includes("/Type0"));
console.log("has /Identity-H:", ascii.includes("/Identity-H"));
console.log("has hex strings with Tj:", /<[0-9A-Fa-f\s]*>\s*Tj/.test(ascii));

async function inflate(b, format) {
  const stream = new Blob([b]).stream().pipeThrough(new DecompressionStream(format));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

const streamRe = /stream\r?\n/g;
let m;
let i = 0;
while ((m = streamRe.exec(ascii))) {
  const start = m.index + m[0].length;
  const end = ascii.indexOf("endstream", start);
  if (end < 0) break;
  streamRe.lastIndex = end + 9;
  // the dict: the 200 bytes before "stream"
  const before = ascii.slice(Math.max(0, m.index - 200), m.index);
  const dictTail = before.slice(before.lastIndexOf("<<"));
  let chunkEnd = end;
  if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
  else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
  const chunk = bytes.subarray(start, chunkEnd);
  let outcome = "FAIL";
  let textLen = 0;
  for (const trimmed of [chunk, bytes.subarray(start, end)]) {
    try {
      const out = await inflate(trimmed, "deflate");
      outcome = "deflate"; textLen = out.length; break;
    } catch {
      try { const out = await inflate(trimmed, "deflate-raw"); outcome = "deflate-raw"; textLen = out.length; break; }
      catch { outcome = "FAIL"; }
    }
  }
  i++;
  if (i <= 40) {
    console.log(`stream #${i}: ${outcome} (${textLen}B) dict=${JSON.stringify(dictTail.slice(0, 120))}`);
  }
}
console.log("total stream candidates:", i);
