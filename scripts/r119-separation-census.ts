// r119 census: for every same-baseline word pair at gap [1,13) em, the
// verdict + the VERTICAL-ALIGNMENT context (does another word on a
// different baseline x-overlap the right block? — the column license).
import { execSync } from "node:child_process";
type W = { text: string; x0: number; y0: number; x1: number; y1: number; page: number; line: number };
function layoutWords(path: string): W[] {
  const xml = execSync(`pdftotext -bbox-layout ${path} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 }).toString();
  const out: W[] = [];
  let page = 0;
  const pageRe = /<page /g, lineRe = /<line /g, wordRe = /<word xMin="([\d.-]+)" yMin="([\d.-]+)" xMax="([\d.-]+)" yMax="([\d.-]+)">([^<]*)<\/word>/g;
  const events: { at: number; kind: "p" | "l" }[] = [];
  let m: RegExpExecArray | null;
  while ((m = pageRe.exec(xml))) events.push({ at: m.index, kind: "p" });
  while ((m = lineRe.exec(xml))) events.push({ at: m.index, kind: "l" });
  events.sort((a, b) => a.at - b.at);
  let lineId = 0; page = 0; let curLine = -1; let ei = 0;
  wordRe.lastIndex = 0;
  while ((m = wordRe.exec(xml))) {
    while (ei < events.length && events[ei].at < m.index) {
      if (events[ei].kind === "p") { page++; curLine = -1; }
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
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
  ["/tmp/skia-cv/john-smith-cv.pdf", "Skia CV"],
  ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint"],
];
for (const [path, name] of members) {
  const ws = layoutWords(path);
  // index words by page for the vertical-context probe
  const byPage = new Map<number, W[]>();
  for (const w of ws) { if (!byPage.has(w.page)) byPage.set(w.page, []); byPage.get(w.page)!.push(w); }
  console.log(`\n##### ${name} #####`);
  const rows: { em: number; joined: boolean; a: string; b: string; vLeft: number; vRight: number }[] = [];
  for (let k = 1; k < ws.length; k++) {
    const a = ws[k - 1], b = ws[k];
    if (a.page !== b.page) continue;
    const h = Math.max(1e-6, Math.min(a.y1 - a.y0, b.y1 - b.y0));
    if (Math.abs(a.y0 - b.y0) >= 0.35 * h) continue;
    const gap = b.x0 - a.x1;
    if (gap <= 0) continue;
    const em = gap / h;
    if (em < 1 || em >= 13) continue;
    // vertical alignment: count words on DIFFERENT baselines (|dy| >= 0.35h)
    // whose x-range overlaps [b.x0-h, b.x1+h] (right) and [a.x0-h, a.x1+h] (left)
    const page = byPage.get(a.page)!;
    let vRight = 0, vLeft = 0;
    for (const w of page) {
      const dy = Math.abs(w.y0 - b.y0);
      if (dy >= 0.35 * h && w.x0 < b.x1 + h && w.x1 > b.x0 - h) vRight++;
      const dy2 = Math.abs(w.y0 - a.y0);
      if (dy2 >= 0.35 * h && w.x0 < a.x1 + h && w.x1 > a.x0 - h) vLeft++;
    }
    rows.push({ em, joined: a.line === b.line, a: a.text.slice(0, 18), b: b.text.slice(0, 18), vLeft, vRight });
  }
  // dedupe by verdict-em buckets: show the min split and max join per member + all Typst-like rows
  const splits = rows.filter(r => !r.joined), joins = rows.filter(r => r.joined);
  const minSplit = splits.reduce((m, r) => r.em < m.em ? r : m, splits[0] ?? { em: 99 } as any);
  const maxJoin = joins.reduce((m, r) => r.em > m.em ? r : m, joins[0] ?? { em: -1 } as any);
  console.log(`  pairs in [1,13)em: ${rows.length} | splits ${splits.length} | joins ${joins.length}`);
  if (splits.length) console.log(`  MIN SPLIT: ${minSplit.em.toFixed(2)} em "${minSplit.a}"|"${minSplit.b}" vL=${minSplit.vLeft} vR=${minSplit.vRight}`);
  if (joins.length) console.log(`  MAX JOIN:  ${maxJoin.em.toFixed(2)} em "${maxJoin.a}"|"${maxJoin.b}" vL=${maxJoin.vLeft} vR=${maxJoin.vRight}`);
  // the decisive view: for each em-bucket [1,2),[2,3),... the verdict split
  for (let lo = 1; lo < 13; lo++) {
    const bucket = rows.filter(r => r.em >= lo && r.em < lo + 1);
    if (!bucket.length) continue;
    const s = bucket.filter(r => !r.joined).length, j = bucket.filter(r => r.joined).length;
    // vertical context avg for each verdict
    const avgV = (rs: typeof rows) => rs.length ? (rs.reduce((x, r) => x + r.vRight, 0) / rs.length).toFixed(1) : "-";
    console.log(`  [${lo},${lo + 1})em: split ${s} (avgVr ${avgV(bucket.filter(r => !r.joined))}) | join ${j} (avgVr ${avgV(bucket.filter(r => r.joined))})`);
  }
}
