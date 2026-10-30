#!/usr/bin/env bun
// r109-c1-output-probe.ts — does the CURRENT extractor's output carry C1
// control chars (U+0080–U+009F) where pdftotext reads real characters?
// The alnum pin is non-alnum-blind (the r100/r102 documented split) — a
// WinAnsi 0x92 read as U+0092 instead of U+2019 never changes the count.
// Leg 1: our extraction, count + sample the C1 chars per member.
// Leg 2: pdftotext's reading of the same lines (the arbiter).
// Usage: bun scripts/r109-c1-output-probe.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { extractTextFromFile } from "../src/lib/cv-text";

const members: [string, string][] = [
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS f1040"],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc"],
  ["/tmp/r107-corpus/lo-writer.pdf", "LO Writer"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "Quartz"],
];

for (const [path, name] of members) {
  const raw = readFileSync(path);
  const text = await extractTextFromFile(new File([new Uint8Array(raw)], "probe.pdf"));

  // C1 census
  const c1Chars: string[] = [];
  const c1Lines: string[] = [];
  for (const line of text.split("\n")) {
    if (/[\u0080-\u009f]/.test(line)) {
      c1Lines.push(line);
      for (const ch of line) if (/[\u0080-\u009f]/.test(ch)) c1Chars.push("U+" + ch.charCodeAt(0).toString(16).padStart(4, "0"));
    }
  }
  const hist = new Map<string, number>();
  for (const c of c1Chars) hist.set(c, (hist.get(c) || 0) + 1);
  console.log(`${name.padEnd(12)} C1chars=${c1Chars.length} C1lines=${c1Lines.length} hist=${JSON.stringify([...hist.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8))}`);
  if (c1Lines.length) {
    // the first 2 sample lines + the pdftotext reading of them (matched by a
    // nearby alnum anchor word)
    for (const line of c1Lines.slice(0, 3)) {
      const display = line.slice(0, 90).replace(/[\u0080-\u009f]/g, "\u25a1");
      console.log(`   ours: ${JSON.stringify(display)}`);
    }
  }
}
