// r118-icon-census2.ts — THE ICON-ANCHORED BLAST-RADIUS CENSUS v2 (the
// walk-back form). Population: every zero-alnum CONTENT block B (an icon /
// symbol / punctuation run — not a space run) at a same-baseline block
// boundary, walking back over intervening space-run blocks to the content
// block A; gapEm = (B.px − A.bx)/max(ps) in [0.3, 13). Verdict: pdftotext
// -bbox-layout line membership — B's word and A's last word on the same
// line => JOIN; different lines => SPLIT. The fire surface of the R118-A
// candidate, measured before any code.
// Usage: bun scripts/r118-icon-census2.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("/tmp/r118-proto/cv-text");
type P = { text: string; px?: number; py?: number; ps?: number; bx?: number; sep?: string; genuine?: boolean; font?: string; condGap?: boolean; condKern?: boolean };
const piecesOf = async (path: string): Promise<P[]> => {
  (globalThis as unknown as { __r118pieces: P[] }).__r118pieces = [];
  const raw = readFileSync(path);
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  return (globalThis as unknown as { __r118pieces: P[] }).__r118pieces;
};

type W = { text: string; x0: number; y0: number; x1: number; y1: number; page: number; line: number; idx: number };
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
    out.push({ text: m[5], x0: +m[1], y0: +m[2], x1: +m[3], y1: +m[4], page, line: curLine, idx: out.length });
  }
  return out;
}

const norm = (s: string) => s.replace(/\s+/g, "");
function verdict(ws: W[], pageH: number, aTail: string, aEndX: number, bHead: string, bStartX: number, baseline: number): string {
  const wantY = pageH - baseline; // device py (top-flipped) -> pdf baseline approx
  const near = (w: W) => Math.abs((w.y0 + w.y1) / 2 - wantY) < Math.max(6, (w.y1 - w.y0));
  const bCands = ws.filter(w => near(w) && Math.abs(w.x0 - bStartX) < 4 && (norm(w.text) === norm(bHead) || norm(bHead).startsWith(norm(w.text)) || norm(w.text).startsWith(norm(bHead).slice(0, 6))));
  const bWord = bCands.sort((p, q) => Math.abs(p.x0 - bStartX) - Math.abs(q.x0 - bStartX))[0];
  if (!bWord) return "?B";
  const aCands = ws.filter(w => near(w) && Math.abs(w.x1 - aEndX) < 5 && (norm(w.text) === norm(aTail) || norm(aTail).endsWith(norm(w.text)) || norm(w.text).endsWith(norm(aTail).slice(-Math.min(8, aTail.length)))));
  const aWord = aCands.sort((p, q) => Math.abs(p.x1 - aEndX) - Math.abs(q.x1 - aEndX))[0];
  if (!aWord) return "?A";
  if (aWord.line === bWord.line) return "JOIN";
  // SPLIT unless B's line contains a DIFFERENT word before bWord matching nothing of A (still split)
  return "SPLIT";
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
  // group pieces into blocks by exact (px, py)
  const blocks: { px: number; py: number; ps: number; text: string; bx?: number; genuine?: boolean }[] = [];
  for (const p of ps) {
    if (p.px === undefined || p.py === undefined || p.ps === undefined) continue;
    const last = blocks[blocks.length - 1];
    if (last && Math.abs(last.px - p.px) < 0.01 && Math.abs(last.py - p.py) < 0.01) { last.text += p.text; if (p.bx !== undefined) last.bx = p.bx; }
    else blocks.push({ px: p.px, py: p.py, ps: p.ps, text: p.text, bx: p.bx, genuine: p.genuine });
  }
  const hits: string[] = [];
  for (let i = 1; i < blocks.length; i++) {
    const B = blocks[i];
    if (Math.abs(blocks[i - 1].py - B.py) >= 0.5 * Math.max(blocks[i - 1].ps, B.ps)) continue; // same-base with the ADJACENT block
    const alnumB = (B.text.match(/[A-Za-z0-9]/g) ?? []).length;
    if (alnumB > 0) continue;
    if (B.text.trim().length === 0) continue; // space runs are not anchors
    // walk back over space-run blocks to the content block A
    let j = i - 1;
    while (j >= 0 && blocks[j].text.trim().length === 0) j--;
    if (j < 0) continue;
    const A = blocks[j];
    if (Math.abs(A.py - B.py) >= 0.5 * Math.max(A.ps, B.ps)) continue;
    if (A.bx === undefined) continue;
    if (Math.abs(A.px - B.px) < 0.01) continue;
    const gapEm = (B.px - A.bx) / Math.max(A.ps, B.ps);
    if (gapEm < 0.3 || gapEm >= 13) continue;
    const v = verdict(ws, pageH, A.text.trim().split(/\s+/).slice(-1)[0] ?? "", A.bx, B.text.trim().split(/\s+/)[0] ?? "", B.px, A.py);
    hits.push(`  gap=${gapEm.toFixed(2)}em verdict=${v} A=${JSON.stringify(A.text.trim().slice(-20))} B=${JSON.stringify(B.text.slice(0, 12))}`);
  }
  console.log(`${name}: ${hits.length} icon-anchored walk-back candidates in [0.3, 13)em`);
  for (const h of hits.slice(0, 16)) console.log(h);
  if (hits.length > 16) console.log(`  … +${hits.length - 16} more`);
}
