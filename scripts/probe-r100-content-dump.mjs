// r100-content-dump.mjs — dump one inflated content stream from a real PDF to
// see the raw text-operator shapes (per-glyph Tj? positioning operators?).
import { readFileSync } from "node:fs";

const path = process.argv[2] ?? "/home/z/my-project/tmp-r100/irs-f1040.pdf";
const which = Number(process.argv[3] ?? 0);
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
  if (!text) continue;
  if (text.includes("beginbfchar") || text.includes("beginbfrange")) continue;
  if (ascii.slice(Math.max(0, m.index - 220), m.index).includes("/ObjStm")) continue;
  // only streams that carry text operators
  if (!/(?:Tj|TJ|'|")/.test(text)) continue;
  if (idx === which) {
    console.log(`— content stream #${which} (${text.length} chars), first 1400 chars —`);
    console.log(text.slice(0, 1400).replace(/\r/g, "<CR>"));
    // census: Tj vs TJ vs ' vs " operators
    const ops = {
      "Tj": (text.match(/\)\s*Tj/g) ?? []).length,
      ">Tj hex": (text.match(/>\s*Tj/g) ?? []).length,
      "TJ": (text.match(/\]\s*TJ/g) ?? []).length,
      "'": (text.match(/'\s*$/gm) ?? []).length,
      '"': (text.match(/"\s*$/gm) ?? []).length,
      Td: (text.match(/\bTd\b/g) ?? []).length,
      TD: (text.match(/\bTD\b/g) ?? []).length,
      Tm: (text.match(/\bTm\b/g) ?? []).length,
      TL: (text.match(/\bTL\b/g) ?? []).length,
    };
    console.log("\noperator census:", JSON.stringify(ops));
    process.exit(0);
  }
  idx++;
}
console.log("no content stream matched index", which, "— walked", idx);
