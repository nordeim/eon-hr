// the full-text byte-level blast radius: HEAD~ (git stash) vs the final source
import { readFileSync } from "node:fs";
import crypto from "node:crypto";
const modPath = process.argv[2] ?? "/home/z/my-project/eon-hr/src/lib/cv-text";
const mod = await import(modPath);
const members: [string, string][] = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
  ["/tmp/typst-cv/resume.pdf", "Typst resume"],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2"],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter"],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2"],
  ["/tmp/skia-cv/john-smith-cv.pdf", "Skia resume"],
  ["/tmp/skia-cv/variant-floatlast.pdf", "Skia floatlast"],
  ["/tmp/skia-cv/variant-absolute.pdf", "Skia absolute"],
  ["/tmp/skia-cv/variant-control.pdf", "Skia control"],
  ["/tmp/skia-cv/variant-twopage.pdf", "Skia twopage"],
];
for (const [p, n] of members) {
  const raw = readFileSync(p);
  const t = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  console.log(`${n}: ${crypto.createHash("md5").update(t).digest("hex").slice(0, 8)}`);
}
