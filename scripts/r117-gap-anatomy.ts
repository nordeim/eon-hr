// r117-gap-anatomy.ts — session 117 / parity round 116: measure the
// device-space x-gaps at the Typst column-split boundaries vs the normal
// in-line word gaps — the threshold calibration for the same-line x-gap
// column rule. Mirrors the R116-A calibration discipline (the y-delta
// round): measure the class to cure AND the classes that must NOT fire
// (in-line word gaps, kern joins, the justified-paragraph gaps).
// Usage: bun scripts/r117-gap-anatomy.ts
import { readFileSync } from "node:fs";
import zlib from "node:zlib";

// Re-derive the piece walk by importing the module and instrumenting the
// same decode path the extractor uses — but rather than replicating the
// internals, read the raw content stream and the piece stamps through the
// module's own exported surface is not available; so parse the stream the
// same way the extractor's hunt scripts did in r116 (the cm-anatomy probe).
const raw = readFileSync("/tmp/typst-cv/resume.pdf");

// --- minimal flate stream extraction (same as the r116 probes) ---
function inflate(data: Uint8Array): Uint8Array {
  // Node zlib
    return new Uint8Array(zlib.inflateSync(Buffer.from(data)));
}
// find stream objects
const text = new TextDecoder("latin1").decode(raw);
const streamRe = /stream\r?\n/g;
const pieces: { text: string; px?: number; py?: number; ps?: number }[] = [];
// walk every stream; only the content streams carry BT/ET blocks
let m: RegExpExecArray | null;
const streams: Uint8Array[] = [];
while ((m = streamRe.exec(text)) !== null) {
  const start = m.index + m[0].length;
  const end = text.indexOf("endstream", start);
  if (end === -1) continue;
  const chunk = raw.subarray(start, end);
  try { streams.push(inflate(chunk)); } catch { /* not flate */ }
}
console.log("streams decoded:", streams.length);
const allText = streams.map(s => new TextDecoder("latin1").decode(s)).join("\n");

// The Typst form: every word its own q / a b c d tx ty cm / BT / Tf / Tm / (..) Tj / ET / Q
// Track the CTM stack + text matrix like the extractor does, and stamp (px, py, ps).
type Mat = [number, number, number, number, number, number];
const mul = (m: Mat, n: Mat): Mat => [
  m[0] * n[0] + m[1] * n[3], m[0] * n[1] + m[1] * n[4],
  m[2] * n[0] + m[3] * n[3], m[2] * n[1] + m[3] * n[4],
  m[4] * n[0] + m[5] * n[3] + n[4], m[4] * n[1] + m[5] * n[4] + n[5],
];
const apply = (m: Mat, x: number, y: number): [number, number] =>
  [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

const tokenRe = /(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+cm|q\b|Q\b|BT\b|ET\b|\/(\w+)\s+(-?[\d.]+)\s+Tf|(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+Tm|\((?:[^()\\]|\\.)*\)\s*Tj/g;

let ctm: Mat = [1, 0, 0, 1, 0, 0];
const ctmStack: Mat[] = [];
let tm: Mat = [1, 0, 0, 1, 0, 0];
let fs = 0;
let inBT = false;
const fontSizes = new Map<string, number>();
let t: RegExpExecArray | null;
const stamps: { text: string; px: number; py: number; ps: number }[] = [];
while ((t = tokenRe.exec(allText)) !== null) {
  if (t[1] !== undefined) {
    const cm: Mat = [parseFloat(t[1]), parseFloat(t[2]), parseFloat(t[3]), parseFloat(t[4]), parseFloat(t[5]), parseFloat(t[6])];
    ctm = mul(cm, ctm);
  } else if (t[0] === "q") ctmStack.push(ctm);
  else if (t[0] === "Q") ctm = ctmStack.pop() ?? ctm;
  else if (t[0] === "BT") { inBT = true; tm = [1, 0, 0, 1, 0, 0]; }
  else if (t[0] === "ET") { inBT = false; }
  else if (t[7] !== undefined) { fs = parseFloat(t[8]); if (inBT) fontSizes.set(t[7], fs); }
  else if (t[9] !== undefined && inBT) {
    tm = [parseFloat(t[9]), parseFloat(t[10]), parseFloat(t[11]), parseFloat(t[12]), parseFloat(t[13]), parseFloat(t[14])];
  } else if (t[0].endsWith("Tj") && inBT) {
    const lit = t[0].slice(0, t[0].length - 3).trim();
    const s = lit.slice(1, -1).replace(/\\([()\\])/g, "$1");
    const [px, py] = apply(mul(tm, ctm), 0, 0);
    stamps.push({ text: s, px, py, ps: fs });
  }
}
console.log("pieces stamped:", stamps.length);

// Now measure: consecutive piece pairs on the SAME py (within 0.1pt) — the
// x-delta in em units (x-gap / max ps). Compare with the pdftotext split map:
// the 5 column boundaries on the resume are the contacts, title+company (x2),
// description+dates (x2).
const sameLine: { gapEm: number; a: string; b: string; py: number }[] = [];
for (let i = 1; i < stamps.length; i++) {
  const a = stamps[i - 1], b = stamps[i];
  if (Math.abs(a.py - b.py) < 0.1 && a.ps > 0 && b.ps > 0) {
    const em = (b.px - a.px) / Math.max(a.ps, b.ps);
    sameLine.push({ gapEm: em, a: a.text.slice(0, 18), b: b.text.slice(0, 18), py: Math.round(a.py) });
  }
}
sameLine.sort((x, y) => y.gapEm - x.gapEm);
console.log("\nTOP 25 same-baseline x-gaps (em), descending:");
sameLine.slice(0, 25).forEach(g => console.log(`  gap ${g.gapEm.toFixed(2)} em  @y=${g.py}  "${g.a}" -> "${g.b}"`));
console.log(`\nsame-baseline pairs total: ${sameLine.length}`);
const above2 = sameLine.filter(g => g.gapEm >= 2).length;
const above4 = sameLine.filter(g => g.gapEm >= 4).length;
const above6 = sameLine.filter(g => g.gapEm >= 6).length;
console.log(`pairs >= 2em: ${above2}, >= 4em: ${above4}, >= 6em: ${above6}`);
