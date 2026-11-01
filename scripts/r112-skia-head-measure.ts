// r112-skia-head-measure.ts — the HEAD measurement on the Skia specimen.
// Usage: bun scripts/r112-skia-head-measure.ts
import { readFileSync } from "node:fs";

const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const raw = readFileSync("/tmp/skia-cv/john-smith-cv.pdf");
const text = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
const alnums = text.replace(/[^A-Za-z0-9]/g, "").length;
console.log(`HEAD alnums: ${alnums} (pdftotext 1553)`);
console.log("--- first 600 chars ---");
console.log(JSON.stringify(text.slice(0, 600)));
console.log("--- last 400 chars ---");
console.log(JSON.stringify(text.slice(-400)));
