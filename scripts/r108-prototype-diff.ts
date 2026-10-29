// r108-prototype-diff.ts — the LEG-A prototype member diff (the r107
// prototype discipline): HEAD's extractor vs the latin1-stream-decode
// prototype (/tmp/r108-cv-text-latin1.ts — ONLY the two PDF content-stream
// TextDecoder calls changed; the .docx XML paths stay UTF-8). The true
// blast radius: which corpus members' OUTPUT text changes, and how.
// Usage: bun scripts/r108-prototype-diff.ts
import { readFileSync } from "node:fs";

// the HEAD module through a VARIABLE path (the R108-A lesson: a literal
// "/tmp/….ts" import breaks tsc + the build's type-check on fresh
// workspaces and the .ts extension trips TS5097 — the variable form is
// invisible to both while bun resolves it at runtime)
const headMod = (await import("../src/lib/cv-text")) as typeof import("../src/lib/cv-text");
const protoPath = "/tmp/r108-cv-text-latin1.ts";
const protoMod = (await import(protoPath)) as { extractTextFromFile: (f: File) => Promise<string> };

const files: [string, string][] = [
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS f1040"],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r107-corpus/lo-calc.pdf", "lo-calc"],
  ["/tmp/r107-corpus/lo-writer.pdf", "lo-writer"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ"],
];

for (const [path, name] of files) {
  const raw = readFileSync(path);
  const mk = () => new File([new Uint8Array(raw)], "probe.pdf");
  const before = await headMod.extractTextFromFile(mk());
  const after = await protoMod.extractTextFromFile(mk());
  const aB = before.replace(/[^A-Za-z0-9]/g, "").length;
  const aA = after.replace(/[^A-Za-z0-9]/g, "").length;
  const identical = before === after;
  console.log(`\n===== ${name} =====`);
  console.log(`alnums: ${aB} → ${aA} · text ${identical ? "BYTE-IDENTICAL" : "DIFFERS"}`);
  if (!identical) {
    const bL = before.split("\n");
    const aL = after.split("\n");
    let hunks = 0;
    let total = 0;
    for (let i = 0; i < Math.max(bL.length, aL.length); i++) {
      if (bL[i] !== aL[i]) {
        total++;
        if (hunks < 6) {
          hunks++;
          console.log(`  L${i + 1}: ${JSON.stringify((bL[i] ?? "").slice(0, 80))} → ${JSON.stringify((aL[i] ?? "").slice(0, 80))}`);
        }
      }
    }
    console.log(`  total differing lines: ${total}`);
  }
}
process.exit(0);
