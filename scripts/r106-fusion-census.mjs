// r106-fusion-census.mjs — session 106: the fused-run + wrong-font-theft
// census on the current extractions (the r103 metric: runs of 25+ chars
// without a space; plus the homoglyph count) — scopes the two-pass width
// table item against the real files at hand.
// Usage: node scripts/r106-fusion-census.mjs <file.pdf> [file2.pdf...]
import { readFileSync } from "node:fs";

const { extractTextFromFile } = await import("../src/lib/cv-text.ts");
const FileCls = (await import("node:buffer")).File;

for (const path of process.argv.slice(2)) {
  const bytes = readFileSync(path);
  const file = new FileCls([new Uint8Array(bytes)], path.split("/").pop(), { type: "application/pdf" });
  const text = await extractTextFromFile(file);
  const alnums = text.replace(/[^A-Za-z0-9]/g, "").length;
  const runs = text.split(/\s+/).filter((w) => w.length >= 25);
  const homoglyphs = (text.match(/[\u0530-\u058F\u018E\u018F]/g) ?? []).length;
  console.log(`=== ${path.split("/").pop()} ===`);
  console.log(`  alnums: ${alnums} | fused 25+ runs: ${runs.length} | Armenian/Ǝ chars: ${homoglyphs}`);
  for (const r of runs.slice(0, 6)) console.log(`    fused: ${JSON.stringify(r.slice(0, 70))}`);
  // the word-integrity spot sample: a few known words
  for (const probe of ["selection", "documentation", "introduction", "options", "package"]) {
    const hits = (text.match(new RegExp(`\\b${probe}\\b`, "g")) ?? []).length;
    console.log(`  word "${probe}": ${hits} whole-word hits`);
  }
}
process.exit(0);
