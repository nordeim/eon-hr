// r108-corpus-verify.ts — the standing corpus discipline on the fresh
// workspace: every member through the CURRENT extractor, the alnum pins
// + the member-level checks (the lo-calc cured covers, the fontspec cure,
// the arXiv/IRS/dvipdfmx identity). The corpus files re-sourced with the
// r107-pinned md5s (fontspec 752e9929…, lo-calc dbb10a2b…).
// Usage: bun scripts/r108-corpus-verify.ts
import { readFileSync } from "node:fs";
import crypto from "node:crypto";
import { extractTextFromFile } from "../src/lib/cv-text";

const md5 = (p: string) => crypto.createHash("md5").update(readFileSync(p)).digest("hex").slice(0, 8);

const files: [string, string, number][] = [
  // R108-B: the IRS pin RE-ANCHORED 5871 → 5798 (the /Font-region collector
  // activates the r105-B ZapfDingbats marker on the real file — the 73
  // /ZaDb checkbox glyphs read \u2714, the spec-correct Adobe reading,
  // where the Latin-1 fallback read "4"; pdftotext extracts none of them)
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS f1040", 5798],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv-2404.16710", 67744],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx manual", 61437],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec v2.9h", 106179],
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc 7.0", 695014],
  ["/tmp/r107-corpus/lo-writer.pdf", "LO Writer 7.6", 646207],
  ["/tmp/r108-quartz/quartz-longer.pdf", "Quartz longer.pdf (13th writer)", 2697],
];

let allGood = true;
for (const [path, name, pin] of files) {
  const raw = readFileSync(path);
  const text = await extractTextFromFile(new File([new Uint8Array(raw)], "probe.pdf"));
  const alnums = text.replace(/[^A-Za-z0-9]/g, "").length;
  const pinHolds = alnums === pin;
  console.log(`${name}: md5 ${md5(path)} · alnums ${alnums} (pin ${pin}) ${pinHolds ? "PIN HOLDS" : "PIN DRIFT"}`);
  if (!pinHolds) allGood = false;
}
// the member-level checks
{
  const raw = readFileSync("/tmp/r107-corpus/lo-calc.pdf");
  const t = await extractTextFromFile(new File([new Uint8Array(raw)], "lo-calc.pdf"));
  const cured = t.includes("Calc Guide") && t.includes("Working With Spreadsheets") && !t.includes("C a l c");
  console.log("lo-calc covers cured:", cured);
  if (!cured) allGood = false;
}
{
  const raw = readFileSync("/tmp/r106-corpus/fontspec.pdf");
  const t = await extractTextFromFile(new File([new Uint8Array(raw)], "fontspec.pdf"));
  const cured = t.includes("Font selection") && !t.includes("Dont selection");
  console.log("fontspec cure holds:", cured);
  if (!cured) allGood = false;
}
// the Quartz member-level check: the current reading of the quote line
{
  const raw = readFileSync("/tmp/r108-quartz/quartz-longer.pdf");
  const t = await extractTextFromFile(new File([new Uint8Array(raw)], "quartz.pdf"));
  const i = t.indexOf("going to be");
  console.log("quartz quote line:", JSON.stringify(t.slice(Math.max(0, i - 12), i + 8)));
}
console.log(allGood ? "\nCORPUS: ALL PINS HOLD" : "\nCORPUS: DRIFT DETECTED");
process.exit(0);
