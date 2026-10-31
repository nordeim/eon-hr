// r110-blast-radius.ts — the R110-A prototype measured against the 15th-writer
// Prawn manual AND the 7 standing corpus members (the blast radius: every
// member's output must stay BYTE-IDENTICAL to HEAD's — the pins are HEAD's
// outputs; the modules ride the variable-path import per the R108-A lesson —
// invisible to the static resolver).
// Usage: bun scripts/r110-blast-radius.ts
import { readFileSync } from "node:fs";

const headMod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
// the R108-A lesson: a literal .ts-extension import breaks tsc/build on
// any tree without the file — the variable-path form is invisible to the
// static resolver, resolved at runtime
const protoPath = process.argv[2] ?? "/home/z/my-project/eon-hr/src/lib/cv-text";
const protoMod = await import(protoPath);
const head: (f: File) => Promise<string> = headMod.extractTextFromFile;
const proto: (f: File) => Promise<string> = protoMod.extractTextFromFile;

const members: [string, string][] = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "PRAWN (15th)"],
];

for (const [p, n] of members) {
  const raw = readFileSync(p);
  const file = new File([new Uint8Array(raw)], "m.pdf");
  const [h, pr] = [await head(file), await proto(file)];
  const ha = h.replace(/[^A-Za-z0-9]/g, "").length;
  const pa = pr.replace(/[^A-Za-z0-9]/g, "").length;
  const identical = h === pr ? "BYTE-IDENTICAL to HEAD" : "*** DIFFERS from HEAD ***";
  console.log(`${n}: HEAD alnums=${ha} | proto alnums=${pa} — ${identical}`);
  if (h !== pr && n === "PRAWN (15th)") {
    // expected: the new member — report the ratio vs pdftotext
    console.log(`  PRAWN proto/pdftotext = ${(pa / 83632 * 100).toFixed(2)}% (pdftotext 83,632)`);
  }
}

