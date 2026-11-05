// r127-classA-census.ts — the REFINED census: Class A site-2 boundaries =
// same text object (NO BT in the intervening ops) AND no positioning op at
// all (no Td/TD/Tm/T* — even a 0-delta one) AND the output ACTUALLY emits a
// space there (prev doesn't end with a space, cur doesn't start with one —
// the redundant-sep suppression). Class B (BT present) is the Typst
// word-separator pin — excluded. For each Class A boundary: what does
// pdftotext read at the junction?
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
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

const hasPos = (ctx: string) => /\b(BT|Td|TD|Tm|T\*)\b/.test(ctx.replace(/;/g, " "));

for (const [p, n] of members) {
  const raw = readFileSync(p);
  (globalThis as any).__r118pieces = [];
  (globalThis as any).__r119pages = [];
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const pieces = ((globalThis as any).__r118pieces ?? []) as Array<Record<string, any>>;
  let classA = 0, classB = 0, suppressed = 0, posPresent = 0;
  const samples: string[] = [];
  const sigCount = new Map<string, number>();
  for (let i = 1; i < pieces.length; i++) {
    const prev = pieces[i - 1], cur = pieces[i];
    if (cur.sep !== " " || cur.condGap || cur.kv !== undefined) continue;
    if (cur.op === prev.op || cur.moved !== false) continue;
    const ctx = cur.opsCtx ?? "";
    if (/\bBT\b/.test(ctx.replace(/;/g, " "))) { classB++; continue; }
    if (hasPos(ctx)) { posPresent++; continue; }
    // Class A candidate: same text object, no positioning. Output-impact filter:
    const pt = prev.text ?? "", ct = cur.text ?? "";
    if (pt.endsWith(" ") || ct.startsWith(" ") || pt.length === 0 || ct.length === 0) { suppressed++; continue; }
    classA++;
    const sig = ctx.slice(0, 60) || "(empty)";
    sigCount.set(sig, (sigCount.get(sig) ?? 0) + 1);
    if (samples.length < 12) samples.push(`${JSON.stringify(pt.slice(-18))}[${prev.font}] +SP+ ${JSON.stringify(ct.slice(0, 18))}[${cur.font}] ctx=${JSON.stringify(sig)}`);
  }
  console.log(`\n${n}: CLASS-A (pen-continues, space EMITTED) ${classA} · class-B(BT) ${classB} · pos-present ${posPresent} · space-suppressed ${suppressed}`);
  for (const [sig, c] of [...sigCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)) console.log(`    ${c}x ctx=${JSON.stringify(sig)}`);
  for (const s of samples.slice(0, 6)) console.log(`      ${s}`);
}
