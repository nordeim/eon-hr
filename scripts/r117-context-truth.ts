// r117-context-truth.ts — exact ground truth: dump pdftotext's actual
// context around the candidate pairs (fixed-window reads, not indexOf
// guesswork), plus the full Typst piece map in stream order.
// Usage: bun scripts/r117-context-truth.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("./protos/cv-text-proto");
const dbg = mod.__r117DebugPieces as { text: string; px?: number; py?: number; ps?: number }[];

async function dump(path: string) {
  dbg.length = 0;
  const raw = readFileSync(path);
  await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  return [...dbg].filter(p => p.px !== undefined) as { text: string; px: number; py: number; ps: number }[];
}

// ---- arXiv: the two refutation pairs, with true context ----
console.log("=== ARXIV — the 'same-line at 42-45em' claims, exact context ===");
const axRef = execSync("pdftotext /tmp/r106-corpus/arxiv-2404.16710.pdf -", { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
for (const needle of ["comprehension.", "main.8."]) {
  let idx = 0, shown = 0;
  while (shown < 3) {
    const i = axRef.indexOf(needle, idx);
    if (i < 0) break;
    console.log(`  "${needle}" @${i}: ...${JSON.stringify(axRef.slice(Math.max(0, i - 30), i + needle.length + 40))}...`);
    idx = i + needle.length; shown++;
  }
}

// ---- Typst resume: full stream-order piece map ----
console.log("\n=== TYPST RESUME — pieces in stream order (positioned) ===");
const pp = await dump("/tmp/typst-cv/resume.pdf");
pp.forEach((p, i) => console.log(`  [${i}] px=${p.px.toFixed(1)} py=${p.py.toFixed(1)} ps=${p.ps.toFixed(1)} "${p.text.slice(0, 36)}"`));
