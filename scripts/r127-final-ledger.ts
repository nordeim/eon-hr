// r127-final-ledger.ts — the FINAL-SOURCE drift ledger + bx census on the
// live cured source (through the committed proto for bx — the D-120a sync
// arm) + the 16 family members. The expected state: 8 IDENTICAL + arXiv/
// IRS/ReportLab/Prawn at their NEW r127 pins (the cure's measured drift,
// zero away) + the 16 families EXACT + bx unchanged at 100.0% × 3.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import * as crypto from "node:crypto";
const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const proto = await import("/home/z/my-project/eon-hr/scripts/protos/cv-text-proto");
const md5 = (s: string) => crypto.createHash("md5").update(s).digest("hex").slice(0, 8);
const na = (s: string) => s.replace(/[^A-Za-z0-9]/g, "");

const members: Array<[string, string, string, number]> = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", "30da3b23", 70646],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx", "d70a708e", 61437],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", "9366f8a9", 106183],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS", "18a4a823", 5798],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ", "7c7e6529", 2697],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab", "adc22376", 213160],
  ["/tmp/r110-prawn-manual.pdf", "Prawn", "c4c4f6f8", 83657],
  ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint", "8afc1417", 782],
  ["/tmp/typst-cv/resume.pdf", "Typst resume", "7e3033d7", 793],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2", "d4c51041", 793],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter", "676f38ab", 897],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2", "74c60344", 871],
];

console.log("=== THE FINAL DRIFT LEDGER (the live source vs the r127 pins) ===");
for (const [p, n, pin, alnumPin] of members) {
  const raw = readFileSync(p);
  const t = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const cur = md5(t);
  const alnums = na(t).length;
  console.log(`${n}: ${cur} (pin ${pin}) ${cur === pin ? "IDENTICAL" : "*** DRIFT ***"} · alnums ${alnums} (pin ${alnumPin}) ${alnums === alnumPin ? "exact" : "*** ALNUM DRIFT ***"}`);
}

console.log("\n=== THE BX CENSUS (through the committed proto) ===");
for (const [p, n] of [["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"], ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"], ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"]] as [string, string][]) {
  (globalThis as any).__r119pages = [];
  const raw = readFileSync(p);
  await proto.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const decoded = ((globalThis as any).__r119pages ?? []).flat() as { p?: { px?: number; bx?: number } }[];
  let positioned = 0, withBx = 0;
  for (const d of decoded) {
    if (d.p?.px !== undefined) { positioned++; if (d.p.bx !== undefined) withBx++; }
  }
  console.log(`${n}: positioned ${positioned} | with bx ${withBx} (${(100 * withBx / positioned).toFixed(1)}%)`);
}

console.log("\n=== THE 16 FAMILY MEMBERS ===");
const fam: Array<[string, string]> = [
  ["/tmp/skia-cv/john-smith-cv.pdf", "Skia CV"], ["/tmp/skia-cv/variant-control.pdf", "Skia control"],
  ["/tmp/skia-cv/variant-floatlast.pdf", "Skia floatlast"], ["/tmp/skia-cv/variant-absolute.pdf", "Skia absolute"],
  ["/tmp/skia-cv/variant-twopage.pdf", "Skia twopage"], ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint CV"],
  ["/tmp/r113-writers/weasy-variant-control.pdf", "WeasyPrint control"], ["/tmp/r113-writers/weasy-variant-floatlast.pdf", "WeasyPrint floatlast"],
  ["/tmp/r113-writers/weasy-variant-absolute.pdf", "WeasyPrint absolute"], ["/tmp/r113-writers/weasy-variant-twopage.pdf", "WeasyPrint twopage"],
  ["/tmp/r113-writers/weasy-variant-display.pdf", "WeasyPrint letterspaced"], ["/tmp/r114-writers/fpdf-variant-control.pdf", "fpdf2 control"],
  ["/tmp/r114-writers/fpdf-variant-absolute.pdf", "fpdf2 dates"], ["/tmp/r114-writers/fpdf-variant-twopage.pdf", "fpdf2 twopage"],
  ["/tmp/r114-writers/fpdf-variant-letterspaced.pdf", "fpdf2 letterspaced"], ["/tmp/r114-writers/fpdf-variant-corefont.pdf", "fpdf2 core14"],
];
let badFam = 0;
for (const [p, n] of fam) {
  const raw = readFileSync(p);
  const t = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const ref = execSync(`pdftotext ${p} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
  const alnum = (s: string) => (s.match(/[A-Za-z0-9]/g) ?? []).join("");
  const ok = alnum(t).length === alnum(ref).length && !t.includes("\uFFFD");
  if (!ok) badFam++;
  console.log(`${n}: alnums ${alnum(t).length}/${alnum(ref).length} ${ok ? "EXACT" : "*** DRIFT ***"}`);
}
console.log(badFam === 0 ? "ALL 16 FAMILY MEMBERS EXACT" : `${badFam} MEMBERS DRIFTED`);
