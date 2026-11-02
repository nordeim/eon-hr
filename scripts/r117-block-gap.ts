// r117-block-gap.ts — the BLOCK-AWARE same-line gap census. Consecutive
// pieces sharing one stamp origin are intra-block (TJ-split) — their
// advances accumulate; the block's width ≈ Σ(text) × coef em. A same-line
// BLOCK BOUNDARY (a stamp-origin change) carries a real gap:
//   gap = right.px − (left.px + leftBlockWidth)
// Census every same-line block boundary on every member; classify against
// pdftotext (split vs join) at the extremes. The intra-block coefficient
// sweeps 0.4/0.5/0.6 to test separation robustness.
// Usage: bun scripts/r117-block-gap.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("/tmp/r117-proto/cv-text");
const dbg = mod.__r117DebugPieces as { text: string; px?: number; py?: number; ps?: number }[];

type P = { text: string; px: number; py: number; ps: number };
async function dump(path: string): Promise<P[]> {
  dbg.length = 0;
  const raw = readFileSync(path);
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  return dbg.filter(p => p.px !== undefined) as P[];
}

// group consecutive pieces into blocks by identical (px, py, ps)
function blocks(pp: P[]) {
  const bs: { px: number; py: number; ps: number; text: string; n: number }[] = [];
  for (const p of pp) {
    const last = bs[bs.length - 1];
    if (last && Math.abs(last.px - p.px) < 0.01 && Math.abs(last.py - p.py) < 0.01 && Math.abs(last.ps - p.ps) < 0.01) {
      last.text += p.text; last.n++;
    } else {
      bs.push({ px: p.px, py: p.py, ps: p.ps, text: p.text, n: 1 });
    }
  }
  return bs;
}

const members: [string, string][] = [
  ["/tmp/typst-cv/resume.pdf", "Typst resume"],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter"],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
];

for (const [path, name] of members) {
  const pp = await dump(path);
  const bs = blocks(pp);
  // same-line block boundaries: consecutive blocks with py within 0.5*max(ps)
  const rows: { gapEm: number; a: string; b: string }[] = [];
  for (let i = 1; i < bs.length; i++) {
    const A = bs[i - 1], B = bs[i];
    if (Math.abs(A.py - B.py) >= 0.5 * Math.max(A.ps, B.ps)) continue; // cross-line
    const widthEm = A.text.replace(/[^A-Za-z0-9 .,:;()@\-+]/g, "").length * 0.5; // printable-ish width estimate
    const gapEm = (B.px - A.px) / Math.max(A.ps, B.ps) - widthEm;
    rows.push({ gapEm, a: A.text.slice(0, 24), b: B.text.slice(0, 24) });
  }
  rows.sort((x, y) => y.gapEm - x.gapEm);
  console.log(`\n===== ${name}: ${bs.length} blocks, ${rows.length} same-line block boundaries =====`);
  console.log(`  gap distribution: >=15em ${rows.filter(r => r.gapEm >= 15).length} · >=8em ${rows.filter(r => r.gapEm >= 8).length} · >=4em ${rows.filter(r => r.gapEm >= 4).length} · >=2em ${rows.filter(r => r.gapEm >= 2).length} · >=1em ${rows.filter(r => r.gapEm >= 1).length}`);
  rows.slice(0, 8).forEach(r => console.log(`  gap≈${r.gapEm.toFixed(1)}em | "${r.a}" -> "${r.b}"`));
}
