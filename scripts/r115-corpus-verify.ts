// r115-corpus-verify.ts — session 115 / parity round 114: the re-sourced
// corpus verified at HEAD before any change (the standing discipline). The
// seven re-sourceable members with their extraction pins; the LO Calc
// member could not be re-sourced this round (the LibreOffice docs site
// restructured; the documented r103 precedent — the unit net's writer-form
// pins carry it). The generated families (Typst/Skia/WeasyPrint/fpdf2)
// regenerate separately below.
// Usage: bun scripts/r115-corpus-verify.ts
import { readFileSync } from "node:fs";
import crypto from "node:crypto";

const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const members: [string, string, string, number][] = [
  // [path, name, extraction-md5-pin (8 hex), alnum pin]
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", "4d55b9e8", 70646],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx", "997b1521", 61437],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", "dc116383", 106179],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS", "3b8da084", 5798],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ", "7c7e6529", 2697],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab", "155ca508", 213160],
  ["/tmp/r110-prawn-manual.pdf", "Prawn", "82da488f", 83657],
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
console.log(drift === 0 ? "ALL 7 RE-SOURCED MEMBERS VERIFIED AT HEAD" : `${drift} MEMBERS DRIFTED`);
