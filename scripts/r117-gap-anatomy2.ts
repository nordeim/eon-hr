// r117-gap-anatomy2.ts — session 117 / parity round 116: measure the
// device-space x-gaps at the Typst column-split boundaries vs the normal
// in-line gaps, through the INSTRUMENTED module copy (real decode + real
// R112-A stamps — no ad-hoc parser). Also measures the other corpus members'
// same-line x-gap distributions (the refutation constraints: in-line word
// gaps everywhere else must stay joined).
// Usage: bun scripts/r117-gap-anatomy2.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("/tmp/r117-proto/cv-text");
const dbg = mod.__r117DebugPieces as { text: string; px?: number; py?: number; ps?: number; sep: string; condGap?: boolean; condKern?: boolean }[];

async function dumpPieces(path: string) {
  dbg.length = 0;
  const raw = readFileSync(path);
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  return [...dbg];
}

// ---- (1) the Typst resume: same-baseline consecutive piece x-gaps ----
console.log("=== THE TYPST RESUME — same-baseline x-gaps through the real decode ===");
const pieces = await dumpPieces("/tmp/typst-cv/resume.pdf");
console.log("pieces:", pieces.length, "| positioned:", pieces.filter(p => p.px !== undefined).length);
type Pair = { gapEm: number; ax: number; aw: number; a: string; b: string; py: number; aEnd: number };
const sameLine: Pair[] = [];
for (let i = 1; i < pieces.length; i++) {
  const a = pieces[i - 1], b = pieces[i];
  if (a.px === undefined || b.px === undefined || a.ps === undefined || b.ps === undefined) continue;
  if (Math.abs(a.py! - b.py!) >= 0.5 * Math.max(a.ps, b.ps)) continue; // cross-line — R116-A territory
  // start-to-start delta (the stamps are piece ORIGINS)
  const startDelta = (b.px! - a.px!) / Math.max(a.ps, b.ps);
  // estimate piece A's advance width: chars × 0.5 em average (proportional font
  // estimate — Latin lowercase averages ~0.5 em; the calibration reads BOTH the
  // raw start-delta and the width-adjusted gap so the threshold can be chosen
  // against the raw delta, which the extractor actually has)
  const widthEm = (a.text.length * 0.5);
  const gapEm = startDelta - widthEm;
  sameLine.push({ gapEm, ax: a.px!, aw: widthEm, a: a.text.slice(0, 22), b: b.text.slice(0, 22), py: Math.round(a.py!), aEnd: a.px! + widthEm * Math.max(a.ps, b.ps) });
}
sameLine.sort((x, y) => y.gapEm - x.gapEm);
console.log("\nsame-baseline consecutive pairs (em start-delta minus est. width), top 20:");
sameLine.slice(0, 20).forEach(g => console.log(`  gap≈${g.gapEm.toFixed(2)} em (startΔ=${(g.gapEm + g.aw).toFixed(2)}em) @y=${g.py}  "${g.a}" -> "${g.b}"`));

// ---- (2) the pdftotext split map on the resume (the cure targets) ----
console.log("\n=== pdftotext's column splits (the 5 cure targets) ===");
const ref = execSync("pdftotext /tmp/typst-cv/resume.pdf -", { encoding: "utf8" });
const targets = ["+1 (555) 010-9911|john.smith@example.com", "Senior HR Manager|TechCorp", "HR Business Partner|InnovateLLC"];
for (const t of targets) {
  const [x, y] = t.split("|");
  const found = ref.includes(x) && ref.includes(y);
  const splitAt = ref.indexOf(y) - ref.indexOf(x);
  console.log(`  "${x}" + "${y}": pdftotext has both, gap in chars: ${splitAt} (a \\n between: ${ref.slice(ref.indexOf(x) + x.length, ref.indexOf(y)).includes("\n")})`);
}

// ---- (3) the refutation constraints: same-line x-gaps on OTHER members ----
console.log("\n=== REFUTATION CONSTRAINTS — same-baseline x-gaps on the standing members ===");
for (const [p, name] of [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
] as [string, string][]) {
  const pp = await dumpPieces(p);
  let n = 0, maxStart = 0, maxGap = 0; let maxStartPair = "", maxGapPair = "";
  for (let i = 1; i < pp.length; i++) {
    const a = pp[i - 1], b = pp[i];
    if (a.px === undefined || b.px === undefined || a.ps === undefined || b.ps === undefined) continue;
    if (Math.abs(a.py! - b.py!) >= 0.5 * Math.max(a.ps, b.ps)) continue;
    const startDelta = (b.px! - a.px!) / Math.max(a.ps, b.ps);
    const widthEm = a.text.length * 0.5;
    const gapEm = startDelta - widthEm;
    n++;
    if (startDelta > maxStart) { maxStart = startDelta; maxStartPair = `"${a.text.slice(0, 14)}"->"${b.text.slice(0, 14)}"`; }
    if (gapEm > maxGap) { maxGap = gapEm; maxGapPair = `"${a.text.slice(0, 14)}"->"${b.text.slice(0, 14)}"`; }
  }
  console.log(`${name}: ${n} same-line pairs | max start-Δ ${maxStart.toFixed(2)} em (${maxStartPair}) | max width-adj gap ${maxGap.toFixed(2)} em (${maxGapPair})`);
}
