// r111-blast-radius.ts — the R111 prototype (A+B+C) measured against the
// 16th-writer Typst specimens AND the 8 standing corpus members (the blast
// radius: every standing member's output must stay BYTE-IDENTICAL to
// HEAD's). Variable-path imports per the R108-A lesson.
// Usage: bun scripts/r111-blast-radius.ts [protoPath]
import { readFileSync } from "node:fs";

const headMod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const protoPath = process.argv[2] ?? "/tmp/r111-proto-cv-text.ts";
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
  ["/tmp/typst-cv/resume.pdf", "TYPST resume (16th)"],
  ["/tmp/typst-cv/resume2.pdf", "TYPST resume2 (16th)"],
  ["/tmp/typst-cv/coverletter.pdf", "TYPST coverletter (16th)"],
  ["/tmp/typst-cv/coverletter2.pdf", "TYPST coverletter2 (16th)"],
];

for (const [p, n] of members) {
  const raw = readFileSync(p);
  const file = () => new File([new Uint8Array(raw)], "m.pdf");
  const [h, pr] = [await head(file()), await proto(file())];
  const ha = h.replace(/[^A-Za-z0-9]/g, "").length;
  const pa = pr.replace(/[^A-Za-z0-9]/g, "").length;
  const identical = h === pr ? "BYTE-IDENTICAL to HEAD" : "*** DIFFERS from HEAD ***";
  console.log(`${n}: HEAD alnums=${ha} | proto alnums=${pa} — ${identical}`);
  if (h !== pr) {
    // show the first divergence
    let i = 0;
    while (i < Math.min(h.length, pr.length) && h[i] === pr[i]) i++;
    console.log(`  first divergence at ${i}:`);
    console.log(`    HEAD : ${JSON.stringify(h.slice(Math.max(0, i - 40), i + 40))}`);
    console.log(`    proto: ${JSON.stringify(pr.slice(Math.max(0, i - 40), i + 40))}`);
  }
}
