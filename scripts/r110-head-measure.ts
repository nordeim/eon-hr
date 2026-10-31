// r110-head-measure.ts — the HEAD measurement on the Prawn manual (the
// 15th-writer specimen): our extractor vs pdftotext.
// Usage: bun scripts/r110-head-measure.ts
import { readFileSync } from "node:fs";
import { extractTextFromFile } from "../src/lib/cv-text";

const raw = readFileSync("/tmp/r110-prawn-manual.pdf");
const text = await extractTextFromFile(new File([new Uint8Array(raw)], "prawn.pdf"));
const alnums = text.replace(/[^A-Za-z0-9]/g, "").length;
console.log("our extraction chars:", text.length, "alnums:", alnums);
console.log("pdftotext alnums: 83632");
console.log(
  alnums === 0
    ? "TOTAL FAILURE — zero characters"
    : `partial: ${(alnums / 83632 * 100).toFixed(2)}% of pdftotext`,
);
// a text probe: prawn's manual text members
for (const probe of ["Prawn", "Document", "Table"]) {
  console.log(`contains "${probe}":`, text.includes(probe));
}
