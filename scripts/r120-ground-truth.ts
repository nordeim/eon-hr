// r120-ground-truth.ts — the real-file ground truth at the final source:
// the pins re-verified with arXiv/dvipdfmx/fontspec RE-PINNED at the cured
// md5s (the toward drift IS the cure — the width-blind elimination); the
// Typst family probes; the alnum preservation exact.
// Usage: bun scripts/r120-ground-truth.ts
import { readFileSync } from "node:fs";
import crypto from "node:crypto";

const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const members: [string, string, string, number][] = [
  // [path, name, pin (8 hex), alnum pin] — arXiv/dvipdfmx/fontspec re-pinned r120 (the un-blind cures)
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", "6aa0c41b", 70646],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx", "d70a708e", 61437],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", "8ecdda5e", 106179],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS", "eeb0ce16", 5798],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ", "7c7e6529", 2697],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab", "e5752ab1", 213160],
  ["/tmp/r110-prawn-manual.pdf", "Prawn", "fe969d8d", 83657],
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
  const lines = t.split("\n");
  const hi = lines.findIndex(l => l.includes("200 new hires."));
  const dateLed = hi >= 0 && /^(Jun 2018|Mar 2021)/.test(lines[hi + 1] ?? "");
  const pi = lines.findIndex(l => l.includes("010-9911"));
  const contactsSplit = pi >= 0 && (lines[pi + 1] ?? "").startsWith("\uF0E0");
  console.log(`${n}: alnums ${alnums} (pin ${pin}) newlines ${nls} descSplit ${dateLed ? "CURED" : (n === "Typst resume" ? "*** MISS ***" : "n/a")} contactsSplit ${contactsSplit ? "CURED" : "n/a"} ${ok ? "PIN HOLDS" : "*** DRIFT ***"}`);
}
console.log(tdrift === 0 ? "ALL 4 TYPST MEMBERS VERIFIED" : `${tdrift} TYPST MEMBERS DRIFTED`);
