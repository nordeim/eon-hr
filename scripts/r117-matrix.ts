// r117-matrix.ts — the operating-point matrix: for every same-line block
// boundary on every member, record (estimated gap em, left-block genuine
// trailing space, pdftotext verdict). Find the (threshold, trail-required)
// operating point with ZERO JOIN misfires across the standing corpus while
// curing the Typst family. The Typst verdicts use the fallback word match
// (space-only blocks fall back to the previous block).
// Usage: bun scripts/r117-matrix.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("./protos/cv-text-proto");
const dbg = mod.__r117DebugPieces as { text: string; px?: number; py?: number; ps?: number }[];

type P = { text: string; px: number; py: number; ps: number; trail?: boolean };
async function dump(path: string): Promise<P[]> {
  dbg.length = 0;
  const raw = readFileSync(path);
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  return dbg.filter(p => p.px !== undefined) as P[];
}
// blocks carry trail = ANY member piece has genuine trail (the R115-B flag
// is per-piece; a block's text ending in a genuine space)
function blocks(pp: P[]) {
  const bs: { px: number; py: number; ps: number; text: string; trail: boolean }[] = [];
  for (const p of pp) {
    const last = bs[bs.length - 1];
    if (last && Math.abs(last.px - p.px) < 0.01 && Math.abs(last.py - p.py) < 0.01 && Math.abs(last.ps - p.ps) < 0.01) {
      last.text += p.text;
      if (/\s$/.test(p.text)) last.trail = true;
    } else {
      bs.push({ px: p.px, py: p.py, ps: p.ps, text: p.text, trail: /\s$/.test(p.text) });
    }
  }
  return bs;
}
type BW = { x: number; y: number; text: string; line: number };
function bboxWords(path: string): BW[] {
  const xml = execSync(`pdftotext -bbox ${path} -`, { encoding: "utf8", maxBuffer: 128 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }).toString();
  const out: BW[] = [];
  const wRe = /<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<\/word>/g;
  let w: RegExpExecArray | null;
  let line = 0, prevY: number | null = null;
  while ((w = wRe.exec(xml))) {
    const y = parseFloat(w[2]);
    if (prevY !== null && Math.abs(y - prevY) > 2.5) line++;
    out.push({ x: parseFloat(w[1]), y, text: w[5], line });
    prevY = y;
  }
  return out;
}
function findBW(words: BW[], frag: string, px: number): number {
  const f = frag.replace(/[^A-Za-z0-9]/g, "").slice(0, 8);
  if (!f) return -1;
  let best = -1, bestD = Infinity;
  for (let i = 0; i < words.length; i++) {
    const wf = words[i].text.replace(/[^A-Za-z0-9]/g, "");
    if (wf.length < 2) continue;
    if (!wf.startsWith(f.slice(0, Math.min(4, f.length)))) continue;
    const d = Math.abs(words[i].x - px);
    if (d < bestD) { bestD = d; best = i; }
  }
  return bestD < 50 ? best : -1;
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

const allRows: { member: string; gapEm: number; trail: boolean; verdict: "JOIN" | "SPLIT" | "?" }[] = [];
for (const [path, name] of members) {
  const words = bboxWords(path);
  const pp = await dump(path);
  const bs = blocks(pp);
  for (let i = 1; i < bs.length; i++) {
    const A = bs[i - 1], B = bs[i];
    if (Math.abs(A.py - B.py) >= 0.5 * Math.max(A.ps, B.ps)) continue;
    const widthEm = A.text.replace(/[^A-Za-z0-9 .,:;()@\-+]/g, "").length * 0.5;
    const gapEm = (B.px - A.px) / Math.max(A.ps, B.ps) - widthEm;
    if (gapEm < 2) continue; // deep-census the >=2em band
    // word match: A's last alnum fragment (fallback: previous block's), B's first
    let aFrag = (A.text.trim().split(/\s+/).pop() ?? "");
    let aPx = A.px;
    if (!/[A-Za-z0-9]/.test(aFrag)) {
      // space-only block: use the PREVIOUS block (the real left neighbor)
      if (i >= 2) { const P2 = bs[i - 2]; aFrag = P2.text.trim().split(/\s+/).pop() ?? ""; aPx = P2.px; }
    }
    const bFrag = B.text.trim().split(/\s+/)[0] ?? "";
    const ia = findBW(words, aFrag, aPx);
    const ib = findBW(words, bFrag, B.px);
    let verdict: "JOIN" | "SPLIT" | "?" = "?";
    if (ia >= 0 && ib >= 0) verdict = words[ia].line === words[ib].line ? "JOIN" : "SPLIT";
    allRows.push({ member: name, gapEm, trail: A.trail, verdict });
  }
}

// the operating-point sweep
console.log("member | trail? | >=T counts (SPLIT/JOIN/?) by threshold");
for (const T of [3, 4, 6, 8, 12, 16]) {
  for (const reqTrail of [true, false]) {
    const sel = allRows.filter(r => r.gapEm >= T && (!reqTrail || r.trail));
    const s = sel.filter(r => r.verdict === "SPLIT").length;
    const j = sel.filter(r => r.verdict === "JOIN").length;
    const u = sel.filter(r => r.verdict === "?").length;
    const byMem = new Map<string, number>();
    sel.filter(r => r.verdict === "JOIN").forEach(r => byMem.set(r.member, (byMem.get(r.member) ?? 0) + 1));
    const typstCured = allRows.filter(r => r.member === "Typst resume" && r.gapEm >= T && r.verdict === "SPLIT" && (!reqTrail || r.trail)).length;
    console.log(`T=${T}em trail=${reqTrail ? "REQ" : "any"}: SPLIT ${s} · JOIN ${j} · ? ${u} | Typst cured ${typstCured}/7${j ? " | JOINs: " + [...byMem.entries()].map(([m, c]) => `${m}×${c}`).join(", ") : ""}`);
  }
}

// the trail-carrying JOIN census (the refutation detail)
console.log("\n=== ALL trail-carrying JOIN pairs >= 3em (the refutation class for the trail signature) ===");
allRows.filter(r => r.trail && r.verdict === "JOIN" && r.gapEm >= 3).forEach(r => console.log(`  ${r.member}: gap≈${r.gapEm.toFixed(1)}em`));
console.log("(count: " + allRows.filter(r => r.trail && r.verdict === "JOIN" && r.gapEm >= 3).length + ")");

// Typst detail
console.log("\n=== TYPST resume rows (gap >= 2em) ===");
allRows.filter(r => r.member === "Typst resume" && r.gapEm >= 2).forEach(r => console.log(`  gap≈${r.gapEm.toFixed(1)}em trail=${r.trail} ${r.verdict}`));
