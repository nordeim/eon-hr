// r117-arxiv-anatomy.ts — dump the arXiv pieces around the refutation pair
// "comprehension."->"2017" with full stamps + neighbors, to decide whether
// the pair is truly a same-baseline consecutive pair or a measurement
// artifact (e.g. stream-order phase between columns).
// Usage: bun scripts/r117-arxiv-anatomy.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("./protos/cv-text-proto");
const dbg = mod.__r117DebugPieces as { text: string; px?: number; py?: number; ps?: number }[];
dbg.length = 0;
const raw = readFileSync("/tmp/r106-corpus/arxiv-2404.16710.pdf");
await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
const pp = dbg.filter(p => p.px !== undefined) as { text: string; px: number; py: number; ps: number }[];

// locate every "comprehension." piece
const hits = pp.map((p, i) => ({ p, i })).filter(x => x.p.text.includes("comprehension"));
console.log(`"comprehension" pieces: ${hits.length}`);
for (const h of hits.slice(0, 4)) {
  console.log(`\n===== [${h.i}] px=${h.p.px.toFixed(1)} py=${h.p.py.toFixed(1)} ps=${h.p.ps.toFixed(1)} "${h.p.text.slice(0, 40)}" =====`);
  const lo = Math.max(0, h.i - 3), hi = Math.min(pp.length, h.i + 4);
  for (let j = lo; j < hi; j++) {
    const q = pp[j];
    const startDelta = j > 0 ? ((q.px - pp[j - 1].px) / Math.max(pp[j - 1].ps, q.ps)).toFixed(1) : "-";
    console.log(`  [${j}] px=${q.px.toFixed(1)} py=${q.py.toFixed(1)} ps=${q.ps.toFixed(1)} startΔ(prev)=${startDelta}em "${q.text.slice(0, 36)}"`);
  }
}

// also: what does pdftotext -layout read at that page? (2-col check)
console.log("\n=== pdftotext -layout around 'machine comprehension. 2017' ===");
const lay = execSync("pdftotext -layout /tmp/r106-corpus/arxiv-2404.16710.pdf -", { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const li = lay.indexOf("comprehension. 2017");
if (li >= 0) {
  console.log(JSON.stringify(lay.slice(li - 120, li + 60)));
} else {
  const li2 = lay.indexOf("comprehension.");
  console.log("direct pair not in layout; first comprehension. context:", JSON.stringify(lay.slice(Math.max(0, li2 - 100), li2 + 120)));
}
