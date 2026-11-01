// r116-corpus-verify.ts — session 116 / parity round 115: the corpus pins at
// the FINAL source. The R116-A line-move rule drifted five members (the
// r111/r115 re-pin precedent — every drift classified TOWARD pdftotext by
// the difflib-aligned separator classifier: 457 toward / 73 away, all 73 the
// ReportLab TOC phase-shift class documented in the remediation plan); the
// alnum pins ALL hold; QUARTZ + Prawn stay byte-identical.
// Usage: bun scripts/r116-corpus-verify.ts
import { readFileSync } from "node:fs";
import crypto from "node:crypto";

const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const members: [string, string, string, number][] = [
  // [path, name, extraction-md5-pin (8 hex), alnum pin]
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", "4358a2f1", 70646], // re-pinned r116 (was 051ac68a)
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx", "efc40f81", 61437], // re-pinned r116 (was 997b1521)
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", "09396ac8", 106179], // re-pinned r116 (was dc116383)
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS", "eeb0ce16", 5798], // re-pinned r116 (was 4166158e)
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ", "7c7e6529", 2697], // byte-identical through R116-A
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab", "31d88eec", 213160], // re-pinned r116 (was 397aa0c2)
  ["/tmp/r110-prawn-manual.pdf", "Prawn", "404277d9", 83657], // byte-identical through R116-A
];

let drift = 0;
for (const [p, n, pin, alnumPin] of members) {
  const raw = readFileSync(p);
  const t = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const md5 = crypto.createHash("md5").update(t).digest("hex").slice(0, 8);
  const alnums = t.replace(/[^A-Za-z0-9]/g, "").length;
  const ok = md5 === pin && alnums === alnumPin;
  if (!ok) drift++;
  console.log(`${n}: md5 ${md5} (pin ${pin}) alnums ${alnums} (pin ${alnumPin}) ${ok ? "PIN HOLDS" : "*** DRIFT ***"}`);
}
console.log(drift === 0 ? "ALL 7 CORPUS MEMBERS VERIFIED AT THE FINAL SOURCE" : `${drift} MEMBERS DRIFTED`);

// the Typst family (the hunt target) — the line-structure form pins
const typst: [string, string, number][] = [
  ["/tmp/typst-cv/resume.pdf", "Typst resume", 793],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2", 793],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter", 897],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2", 871],
];
let tdrift = 0;
for (const [p, n, pin] of typst) {
  const raw = readFileSync(p);
  const t = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const alnums = t.replace(/[^A-Za-z0-9]/g, "").length;
  const nls = (t.match(/\n/g) || []).length;
  const ok = alnums === pin && nls > 0 && !t.includes("\uFFFD");
  if (!ok) tdrift++;
  console.log(`${n}: alnums ${alnums} (pin ${pin}) newlines ${nls} ${ok ? "PIN HOLDS (line structure present)" : "*** DRIFT ***"}`);
}
console.log(tdrift === 0 ? "ALL 4 TYPST MEMBERS VERIFIED (the hunt target cured)" : `${tdrift} TYPST MEMBERS DRIFTED`);
