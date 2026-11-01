// r112-skia-diag.mjs — diagnose the Skia emission order: dump the first
// text shows + their Tm/Td positioning from the (uncompressed) content
// stream, to see where the floated dates ride.
// Usage: bun scripts/r112-skia-diag.mjs
import { readFileSync } from "node:fs";
import zlib from "node:zlib";

const buf = readFileSync("/tmp/skia-cv/john-smith-cv.pdf");
const latin = Buffer.from(buf).toString("latin1");
// find all stream objects with FlateDecode
const re = /(\d+)\s+0\s+obj\s*<<([^>]*)>>\s*stream\r?\n?/g;
let m;
const streams = [];
while ((m = re.exec(latin))) {
  const start = m.index + m[0].length;
  const end = latin.indexOf("endstream", start);
  const dict = m[2];
  if (/FlateDecode/.test(dict) && !/Type\/ObjStm/.test(dict)) {
    const raw = buf.subarray(start, end);
    try {
      const out = zlib.inflateSync(raw);
      if (/BT/.test(out.toString("latin1")) || /Tj|TJ/.test(out.toString("latin1"))) {
        streams.push({ obj: parseInt(m[1], 10), len: out.length, text: out.toString("latin1") });
      }
    } catch {}
  }
}
console.log("text streams found:", streams.map((s) => `obj ${s.obj} (${s.len}B)`).join(", "));
const s = streams[0];
// dump the first 3000 chars of the first text stream
console.log("--- stream head (first 2600 chars) ---");
console.log(s.text.slice(0, 2600));
