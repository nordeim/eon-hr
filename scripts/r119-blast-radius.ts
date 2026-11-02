// r119 blast-radius census v3 — walk PIECES directly (the R117-A form):
// consecutive pieces, block boundary = different (px,py); guards verbatim
// (trail license walk-back, alnum right, condGap/condKern); gapEm in
// [1,13); verdict from bbox-layout line membership.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

// NOTE: this census rides the r119 PROTO (the real source carries no piece-dump
// hook); the proto mirrors the shipped R119-A/R119-B source exactly.
const mod = await import("./protos/cv-text-proto");
type S = { px?: number; py?: number; ps?: number; bx?: number; condGap?: boolean; condKern?: boolean };
type P = { p?: S; text: string; genuine?: boolean; trail?: boolean };
const piecesOf = async (path: string): Promise<P[]> => {
  (globalThis as unknown as { __r119pages: P[][] }).__r119pages = [];
  const raw = readFileSync(path);
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  return ((globalThis as unknown as { __r119pages: P[][] }).__r119pages ?? []).flat();
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
const norm = (s: string) => s.replace(/\s+/g, "");
function verdict(ws: W[], pageH: number, aTail: string, aEndX: number, bHead: string, bStartX: number, baseline: number): string {
  const wantY = pageH - baseline;
  const near = (w: W) => Math.abs((w.y0 + w.y1) / 2 - wantY) < Math.max(6, (w.y1 - w.y0));
  const bWord = ws.filter(w => near(w) && Math.abs(w.x0 - bStartX) < 4 && (norm(w.text) === norm(bHead) || norm(bHead).startsWith(norm(w.text)) || norm(w.text).startsWith(norm(bHead).slice(0, 6)))).sort((p, q) => Math.abs(p.x0 - bStartX) - Math.abs(q.x0 - bStartX))[0];
  if (!bWord) return "?B";
  const aWord = ws.filter(w => near(w) && Math.abs(w.x1 - aEndX) < 5 && (norm(w.text) === norm(aTail) || norm(aTail).endsWith(norm(w.text)) || norm(w.text).endsWith(norm(aTail).slice(-Math.min(8, aTail.length))))).sort((p, q) => Math.abs(p.x1 - aEndX) - Math.abs(q.x1 - aEndX))[0];
  if (!aWord) return "?A";
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

let joins2 = 0, splits2 = 0, joins12 = 0, splits12 = 0, unk = 0;
for (const [path, name, pageH] of members) {
  const decoded = await piecesOf(path);
  const ws = layoutWords(path);
  const rows: string[] = [];
  for (let i = 1; i < decoded.length; i++) {
    const d = decoded[i], e = decoded[i - 1];
    const dp = d.p ?? {}, ep = e.p ?? {};
    if (dp.px === undefined || dp.py === undefined || dp.ps === undefined) continue;
    if (ep.px === undefined || ep.py === undefined || ep.ps === undefined || ep.bx === undefined) continue;
    if (Math.abs(ep.px - dp.px) < 0.01) continue; // same block
    if (Math.abs(ep.py - dp.py) >= 0.5 * Math.max(ep.ps, dp.ps)) continue; // cross-line
    const gapEm = (dp.px - ep.bx) / Math.max(ep.ps, dp.ps);
    if (gapEm < 1 || gapEm >= 13) continue;
    // trail license walk-back over pieces (the source form)
    let j = i - 1, licensed = false;
    while (j >= 0) {
      const dj = decoded[j];
      if (dj.genuine === true && dj.text.length > 0 && /^ +$/.test(dj.text)) { licensed = true; j--; continue; }
      if (dj.trail === true) licensed = true;
      break;
    }
    if (!licensed) continue;
    // alnum right: the block's whole content
    let alnumRight = 0;
    for (let k = i; k < decoded.length; k++) {
      const dk = decoded[k], dkp = dk.p ?? {};
      if (dkp.px === undefined || dkp.py === undefined) break;
      if (Math.abs(dkp.px - dp.px) > 0.01 || Math.abs(dkp.py - dp.py) > 0.01) break;
      alnumRight += (dk.text.match(/[A-Za-z0-9]/g) ?? []).length;
    }
    if (alnumRight < 2) continue;
    if (dp.condGap === true) continue;
    if (dp.condKern === true && d.genuine) continue;
    const aWords = e.text.trim().split(/\s+/);
    const bWords = d.text.trim().split(/\s+/);
    const v = verdict(ws, pageH, aWords[aWords.length - 1] ?? e.text, ep.bx, bWords[0] ?? d.text, dp.px, dp.py);
    if (v === "JOIN" || v === "SPLIT") {
      rows.push(`    ${gapEm.toFixed(2)} em ${v}  "${e.text.trim().slice(-22)}" | "${d.text.trim().slice(0, 22)}"`);
      if (gapEm >= 2) { if (v === "JOIN") joins2++; else splits2++; }
      else { if (v === "JOIN") joins12++; else splits12++; }
    } else unk++;
  }
  if (rows.length) {
    console.log(`\n##### ${name} — ${rows.length} guarded pairs in [1,13)em #####`);
    for (const r of rows.slice(0, 16)) console.log(r);
    if (rows.length > 16) console.log(`    … +${rows.length - 16} more`);
  }
}
console.log(`\n===== [2,13)em: JOIN ${joins2} | SPLIT ${splits2}   [1,2)em: JOIN ${joins12} | SPLIT ${splits12} | unmatched ${unk} =====`);
