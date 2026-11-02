// r117-real-gaps.ts — the REAL gap measurement via pdftotext -bbox word
// xMax: for every Typst split pair, gap = B.px − A's last word xMax (in
// em). This replaces the chars×0.5em estimate with measured truth. Also:
// enumerate the "?" population at T>=8em trail=REQ on the other members.
// Usage: bun scripts/r117-real-gaps.ts
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
// bbox words: text -> list of (xMin, xMax) to find the true end of a fragment
function bboxWordBoxes(path: string) {
  const xml = execSync(`pdftotext -bbox ${path} -`, { encoding: "utf8", maxBuffer: 128 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }).toString();
  const out: { text: string; x0: number; x1: number }[] = [];
  const wRe = /<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<\/word>/g;
  let w: RegExpExecArray | null;
  while ((w = wRe.exec(xml))) out.push({ text: w[5], x0: parseFloat(w[1]), x1: parseFloat(w[3]) });
  return out;
}
// the real end of a block: the max xMax over bbox words whose text appears in the block's tail
function realEnd(boxes: { text: string; x0: number; x1: number }[], blockText: string, blockPx: number): number | null {
  const words = blockText.trim().split(/\s+/).filter(w => /[A-Za-z0-9]/.test(w));
  if (!words.length) return null;
  const tail = words.slice(-3);
  let best: number | null = null;
  for (const t of tail) {
    for (const b of boxes) {
      if (b.text === t && Math.abs(b.x0 - blockPx) < 260) {
        // candidate; ensure it's the rightmost occurrence near this block
        if (best === null || b.x1 > best) best = b.x1;
      }
    }
  }
  return best;
}

console.log("=== TYPST RESUME — REAL gaps (B.px − A's true end from bbox xMax) ===");
const boxes = bboxWordBoxes("/tmp/typst-cv/resume.pdf");
const pp = await dump("/tmp/typst-cv/resume.pdf");
const bs = blocks(pp);
for (let i = 1; i < bs.length; i++) {
  const A = bs[i - 1], B = bs[i];
  if (Math.abs(A.py - B.py) >= 0.5 * Math.max(A.ps, B.ps)) continue;
  const estWidthEm = A.text.replace(/[^A-Za-z0-9 .,:;()@\-+]/g, "").length * 0.5;
  const estGap = (B.px - A.px) / Math.max(A.ps, B.ps) - estWidthEm;
  if (estGap < 2) continue;
  // real end: for space-only A blocks, use the block BEFORE A
  let endBlock = A, back = 0;
  while (!/[A-Za-z0-9]/.test(endBlock.text.trim()) && i - 1 - back - 1 >= 0) { back++; endBlock = bs[i - 1 - back]; }
  const re = realEnd(boxes, endBlock.text, endBlock.px);
  const realGapEm = re !== null ? (B.px - re) / Math.max(A.ps, B.ps) : null;
  console.log(`  est≈${estGap.toFixed(1)}em real≈${realGapEm === null ? "?" : realGapEm.toFixed(1)}em | "${A.text.trim().slice(0, 26)}" -> "${B.text.trim().slice(0, 26)}"`);
}

console.log("\n=== the '?' population at T>=8em trail=REQ on the OTHER members ===");
const members: [string, string][] = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
];
for (const [path, name] of members) {
  const ref = execSync(`pdftotext ${path} -`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).toString();
  const pp2 = await dump(path);
  const bs2 = blocks(pp2);
  for (let i = 1; i < bs2.length; i++) {
    const A = bs2[i - 1], B = bs2[i];
    if (Math.abs(A.py - B.py) >= 0.5 * Math.max(A.ps, B.ps)) continue;
    const estWidthEm = A.text.replace(/[^A-Za-z0-9 .,:;()@\-+]/g, "").length * 0.5;
    const estGap = (B.px - A.px) / Math.max(A.ps, B.ps) - estWidthEm;
    if (estGap < 8 || !/\s$/.test(A.text)) continue;
    const aTail = A.text.trim().split(/\s+/).slice(-2).join(" ").slice(0, 22);
    const bHead = B.text.trim().split(/\s+/).slice(0, 2).join(" ").slice(0, 22);
    if (!aTail || !bHead) { console.log(`  ${name}: est≈${estGap.toFixed(1)}em (no-frag) "${A.text.trim().slice(0, 20)}" -> "${B.text.trim().slice(0, 20)}"`); continue; }
    // verdict
    let v = "?";
    let from = 0;
    for (;;) {
      const ai = ref.indexOf(aTail, from);
      if (ai < 0) break;
      const after = ref.slice(ai + aTail.length, ai + aTail.length + bHead.length + 12);
      const bj = after.indexOf(bHead);
      if (bj >= 0 && bj <= 6) {
        const between = after.slice(0, bj);
        v = /^ +$/.test(between) ? "JOIN" : /^ *\n/.test(between) ? "SPLIT" : "?";
        if (v !== "?") break;
      }
      from = ai + 1;
    }
    if (v === "?") console.log(`  ${name}: est≈${estGap.toFixed(1)}em ${v} "${aTail}" -> "${bHead}"`);
  }
}
