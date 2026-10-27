// r99-build-real-pdf.mjs — the live-verify fixture: a real-shaped PDF that
// exercises BOTH new paths at once — the space+CRLF stream delimiters
// (R99-A) AND hex-string text mapped through a trailing bfchar ToUnicode
// CMap (R99-B, the W3C dummy.pdf writer shape). The mapped vocabulary
// carries the System Admin job's keywords so the analysis score is nonzero.
import { writeFileSync } from "node:fs";

const body =
  "Senior HR Technology Specialist with HRIS administration, GOSI registration, payroll cycles, onboarding, and compliance reporting experience";
const glyphFor = {};
const codes = [];
for (const ch of body) {
  if (ch === " ") { codes.push("05"); continue; }
  let code = Object.keys(glyphFor).find((k) => glyphFor[k] === ch);
  if (!code) {
    code = (0x10 + Object.keys(glyphFor).length).toString(16).padStart(2, "0");
    glyphFor[code] = ch;
  }
  codes.push(code);
}
const cmapLines = Object.entries(glyphFor)
  .map(([c, ch]) => `<${c}> <${ch.charCodeAt(0).toString(16).padStart(4, "0").toUpperCase()}>`)
  .join("\n");
const cmap = [
  "/CIDInit/ProcSet findresource begin\n12 dict begin\nbegincmap",
  "/CIDSystemInfo<< /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def",
  "/CMapName/Adobe-Identity-UCS def\n/CMapType 2 def",
  "1 begincodespacerange\n<00> <FF>\nendcodespacerange",
  `${Object.keys(glyphFor).length + 1} beginbfchar`,
  `<05> <0020>\n${cmapLines}`,
  "endbfchar\nendcmap\nend",
].join("\n");

const deflate = async (s) => {
  const zlib = new CompressionStream("deflate");
  return new Uint8Array(await new Response(new Blob([s]).stream().pipeThrough(zlib)).arrayBuffer());
};
const enc = (s) => new TextEncoder().encode(s);

const d1 = await deflate(`BT /F1 12 Tf <${codes.join("")}> Tj ET`);
const d2 = await deflate(cmap);
const parts = [
  enc("1 0 obj\n<< /Length " + d1.length + " >>\nstream \r\n"), // the SPACE delimiter (R99-A)
  d1,
  enc("\r\nendstream\r\nendobj\n"),
  enc("2 0 obj\n<< /Length " + d2.length + " >>\nstream \r\n"), // the CMap stream, also space-delimited
  d2,
  enc("\r\nendstream\r\nendobj\ntrailer\n<< /Root 3 0 R >>\n%%EOF"),
];
const total = parts.reduce((n, p) => n + p.length, 0);
const pdf = new Uint8Array(total);
let o = 0;
for (const p of parts) { pdf.set(p, o); o += p.length; }
writeFileSync("/tmp/r99-real-cv.pdf", pdf);
console.log("built /tmp/r99-real-cv.pdf:", total, "bytes");
