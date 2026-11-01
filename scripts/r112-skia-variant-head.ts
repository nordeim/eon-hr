// r112-skia-variant-head.ts — HEAD extraction of the variants (where do
// the hoisted boxes land in OUR output vs pdftotext?).
// Usage: bun scripts/r112-skia-variant-head.ts
import { readFileSync } from "node:fs";

const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
for (const v of ["control", "floatlast", "absolute", "twopage"]) {
  const raw = readFileSync(`/tmp/skia-cv/variant-${v}.pdf`);
  const text = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  console.log(`\n===== variant-${v} (HEAD, first 260 chars) =====`);
  console.log(JSON.stringify(text.slice(0, 260)));
  const tag = v === "floatlast" ? "Jan 2020 - Dec 2024" : v === "absolute" ? "ABS-TAG-99" : v === "twopage" ? "PG1-FLOAT" : null;
  if (tag) {
    const pos = text.indexOf(tag);
    console.log(`tag '${tag}' at char ${pos} (first-para '${text.slice(0, 40).replace(/\n/g, "|")}')`);
  }
}
