// r117-bbox-truth2.ts — the definitive verdict, take 2: reconstruct
// pdftotext's output LINES from the -bbox word sequence (a yMin change
// between consecutive words = a line break; the sequence IS the reading
// order). Match each >=8em block-boundary pair's words by text + x, then
// read the verdict: same reconstructed line → JOIN, different → SPLIT.
// Usage: bun scripts/r117-bbox-truth2.ts
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

// the bbox words with reconstructed line ids
type BW = { x: number; y: number; text: string; line: number };
function bboxWords(path: string): BW[] {
  const xml = execSync(`pdftotext -bbox ${path} -`, { encoding: "utf8", maxBuffer: 128 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }).toString();
  const out: BW[] = [];
  const wRe = /<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<\/word>/g;
  let w: RegExpExecArray | null;
  let line = 0;
  let prevY: number | null = null;
  while ((w = wRe.exec(xml))) {
    const y = parseFloat(w[2]);
    if (prevY !== null && Math.abs(y - prevY) > 2.5) line++;
    out.push({ x: parseFloat(w[1]), y, text: w[5], line });
    prevY = y;
  }
  return out;
}

// find a bbox word by alnum-fragment + x proximity
function findBW(words: BW[], frag: string, px: number): number {
  const f = frag.replace(/[^A-Za-z0-9]/g, "").slice(0, 8);
  if (!f) return -1;
  let best = -1, bestD = Infinity;
  for (let i = 0; i < words.length; i++) {
    const wf = words[i].text.replace(/[^A-Za-z0-9]/g, "");
    if (wf.length < 2) continue;
    if (!wf.startsWith(f.slice(0, Math.min(4, f.length)))) continue;
    const d = Math.abs(words[i].x - px);
    if (d < bestD) { bestD = d; best = i; }
  }
  return bestD < 50 ? best : -1;
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
  const words = bboxWords(path);
  const pp = await dump(path);
  const bs = blocks(pp);
  const rows: { gapEm: number; a: string; b: string; apx: number; bpx: number }[] = [];
  for (let i = 1; i < bs.length; i++) {
    const A = bs[i - 1], B = bs[i];
    if (Math.abs(A.py - B.py) >= 0.5 * Math.max(A.ps, B.ps)) continue;
    const widthEm = A.text.replace(/[^A-Za-z0-9 .,:;()@\-+]/g, "").length * 0.5;
    const gapEm = (B.px - A.px) / Math.max(A.ps, B.ps) - widthEm;
    if (gapEm >= 8) rows.push({ gapEm, a: A.text, b: B.text, apx: A.px, bpx: B.px });
  }
  rows.sort((x, y) => y.gapEm - x.gapEm);
  let split = 0, join = 0, unknown = 0;
  const joins: string[] = [];
  const splits: string[] = [];
  for (const r of rows) {
    const ia = findBW(words, r.a.split(/\s+/).pop() ?? r.a, r.apx); // last word-fragment of block A
    const ib = findBW(words, r.b.split(/\s+/)[0] ?? r.b, r.bpx);    // first word-fragment of block B
    if (ia < 0 || ib < 0) { unknown++; continue; }
    if (words[ia].line === words[ib].line) { join++; if (joins.length < 8) joins.push(`gap≈${r.gapEm.toFixed(1)}em "${r.a.slice(0, 16)}"→"${r.b.slice(0, 16)}"`); }
    else { split++; if (splits.length < 3) splits.push(`gap≈${r.gapEm.toFixed(1)}em "${r.a.slice(0, 16)}"→"${r.b.slice(0, 16)}"`); }
  }
  console.log(`\n===== ${name}: ${rows.length} boundaries >=8em | SPLIT ${split} · JOIN ${join} · ? ${unknown} =====`);
  joins.forEach(j => console.log("  JOIN: " + j));
  if (splits.length) console.log("  (split examples: " + splits.join(" | ") + ")");
}
