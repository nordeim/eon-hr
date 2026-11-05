// r127-classA-verdict.ts — the GROUND TRUTH: at each Class A boundary, does
// pdftotext read a SPACE or CONTIGUOUS text? For every boundary, reconstruct
// the junction (prevTail + sep + curHead) in our output and find the same
// text in pdftotext's reading; classify JOIN (pdftotext contiguous) vs SPACE
// (pdftotext reads a space) by looking at pdftotext's actual bytes between
// the prevTail and curHead fragments.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
const PATCHED = "/tmp/r127-opsctx-proto.ts"; // the variable form — the literal /tmp import ban (the r126 trap)
const mod = await import(PATCHED);

const members: Array<[string, string]> = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
];

const hasPos = (ctx: string) => /\b(BT|Td|TD|Tm|T\*)\b/.test(ctx.replace(/;/g, " "));

for (const [p, n] of members) {
  const raw = readFileSync(p);
  (globalThis as any).__r118pieces = [];
  (globalThis as any).__r119pages = [];
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const pieces = ((globalThis as any).__r118pieces ?? []) as Array<Record<string, any>>;
  const ref = execSync(`pdftotext ${p} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
  let join = 0, space = 0, ambiguous = 0;
  const joinSamples: string[] = [], spaceSamples: string[] = [];
  for (let i = 1; i < pieces.length; i++) {
    const prev = pieces[i - 1], cur = pieces[i];
    if (cur.sep !== " " || cur.condGap || cur.kv !== undefined) continue;
    if (cur.op === prev.op || cur.moved !== false) continue;
    const ctx = cur.opsCtx ?? "";
    if (/\bBT\b/.test(ctx.replace(/;/g, " ")) || hasPos(ctx)) continue;
    const pt = prev.text ?? "", ct = cur.text ?? "";
    if (pt.endsWith(" ") || ct.startsWith(" ") || pt.length === 0 || ct.length === 0) continue;
    // the junction fragments: prev's tail word + cur's head word
    const tail = pt.match(/[A-Za-z0-9\u00C0-\uFFFF.']+$/) ?? [""];
    const head = ct.match(/^[A-Za-z0-9\u00C0-\uFFFF.']+/) ?? [""];
    if (!tail[0] || !head[0] || tail[0].length < 2 || head[0].length < 2) { ambiguous++; continue; }
    // pdftotext's reading: find tail immediately followed by head (JOIN) vs
    // tail + whitespace + head (SPACE). Search with escaping-free literals.
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const joinRe = new RegExp(esc(tail[0]) + esc(head[0]));
    const spaceRe = new RegExp(esc(tail[0]) + "\\s+" + esc(head[0]));
    const sj = joinRe.test(ref), ss = spaceRe.test(ref);
    if (sj && !ss) { join++; if (joinSamples.length < 8) joinSamples.push(`${tail[0]}‖${head[0]}`); }
    else if (ss && !sj) { space++; if (spaceSamples.length < 6) spaceSamples.push(`${tail[0]} ␣ ${head[0]}`); }
    else { ambiguous++; }
  }
  console.log(`\n${n}: JOIN (pdftotext contiguous) ${join} · SPACE (pdftotext reads a space) ${space} · ambiguous ${ambiguous}`);
  if (joinSamples.length) console.log(`  JOIN samples: ${joinSamples.join(" · ")}`);
  if (spaceSamples.length) console.log(`  SPACE samples: ${spaceSamples.join(" · ")}`);
}
