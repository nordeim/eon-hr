#!/usr/bin/env bun
// r109-ground-truth.ts — the real-file ground truth: HEAD's extractor (the
// r108 close, snapshot) vs the remediated one (the r109 three-leg fix) on
// all 8 corpus members + the pdftotext arbiter on the ReportLab member.
// Usage: bun scripts/r109-ground-truth.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

// HEAD through a VARIABLE path (the R108-A lesson: a literal /tmp import
// breaks tsc on fresh workspaces)
const headPath = "/tmp/r109-cv-text-head-snapshot.ts";
const headMod = (await import(headPath)) as { extractTextFromFile: (f: File) => Promise<string> };
const newMod = (await import("../src/lib/cv-text")) as typeof import("../src/lib/cv-text");

const files: [string, string, number | null][] = [
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS f1040", 5798],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", 67744],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx", 61437],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", 106179],
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc", 695014],
  ["/tmp/r107-corpus/lo-writer.pdf", "LO Writer", 646207],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ", 2697],
  ["/tmp/r109-corpus/rl-userguide.pdf", "REPORTLAB (14th writer)", 0], // HEAD reads 0; the new pin is measured below
];

for (const [path, name, pin] of files) {
  const raw = readFileSync(path);
  const mk = () => new File([new Uint8Array(raw)], "probe.pdf");
  const before = await headMod.extractTextFromFile(mk());
  const after = await newMod.extractTextFromFile(mk());
  const aB = before.replace(/[^A-Za-z0-9]/g, "").length;
  const aA = after.replace(/[^A-Za-z0-9]/g, "").length;
  const identical = before === after;
  console.log(`\n===== ${name} =====`);
  console.log(`alnums: ${aB} → ${aA} · text ${identical ? "BYTE-IDENTICAL" : "DIFFERS"}`);
  if (pin !== null && pin !== 0) console.log(`pin: ${pin} ${aA === pin ? "HOLDS" : "*** DRIFT ***"}`);
  if (!identical) {
    const bL = before.split("\n");
    const aL = after.split("\n");
    let hunks = 0;
    let total = 0;
    for (let i = 0; i < Math.max(bL.length, aL.length); i++) {
      if (bL[i] !== aL[i]) {
        total++;
        if (hunks < 4) {
          hunks++;
          console.log(`  L${i + 1}: ${JSON.stringify((bL[i] ?? "").slice(0, 60))} → ${JSON.stringify((aL[i] ?? "").slice(0, 60))}`);
        }
      }
    }
    console.log(`  (${total} differing lines)`);
  }
}

// the ReportLab member vs pdftotext (the arbiter) — the member-level checks
const raw = readFileSync("/tmp/r109-corpus/rl-userguide.pdf");
const ours = await newMod.extractTextFromFile(new File([new Uint8Array(raw)], "probe.pdf"));
const ref = execSync("pdftotext -enc UTF-8 /tmp/r109-corpus/rl-userguide.pdf -", { stdio: "pipe", maxBuffer: 128 << 20 }).toString();
const ourAlnum = ours.replace(/[^A-Za-z0-9]/g, "").length;
const refAlnum = ref.replace(/[^A-Za-z0-9]/g, "").length;
console.log(`\n===== REPORTLAB vs pdftotext (the arbiter) =====`);
console.log(`ours: ${ourAlnum} alnums (THE NEW PIN); pdftotext: ${refAlnum}; ratio ${(ourAlnum / refAlnum * 100).toFixed(2)}%`);
console.log(`em-dash probe: ${JSON.stringify(ours.slice(ours.indexOf("To die"), ours.indexOf("To die") + 18))} (pdftotext: "To die—to sleep")`);
console.log(`bullet present: ${ours.includes("\u2022")} | C1 controls: ${/[\u0080-\u009f]/.test(ours) ? "PRESENT ***" : "ZERO"}`);
// the WinAnsi quote family
const fam = (t: string) => (t.match(/[\u2018\u2019\u201C\u201D\u2013\u2014\u2022\u20AC\u2122]/g) || []).length;
console.log(`WinAnsi family: ours ${fam(ours)} vs pdftotext ${fam(ref)}`);
