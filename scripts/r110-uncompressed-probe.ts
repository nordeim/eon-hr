// r110-uncompressed-probe.ts — the NEW r110 queue item measured: does HEAD
// extract text from a content stream that declares NO /Filter at all (the
// uncompressed-content-stream watch — the no-/Filter leg documented at
// r109 but unexercised by the corpus)?
// A writer that emits plain text operators in a raw stream is the oldest
// PDF form (PDF 1.0/1.1 writers, hand-rolled PDFs, "uncompressed" exports).
// Usage: bun scripts/r110-uncompressed-probe.ts
import { extractTextFromFile } from "../src/lib/cv-text";

// the minimal uncompressed PDF: the content stream has NO /Filter key —
// its bytes ARE the content
const content =
  "BT /F1 12 Tf 20 700 Td (Uncompressed Writer Text) Tj ET\n" +
  "BT /F1 12 Tf 20 680 Td (payroll admin compliance training onboarding specialist platform systems technology) Tj ET\n";

const objects = [
  "<< /Type /Catalog /Pages 5 0 R >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  "<< /Font << /F1 2 0 R >> >>",
  `<< /Length ${content.length} >>\nstream\n${content}endstream`,
  "<< /Type /Pages /Kids [6 0 R] >>",
  "<< /Type /Page /Contents 4 0 R /Resources 3 0 R >>",
];

let pdf = "%PDF-1.1\n";
const offsets: number[] = [];
for (let i = 0; i < objects.length; i++) {
  offsets.push(pdf.length);
  pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
}
const xrefPos = pdf.length;
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (const o of offsets) pdf += `${String(o).padStart(10, "0")} 00000 n \n`;
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

const file = new File([new Uint8Array([...pdf].map((c) => c.charCodeAt(0)))], "uncompressed.pdf");
const text = await extractTextFromFile(file);
console.log("extracted:", JSON.stringify(text));
console.log(
  text.includes("Uncompressed Writer Text")
    ? "READS — the no-/Filter leg works at HEAD"
    : "DOES NOT READ — the uncompressed-content-stream defect is REAL at HEAD",
);
