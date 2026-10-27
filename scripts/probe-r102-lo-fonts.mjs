// probe-r102-lo-fonts.mjs — map the font-object structure: (a) do content
// streams carry inline /Resources /Font << /F1 12 0 R >> dicts? (b) how do
// font dicts reference their /ToUnicode streams? (c) the F-name → object →
// CMap chain needed for font-scoped decoding.
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const path = process.argv[2];
const buf = readFileSync(path);
const bytes = new Uint8Array(buf);
const ascii = Buffer.from(buf).toString("latin1");

// (a) the dict region before each CONTENT stream — inline /Resources?
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m; let withInlineFont = 0, contentStreams = 0;
let dictSample = "";
while ((m = streamRe.exec(ascii))) {
  if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
  const start = m.index + m[0].length;
  const end = ascii.indexOf("endstream", start);
  if (end < 0) break;
  streamRe.lastIndex = end + "endstream".length;
  const dictRegion = ascii.slice(Math.max(0, m.index - 600), m.index);
  const chunkEnd0 = (() => {
    let cE = end;
    if (ascii.charCodeAt(cE - 2) === 13 && ascii.charCodeAt(cE - 1) === 10) cE -= 2;
    else if (ascii.charCodeAt(cE - 1) === 10 || ascii.charCodeAt(cE - 1) === 13) cE -= 1;
    return cE;
  })();
  const chunk = bytes.subarray(start, chunkEnd0);
  let text = "";
  try { text = new TextDecoder().decode(await inflate(chunk)); } catch {
    try { text = new TextDecoder().decode(await inflate(chunk, true)); } catch { continue; }
  }
  if (!text || !/\bBT\b/.test(text) || !/(?:\)\s*|\]\s*|>\s*)(?:Tj|TJ|'|")/.test(text)) continue;
  contentStreams++;
  if (/\/Font\s*<</.test(dictRegion)) {
    withInlineFont++;
    if (!dictSample) {
      const i = dictRegion.indexOf("/Font");
      dictSample = dictRegion.slice(Math.max(0, i - 120), i + 240);
    }
  }
}
console.log(`content streams: ${contentStreams}, with inline /Font resources: ${withInlineFont}`);
console.log("inline dict sample:", JSON.stringify(dictSample));

// (b) the font dicts: /ToUnicode N 0 R references
const fontDicts = [];
for (const fm of ascii.matchAll(/<<[^<>]*\/Type\s*\/Font[^<>]*>>/g)) {
  const d = fm[0];
  if (d.length > 900) continue;
  const base = (d.match(/\/BaseFont\s*\/([\w#+-]+)/) ?? [])[1] || "?";
  const tu = (d.match(/\/ToUnicode\s+(\d+)\s+0\s+R/) ?? [])[1];
  const subtype = (d.match(/\/Subtype\s*\/(\w+)/) ?? [])[1] || "?";
  fontDicts.push({ obj: null, base, subtype, tu });
}
console.log(`\nfont dicts found (raw scan): ${fontDicts.length}`);
for (const f of fontDicts.slice(0, 18)) console.log(` ${f.subtype} ${f.base} → ToUnicode obj ${f.tu}`);

// (c) object-number association: find "N 0 obj << ... /Type /Font ... >>"
const objFontRe = /(\d+)\s+0\s+obj\s*<<([^<>]*(?:<<[^<>]*>>[^<>]*)*)>>/g;
let om; const objFonts = [];
while ((om = objFontRe.exec(ascii))) {
  const body = om[2];
  if (!/\/Type\s*\/Font\b/.test(body)) continue;
  const tu = (body.match(/\/ToUnicode\s+(\d+)\s+0\s+R/) ?? [])[1];
  objFonts.push({ objNum: om[1], tu });
}
console.log(`\nfont objects with /ToUnicode (numbered): ${objFonts.length}`);
console.log(objFonts.slice(0, 18).map(o => `obj${o.objNum}→tu${o.tu}`).join("  "));
