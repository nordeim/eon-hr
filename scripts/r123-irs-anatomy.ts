// r123-irs-anatomy.ts — dump the IRS title-region pieces (the one
// non-ReportLab firing pair of the bare-number census).
import { readFileSync } from "node:fs";
const mod = await import("/home/z/my-project/eon-hr/scripts/protos/cv-text-proto");
const g = globalThis as unknown as { __r118pieces?: Array<Record<string, unknown>> };
const raw = readFileSync("/tmp/r106-corpus/irs-f1040.pdf");
const file = new File([new Uint8Array(raw)], "m.pdf");
await mod.extractTextFromFile(file);
const dbg = g.__r118pieces ?? [];
const idx = dbg.findIndex((p) => String(p.text ?? "").includes("U.S. Individual Income Tax R"));
console.log("target idx:", idx);
for (let i = Math.max(0, idx - 6); i <= Math.min(dbg.length - 1, idx + 4); i++) {
  const p = dbg[i] as { text?: string; sep?: string; px?: number; py?: number; ps?: number; bx?: number };
  console.log(i, JSON.stringify({ text: String(p.text ?? "").slice(0, 35), px: p.px !== undefined ? Math.round(p.px*10)/10 : undefined, py: p.py !== undefined ? Math.round(p.py*10)/10 : undefined, ps: p.ps !== undefined ? Math.round(p.ps*10)/10 : undefined, bx: p.bx !== undefined ? Math.round(p.bx*10)/10 : undefined, sep: p.sep ?? "" }));
}
