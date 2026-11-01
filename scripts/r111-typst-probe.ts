// r111-typst-probe.ts — the HEAD measurement of the Typst specimen (the
// 16th-writer candidate): our extractor vs pdftotext. Variable-path import
// (the R108-A lesson — a literal .ts extension breaks tsc TS5097).
// Usage: bun scripts/r111-typst-probe.ts
import { readFileSync } from "node:fs";

const modPath = process.argv[2] ?? "/home/z/my-project/eon-hr/src/lib/cv-text";
const mod = await import(modPath);

const files: [string, string][] = [
  ["/tmp/typst-cv/resume.pdf", "Typst modern-cv resume"],
  ["/tmp/typst-cv/resume2.pdf", "Typst modern-cv resume2"],
  ["/tmp/typst-cv/coverletter.pdf", "Typst modern-cv coverletter"],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst modern-cv coverletter2"],
];

for (const [path, name] of files) {
  try {
    const raw = readFileSync(path);
    const ours = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "probe.pdf"));
    const alnums = (s: string) => (s.match(/[A-Za-z0-9]/g) ?? []).length;
    console.log(`\n===== ${name} =====`);
    console.log(`ours: ${ours.length} chars, ${alnums(ours)} alnums`);
    console.log(`sample:`, JSON.stringify(ours.slice(0, 240)));
    const fffd = (ours.match(/\uFFFD/g) ?? []).length;
    console.log(`U+FFFD count: ${fffd}`);
  } catch (e) {
    console.log(`\n===== ${name} =====`);
    console.log(`EXTRACTION THREW or file missing:`, String(e).slice(0, 120));
  }
}
