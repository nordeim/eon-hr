// r122-rl-toc-anatomy.ts — dump the raw piece stream around the ReportLab
// TOC entries (px/py/ps/text per piece) to decode the exact phase-shift
// anatomy for the leader-dot re-order cure design.
// Usage: bun scripts/r122-rl-toc-anatomy.ts
import { readFileSync } from "node:fs";

const mod = await import("/home/z/my-project/eon-hr/scripts/protos/cv-text-proto");
const g = globalThis as unknown as { __r118pieces?: Array<Record<string, unknown>> };

const raw = readFileSync("/tmp/r109-corpus/rl-userguide.pdf");
const file = new File([new Uint8Array(raw)], "m.pdf");
await mod.extractTextFromFile(file);

const dbg = g.__r118pieces ?? [];

// find the piece carrying "About this document"
const idx = dbg.findIndex((p) => String(p.text ?? "").includes("About this document"));
console.log("piece count:", dbg.length, "target idx:", idx);
for (let i = Math.max(0, idx - 6); i <= Math.min(dbg.length - 1, idx + 8); i++) {
  const p = dbg[i] as { text?: string; sep?: string; px?: number; py?: number; ps?: number; bx?: number };
  console.log(
    i,
    JSON.stringify({
      text: String(p.text ?? "").slice(0, 40) + (String(p.text ?? "").length > 40 ? "…" : ""),
      tail: String(p.text ?? "").slice(-6),
      len: String(p.text ?? "").length,
      px: p.px !== undefined ? Math.round(p.px * 10) / 10 : undefined,
      py: p.py !== undefined ? Math.round(p.py * 10) / 10 : undefined,
      ps: p.ps !== undefined ? Math.round(p.ps * 10) / 10 : undefined,
      bx: p.bx !== undefined ? Math.round(p.bx * 10) / 10 : undefined,
      sep: p.sep ?? "",
    })
  );
}
