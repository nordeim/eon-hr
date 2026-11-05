// r127-debug-pieces.ts — dump ALL fields of the pieces around the ﬀ ligature
// in the motivation form row (the arXiv member) to see the actual sep values
// and block origins.
import { readFileSync } from "node:fs";
const proto = await import("/home/z/my-project/eon-hr/scripts/protos/cv-text-proto");

const raw = readFileSync("/tmp/r106-corpus/arxiv-2404.16710.pdf");
(globalThis as any).__r118pieces = [];
(globalThis as any).__r119pages = [];
await proto.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
const pieces = ((globalThis as any).__r118pieces ?? []) as Array<Record<string, any>>;
console.log(`total pieces: ${pieces.length}`);
console.log("field keys sample:", JSON.stringify(Object.keys(pieces[500] ?? pieces[0])));

// find the ﬀ piece and its neighbors
const idx = pieces.findIndex((p) => p.text === "\uFB00");
console.log(`\nﬀ piece at index ${idx}`);
for (let i = Math.max(0, idx - 12); i <= Math.min(pieces.length - 1, idx + 14); i++) {
  const p = pieces[i];
  console.log(`[${i}] ${JSON.stringify({ text: p.text, sep: p.sep, px: p.px, py: p.py, ps: p.ps, bx: p.bx, font: p.font, genuine: p.genuine, trail: p.trail, kv: p.kv, condGap: p.condGap, condKern: p.condKern, kind: p.kind })}`);
}
