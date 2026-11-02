// r117-text-verdict.ts — the CORRECT census. The block text is built with
// proper piece separators; the verdict reads the DEFAULT pdftotext output:
// find A's last words, then B's first words; spaces between → JOIN, a
// line break → SPLIT. Two-word fragments for uniqueness. This produces the
// true operating-point matrix for the same-line x-gap column rule.
// Usage: bun scripts/r117-text-verdict.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("./protos/cv-text-proto");
const dbg = mod.__r117DebugPieces as { text: string; px?: number; py?: number; ps?: number; sep?: string }[];

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
function verdict(ref: string, aWords: string, bWords: string): "JOIN" | "SPLIT" | "?" {
  if (!aWords || !bWords) return "?";
  const positions: number[] = [];
  let from = 0;
  for (;;) {
    const i = ref.indexOf(aWords, from);
    if (i < 0) break;
    positions.push(i);
    from = i + 1;
    if (positions.length > 40) break;
  }
  for (const ai of positions) {
    const after = ref.slice(ai + aWords.length, ai + aWords.length + bWords.length + 12);
    const bj = after.indexOf(bWords);
    if (bj >= 0 && bj <= 6) {
      const between = after.slice(0, bj);
      if (/^ +$/.test(between)) return "JOIN";
      if (/^ *\n/.test(between)) return "SPLIT";
    }
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

const allRows: { member: string; gapEm: number; trail: boolean; verdict: string; pair: string }[] = [];
for (const [path, name] of members) {
  const ref = execSync(`pdftotext ${path} -`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).toString();
  const pp = await dump(path);
  const bs = blocks(pp);
  for (let i = 1; i < bs.length; i++) {
    const A = bs[i - 1], B = bs[i];
    if (Math.abs(A.py - B.py) >= 0.5 * Math.max(A.ps, B.ps)) continue;
    const widthEm = A.text.replace(/[^A-Za-z0-9 .,:;()@\-+]/g, "").length * 0.5;
    const gapEm = (B.px - A.px) / Math.max(A.ps, B.ps) - widthEm;
    if (gapEm < 2) continue;
    const aTail = A.text.trim().split(/\s+/).slice(-2).join(" ").slice(0, 22);
    const bHead = B.text.trim().split(/\s+/).slice(0, 2).join(" ").slice(0, 22);
    // trail: block A ends with whitespace (the writer's own space or an R115-B trail piece)
    const trail = /\s$/.test(A.text);
    const v = verdict(ref, aTail, bHead);
    allRows.push({ member: name, gapEm, trail, verdict: v, pair: `"${aTail}"→"${bHead}"` });
  }
}

console.log("=== THE OPERATING-POINT MATRIX (true verdicts) ===");
for (const T of [3, 4, 6, 8, 12, 16, 24]) {
  for (const reqTrail of [true, false]) {
    const sel = allRows.filter(r => r.gapEm >= T && (!reqTrail || r.trail));
    const s = sel.filter(r => r.verdict === "SPLIT").length;
    const j = sel.filter(r => r.verdict === "JOIN").length;
    const u = sel.filter(r => r.verdict === "?").length;
    const jDetail = new Map<string, string[]>();
    sel.filter(r => r.verdict === "JOIN").forEach(r => { if (!jDetail.has(r.member)) jDetail.set(r.member, []); if (jDetail.get(r.member)!.length < 3) jDetail.get(r.member)!.push(`${r.gapEm.toFixed(1)}em ${r.pair}`); });
    console.log(`T=${T} trail=${reqTrail ? "REQ" : "any"}: SPLIT ${s} · JOIN ${j} · ? ${u}${j ? " | JOINs: " + [...jDetail.entries()].map(([m, xs]) => `${m}[${xs.join(" ; ")}]`).join(" · ") : ""}`);
  }
}

console.log("\n=== TYPST family rows (gap >= 2em) — the cure targets ===");
allRows.filter(r => r.member.startsWith("Typst")).forEach(r => console.log(`  ${r.member}: gap≈${r.gapEm.toFixed(1)}em trail=${r.trail} ${r.verdict} ${r.pair}`));
