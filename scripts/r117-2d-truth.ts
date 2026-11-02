// r117-2d-truth.ts — the decisive 2D check: dump ALL pieces at the arXiv
// refutation baselines sorted by px (is there column-2 text visually between
// the joined pair?), and the same for the Typst split baselines. This
// determines whether pdftotext's split decision is explainable by any
// per-pair signature or purely by 2D layout analysis.
// Usage: bun scripts/r117-2d-truth.ts
import { readFileSync } from "node:fs";

const mod = await import("./protos/cv-text-proto");
const dbg = mod.__r117DebugPieces as { text: string; px?: number; py?: number; ps?: number }[];

async function dump(path: string) {
  dbg.length = 0;
  const raw = readFileSync(path);
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  return dbg.filter(p => p.px !== undefined) as { text: string; px: number; py: number; ps: number }[];
}

// arXiv: baseline py=283.9 — all pieces within 3pt
console.log("=== ARXIV baseline py≈283.9 — all pieces by px ===");
const ax = await dump("/tmp/r106-corpus/arxiv-2404.16710.pdf");
// pieces are per-PAGE; the py=283.9 pieces could be on several pages. Group by (py, px-cluster).
const at284 = ax.filter(p => Math.abs(p.py - 283.9) < 3).sort((a, b) => a.px - b.px);
at284.slice(0, 40).forEach(p => console.log(`  px=${p.px.toFixed(1)} py=${p.py.toFixed(1)} ps=${p.ps.toFixed(1)} "${p.text.slice(0, 30)}"`));

// how many distinct px clusters on this baseline?
const clusters: number[] = [];
for (const p of at284) {
  if (!clusters.some(c => Math.abs(c - p.px) < 20)) clusters.push(p.px);
}
console.log(`px clusters on py≈283.9 (pages merged): ${clusters.map(c => c.toFixed(0)).join(", ")}`);

// Typst: the title baseline py=588.5
console.log("\n=== TYPST baseline py≈588.5 — all pieces by px ===");
const ty = await dump("/tmp/typst-cv/resume.pdf");
ty.filter(p => Math.abs(p.py - 588.5) < 3).sort((a, b) => a.px - b.px).forEach(p => console.log(`  px=${p.px.toFixed(1)} py=${p.py.toFixed(1)} ps=${p.ps.toFixed(1)} "${p.text.slice(0, 30)}"`));
