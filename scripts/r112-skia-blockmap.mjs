// r112-skia-blockmap.mjs — map every BT/ET block's first Tm position in
// stream order vs layout order (the flipped cm space: effective page Y =
// 842.88 - (215.625 + 3.125*y)). Shows where stream order diverges from
// reading order (the float-hoist pattern).
// Usage: bun scripts/r112-skia-blockmap.mjs
import { readFileSync } from "node:fs";
import zlib from "node:zlib";

const buf = readFileSync("/tmp/skia-cv/john-smith-cv.pdf");
const latin = Buffer.from(buf).toString("latin1");
const re = /(\d+)\s+0\s+obj\s*<<([^>]*)>>\s*stream\r?\n?/g;
let m;
let stream = null;
while ((m = re.exec(latin))) {
  const start = m.index + m[0].length;
  const end = latin.indexOf("endstream", start);
  if (/FlateDecode/.test(m[2])) {
    try {
      const out = zlib.inflateSync(buf.subarray(start, end));
      const t = out.toString("latin1");
      if (/BT/.test(t)) stream = t;
    } catch {}
  }
}
// outer cm: .24 0 0 -.24 0 842.88  → pageX = .24*x + 0, pageY = 842.88 - .24*y
// inner cm per block: 3.125 0 0 3.125 tx ty
// text Tm: 1 0 0 -1 x y (in the inner space) → effective local coords scaled
const blocks = [];
const btRe = /BT\s+\/(\w+)\s+([\d.]+)\s+Tf\s+1 0 0 -1 ([\d.]+) ([\d.]+)\s+Tm/g;
let b;
let idx = 0;
while ((b = btRe.exec(stream))) {
  // the first hex atom for a content sniff
  const after = stream.slice(b.index, b.index + 200);
  const atom = after.match(/<([0-9A-Fa-f]+)>\s*Tj/);
  blocks.push({ n: idx++, font: b[1], size: parseFloat(b[2]), x: parseFloat(b[3]), y: parseFloat(b[4]), firstAtom: atom ? atom[1] : "" });
}
console.log("total BT blocks:", blocks.length);
console.log("n | font size | local x,y | approx page y (842.88 - .24*(215.625+3.125*y)) | first atom");
for (const bl of blocks.slice(0, 30)) {
  const pageY = 842.88 - 0.24 * (215.625 + 3.125 * bl.y);
  console.log(`${String(bl.n).padStart(3)} | ${bl.font} ${bl.size.toFixed(1)} | x=${bl.x.toFixed(0)} y=${bl.y.toFixed(0)} | pageY=${pageY.toFixed(0)} | <${bl.firstAtom}>`);
}
// monotonicity check on pageY in stream order
let prev = -Infinity;
const violations = [];
for (const bl of blocks) {
  const pageY = 842.88 - 0.24 * (215.625 + 3.125 * bl.y);
  if (pageY < prev - 0.5) violations.push(bl.n);
  prev = Math.max(prev, pageY);
}
console.log("\nstream-order Y violations at blocks:", violations.slice(0, 40).join(","), violations.length ? `(${violations.length} total)` : "(NONE — in order)");
