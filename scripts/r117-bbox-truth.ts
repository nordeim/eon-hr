// r117-bbox-truth.ts — the DEFINITIVE per-pair verdict via pdftotext -bbox:
// every output word carries its box; every <line> element is an output line.
// For each same-line block boundary (>=8em gap estimate), find the two
// blocks' words by box proximity and check SAME-LINE vs DIFFERENT-LINE in
// the bbox output. This is the ground truth the rule will be judged by.
// Usage: bun scripts/r117-bbox-truth.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("./protos/cv-text-proto");
const dbg = mod.__r117DebugPieces as { text: string; px?: number; py?: number; ps?: number }[];

type P = { text: string; px: number; py: number; ps: number };
async function dump(path: string): Promise<P[]> {
  dbg.length = 0;
  const raw = readFileSync(path);
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  return dbg.filter(p => p.px !== undefined) as P[];
}
function blocks(pp: P[]) {
  const bs: { px: number; py: number; ps: number; text: string }[] = [];
  for (const p of pp) {
    const last = bs[bs.length - 1];
    if (last && Math.abs(last.px - p.px) < 0.01 && Math.abs(last.py - p.py) < 0.01 && Math.abs(last.ps - p.ps) < 0.01) last.text += p.text;
    else bs.push({ px: p.px, py: p.py, ps: p.ps, text: p.text });
  }
  return bs;
}

// parse pdftotext -bbox: <word xMin=".." yMin=".." xMax=".." yMax="..">text</word>
// grouped in <line> elements. y in bbox is TOP-DOWN; our stamps are the PDF
// bottom-up device space. For line-membership comparison we only need the
// word's own (x, y) relative to other words — same page assumed by order.
function bboxLines(path: string) {
  const xml = execSync(`pdftotext -bbox ${path} -`, { encoding: "utf8", maxBuffer: 128 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }).toString();
  const lines: { x: number; y: number; text: string }[][] = [];
  const lineRe = /<line[^>]*>([\s\S]*?)<\/line>/g;
  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(xml))) {
    const words: { x: number; y: number; text: string }[] = [];
    const wRe = /<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<\/word>/g;
    let w: RegExpExecArray | null;
    while ((w = wRe.exec(m[1]))) words.push({ x: parseFloat(w[1]), y: parseFloat(w[2]), text: w[5] });
    if (words.length) lines.push(words);
  }
  return lines;
}

// find which bbox line contains a word whose text overlaps the block's text
// and whose x is near the block's origin (within 30pt). Returns [lineIdx, wordIdx] or null.
function findWord(lines: { x: number; y: number; text: string }[][], text: string, px: number, pyTop: number) {
  const frag = text.trim().replace(/[^A-Za-z0-9]/g, "").slice(0, 10);
  if (!frag) return null;
  let best: { li: number; wi: number; d: number } | null = null;
  for (let li = 0; li < lines.length; li++) {
    for (let wi = 0; wi < lines[li].length; wi++) {
      const w = lines[li][wi];
      const wf = w.text.replace(/[^A-Za-z0-9]/g, "");
      if (!wf) continue;
      if (!wf.startsWith(frag.slice(0, 4))) continue;
      const d = Math.abs(w.x - px);
      if (d < 40) { if (!best || d < best.d) best = { li, wi, d }; }
    }
  }
  return best;
}

const members: [string, string][] = [
  ["/tmp/typst-cv/resume.pdf", "Typst resume"],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
];

for (const [path, name] of members) {
  const lines = bboxLines(path);
  const pp = await dump(path);
  const bs = blocks(pp);
  const rows: { gapEm: number; a: string; b: string }[] = [];
  for (let i = 1; i < bs.length; i++) {
    const A = bs[i - 1], B = bs[i];
    if (Math.abs(A.py - B.py) >= 0.5 * Math.max(A.ps, B.ps)) continue;
    const widthEm = A.text.replace(/[^A-Za-z0-9 .,:;()@\-+]/g, "").length * 0.5;
    const gapEm = (B.px - A.px) / Math.max(A.ps, B.ps) - widthEm;
    if (gapEm >= 8) rows.push({ gapEm, a: A.text, b: B.text });
  }
  rows.sort((x, y) => y.gapEm - x.gapEm);
  let split = 0, join = 0, unknown = 0;
  const joins: string[] = [];
  for (const r of rows) {
    const wa = findWord(lines, r.a, bs.find(b => b.text === r.a)?.px ?? 0, 0);
    // simpler: locate by the row's own a/b block objects — rebuild with px
    void wa;
  }
  // redo with px carried on rows
  const rows2: { gapEm: number; a: string; b: string; apx: number; bpx: number }[] = [];
  for (let i = 1; i < bs.length; i++) {
    const A = bs[i - 1], B = bs[i];
    if (Math.abs(A.py - B.py) >= 0.5 * Math.max(A.ps, B.ps)) continue;
    const widthEm = A.text.replace(/[^A-Za-z0-9 .,:;()@\-+]/g, "").length * 0.5;
    const gapEm = (B.px - A.px) / Math.max(A.ps, B.ps) - widthEm;
    if (gapEm >= 8) rows2.push({ gapEm, a: A.text, b: B.text, apx: A.px, bpx: B.px });
  }
  rows2.sort((x, y) => y.gapEm - x.gapEm);
  for (const r of rows2) {
    const la = findWord(lines, r.a, r.apx, 0);
    const lb = findWord(lines, r.b, r.bpx, 0);
    if (!la || !lb) { unknown++; continue; }
    if (la.li === lb.li) { join++; if (joins.length < 8) joins.push(`gap≈${r.gapEm.toFixed(1)}em "${r.a.slice(0, 18)}"@${r.apx.toFixed(0)} -> "${r.b.slice(0, 18)}"@${r.bpx.toFixed(0)}`); }
    else split++;
  }
  console.log(`\n===== ${name}: ${rows2.length} boundaries >= 8em | SPLIT ${split} · JOIN ${join} · ? ${unknown} =====`);
  joins.forEach(j => console.log("  JOIN: " + j));
}
