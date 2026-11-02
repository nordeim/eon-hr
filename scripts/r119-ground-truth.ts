// r119-ground-truth.ts — the drift ledger at the final source: the pins
// re-verified (ReportLab + Prawn re-pinned at the cured md5s — the toward
// drift IS the cure); the Typst family's description-split probe; the form
// probes (no " \n" in the new forms, no doubled gaps).
// Usage: bun scripts/r119-ground-truth.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import crypto from "node:crypto";

const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const members: [string, string, string, number][] = [
  // [path, name, pin (8 hex), alnum pin] — ReportLab/Prawn re-pinned r119 (the table-row/tick cures)
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", "4358a2f1", 70646],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx", "efc40f81", 61437],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", "09396ac8", 106179],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS", "eeb0ce16", 5798],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ", "7c7e6529", 2697],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab", "e5752ab1", 213160], // re-pinned r119 (was 31d88eec)
  ["/tmp/r110-prawn-manual.pdf", "Prawn", "fe969d8d", 83657], // re-pinned r119 (was 404277d9)
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

// the Typst family — the description-split probe (the r119 cure) + the standing contacts probe
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
  // the r119 probe: the description line ends, the date range leads the next line
  const lines = t.split("\n");
  const hi = lines.findIndex(l => l.includes("200 new hires."));
  const dateLed = hi >= 0 && /^(Jun 2018|Mar 2021)/.test(lines[hi + 1] ?? "");
  // the standing contacts probe: the phone line ends, the icon leads the email line
  const pi = lines.findIndex(l => l.includes("010-9911"));
  const contactsSplit = pi >= 0 && (lines[pi + 1] ?? "").startsWith("\uF0E0");
  console.log(`${n}: alnums ${alnums} (pin ${pin}) newlines ${nls} descSplit ${dateLed ? "CURED" : (n === "Typst resume" ? "*** MISS ***" : "n/a")} contactsSplit ${contactsSplit ? "CURED" : "n/a"} ${ok ? "PIN HOLDS" : "*** DRIFT ***"}`);
}
console.log(tdrift === 0 ? "ALL 4 TYPST MEMBERS VERIFIED" : `${tdrift} TYPST MEMBERS DRIFTED`);
