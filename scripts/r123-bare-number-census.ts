// r123-bare-number-census.ts — the fire-separation census for the two
// R123 candidate classes: a bare-number piece (all digits, 1-3 chars)
// followed same-baseline by an alnum-rich piece at smaller px.
// Census across the whole corpus: which pairs fire under the contiguity
// form (gap in [-1, +3.5] em of the FOLLOWER's ps) vs the far-right form
// (gap > 15 em), and what each firing pair actually is.
// Usage: bun scripts/r123-bare-number-census.ts
import { readFileSync } from "node:fs";

const mod = await import("/home/z/my-project/eon-hr/scripts/protos/cv-text-proto");
const g = globalThis as unknown as { __r118pieces?: Array<Record<string, unknown>> };

const members: [string, string][] = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
];

const isBareNumber = (t: string) => /^\d{1,3}$/.test(t);
const isAlnumRich = (t: string) => (t.match(/[A-Za-z0-9]/g) ?? []).length >= 4;

for (const [path, name] of members) {
  const raw = readFileSync(path);
  const file = new File([new Uint8Array(raw)], "m.pdf");
  g.__r118pieces = [];
  await mod.extractTextFromFile(file);
  const dbg = (g.__r118pieces ?? []).slice();
  let contig = 0, farright = 0, other = 0;
  const samples: string[] = [];
  for (let i = 0; i < dbg.length - 1; i++) {
    const a = dbg[i] as { text?: string; px?: number; py?: number; ps?: number };
    const b = dbg[i + 1] as { text?: string; px?: number; py?: number; ps?: number };
    const ta = String(a.text ?? ""), tb = String(b.text ?? "");
    if (!isBareNumber(ta) || !isAlnumRich(tb)) continue;
    if (a.px === undefined || b.px === undefined || a.py === undefined || b.py === undefined) continue;
    if (a.px <= b.px) continue; // number must be at larger px
    const psB = b.ps ?? 12;
    const dy = Math.abs((a.py ?? 0) - (b.py ?? 0));
    if (dy > psB * 0.5) continue; // same-baseline tolerance (0.5 em)
    const gapEm = (a.px - b.px) / psB; // number-start to follower-START (px diff, not bx — conservative)
    // note: for the real classes we use the follower's bx; this census uses px as the coarse pre-filter
    if (samples.length < 6) samples.push(`${ta}|${tb.slice(0, 28)}|pxΔ=${Math.round(gapEm)}em|ps=${(a.ps??0).toFixed(1)}/${(b.ps??0).toFixed(1)}`);
    other++;
  }
  console.log(`${name}: candidate pairs (bare-num + same-baseline alnum at smaller px): ${other}`);
  for (const s of samples) console.log(`   ${s}`);
}
