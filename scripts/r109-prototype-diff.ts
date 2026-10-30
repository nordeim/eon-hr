#!/usr/bin/env bun
// r109-prototype-diff.ts — the pre-plan blast radius (the r107/r108
// prototype discipline): HEAD's extractor vs the two-leg r109 prototype
// (/tmp/r109-cv-text-proto.ts — LEG A the ASCII85Decode filter chain,
// LEG B the WinAnsi raw-literal remap). The 7 standing corpus members must
// stay BYTE-IDENTICAL (except known layers); the ReportLab 14th-writer
// member goes from EMPTY to a real extraction, checked member-for-member
// against pdftotext.
// Usage: bun scripts/r109-prototype-diff.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const headMod = (await import("../src/lib/cv-text")) as typeof import("../src/lib/cv-text");
const protoPath = "/tmp/r109-cv-text-proto.ts";
const protoMod = (await import(protoPath)) as { extractTextFromFile: (f: File) => Promise<string> };

const files: [string, string][] = [
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS f1040"],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc"],
  ["/tmp/r107-corpus/lo-writer.pdf", "LO Writer"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ"],
  ["/tmp/r109-hunt/rl-userguide.pdf", "REPORTLAB (14th writer)"],
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
        if (hunks < 5) {
          hunks++;
          console.log(`  L${i + 1}: ${JSON.stringify((bL[i] ?? "").slice(0, 70))} → ${JSON.stringify((aL[i] ?? "").slice(0, 70))}`);
        }
      }
    }
    console.log(`  (${total} differing lines)`);
  }
}

// the ReportLab member vs pdftotext (the arbiter)
const raw = readFileSync("/tmp/r109-hunt/rl-userguide.pdf");
const ours = await protoMod.extractTextFromFile(new File([new Uint8Array(raw)], "probe.pdf"));
const ref = execSync("pdftotext -enc UTF-8 /tmp/r109-hunt/rl-userguide.pdf -", { stdio: "pipe", maxBuffer: 128 << 20 }).toString();
const ourAlnum = ours.replace(/[^A-Za-z0-9]/g, "").length;
const refAlnum = ref.replace(/[^A-Za-z0-9]/g, "").length;
console.log(`\n===== REPORTLAB vs pdftotext =====`);
console.log(`ours: ${ours.length} chars / ${ourAlnum} alnums; pdftotext: ${ref.length} chars / ${refAlnum} alnums; ratio ${(ourAlnum / refAlnum * 100).toFixed(1)}%`);
// the WinAnsi-mapped family in each
const FAM = /[\u2018\u2019\u201C\u201D\u2013\u2014\u2026\u2022\u20AC\u2122\u2030\u2039\u203A]/g;
const oursFam = ours.match(FAM) || [];
const refFam = ref.match(FAM) || [];
const h1 = new Map<string, number>();
for (const c of oursFam) h1.set(c, (h1.get(c) || 0) + 1);
const h2 = new Map<string, number>();
for (const c of refFam) h2.set(c, (h2.get(c) || 0) + 1);
console.log(`ours family: ${JSON.stringify([...h1.entries()].sort())}`);
console.log(`pdftotext family: ${JSON.stringify([...h2.entries()].sort())}`);
// C1 controls in ours (should be gone under WinAnsi fonts)
let c1 = 0;
for (const ch of ours) if (/[\u0080-\u009f]/.test(ch)) c1++;
console.log(`our C1 chars: ${c1}`);
// the known em-dash line
const idx = ours.indexOf("To die");
if (idx >= 0) console.log(`em-dash probe: ${JSON.stringify(ours.slice(idx, idx + 30))}`);
