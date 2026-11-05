// r127-classA-verdict3.ts — the ground truth, v3: window-based. For each
// Class A boundary, build a context window from the SURROUNDING pieces
// (±2 non-empty neighbors), then test the two hypotheses against pdftotext's
// normalized reading: JOIN (the boundary pieces contiguous) vs SPACE (a space
// between them). The window gives uniqueness the short fragments lack.
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
  let join = 0, space = 0, ambiguous = 0, total = 0;
  const joinSamples: string[] = [], spaceSamples: string[] = [];
  for (let i = 1; i < pieces.length; i++) {
    const prev = pieces[i - 1], cur = pieces[i];
    if (cur.sep !== " " || cur.condGap || cur.kv !== undefined) continue;
    if (cur.op === prev.op || cur.moved !== false) continue;
    const ctx = cur.opsCtx ?? "";
    if (/\bBT\b/.test(ctx.replace(/;/g, " ")) || hasPos(ctx)) continue;
    const pt = prev.text ?? "", ct = cur.text ?? "";
    if (pt.endsWith(" ") || ct.startsWith(" ") || pt.length === 0 || ct.length === 0) continue;
    total++;
    // the window: up to 2 non-empty neighbors on each side
    const before: string[] = [], after: string[] = [];
    for (let j = i - 2; j >= 0 && before.length < 2; j--) {
      const t = (pieces[j].text ?? "").trim();
      if (t) before.unshift(t);
    }
    for (let j = i + 1; j < pieces.length && after.length < 2; j++) {
      const t = (pieces[j].text ?? "").trim();
      if (t) after.push(t);
    }
    const L = before.length ? before.join(" ") + " " : "";
    const R = after.length ? " " + after.join(" ") : "";
    const core = norm(pt).trim() + "\u0001" + norm(ct).trim(); // \u0001 = the boundary marker
    const windowJoin = esc(L + core.replace("\u0001", "") + R);
    const windowSpace = esc(L + core.replace("\u0001", " ") + R);
    const sj = new RegExp(windowJoin).test(ref);
    const ss = new RegExp(windowSpace).test(ref);
    if (sj && !ss) { join++; if (joinSamples.length < 10) joinSamples.push(`${L.slice(0, 24)}[${pt.slice(-12)}‖${ct.slice(0, 12)}]${R.slice(0, 24)}`); }
    else if (ss && !sj) { space++; if (spaceSamples.length < 6) spaceSamples.push(`${pt.slice(-12)} ␣ ${ct.slice(0, 12)}`); }
    else ambiguous++;
  }
  console.log(`\n${n}: total ${total} · JOIN ${join} · SPACE ${space} · ambiguous ${ambiguous}`);
  if (joinSamples.length) console.log(`  JOIN:\n    ${joinSamples.join("\n    ")}`);
  if (spaceSamples.length) console.log(`  SPACE: ${spaceSamples.join(" · ")}`);
}
