// r106-corpus-verify.ts — session 105 / parity round 104: the real-file
// ground truth. The 12-writer corpus's two re-sourceable members (the r104
// re-establishment) re-extracted through the REMEDIATED cv-text — the
// standing pins: IRS f1040 = 5,871 alnums, arXiv-2404.16710 = 67,744 alnums,
// IDENTICAL (the R105 fixes must not drift a single alnum on the corpus).
// Usage: bun scripts/r106-corpus-verify.ts
import { readFileSync } from "node:fs";
import { extractTextFromFile } from "../src/lib/cv-text";

const pins: { path: string; name: string; expected: number }[] = [
  { path: "/tmp/r106-corpus/irs-f1040.pdf", name: "IRS f1040", expected: 5871 },
  { path: "/tmp/r106-corpus/arxiv-2404.16710.pdf", name: "arXiv-2404.16710", expected: 67744 },
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
    const identical = alnums === expected;
    if (!identical) allIdentical = false;
    console.log(`${name}: ${alnums} alnums (pin ${expected}) ${identical ? "IDENTICAL" : "DRIFT"}`);
    if (!identical) console.log("  head:", JSON.stringify(text.slice(0, 200)));
  } catch (e) {
    allIdentical = false;
    console.log(`${name}: EXTRACTION ERROR ${String(e).slice(0, 200)}`);
  }
}
console.log(allIdentical ? "CORPUS HOLDS" : "CORPUS DRIFT — audit before proceeding");
