// r107-corpus-verify.ts — session 107 / parity round 106: the real-file
// ground truth. The corpus members re-extracted through the CURRENT
// cv-text — the standing pins (the r105/r106 closes): IRS f1040 = 5,871,
// arXiv-2404.16710 = 67,744, lo-calc 7.0 = 691,268 (the r102 pin, the file
// re-sourced this round), plus the NEW lo-writer 7.6 member (first read)
// and the fontspec/dvipdfmx member checks (the r106 state).
// ALSO: the negative-tracking damage probe — the split-digit census in the
// extracted text (the "01 02 03" class from the −113..−154 tabular kerns).
// Usage: bun scripts/r107-corpus-verify.ts
import { readFileSync } from "node:fs";
import { extractTextFromFile } from "../src/lib/cv-text";

const pins: { path: string; name: string; expected: number | null }[] = [
  { path: "/tmp/r106-corpus/irs-f1040.pdf", name: "IRS f1040", expected: 5871 },
  { path: "/tmp/r106-corpus/arxiv-2404.16710.pdf", name: "arXiv-2404.16710", expected: 67744 },
  { path: "/tmp/r106-corpus/dvipdfmx.pdf", name: "dvipdfmx manual", expected: 61437 },
  { path: "/tmp/r106-corpus/fontspec.pdf", name: "fontspec v2.9h", expected: 101515 },
  { path: "/tmp/r107-corpus/lo-calc.pdf", name: "LO Calc 7.0", expected: 691268 },
  { path: "/tmp/r107-corpus/lo-writer.pdf", name: "LO Writer 7.6", expected: null },
];

let allIdentical = true;
for (const { path, name, expected } of pins) {
  try {
    const bytes = readFileSync(path);
    const file = new File([new Uint8Array(bytes)], name.replace(/[^\w.]/g, "-").toLowerCase() + ".pdf", {
      type: "application/pdf",
    });
    const text = await extractTextFromFile(file);
    const alnums = text.replace(/[^A-Za-z0-9]/g, "").length;
    const identical = expected === null || alnums === expected;
    if (!identical) allIdentical = false;
    console.log(`${name}: ${alnums} alnums${expected === null ? " (first read — no pin)" : ` (pin ${expected})`} ${identical ? "IDENTICAL" : "DRIFT"}`);
    if (expected === null || !identical) console.log("  head:", JSON.stringify(text.slice(0, 200)));
    // the split-digit probe: 2+ digit runs separated by single spaces
    // (the negative-tracking damage class — tabular figures split by kerns)
    const splitDigits = text.match(/\b\d{1,4} \d{1,4}\b/g) ?? [];
    // how many of those pairs are PURE digit pairs (no letters around)?
    const purePairs = splitDigits.filter((s) => /^\d+ \d+$/.test(s));
    console.log(`  split-digit pairs: ${purePairs.length} samples:`, JSON.stringify(purePairs.slice(0, 10)));
  } catch (e) {
    allIdentical = false;
    console.log(`${name}: EXTRACTION ERROR ${String(e).slice(0, 200)}`);
  }
}
console.log(allIdentical ? "\nPINS ALL HOLD" : "\nPIN DRIFT DETECTED");
process.exit(0);
