// r116-delta-calibrate.ts — session 116 / parity round 115: calibrate the
// cm-carried line-move threshold. Measures the device-space y-deltas
// (in em, divided by max(ps_prev, ps_cur)) at every consecutive positioned
// piece pair, for:
//   (a) the Typst resume — where pdftotext reads "\n" (the cure must fire)
//   (b) the arXiv member — the math-accent class (sub-em deltas where
//       pdftotext reads " " — the cure must NOT fire; the r115 refutation)
// Reports the em-delta histogram for line-move pairs vs same-line pairs.
// Usage: bun scripts/r116-delta-calibrate.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");

// Re-implement the piece dump by calling the module's internals is not
// exported; instead measure through the public API: extract with positions
// is not exposed either. So: instrument via a source-level probe — read the
// pieces through a light re-walk using the same regexes is fragile. Instead:
// use extractTextFromFile on synthetic minimal PDFs? No — use the REAL files
// and diff at the text level, plus parse the raw streams directly for the
// q/cm/BT block deltas (the Typst form is uniform).
function typstBlockDeltas(path: string) {
  const raw = readFileSync(path);
  const rawStr = raw.toString("latin1");
  const streamRe = /stream\r?\n/g;
  let m: RegExpExecArray | null;
  const blocks: { tx: number; ty: number; text: string; size: number }[] = [];
  while ((m = streamRe.exec(rawStr))) {
    const start = m.index + m[0].length;
    const end = rawStr.indexOf("endstream", start);
    if (end < 0) continue;
    const chunk = rawStr.slice(start, end);
    let content = "";
    for (const attempt of [() => zlib.inflateSync(Buffer.from(chunk, "latin1")), () => zlib.inflateRawSync(Buffer.from(chunk, "latin1"))]) {
      try { content = attempt().toString("latin1"); break; } catch { /* next */ }
    }
    if (!content.includes("BT")) continue;
    // the Typst block form: q / <cm> cm / BT / <font> <size> Tf / <Tm> / (text) Tj / ET / Q
    const blockRe = /q\s+([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+) cm\s+BT\s+\/(\S+) ([\d.]+) Tf\s+([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+) Tm\s*\(((?:\\.|[^\\()])*)\)\s*Tj/g;
    let b: RegExpExecArray | null;
    while ((b = blockRe.exec(content))) {
      blocks.push({ tx: parseFloat(b[5]), ty: parseFloat(b[6]), size: parseFloat(b[8]), text: b[14] });
    }
  }
  return blocks;
}

import zlib from "node:zlib";

console.log("=== (a) THE TYPST RESUME — consecutive block y-deltas in em ===");
const blocks = typstBlockDeltas("/tmp/typst-cv/resume.pdf");
console.log("blocks:", blocks.length);
let prev: typeof blocks[number] | null = null;
const lineDeltas: number[] = [];
const sameDeltas: number[] = [];
for (const b of blocks) {
  if (prev) {
    const dy = Math.abs(b.ty - prev.ty);
    const emDen = Math.max(prev.size, b.size);
    const em = dy / emDen;
    (em >= 0.5 ? lineDeltas : sameDeltas).push(em);
  }
  prev = b;
}
console.log("same-line deltas (em):", sameDeltas.length ? sameDeltas.map((x) => x.toFixed(3)).join(" ") : "(none)");
console.log("line-move deltas (em):", lineDeltas.map((x) => x.toFixed(3)).join(" "));
console.log("MIN line-move em:", lineDeltas.length ? Math.min(...lineDeltas).toFixed(3) : "n/a");
console.log("MAX same-line em:", sameDeltas.length ? Math.max(...sameDeltas).toFixed(3) : "n/a");

console.log("\n=== (b) THE ARXIV ACCENT CLASS — the refutation constraint ===");
// find pdftotext's "ˆ inference"-class pairs: an accent char followed by a space+word
const ref = execSync("pdftotext /tmp/r106-corpus/arxiv-2404.16710.pdf -", { encoding: "utf8" });
const accentPairs = ref.match(/[ˆ`´¨˜]\s\S+/g) || [];
console.log("accent-space-word pairs pdftotext reads:", accentPairs.length, accentPairs.slice(0, 8));

// dump the arXiv pieces with positions: walk the streams the same way the
// extractor does — reuse the module's pdfTextPieces? It is not exported; the
// blast-radius prototype will run through the real module. Here: check what
// OUR extractor currently reads between accents and words (must be " ").
const ours = await mod.extractTextFromFile(new File([new Uint8Array(readFileSync("/tmp/r106-corpus/arxiv-2404.16710.pdf"))], "m.pdf"));
const ourAcc = ours.match(/[ˆ`´¨˜]\s\S+/g) || [];
console.log("accent-space-word pairs OURS reads:", ourAcc.length, ourAcc.slice(0, 8));
const ourFused = ours.match(/[ˆ`´¨˜]\S+/g) || [];
console.log("accent-FUSED-word pairs OURS reads (must be 0 for parity):", ourFused.length, ourFused.slice(0, 8));
