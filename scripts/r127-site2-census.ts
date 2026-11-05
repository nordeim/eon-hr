// r127-site2-census.ts — THE FIRE-SEPARATION CENSUS (the opSeq-instrumented
// proto): every piece boundary with sep=" " that is a SEPARATE-SHOW-OP join
// (cur.op !== prev.op — no positioning op between the two shows, the pen
// continues) vs the TJ-internal no-number join (same op — the W3C dummy.pdf
// pin). For each site-2 boundary: the texts, the fonts (a font switch is the
// matplotlib signature), and what pdftotext reads there.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
const PATCHED = "/tmp/r127-opseq-proto.ts";
const mod = await import(PATCHED);

const members: Array<[string, string]> = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
  ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint"],
  ["/tmp/typst-cv/resume.pdf", "Typst resume"],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2"],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter"],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2"],
];

for (const [p, n] of members) {
  const raw = readFileSync(p);
  (globalThis as any).__r118pieces = [];
  (globalThis as any).__r119pages = [];
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const pieces = ((globalThis as any).__r118pieces ?? []) as Array<Record<string, any>>;
  let tjInternal = 0, site2 = 0, backstep = 0;
  const samples: string[] = [];
  for (let i = 1; i < pieces.length; i++) {
    const prev = pieces[i - 1], cur = pieces[i];
    if (cur.sep !== " " || cur.condGap || cur.kv !== undefined) continue;
    if (cur.op === prev.op) { tjInternal++; continue; }
    if (cur.moved === false) {
      site2++;
      if (samples.length < 10) {
        samples.push(`${JSON.stringify((prev.text ?? "").slice(0, 24))}[${prev.font}] | ${JSON.stringify((cur.text ?? "").slice(0, 24))}[${cur.font}]`);
      }
    } else if (cur.backward === true) backstep++;
  }
  console.log(`${n}: TJ-internal-no-number joins ${tjInternal} · SITE-2 (separate shows, NO positioning) ${site2} · backstep-moved ${backstep}`);
  for (const s of samples) console.log(`    ${s}`);
}
