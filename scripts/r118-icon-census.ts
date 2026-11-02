// r118-icon-census.ts — THE ICON-ANCHORED BLAST-RADIUS CENSUS. Population:
// every same-baseline BLOCK-boundary pair (stamped, different origins,
// |Δpy| < 0.5·max(ps), left bx defined) whose RIGHT block contains ZERO
// alphanumeric characters (the icon/symbol class: PUA glyphs, bullets,
// dashes, currency, dot runs) and gapEm = (right.px − left.bx)/max(ps) in
// [0.4, 13). Verdict: pdftotext's line membership via -bbox-layout (the
// right block's first word vs the left block's last word — same line =>
// JOIN, different line => SPLIT). This is the fire surface of the
// candidate R118-A rule, measured before any code.
// Usage: bun scripts/r118-icon-census.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("./protos/cv-text-proto");
type P = { text: string; px?: number; py?: number; ps?: number; bx?: number; sep?: string; genuine?: boolean; font?: string; condGap?: boolean; condKern?: boolean };
const piecesOf = async (path: string): Promise<P[]> => {
  (globalThis as unknown as { __r118pieces: P[] }).__r118pieces = [];
  const raw = readFileSync(path);
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  return (globalThis as unknown as { __r118pieces: P[] }).__r118pieces;
};

type W = { text: string; x0: number; y0: number; x1: number; y1: number; page: number; line: number };
function layoutWords(path: string): W[] {
  const xml = execSync(`pdftotext -bbox-layout ${path} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }).toString();
  const out: W[] = [];
  let page = 0, lineId = 0, curLine = -1;
  const events: { at: number; kind: "p" | "l" }[] = [];
  let m: RegExpExecArray | null;
  const pageRe = /<page /g, lineRe = /<line /g, wordRe = /<word xMin="([\d.-]+)" yMin="([\d.-]+)" xMax="([\d.-]+)" yMax="([\d.-]+)">([^<]*)<\/word>/g;
  while ((m = pageRe.exec(xml))) events.push({ at: m.index, kind: "p" });
  while ((m = lineRe.exec(xml))) events.push({ at: m.index, kind: "l" });
  events.sort((a, b) => a.at - b.at);
  let ei = 0;
  wordRe.lastIndex = 0;
  while ((m = wordRe.exec(xml))) {
    while (ei < events.length && events[ei].at < m.index) {
      if (events[ei].kind === "p") { page++; curLine = -1; } else { lineId++; curLine = lineId; }
      ei++;
    }
    out.push({ text: m[5], x0: +m[1], y0: +m[2], x1: +m[3], y1: +m[4], page, line: curLine });
  }
  return out;
}

// NOTE: our device-space (px,py) vs pdftotext's top-left origin: the corpus
// pages share height H; py_device = H − y_pdf. We match words by text and
// geometry proximity (page-level): a word matches a block if its CENTER y
// is within the block's baseline ±2pt and x within ±3pt of the block span.
function verdictFor(ws: W[], pageH: number, aText: string, aEnd: number, bText: string, bStart: number, py: number): string {
  const yTol = 3;
  const norm = (s: string) => s.replace(/\s+/g, "");
  const aT = norm(aText), bT = norm(bText);
  // find the LAST word on the line whose text ends aT (or contains its tail), near x≈aEnd, y≈pageH−py
  const wantY = pageH - py;
  const cands = ws.filter(w => Math.abs((w.y0 + w.y1) / 2 - wantY) < yolTol(w));
  function yolTol(w: W) { return Math.max(6, (w.y1 - w.y0) * 1.2); }
  const aWord = cands.filter(w => Math.abs(w.x1 - aEnd) < 4 && (norm(w.text) === aT || aT.endsWith(norm(w.text)) || norm(w.text).endsWith(aT.slice(-Math.min(10, aT.length))))).sort((p, q) => Math.abs(p.x1 - aEnd) - Math.abs(q.x1 - aEnd))[0];
  const bWord = cands.filter(w => Math.abs(w.x0 - bStart) < 4 && (norm(w.text) === bT || bT.startsWith(norm(w.text)) || norm(w.text).startsWith(bT.slice(0, Math.min(10, bT.length))))).sort((p, q) => Math.abs(p.x0 - bStart) - Math.abs(q.x0 - bStart))[0];
  if (!aWord || !bWord) return "?";
  return aWord.line === bWord.line ? "JOIN" : "SPLIT";
}

const members: [string, string, number][] = [
  ["/tmp/typst-cv/resume.pdf", "Typst resume", 841.89],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2", 841.89],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter", 841.89],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2", 841.89],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", 792],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx", 792],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", 792],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS", 792],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ", 792],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab", 792],
  ["/tmp/r110-prawn-manual.pdf", "Prawn", 792],
  ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint CV", 841.89],
  ["/tmp/r114-writers/fpdf-variant-control.pdf", "fpdf2", 841.89],
  ["/tmp/skia-cv/john-smith-cv.pdf", "Skia CV", 841.89],
];

for (const [path, name, pageH] of members) {
  const ps = await piecesOf(path);
  const ws = layoutWords(path);
  // group pieces into blocks by (px, py)
  const blocks: { px: number; py: number; ps: number; text: string; bx: number }[] = [];
  for (const p of ps) {
    if (p.px === undefined || p.py === undefined || p.ps === undefined) continue;
    const last = blocks[blocks.length - 1];
    if (last && Math.abs(last.px - p.px) < 0.01 && Math.abs(last.py - p.py) < 0.01) { last.text += p.text; if (p.bx !== undefined) last.bx = p.bx; }
    else blocks.push({ px: p.px, py: p.py, ps: p.ps, text: p.text, bx: p.bx ?? p.px });
  }
  const hits: string[] = [];
  for (let i = 1; i < blocks.length; i++) {
    const A = blocks[i - 1], B = blocks[i];
    if (Math.abs(A.py - B.py) >= 0.5 * Math.max(A.ps, B.ps)) continue;
    if (Math.abs(A.px - B.px) < 0.01) continue; // same block origin — skip (same block, already grouped)
    const alnumB = (B.text.match(/[A-Za-z0-9]/g) ?? []).length;
    if (alnumB > 0) continue; // the icon-anchor: zero-alnum right block
    if (B.text.trim().length === 0) continue; // pure space runs are not anchors
    if (A.bx === undefined) continue;
    const gapEm = (B.px - A.bx) / Math.max(A.ps, B.ps);
    if (gapEm < 0.4 || gapEm >= 13) continue;
    const v = verdictFor(ws, pageH, A.text.trim().split(/\s+/).slice(-1)[0] ?? "", A.bx, B.text.trim().split(/\s+/)[0] ?? "", B.px, A.py);
    hits.push(`  gap=${gapEm.toFixed(2)}em verdict=${v} A=${JSON.stringify(A.text.trim().slice(-22))} B=${JSON.stringify(B.text.slice(0, 14))}`);
  }
  console.log(`${name}: ${hits.length} icon-anchored candidates in [0.4, 13)em`);
  for (const h of hits.slice(0, 14)) console.log(h);
  if (hits.length > 14) console.log(`  … +${hits.length - 14} more`);
}
