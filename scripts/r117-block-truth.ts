// r117-block-truth.ts — for every same-line block boundary >= threshold on
// every member, check pdftotext's verdict (SPLIT vs JOIN) using the block
// TEXT (concatenated, unique enough for reliable context matching).
// Reports per member: how many >=8em boundaries pdftotext splits vs joins.
// Usage: bun scripts/r117-block-truth.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("./protos/cv-text-proto");
const dbg = mod.__r117DebugPieces as { text: string; px?: number; py?: number; ps?: number }[];

type P = { text: string; px: number; py: number; ps: number };
async function dump(path: string): Promise<P[]> {
  dbg.length = 0;
  const raw = readFileSync(path);
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  return dbg.filter(p => p.px !== undefined) as P[];
}
function blocks(pp: P[]) {
  const bs: { px: number; py: number; ps: number; text: string }[] = [];
  for (const p of pp) {
    const last = bs[bs.length - 1];
    if (last && Math.abs(last.px - p.px) < 0.01 && Math.abs(last.py - p.py) < 0.01 && Math.abs(last.ps - p.ps) < 0.01) last.text += p.text;
    else bs.push({ px: p.px, py: p.py, ps: p.ps, text: p.text });
  }
  return bs;
}

// pdftotext verdict: find a-fragment then b-fragment within a window;
// spaces between → JOIN; \n (with optional spaces) → SPLIT
function verdict(ref: string, a: string, b: string): "JOIN" | "SPLIT" | "?" {
  const ta = a.trim().slice(0, 14), tb = b.trim().slice(0, 14);
  if (!ta || !tb) return "?";
  const ai = ref.indexOf(ta);
  if (ai < 0) return "?";
  const after = ref.slice(ai + ta.length, ai + ta.length + ta.length + tb.length + 30);
  const bj = after.indexOf(tb);
  if (bj < 0) return "?";
  const between = after.slice(0, bj);
  if (/^ +$/.test(between)) return "JOIN";
  if (/^ *\n/.test(between)) return "SPLIT";
  return "?";
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

for (const [path, name] of members) {
  const ref = execSync(`pdftotext ${path} -`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const pp = await dump(path);
  const bs = blocks(pp);
  const rows: { gapEm: number; a: string; b: string }[] = [];
  for (let i = 1; i < bs.length; i++) {
    const A = bs[i - 1], B = bs[i];
    if (Math.abs(A.py - B.py) >= 0.5 * Math.max(A.ps, B.ps)) continue;
    const widthEm = A.text.replace(/[^A-Za-z0-9 .,:;()@\-+]/g, "").length * 0.5;
    const gapEm = (B.px - A.px) / Math.max(A.ps, B.ps) - widthEm;
    if (gapEm >= 8) rows.push({ gapEm, a: A.text, b: B.text });
  }
  rows.sort((x, y) => y.gapEm - x.gapEm);
  let split = 0, join = 0, unknown = 0;
  const joinExamples: string[] = [];
  for (const r of rows) {
    const v = verdict(ref, r.a, r.b);
    if (v === "SPLIT") split++;
    else if (v === "JOIN") { join++; if (joinExamples.length < 6) joinExamples.push(`gap≈${r.gapEm.toFixed(1)}em "${r.a.slice(0, 20)}" -> "${r.b.slice(0, 20)}"`); }
    else unknown++;
  }
  console.log(`\n===== ${name}: ${rows.length} same-line block boundaries >= 8em =====`);
  console.log(`  pdftotext: SPLIT ${split} · JOIN ${join} · ? ${unknown}`);
  if (joinExamples.length) { console.log("  JOIN examples (the refutation class):"); joinExamples.forEach(e => console.log("    " + e)); }
}
