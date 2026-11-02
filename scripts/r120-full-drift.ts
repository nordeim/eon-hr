// r120-full-drift.ts — the candidate's full-corpus drift ledger: every
// member's HEAD output vs the CANDIDATE (/tmp/r120-proto) vs pdftotext,
// with the toward/away classification per changed hunk (the r116/r119
// discipline — the difflib-aligned word-stream classifier). NOTHING may
// drift away from pdftotext.
// Usage: bun scripts/r120-full-drift.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import crypto from "node:crypto";

const cand = await import("./protos/cv-text-proto");
const head = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const md5 = (s: string) => crypto.createHash("md5").update(s).digest("hex").slice(0, 8);
const na = (s: string) => s.replace(/[^A-Za-z0-9]/g, "");

const members: [string, string, string][] = [
  // [path, name, HEAD pin md5]
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", "4358a2f1"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx", "efc40f81"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", "09396ac8"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS", "eeb0ce16"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ", "7c7e6529"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab", "e5752ab1"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn", "fe969d8d"],
  ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint", "—"],
  ["/tmp/typst-cv/resume.pdf", "Typst resume", "—"],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2", "—"],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter", "—"],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2", "—"],
];

// NOTE: the toward/away CLASSIFIER lives in scripts/r120-toward-away.py
// (the r116 difflib discipline — sequence-aligned word streams); this
// script prints the raw md5/alnum drift ledger only.

for (const [p, n, pin] of members) {
  const raw = readFileSync(p);
  const file = new File([new Uint8Array(raw)], "m.pdf");
  const h = await head.extractTextFromFile(file);
  const c = await cand.extractTextFromFile(file);
  const ref = execSync(`pdftotext ${p} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
  const hm = md5(h), cm = md5(c);
  const naH = na(h).length, naC = na(c).length, naR = na(ref).length;
  if (h === c) {
    console.log(`${n}: IDENTICAL (md5 ${hm}${pin !== "—" ? ` pin ${pin}` : ""}) alnums ${naC}/${naR}`);
    continue;
  }
  console.log(`${n}: DRIFT ${hm} -> ${cm} | alnums ${naH}->${naC} (ref ${naR})`);
}
