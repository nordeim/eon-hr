// r127-figform.ts — session 127 / parity round 126: THE HUNT, queue item 1 —
// the arXiv figure-region line-form residuals. The r126 cures bound the four
// matplotlib PTEX forms' own subsets (the 'z' un-blinded, the ligature decodes
// corrected); the r127 queue's question: how do the figure regions' LINE FORMS
// compare to pdftotext now — the per-glyph show rows' assembly (splits/joins)
// vs pdftotext's own reading of the same rows.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");

const PDF = "/tmp/r106-corpus/arxiv-2404.16710.pdf";
const raw = readFileSync(PDF);
const mine = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
const ref = execSync(`pdftotext ${PDF} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });

// The known figure-text anchors (the 4 matplotlib forms' content, measured in
// r125/r126): overview.pdf, motivation.pdf, early_exit_inference.pdf,
// self_speculative_decoding.pdf.
const anchors = [
  "different sized models",
  "shared weights",
  "Use rst N layers",       // ligature-aware: our output reads fi-ligatures
  "Pre ll Latency",
  "rst N layers",
];

console.log("=== THE FIGURE ANCHORS — mine vs pdftotext (context ±2 lines) ===");
const mineL = mine.split("\n");
const refL = ref.split("\n");
for (const a of anchors) {
  for (const [name, lines] of [["MINE", mineL], ["PDFTOTEXT", refL]] as [string, string[]][]) {
    const hits = lines.map((l, i) => [l, i] as const).filter(([l]) => l.includes(a));
    for (const [l, i] of hits.slice(0, 3)) {
      const ctx = lines.slice(Math.max(0, i - 2), i + 3).map((x) => `    | ${x}`).join("\n");
      console.log(`[${name}] anchor "${a}" @ line ${i}:\n${ctx}`);
    }
    if (!hits.length) console.log(`[${name}] anchor "${a}": NOT FOUND`);
  }
  console.log("---");
}

// The per-glyph piece anatomy of one figure row: dump the pieces of form obj
// 321 (motivation.pdf) with their text, px, and the inter-piece gaps in em.
console.log("\n=== THE PIECE ANATOMY (the motivation.pdf form's pieces) ===");
(globalThis as any).__r119pages = [];
await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
const pages = ((globalThis as any).__r119pages ?? []) as unknown[][];
// The proto surfaces via scripts/protos — re-run through the proto for the piece dump.
const proto = await import("/home/z/my-project/eon-hr/scripts/protos/cv-text-proto");
(globalThis as any).__r119pages = [];
(globalThis as any).__r118pieces = [];
await proto.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
const pieces = ((globalThis as any).__r118pieces ?? []) as Array<Record<string, unknown>>;
// The motivation form's pieces: ps 54 display-class glyphs around px 1509 py 38.
const fig = pieces.filter((p) => typeof p.ps === "number" && (p as any).ps > 40);
console.log(`display-class pieces (ps>40): ${fig.length}`);
for (const p of fig.slice(0, 60)) {
  console.log(JSON.stringify({ text: p.text, px: p.px, py: p.py, ps: p.ps, bx: p.bx, adv: p.adv }));
}
