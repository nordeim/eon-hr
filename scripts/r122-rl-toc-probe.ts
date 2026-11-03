// r122-rl-toc-probe.ts — the hunt measurement: the ReportLab TOC dot-order
// divergence (the r122 queue's named class). Extracts the TOC page region
// with the HEAD extractor and prints the raw piece stream around the first
// TOC entries, side-by-side with the pdftotext ground truth.
// Usage: bun scripts/r122-rl-toc-probe.ts
import { readFileSync } from "node:fs";

const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");

const raw = readFileSync("/tmp/r109-corpus/rl-userguide.pdf");
const file = new File([new Uint8Array(raw)], "m.pdf");
const text = await mod.extractTextFromFile(file);

// Locate the TOC region in our extraction ("1.1 About this document")
const idx = text.indexOf("1.1 About this document");
console.log("=== OUR EXTRACTION (TOC region) ===");
console.log(JSON.stringify(text.slice(idx - 200, idx + 400)));

// The pdftotext ground truth for the same region
const pdft = readFileSync("/tmp/r122/rl-pdftotext.txt", "utf8");
const pidx = pdft.indexOf("1.1 About this document");
console.log("\n=== PDFTOTEXT (TOC region) ===");
console.log(JSON.stringify(pdft.slice(pidx - 100, pidx + 300)));
