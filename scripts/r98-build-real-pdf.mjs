// Build the r98 real multi-stream + octal-escape CV PDF for the live
// :3200 upload — the same two-stream shape as the unit/E2E fixtures.
import crypto from "node:crypto";
import fs from "node:fs";

async function deflate(s) {
  const zlib = new CompressionStream("deflate");
  return new Uint8Array(
    await new Response(new Blob([s]).stream().pipeThrough(zlib)).arrayBuffer()
  );
}
const enc = (s) => new TextEncoder().encode(s);

const content1 = "BT /F1 12 Tf [(Senior HR Administrator \\227 r\\351sum\\351, HRIS specialist)] TJ ET";
const content2 =
  "BT /F1 12 Tf [(HRIS administration, GOSI registration, payroll cycles, onboarding, and compliance reporting experience)] TJ ET";
const d1 = await deflate(content1);
const d2 = await deflate(content2);

const parts = [
  enc("%PDF-1.4\n"),
  enc("1 0 obj\n<< /Length " + d1.length + " >>\nstream\r\n"),
  d1,
  enc("\r\nendstream\r\nendobj\n"),
  enc("2 0 obj\n<< /Length " + d2.length + " >>\nstream\r\n"),
  d2,
  enc("\r\nendstream\r\nendobj\ntrailer\n<< /Root 3 0 R >>\n%%EOF"),
];
const total = parts.reduce((n, p) => n + p.length, 0);
const pdf = new Uint8Array(total);
let o = 0;
for (const p of parts) {
  pdf.set(p, o);
  o += p.length;
}
fs.writeFileSync("/tmp/r98-real-cv.pdf", pdf);
console.log(
  "wrote /tmp/r98-real-cv.pdf",
  pdf.length,
  "bytes md5=" + crypto.createHash("md5").update(pdf).digest("hex").slice(0, 8)
);
