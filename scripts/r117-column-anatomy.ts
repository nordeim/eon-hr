// r117-column-anatomy.ts — test the COLUMN-ALIGNMENT hypothesis: pdftotext
// splits a same-line x-gap pair only when the right-hand piece starts a
// VERTICALLY-ALIGNED column (its px matches the px of pieces on other
// nearby baselines). Measure the Typst resume's right-column pieces and
// check alignment; then check the arXiv refutation pairs for NON-alignment.
// Usage: bun scripts/r117-column-anatomy.ts
import { readFileSync } from "node:fs";

const mod = await import("./protos/cv-text-proto");
const dbg = mod.__r117DebugPieces as { text: string; px?: number; py?: number; ps?: number }[];

async function dump(path: string) {
  dbg.length = 0;
  const raw = readFileSync(path);
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  return [...dbg].filter(p => p.px !== undefined) as { text: string; px: number; py: number; ps: number }[];
}

console.log("=== THE TYPST RESUME — all positioned pieces with px >= 300 (the right column) ===");
const pp = await dump("/tmp/typst-cv/resume.pdf");
// page width is ~595 (A4). The right column starts around x>350 for the dates.
const right = pp.filter(p => p.px > 330).sort((a, b) => a.py - b.py || a.px - b.px);
right.forEach(p => console.log(`  px=${p.px.toFixed(1)} py=${p.py.toFixed(1)} ps=${p.ps.toFixed(1)} "${p.text.slice(0, 30)}"`));

console.log("\n=== alignment clusters (px within 6pt across DIFFERENT baselines, >=2 lines) ===");
// greedy clustering over right-column pieces
const cols: { px: number; members: { py: number; text: string }[] }[] = [];
for (const p of right) {
  const c = cols.find(c => Math.abs(c.px - p.px) < 6);
  if (c) { if (!c.members.some(m => Math.abs(m.py - p.py) < 5)) c.members.push({ py: p.py, text: p.text }); }
  else cols.push({ px: p.px, members: [{ py: p.py, text: p.text }] });
}
cols.filter(c => c.members.length >= 2).forEach(c => {
  console.log(`  column @px≈${c.px.toFixed(1)}: ${c.members.length} baselines -> ${c.members.map(m => `"${m.text.slice(0, 14)}"@y${Math.round(m.py)}`).join(", ")}`);
});

console.log("\n=== THE ARXIV REFUTATION PAIRS — do they form columns? ===");
const ax = await dump("/tmp/r106-corpus/arxiv-2404.16710.pdf");
// the two measured same-line-at-huge-gap pairs: "comprehension."->"2017" and "main.8."->"h"
for (const target of ["2017", "h"]) {
  const hits = ax.filter(p => p.text.startsWith(target));
  // check: for each hit, is there another piece at px within 6pt on a different baseline nearby?
  let aligned = 0;
  for (const h of hits) {
    const mates = ax.filter(p => p !== h && Math.abs(p.px - h.px) < 6 && Math.abs(p.py - h.py) > 5 && Math.abs(p.py - h.py) < 200);
    if (mates.length > 0) aligned++;
  }
  console.log(`  "${target}": ${hits.length} pieces, ${aligned} with px-aligned mates within 200pt vertically`);
}
