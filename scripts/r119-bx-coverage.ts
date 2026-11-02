import { readFileSync } from "node:fs";
const mod = await import("/tmp/r119-proto/cv-text");
type S = { px?: number; py?: number; ps?: number; bx?: number };
type P = { p?: S; text: string };
const members: [string, string][] = [
  ["/tmp/typst-cv/resume.pdf", "Typst resume"],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
  ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint"],
  ["/tmp/r114-writers/fpdf-variant-control.pdf", "fpdf2"],
  ["/tmp/skia-cv/john-smith-cv.pdf", "Skia CV"],
];
for (const [path, name] of members) {
  (globalThis as any).__r119pages = [];
  const raw = readFileSync(path);
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const decoded = ((globalThis as any).__r119pages ?? []).flat() as P[];
  let positioned = 0, withBx = 0;
  for (const p of decoded) {
    if (p.p?.px !== undefined) { positioned++; if (p.p.bx !== undefined) withBx++; }
  }
  console.log(`${name}: ${decoded.length} pieces | positioned ${positioned} | with bx ${withBx} (${positioned ? (100 * withBx / positioned).toFixed(1) : 0}%)`);
}
