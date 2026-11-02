// r117-pair-truth.ts — the decisive measurement: for the top same-baseline
// x-gap pairs on EVERY member, does pdftotext read them same-line or split?
// A gap rule is only viable where pdftotext's own behavior splits at gaps.
// Usage: bun scripts/r117-pair-truth.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("./protos/cv-text-proto");
const dbg = mod.__r117DebugPieces as { text: string; px?: number; py?: number; ps?: number }[];

async function topPairs(path: string, minGap = 3.0, maxN = 12) {
  dbg.length = 0;
  const raw = readFileSync(path);
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const pp = [...dbg];
  const out: { a: string; b: string; gapEm: number; startEm: number }[] = [];
  for (let i = 1; i < pp.length; i++) {
    const a = pp[i - 1], b = pp[i];
    if (a.px === undefined || b.px === undefined || a.ps === undefined || b.ps === undefined) continue;
    if (Math.abs(a.py! - b.py!) >= 0.5 * Math.max(a.ps, b.ps)) continue;
    const startEm = (b.px! - a.px!) / Math.max(a.ps, b.ps);
    const gapEm = startEm - a.text.length * 0.5;
    if (gapEm >= minGap) out.push({ a: a.text, b: b.text, gapEm, startEm });
  }
  out.sort((x, y) => y.gapEm - x.gapEm);
  return out.slice(0, maxN);
}

function refReads(ref: string, a: string, b: string): string {
  // find `a` in ref, then check whether `b` follows within the next few
  // tokens with only spaces between (same-line) or with a \n (split)
  const ai = ref.indexOf(a);
  if (ai < 0) return "A-NOT-FOUND";
  const after = ref.slice(ai + a.length, ai + a.length + a.length + b.length + 40);
  const bj = after.indexOf(b);
  if (bj < 0) return "B-NOT-AFTER-A";
  const between = after.slice(0, bj);
  if (/^[ ]+$/.test(between)) return "SAME-LINE (spaces)";
  if (between.includes("\n")) return "SPLIT (\\n)";
  return "OTHER: " + JSON.stringify(between.slice(0, 20));
}

const members: [string, string][] = [
  ["/tmp/typst-cv/resume.pdf", "Typst resume"],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
];

for (const [p, name] of members) {
  const ref = execSync(`pdftotext ${p} -`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const pairs = await topPairs(p, 3.5, 10);
  console.log(`\n===== ${name} — top ${pairs.length} same-line x-gap pairs vs pdftotext =====`);
  for (const pr of pairs) {
    const verdict = refReads(ref, pr.a.slice(0, 18), pr.b.slice(0, 18));
    console.log(`  gap≈${pr.gapEm.toFixed(1)}em startΔ=${pr.startEm.toFixed(1)}em | ${verdict} | "${pr.a.slice(0, 18)}" -> "${pr.b.slice(0, 18)}"`);
  }
}
