// r127-classA-verdict2.ts — the ground truth, v2: normalize pdftotext's
// whitespace (\s+ -> " "), use LONG unique fragments (12+ chars from prev's
// tail and cur's head), require the fragment pair to be findable, and
// classify JOIN (tail+head contiguous) vs SPACE (tail " " head).
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
const norm = (s: string) => s.replace(/\s+/g, " ");
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

for (const [p, n] of members) {
  const raw = readFileSync(p);
  (globalThis as any).__r118pieces = [];
  (globalThis as any).__r119pages = [];
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const pieces = ((globalThis as any).__r118pieces ?? []) as Array<Record<string, any>>;
  const ref = norm(execSync(`pdftotext ${p} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 }));
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
    const tail = norm(pt).slice(-16).trim();
    const head = norm(ct).slice(0, 16).trim();
    if (tail.length < 4 || head.length < 4) { ambiguous++; continue; }
    const joinRe = new RegExp(esc(tail) + esc(head));
    const spaceRe = new RegExp(esc(tail) + " " + esc(head));
    const sj = joinRe.test(ref), ss = spaceRe.test(ref);
    if (sj && !ss) { join++; if (joinSamples.length < 10) joinSamples.push(`…${tail}‖${head}…`); }
    else if (ss && !sj) { space++; if (spaceSamples.length < 6) spaceSamples.push(`…${tail} ␣ ${head}…`); }
    else ambiguous++;
  }
  console.log(`\n${n}: JOIN ${join} · SPACE ${space} · ambiguous ${ambiguous}`);
  if (joinSamples.length) console.log(`  JOIN: ${joinSamples.join("\n         ")}`);
  if (spaceSamples.length) console.log(`  SPACE: ${spaceSamples.join(" · ")}`);
}
