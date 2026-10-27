// r100-objstm-diag.mjs — diagnose the real IRS f1040 (ObjStm-bearing,
// Acrobat-family): inflate its streams, classify each (CMap / content /
// ObjStm-dict body), and show the raw text-operator shapes that produce the
// per-glyph spacing artifact ("F o r   t h e" — every glyph its own atom).
import { readFileSync } from "node:fs";

const path = process.argv[2] ?? "/home/z/my-project/tmp-r100/irs-f1040.pdf";
const buf = readFileSync(path);
const bytes = new Uint8Array(buf);
const ascii = Buffer.from(buf).toString("latin1");

async function inflateChunk(data, format) {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream(format));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m;
let idx = 0;
const shapes = {};
const samples = [];
let cmapCount = 0, objstmCount = 0, contentCount = 0, failedCount = 0;
while ((m = streamRe.exec(ascii))) {
  if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
  const start = m.index + m[0].length;
  const end = ascii.indexOf("endstream", start);
  if (end < 0) break;
  streamRe.lastIndex = end + "endstream".length;
  let chunkEnd = end;
  if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
  else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
  const chunk = bytes.subarray(start, chunkEnd);
  let text = "";
  for (const trimmed of [chunk, bytes.subarray(start, end)]) {
    try { text = new TextDecoder().decode(await inflateChunk(trimmed, "deflate")); break; }
    catch { try { text = new TextDecoder().decode(await inflateChunk(trimmed, "deflate-raw")); break; } catch { text = ""; } }
  }
  if (!text) { failedCount++; continue; }
  idx++;
  if (text.includes("beginbfchar") || text.includes("beginbfrange")) { cmapCount++; continue; }
  if (ascii.slice(Math.max(0, m.index - 220), m.index).includes("/ObjStm")) { objstmCount++; continue; }
  // a content stream: census the text-operator shapes
  contentCount++;
  const tjArrays = text.match(/\[[^\]]*\]\s*TJ/g) ?? [];
  for (const arr of tjArrays) {
    const atoms = arr.match(/\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>/g) ?? [];
    const key = atoms.length === 1 ? "single-atom" : atoms.length <= 4 ? `few(${atoms.length})` : `many(${atoms.length})`;
    shapes[key] = (shapes[key] ?? 0) + 1;
    if (samples.length < 6 && atoms.length > 4) {
      samples.push(arr.slice(0, 220).replace(/\r?\n/g, "\\n"));
    }
  }
  // also census the number-between-atoms pattern: single digits as atoms?
  const perGlyph = [...text.matchAll(/\[((?:\([A-Za-z0-9]\)\s*-?\d+(?:\.\d+)?\s*)+)\]\s*TJ/g)];
  if (perGlyph.length && samples.length < 8) {
    samples.push("PER-GLYPH: " + perGlyph[0][1].slice(0, 180));
  }
}
console.log(`streams: ${idx} walked | CMaps: ${cmapCount} | ObjStm bodies: ${objstmCount} | content-ish: ${contentCount} | inflate-failed: ${failedCount}`);
console.log("TJ-array shape census:", JSON.stringify(shapes));
console.log("\n— sample per-glyph/kerned arrays —");
for (const s of samples) console.log("  ", JSON.stringify(s).slice(0, 260));
