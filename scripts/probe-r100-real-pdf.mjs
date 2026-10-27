// r100-real-pdf.mjs — run REAL downloaded PDFs through the extraction pipeline
// and report producer metadata, the ObjStm presence, and the extracted yield.
// The r100 queue's two candidates: the ObjStm/compressed-object form + a real
// Acrobat-produced PDF.
import { readFileSync } from "node:fs";
import { extractTextFromFile } from "../src/lib/cv-text.ts";

const paths = process.argv.slice(2);
for (const path of paths) {
  console.log(`\n=== ${path} ===`);
  let buf;
  try { buf = readFileSync(path); } catch (e) { console.log(" READ FAIL:", String(e).slice(0, 120)); continue; }
  const ascii = Buffer.from(buf).toString("latin1");

  for (const key of ["Producer", "Creator"]) {
    const m = ascii.match(new RegExp(`/${key}\\s*\\(([^)]*)\\)`));
    console.log(` ${key}: ${m ? m[1] : "(not found — may be compressed in an ObjStm)"}`);
  }
  console.log(" header:", JSON.stringify(ascii.slice(0, 16)));
  console.log(" ObjStm count:", (ascii.match(/\/ObjStm/g) ?? []).length);
  console.log(" XRef stream:", ascii.includes("/Type/XRef") || ascii.includes("/Type /XRef"));

  const file = new File([buf], "real.pdf", { type: "application/pdf" });
  const text = await extractTextFromFile(file);
  const alnum = text.replace(/[^A-Za-z0-9]/g, "");
  console.log(` extracted length: ${text.length} (alnum ${alnum.length})`);
  console.log(" first 200 chars:", JSON.stringify(text.slice(0, 200)));
}
