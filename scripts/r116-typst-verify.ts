// r116-typst-verify.ts — session 116 / parity round 115: the Typst family
// re-verified at HEAD after regeneration, PLUS the r116 hunt measurement:
// the cm-carried LINE-STRUCTURE class (the Typst `cm` translations never
// feed the separator tracker — the line structure reads space-joined where
// pdftotext reads newlines). This script quantifies the line-structure
// delta member by member: our newline count vs pdftotext's, and the exact
// positions where pdftotext reads "\n" and we read " ".
// Usage: bun scripts/r116-typst-verify.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const na = (s: string) => s.replace(/[^A-Za-z0-9]/g, "");
const dbl = (s: string) => (s.match(/\S  +\S/g) || []).length;

console.log("=== THE TYPST FAMILY — extraction + the LINE-STRUCTURE measurement ===");
const typst: [string, string, number][] = [
  ["/tmp/typst-cv/resume.pdf", "Typst resume", 793],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2", 793],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter", 897],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2", 871],
];
for (const [p, n, pin] of typst) {
  const raw = readFileSync(p);
  const ours = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const ref = execSync(`pdftotext ${p} -`, { encoding: "utf8" });
  const ok = na(ours).length === pin && na(ours).length === na(ref).length;
  const ourNl = (ours.match(/\n/g) || []).length;
  const refNl = (ref.match(/\n/g) || []).length;
  console.log(`${n}: ours ${na(ours).length} (pin ${pin}) pdftotext ${na(ref).length} — ${ok ? "100.00%" : "*** DRIFT ***"} | dbl ours ${dbl(ours)} ref ${dbl(ref)} | NEWLINES ours ${ourNl} ref ${refNl} ${ourNl < refNl ? "← THE LINE-STRUCTURE DEFECT" : ""}`);
}

// the line-structure delta on the resume — where does pdftotext read \n and we read " "?
{
  const p = "/tmp/typst-cv/resume.pdf";
  const raw = readFileSync(p);
  const ours = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const ref = execSync(`pdftotext ${p} -`, { encoding: "utf8" });
  // word-stream diff: every word pair that pdftotext separates with \n and we with " "
  const ourWords = ours.split(/\s+/).filter(Boolean);
  const refWords = ref.split(/\s+/).filter(Boolean);
  console.log(`\nword streams: ours ${ourWords.length} ref ${refWords.length} ${ourWords.length === refWords.length ? "EQUAL" : "*** DIVERGE ***"}`);
  // reconstruct the separator pdftotext put between consecutive word pairs
  const refSep = new Map<string, string[]>();
  for (let i = 0; i + 1 < refWords.length; i++) {
    const k = refWords[i] + "\u0000" + refWords[i + 1];
    // find what's actually between them in the ref text
    const i1 = ref.indexOf(refWords[i]);
    const between = ref.slice(i1 + refWords[i].length, i1 + refWords[i].length + 40).split(/\S/)[0];
    if (!refSep.has(k)) refSep.set(k, []);
    refSep.get(k)!.push(between.replace(/\n/g, "\\n"));
  }
  const mismatch: string[] = [];
  for (let i = 0; i + 1 < ourWords.length; i++) {
    const k = ourWords[i] + "\u0000" + ourWords[i + 1];
    const rs = refSep.get(k);
    if (rs && rs[0].includes("\\n")) {
      // pdftotext reads a newline here; what do we read?
      const i1 = ours.indexOf(ourWords[i]);
      const between = ours.slice(i1 + ourWords[i].length, i1 + ourWords[i].length + 40).split(/\S/)[0];
      if (!between.includes("\n")) mismatch.push(`${ourWords[i]} [${between.replace(/\n/g, "\\n") || "∅"}] ${ourWords[i + 1]}  (pdftotext: ${rs[0]})`);
    }
  }
  console.log(`\nline-structure mismatches (pdftotext \\n, ours space): ${mismatch.length}`);
  for (const m of mismatch.slice(0, 25)) console.log("  " + m);
  console.log("\n--- ours (first 400) ---\n" + ours.slice(0, 400));
  console.log("\n--- pdftotext (first 400) ---\n" + ref.slice(0, 400));
}
