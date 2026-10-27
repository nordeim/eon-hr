// probe-r101-extract.mjs — run the current extractor over the real files and
// report yield + samples (the r100-real-pdf pattern, minus the census).
import { readFileSync } from "node:fs";
import { extractTextFromFile } from "../src/lib/cv-text.ts";

const paths = process.argv.slice(2);
for (const path of paths) {
  console.log(`\n=== ${path} ===`);
  let buf;
  try { buf = readFileSync(path); } catch (e) { console.log(" READ FAIL:", String(e).slice(0, 120)); continue; }
  const file = new File([buf], "real.pdf", { type: "application/pdf" });
  const text = await extractTextFromFile(file);
  const alnum = text.replace(/[^A-Za-z0-9]/g, "");
  console.log(` extracted length: ${text.length} (alnum ${alnum.length})`);
  console.log(" first 300:", JSON.stringify(text.slice(0, 300)));
  // letter-soup detector: single letters followed by spaces in runs
  const soup = text.match(/\b[A-Za-z] [A-Za-z] [A-Za-z] /g);
  console.log(` letter-soup runs (x y z ): ${soup ? soup.length : 0}`);
  // fused-word detector: 24+ char words
  const fused = text.match(/[A-Za-z]{25,}/g);
  console.log(` fused 25+ char words: ${fused ? fused.length : 0}${fused ? " e.g. " + JSON.stringify(fused.slice(0, 3)) : ""}`);
}
