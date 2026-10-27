// probe-r101-tzts-type3.mjs — the r101 queue's classification legs:
// (1) the Ts operand values in the inflated content streams (tisch),
// (2) the Tz values (already known: all "100" in tisch; confirm corpus-wide),
// (3) the Type3 font usage in the arXiv file — what shows carry Type3-set
//     text and how do they currently extract.
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

async function streams(path) {
  const buf = readFileSync(path);
  const ascii = Buffer.from(buf).toString("latin1");
  const out = [];
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
    const chunk = buf.subarray(start, chunkEnd);
    let text = "";
    try { text = new TextDecoder().decode(await inflate(chunk)); } catch {
      try { text = new TextDecoder().decode(await inflate(chunk, true)); } catch { continue; }
    }
    if (text) out.push({ offset: m.index, text, raw: ascii.slice(Math.max(0, m.index - 220), m.index) });
  }
  return { ascii, out };
}

console.log("### (1)+(2) Ts/Tz operand census across the corpus:");
for (const p of process.argv.slice(2)) {
  const { out } = await streams(p);
  const tsVals = new Map(); const tzVals = new Map();
  for (const s of out) {
    for (const mm of s.text.matchAll(/(-?[\d.]+)\s+Ts\b/g)) tsVals.set(mm[1], (tsVals.get(mm[1]) ?? 0) + 1);
    for (const mm of s.text.matchAll(/(-?[\d.]+)\s+Tz\b/g)) tzVals.set(mm[1], (tzVals.get(mm[1]) ?? 0) + 1);
  }
  console.log(` ${p.split("/").pop()}: Ts=${JSON.stringify([...tsVals.entries()])} Tz=${JSON.stringify([...tzVals.entries()])}`);
}

console.log("\n### (3) the arXiv Type3 usage:");
const { ascii, out } = await streams("/home/z/my-project/tmp-r100/arxiv-2404.16710.pdf");
void out;
// where do /Type3 declarations live?
let declared = 0;
for (const mm of ascii.matchAll(/\/Type3/g)) {
  declared++;
  if (declared <= 3) console.log(` raw ctx: ${JSON.stringify(ascii.slice(mm.index - 80, mm.index + 120))}`);
}
console.log(` raw /Type3 declarations: ${declared}`);
// which font resource names are Type3, and do their shows appear in content?
const t3fonts = new Set();
for (const mm of ascii.matchAll(/\/(\w+)\s+\d+\s+0\s+R/g)) {
  // cannot resolve refs without xref walk — instead look for font dicts with /FontType 3
}
for (const mm of ascii.matchAll(/\/Subtype\s*\/Type3/g)) {
  console.log(` Subtype/Type3 ctx: ${JSON.stringify(ascii.slice(mm.index - 150, mm.index + 150))}`);
}
// the d0/d1 glyph-proc operators in inflated streams
let d0d1 = 0;
for (const s of out) d0d1 += (s.text.match(/\b[01]\s+d[01]\b/g) ?? []).length;
console.log(` d0/d1 glyph-proc ops in inflated streams: ${d0d1}`);
