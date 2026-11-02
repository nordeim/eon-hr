// r118-separation-band2.ts — THE DEFINITIVE SEPARATION-BAND CENSUS v2,
// on pdftotext -bbox-layout (poppler's OWN block/line/word analysis — the
// line membership is built into the XML, zero output matching). For every
// consecutive word pair: same <line> => JOINED; different lines at the same
// baseline => SPLIT. The word gap = B.xMin − A.xMax over min(height).
// Output: per member, the max JOINED same-baseline gap and the min SPLIT
// same-baseline gap — the true separation band, straight from poppler.
// Usage: bun scripts/r118-separation-band2.ts
import { execSync } from "node:child_process";

type W = { text: string; x0: number; y0: number; x1: number; y1: number; page: number; line: number };

function layoutWords(path: string): W[] {
  const xml = execSync(`pdftotext -bbox-layout ${path} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }).toString();
  const out: W[] = [];
  let page = 0;
  const pageRe = /<page /g, lineRe = /<line /g, wordRe = /<word xMin="([\d.-]+)" yMin="([\d.-]+)" xMax="([\d.-]+)" yMax="([\d.-]+)">([^<]*)<\/word>/g;
  // walk sequentially: track page + line indices by offset order
  const events: { at: number; kind: "p" | "l"; m: RegExpExecArray }[] = [];
  let m: RegExpExecArray | null;
  while ((m = pageRe.exec(xml))) events.push({ at: m.index, kind: "p", m });
  while ((m = lineRe.exec(xml))) events.push({ at: m.index, kind: "l", m });
  events.sort((a, b) => a.at - b.at);
  let lineId = 0;
  for (const e of events) { if (e.kind === "p") page++; else lineId++; }
  // second pass with per-word line attribution
  page = 0; let curLine = -1; lineId = 0;
  const ev2 = [...events];
  let ei = 0;
  wordRe.lastIndex = 0;
  while ((m = wordRe.exec(xml))) {
    while (ei < ev2.length && ev2[ei].at < m.index) {
      if (ev2[ei].kind === "p") { page++; curLine = -1; }
      else { lineId++; curLine = lineId; }
      ei++;
    }
    out.push({ text: m[5], x0: +m[1], y0: +m[2], x1: +m[3], y1: +m[4], page, line: curLine });
  }
  return out;
}

const members: [string, string][] = [
  ["/tmp/typst-cv/resume.pdf", "Typst resume"],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2"],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter"],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2"],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
  ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint CV"],
  ["/tmp/r114-writers/fpdf-variant-control.pdf", "fpdf2"],
  ["/tmp/skia-cv/john-smith-cv.pdf", "Skia CV"],
];

let gMaxJoin = -Infinity, gMinSplit = Infinity, gMaxJoinAt = "", gMinSplitAt = "";
for (const [path, name] of members) {
  const ws = layoutWords(path);
  let maxJoin = -Infinity, minSplit = Infinity, joinN = 0, splitN = 0;
  let maxJoinPair = "", minSplitPair = "";
  for (let k = 1; k < ws.length; k++) {
    const a = ws[k - 1], b = ws[k];
    if (a.page !== b.page) continue;
    const h = Math.max(1e-6, Math.min(a.y1 - a.y0, b.y1 - b.y0));
    const sameBase = Math.abs(a.y0 - b.y0) < 0.35 * h;
    if (!sameBase) continue;
    const gap = b.x0 - a.x1;
    if (gap <= 0) continue;
    const em = gap / h;
    if (a.line === b.line) {
      joinN++;
      if (em > maxJoin) { maxJoin = em; maxJoinPair = `${JSON.stringify(a.text.slice(0, 16))} -> ${JSON.stringify(b.text.slice(0, 16))} @${gap.toFixed(1)}pt h=${h.toFixed(1)}`; }
    } else {
      splitN++;
      if (em < minSplit) { minSplit = em; minSplitPair = `${JSON.stringify(a.text.slice(0, 16))} -> ${JSON.stringify(b.text.slice(0, 16))} @${gap.toFixed(1)}pt h=${h.toFixed(1)}`; }
    }
  }
  if (maxJoin > gMaxJoin) { gMaxJoin = maxJoin; gMaxJoinAt = `${name}: ${maxJoinPair}`; }
  if (minSplit < gMinSplit) { gMinSplit = minSplit; gMinSplitAt = `${name}: ${minSplitPair}`; }
  console.log(`${name}: words ${ws.length} | joins ${joinN} max ${maxJoin === -Infinity ? "n/a" : maxJoin.toFixed(2) + "em"} | same-base splits ${splitN} min ${minSplit === Infinity ? "n/a" : minSplit.toFixed(2) + "em"}`);
  if (maxJoin !== -Infinity) console.log(`   maxJoin: ${maxJoinPair}`);
  if (minSplit !== Infinity) console.log(`   minSplit: ${minSplitPair}`);
}
console.log(`\nGLOBAL: max JOINED same-base gap ${gMaxJoin.toFixed(3)}em  [${gMaxJoinAt}]`);
console.log(`GLOBAL: min SPLIT  same-base gap ${gMinSplit.toFixed(3)}em  [${gMinSplitAt}]`);
