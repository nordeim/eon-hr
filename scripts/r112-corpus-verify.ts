// r112-corpus-verify.ts — the re-sourced corpus verified at HEAD (the
// standing pins after the session-111 close: arXiv RE-PINNED at 70,646 —
// the documented R111-A improvement; the four Typst members pinned at
// pdftotext-exact; Prawn's is our own 100.03%-of-pdftotext reading).
// Usage: bun scripts/r112-corpus-verify.ts
import { readFileSync } from "node:fs";

const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const members: [string, string, number][] = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", 70646],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx", 61437],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", 106179],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS", 5798],
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc", 695014],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ", 2697],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab", 213160],
  ["/tmp/r110-prawn-manual.pdf", "Prawn", 83657],
  ["/tmp/typst-cv/resume.pdf", "Typst resume", 2422],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2", 2013],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter", 1872],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2", 2083],
];

for (const [p, n, pin] of members) {
  const raw = readFileSync(p);
  const text = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const alnums = text.replace(/[^A-Za-z0-9]/g, "").length;
  console.log(`${n}: ${alnums} (pin ${pin}) ${alnums === pin ? "PIN HOLDS" : "*** PIN DRIFT ***"}`);
}
