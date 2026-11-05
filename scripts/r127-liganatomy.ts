// r127-liganatomy.ts — session 127 / parity round 126: the ligature-spacing
// artifact anatomy. The figure rows read "di ﬀ erent" / "Use ﬁ rst" in our
// output vs pdftotext's "diﬀerent" / "Use ﬁrst" — spaces wrapped around the
// ligature pieces. Dump the exact pieces + gaps around every ﬁ/ﬀ piece in the
// arXiv corpus to see whether the gaps are sub-space-class (a joiner
// threshold artifact) or genuine word gaps.
import { readFileSync } from "node:fs";
const proto = await import("/home/z/my-project/eon-hr/scripts/protos/cv-text-proto");

const PDF = "/tmp/r106-corpus/arxiv-2404.16710.pdf";
const raw = readFileSync(PDF);
(globalThis as any).__r119pages = [];
(globalThis as any).__r118pieces = [];
await proto.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
const pieces = ((globalThis as any).__r118pieces ?? []) as Array<Record<string, any>>;

// Group pieces into runs: same py (rounded), sorted by px — reconstruct rows.
// Focus: rows containing a ligature piece (ﬁ/ﬀ/ﬂ/ﬃ/ﬄ).
const LIG = /[\uFB00-\uFB04]/;
const ligPieces = pieces.filter((p) => typeof p.text === "string" && LIG.test(p.text));
console.log(`ligature pieces: ${ligPieces.length}`);
for (const lp of ligPieces.slice(0, 40)) {
  console.log(JSON.stringify({ text: lp.text, px: Math.round(lp.px * 10) / 10, py: Math.round(lp.py * 10) / 10, ps: lp.ps, bx: Math.round(lp.bx * 10) / 10, w: lp.w, font: lp.font }));
}

// For each ligature piece, find its row neighbors (same page+part? we only
// have the flat pieces — use py+ps proximity and px window) and measure the
// gaps: prev.bx -> lig.px and lig.bx -> next.px, in em units (gap / ps).
console.log("\n=== THE GAP ANATOMY (prev.bx→lig.px and lig.bx→next.px, in em) ===");
const em = (gap: number, ps: number) => gap / ps;
let spaceClass = 0, subSpace = 0;
for (const lp of ligPieces) {
  if (typeof lp.px !== "number" || typeof lp.bx !== "number" || !lp.ps) continue;
  // neighbors: pieces whose py is within 2 units and px near the ligature
  const row = pieces.filter((p) => p !== lp && typeof p.px === "number" && typeof p.bx === "number"
    && Math.abs((p.py ?? 1e9) - (lp.py ?? -1e9)) < 3
    && Math.abs(p.ps - lp.ps) < 1);
  row.sort((a, b) => a.px - b.px);
  const prev = row.filter((p) => p.bx <= lp.px + 0.5).pop();
  const next = row.find((p) => p.px >= lp.bx - 0.5);
  const g1 = prev ? em(lp.px - prev.bx, lp.ps) : null;
  const g2 = next ? em(next.px - lp.bx, lp.ps) : null;
  const verdict = (g: number | null) => g === null ? "-" : g < 0.17 ? "join" : g < 0.35 ? "SUB-SPACE" : "space";
  if (g1 !== null && g1 >= 0.17 && g1 < 0.35) spaceClass++;
  if (g2 !== null && g2 >= 0.17 && g2 < 0.35) spaceClass++;
  if (g1 !== null && g1 < 0.17) subSpace++;
  if (g2 !== null && g2 < 0.17) subSpace++;
  console.log(`lig ${JSON.stringify(lp.text)} ps ${lp.ps}: prev ${prev ? JSON.stringify(prev.text) : "∅"} gap1 ${g1 === null ? "-" : g1.toFixed(3)}em [${verdict(g1)}] → next ${next ? JSON.stringify(next.text) : "∅"} gap2 ${g2 === null ? "-" : g2.toFixed(3)}em [${verdict(g2)}]`);
}
console.log(`\nsub-space (joinable) gaps: ${subSpace} · space-class (0.17–0.35em) gaps: ${spaceClass}`);
