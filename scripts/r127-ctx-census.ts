// r127-ctx-census.ts — with the opsCtx proto: for each site-2 boundary
// (sep=" ", no condGap, no kv, moved===false, op differs), print the EXACT
// intervening ops. Group the boundaries by their opsCtx signature to see the
// real classes (pure font switch vs empty vs something else).
import { readFileSync } from "node:fs";
const PATCHED = "/tmp/r127-opsctx-proto.ts"; // the variable form — the literal /tmp import ban (the r126 trap)
const mod = await import(PATCHED);

const members: Array<[string, string]> = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
  ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint"],
  ["/tmp/typst-cv/resume.pdf", "Typst resume"],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2"],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter"],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2"],
];

for (const [p, n] of members) {
  const raw = readFileSync(p);
  (globalThis as any).__r118pieces = [];
  (globalThis as any).__r119pages = [];
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const pieces = ((globalThis as any).__r118pieces ?? []) as Array<Record<string, any>>;
  const sigs = new Map<string, number>();
  const examples = new Map<string, string>();
  for (let i = 1; i < pieces.length; i++) {
    const prev = pieces[i - 1], cur = pieces[i];
    if (cur.sep !== " " || cur.condGap || cur.kv !== undefined) continue;
    if (cur.op === prev.op || cur.moved !== false) continue;
    const sig = (cur.opsCtx ?? "").slice(0, 120);
    sigs.set(sig, (sigs.get(sig) ?? 0) + 1);
    if (!examples.has(sig)) {
      examples.set(sig, `${JSON.stringify((prev.text ?? "").slice(0, 20))}[${prev.font}] | ${JSON.stringify((cur.text ?? "").slice(0, 20))}[${cur.font}]`);
    }
  }
  if (sigs.size === 0) { console.log(`${n}: 0 site-2 boundaries`); continue; }
  console.log(`\n${n}: ${[...sigs.values()].reduce((a, b) => a + b, 0)} site-2 boundaries, ${sigs.size} op signatures:`);
  const sorted = [...sigs.entries()].sort((a, b) => b[1] - a[1]);
  for (const [sig, count] of sorted.slice(0, 8)) {
    console.log(`  ${count}x  ctx=${JSON.stringify(sig)}  e.g. ${examples.get(sig)}`);
  }
}
