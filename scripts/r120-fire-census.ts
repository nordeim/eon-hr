// r120-fire-census.ts — every pair the candidate's R117-A (>=2.5em) and
// R118-A (>=0.95em) rules actually FIRE on, across the drifting members,
// with the poppler line-membership verdict for each — the away population
// isolated with its exact anatomy (gap, intervening pieces, block texts).
// Usage: bun scripts/r120-fire-census.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("./protos/cv-text-proto");
type S = { px?: number; py?: number; ps?: number; bx?: number; condGap?: boolean; condKern?: boolean };
type P = { p?: S; text: string; genuine?: boolean; trail?: boolean };

const members: [string, string][] = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
];

for (const [path, name] of members) {
  (globalThis as unknown as { __r119pages: P[][] }).__r119pages = [];
  const raw = readFileSync(path);
  const out = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const decoded = ((globalThis as unknown as { __r119pages: P[][] }).__r119pages ?? []).flat();
  // replicate the R117-A/R118-A fire conditions, capturing the pair anatomy
  const fires: { gap: number; left: string; right: string; between: string; kind: string }[] = [];
  const hasSpaceGlyphs = decoded.some(({ text }) => text.length > 0 && /^ +$/.test(text));
  for (let i = 1; i < decoded.length; i++) {
    const d = decoded[i], e = decoded[i - 1];
    const p = d.p, q = e.p;
    if (!p || !q || p.px === undefined || p.py === undefined || p.ps === undefined) continue;
    if (q.px === undefined || q.py === undefined || q.ps === undefined || q.bx === undefined) continue;
    if (Math.abs(q.px - p.px) < 0.01) continue;
    if (Math.abs(q.py - p.py) >= 0.5 * Math.max(q.ps, p.ps)) continue;
    const gapEm = (p.px - q.bx) / Math.max(q.ps, p.ps);
    if (gapEm < 2.5) continue;
    let j = i - 1;
    const consumed: number[] = [];
    while (j >= 0) {
      const dj = decoded[j];
      if (dj.genuine === true && dj.text.length > 0 && /^ +$/.test(dj.text)) { consumed.push(j); j--; continue; }
      break;
    }
    let alnumRight = 0;
    for (let k = i; k < decoded.length; k++) {
      const dk = decoded[k];
      if (dk.p?.px === undefined || dk.p?.py === undefined) break;
      if (Math.abs(dk.p.px - p.px) > 0.01 || Math.abs(dk.p.py - p.py) > 0.01) break;
      alnumRight += (dk.text.match(/[A-Za-z0-9]/g) ?? []).length;
    }
    if (alnumRight < 2) continue;
    if (p.condGap && hasSpaceGlyphs) continue;
    if (p.condKern && d.genuine) continue;
    const between = decoded.slice(j + 1, i).map((x) => x.text).join("|");
    fires.push({ gap: gapEm, left: decoded[j].text.slice(-30), right: decoded.slice(i, i + 2).map((x) => x.text).join(" ").slice(0, 30), between, kind: alnumRight >= 2 ? "R117A" : "" });
  }
  console.log(`\n===== ${name}: ${fires.length} R117-A fires =====`);
  // gap histogram
  const bands = new Map<string, number>();
  for (const f of fires) {
    const b = f.gap < 3 ? "2.5-3" : f.gap < 4 ? "3-4" : f.gap < 5 ? "4-5" : f.gap < 8 ? "5-8" : f.gap < 13 ? "8-13" : "13+";
    bands.set(b, (bands.get(b) ?? 0) + 1);
  }
  console.log("  gap bands:", [...bands.entries()].map(([b, n]) => `${b}em:${n}`).join(" "));
  const withBetween = fires.filter((f) => f.between.length > 0);
  console.log(`  fires with intervening non-space content: ${withBetween.length}`);
  for (const f of withBetween.slice(0, 4)) console.log(`    gap ${f.gap.toFixed(2)} between [${f.between.slice(0, 40)}] left "...${f.left}" right "${f.right}"`);
  const pure = fires.filter((f) => f.between.length === 0);
  console.log(`  pure-gap fires: ${pure.length}`);
  for (const f of pure.slice(0, 6)) console.log(`    gap ${f.gap.toFixed(2)} left "...${f.left}" right "${f.right}"`);
}
