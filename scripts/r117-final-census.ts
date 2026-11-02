// r117-final-census.ts — THE FINAL DESIGN CENSUS. Population: same-baseline
// block boundaries, trail on left block, >=2 alnum on right block, real
// gap (B.px − A's bbox last-word xMax) >= 8em. Verdict vs pdftotext text.
// This is the exact population the proposed R117-A rule would fire on.
// Usage: bun scripts/r117-final-census.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("/tmp/r117-proto/cv-text");
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
    if (last && Math.abs(last.px - p.px) < 0.01 && Math.abs(last.py - p.py) < 0.01) last.text += p.text;
    else bs.push({ px: p.px, py: p.py, ps: p.ps, text: p.text });
  }
  return bs;
}
function wordEnds(path: string) {
  const xml = execSync(`pdftotext -bbox ${path} -`, { encoding: "utf8", maxBuffer: 128 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }).toString();
  const out: { text: string; x0: number; x1: number }[] = [];
  const wRe = /<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<\/word>/g;
  let w: RegExpExecArray | null;
  while ((w = wRe.exec(xml))) out.push({ text: w[5], x0: parseFloat(w[1]), x1: parseFloat(w[3]) });
  return out;
}
function verdict(ref: string, aTail: string, bHead: string): string {
  if (!aTail || !bHead) return "?";
  let from = 0;
  for (;;) {
    const ai = ref.indexOf(aTail, from);
    if (ai < 0) break;
    const after = ref.slice(ai + aTail.length, ai + aTail.length + bHead.length + 14);
    const bj = after.indexOf(bHead);
    if (bj >= 0 && bj <= 8) {
      const between = after.slice(0, bj);
      if (/^ +$/.test(between)) return "JOIN";
      if (/^ *\n/.test(between)) return "SPLIT";
    }
    from = ai + 1;
  }
  return "?";
}

const members: [string, string][] = [
  ["/tmp/typst-cv/resume.pdf", "Typst resume"],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter"],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
];

let totalSplit = 0, totalJoin = 0, totalQ = 0;
for (const [path, name] of members) {
  const ref = execSync(`pdftotext ${path} -`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).toString();
  const ends = wordEnds(path);
  const pp = await dump(path);
  const bs = blocks(pp);
  const rows: { realGap: number; v: string; pair: string }[] = [];
  for (let i = 1; i < bs.length; i++) {
    const A = bs[i - 1], B = bs[i];
    if (Math.abs(A.py - B.py) >= 0.5 * Math.max(A.ps, B.ps)) continue;
    // guards: trail on A, >=2 alnum on B
    if (!/\s$/.test(A.text)) continue;
    if ((B.text.match(/[A-Za-z0-9]/g) ?? []).length < 2) continue;
    // real end of A (fallback to previous block if A is space-only)
    let endBlock = A, back = 0;
    while (!/[A-Za-z0-9]/.test(endBlock.text.trim()) && i - 1 - back - 1 >= 0) { back++; endBlock = bs[i - 1 - back]; }
    const aLast = endBlock.text.trim().split(/\s+/).pop() ?? "";
    if (!aLast) continue;
    const cands = ends.filter(e => e.text === aLast);
    if (!cands.length) continue;
    const re = cands.sort((x, y) => Math.abs(x.x0 - endBlock.px) - Math.abs(y.x0 - endBlock.px))[0];
    const realGap = (B.px - re.x1) / Math.max(A.ps, B.ps);
    if (realGap < 8) continue;
    const aTail = endBlock.text.trim().split(/\s+/).slice(-2).join(" ").slice(0, 20);
    const bHead = B.text.trim().split(/\s+/).slice(0, 2).join(" ").slice(0, 20);
    const v = verdict(ref, aTail, bHead);
    rows.push({ realGap, v, pair: `${aTail} → ${bHead}` });
  }
  const s = rows.filter(r => r.v === "SPLIT").length;
  const j = rows.filter(r => r.v === "JOIN").length;
  const q = rows.filter(r => r.v === "?").length;
  totalSplit += s; totalJoin += j; totalQ += q;
  console.log(`\n${name}: ${rows.length} candidates | SPLIT ${s} · JOIN ${j} · ? ${q}`);
  rows.sort((x, y) => y.realGap - x.realGap);
  for (const r of rows.slice(0, 10)) console.log(`  real≈${r.realGap.toFixed(1)}em ${r.v.padEnd(5)} ${r.pair}`);
}
console.log(`\nTOTALS: SPLIT ${totalSplit} · JOIN ${totalJoin} · ? ${totalQ}`);
