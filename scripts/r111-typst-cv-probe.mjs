// r111-typst-cv-probe.mjs — build the Typst-shaped CV probe PDF for the
// live UI verify: octal-escaped literal codes under a lowercase /f0
// binding + a raw nested paren in a TJ array (reads EMPTY at HEAD).
// Usage: node scripts/r111-typst-cv-probe.mjs
import { writeFileSync } from "node:fs";

const PHRASE = "JohnSmithSeniorHRManagerPayrollGOSIComplianceOnboardingTypstProbe";
const codeFor = (i) => (i + 1 >= 40 ? i + 3 : i + 1); // skip paren bytes in the plain run
const pairs = [...PHRASE]
  .map((c, i) => `<${codeFor(i).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`)
  .join("\n");
const cmap =
  "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
  `${PHRASE.length} beginbfchar\n${pairs}\nendbfchar\nendcmap\n`;
const octalLiteral = [...PHRASE].map((_, i) => `\\000\\${codeFor(i).toString(8).padStart(3, "0")}`).join("");
// the nested-paren member: the phrase "Ma(nager)" carries a raw paren pair
const nestedAtom = "Senior HR Ma(nager) with payroll, GOSI, onboarding, and compliance skills";

async function flate(str) {
  const zlib = new CompressionStream("deflate");
  return new Uint8Array(await new Response(new Blob([str]).stream().pipeThrough(zlib)).arrayBuffer());
}
const encS = (s) => new TextEncoder().encode(s);
const encL = (s) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

const objects = [
  { raw: "<< /Type /Catalog /Pages 8 0 R >>" },
  { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /AAAAAA+Libertinus /Encoding /Identity-H /ToUnicode 3 0 R >>" },
  { dict: "/Filter /FlateDecode", stream: cmap },
  { raw: "<< /Font << /f0 2 0 R >> >>" },
  { dict: "/Filter /FlateDecode", stream: `BT /f0 12 Tf (${octalLiteral}) Tj ET` },
  { dict: "/Filter /FlateDecode", stream: `BT /f0 12 Tf [(${nestedAtom}) -7 (with Typst payroll, GOSI, onboarding, and compliance skills)] TJ ET` },
  { raw: "<< /Type /Pages /Kids [9 0 R] >>" },
  { raw: "<< /Type /Page /Contents 5 0 R /Resources 4 0 R >>" },
  { raw: "<< /Type /Page /Contents 6 0 R /Resources 4 0 R >>" },
];

const parts = [];
for (let i = 0; i < objects.length; i++) {
  const obj = objects[i];
  if ("raw" in obj) parts.push(encS(`${i + 1} 0 obj\n${obj.raw}\nendobj\n`));
  else {
    const deflated = await flate(encL(obj.stream));
    parts.push(encS(`${i + 1} 0 obj\n<< ${obj.dict} /Length ${deflated.length} >>\nstream\r\n`));
    parts.push(deflated);
    parts.push(encS("\r\nendstream\nendobj\n"));
  }
}
parts.push(encS("trailer\n<< /Root 1 0 R >>\n%%EOF"));
const total = parts.reduce((n, p) => n + p.length, 0);
const pdf = new Uint8Array(total);
let o = 0;
for (const p of parts) { pdf.set(p, o); o += p.length; }
writeFileSync("/tmp/r111-typst-probe.pdf", pdf);
console.log("probe written:", total, "bytes → /tmp/r111-typst-probe.pdf");

// self-check runs via bun (scripts/r111-probe-selfcheck)
