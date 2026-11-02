// r118-separation-band.ts — THE DEFINITIVE SEPARATION-BAND CENSUS.
// For every corpus member: walk pdftotext's word stream twice — the -bbox
// geometry and the default output's LINE structure — with cursor matching
// (no indexOf: the wrong-occurrence class is dead). For every consecutive
// word pair: same output line => JOINED; different lines => line break.
// Record the word gap (B.xMin − A.xMax) / min(h) and the same-baseline
// state. The output: the max JOINED same-baseline gap and the min SPLIT
// same-baseline gap per member — the true separation band.
// Usage: bun scripts/r118-separation-band.ts
import { execSync } from "node:child_process";

type BW = { text: string; x0: number; y0: number; x1: number; y1: number };
type OW = { text: string; line: number };

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

function bboxWords(path: string): BW[] {
  const xml = execSync(`pdftotext -bbox ${path} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }).toString();
  const out: BW[] = [];
  const re = /<word xMin="([\d.-]+)" yMin="([\d.-]+)" xMax="([\d.-]+)" yMax="([\d.-]+)">([^<]*)<\/word>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) out.push({ text: m[5], x0: +m[1], y0: +m[2], x1: +m[3], y1: +m[4] });
  return out;
}

function outWords(path: string): OW[] {
  const text = execSync(`pdftotext ${path} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 }).toString();
  const out: OW[] = [];
  text.split("\n").forEach((l, li) => {
    for (const w of l.split(/\s+/)) if (w) out.push({ text: w, line: li });
  });
  return out;
}

// cursor-match the two streams (both in extraction order)
function match(bw: BW[], ow: OW[]): { o: OW; b: BW }[] {
  const pairs: { o: OW; b: BW }[] = [];
  let j = 0;
  for (let i = 0; i < ow.length; i++) {
    const want = norm(ow[i].text);
    let k = j, got = -1;
    while (k < bw.length) { if (norm(bw[k].text) === want) { got = k; break; } k++; }
    if (got < 0) continue; // unmatched (fold differences) — skip
    pairs.push({ o: ow[i], b: bw[got] });
    j = got + 1;
  }
  return pairs;
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
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc"],
];

let gMaxJoin = -Infinity, gMinSplit = Infinity;
let gMaxJoinAt = "", gMinSplitAt = "";
for (const [path, name] of members) {
  const bw = bboxWords(path);
  const ow = outWords(path);
  const pairs = match(bw, ow);
  let maxJoin = -Infinity, minSplit = Infinity;
  let maxJoinPair = "", minSplitPair = "";
  let joinN = 0, splitN = 0;
  for (let k = 1; k < pairs.length; k++) {
    const a = pairs[k - 1], b = pairs[k];
    if (a.o.line !== b.o.line) {
      // different output lines — a break. Same baseline? (gap-driven only then)
      const sameBase = Math.abs(a.b.y0 - b.b.y0) < 0.35 * Math.max(1e-6, Math.min(a.b.y1 - a.b.y0, b.b.y1 - b.b.y0));
      if (!sameBase) continue;
      const gap = b.b.x0 - a.b.x1;
      if (gap <= 0) continue; // overlap — not a gap-driven split
      const h = Math.max(1e-6, Math.min(a.b.y1 - a.b.y0, b.b.y1 - b.b.y0));
      const em = gap / h;
      splitN++;
      if (em < minSplit) { minSplit = em; minSplitPair = `${JSON.stringify(a.b.text.slice(0, 18))} -> ${JSON.stringify(b.b.text.slice(0, 18))} @${gap.toFixed(1)}pt`; }
    } else {
      const gap = b.b.x0 - a.b.x1;
      const h = Math.max(1e-6, Math.min(a.b.y1 - a.b.y0, b.b.y1 - b.b.y0));
      const em = gap / h;
      joinN++;
      if (em > maxJoin) { maxJoin = em; maxJoinPair = `${JSON.stringify(a.b.text.slice(0, 18))} -> ${JSON.stringify(b.b.text.slice(0, 18))} @${gap.toFixed(1)}pt`; }
    }
  }
  if (maxJoin > gMaxJoin) { gMaxJoin = maxJoin; gMaxJoinAt = `${name}: ${maxJoinPair}`; }
  if (minSplit < gMinSplit) { gMinSplit = minSplit; gMinSplitAt = `${name}: ${minSplitPair}`; }
  console.log(`${name}: joins ${joinN} (max ${maxJoin === -Infinity ? "n/a" : maxJoin.toFixed(2) + "em"}) | same-base splits ${splitN} (min ${minSplit === Infinity ? "n/a" : minSplit.toFixed(2) + "em"}) | matched ${pairs.length}/${ow.length}`);
  if (maxJoin !== -Infinity) console.log(`   maxJoin: ${maxJoinPair}`);
  if (minSplit !== Infinity) console.log(`   minSplit: ${minSplitPair}`);
}
console.log(`\nGLOBAL: max JOINED same-base gap ${gMaxJoin.toFixed(3)}em  [${gMaxJoinAt}]`);
console.log(`GLOBAL: min SPLIT  same-base gap ${gMinSplit.toFixed(3)}em  [${gMinSplitAt}]`);
