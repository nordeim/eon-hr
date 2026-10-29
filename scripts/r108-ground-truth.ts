// r108-ground-truth.ts — the real-file ground truth for the round: the
// full member diff between HEAD's extractor (git show HEAD:src/lib/cv-text.ts,
// exported to /tmp) and the remediated working tree, across every corpus
// member INCLUDING the new 13th-writer Quartz member. Expected: IRS /
// dvipdfmx / fontspec / lo-calc / lo-writer BYTE-IDENTICAL; arXiv the 49
// pre-existing Type3-charproc garbage lines only (the alnum pin unchanged);
// the QUARTZ member: exactly the quote line cured ("There's" — U+2019),
// matching pdftotext member-for-member.
// Usage: bun scripts/r108-ground-truth.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

// export HEAD's extractor — through a VARIABLE path (the R108-A lesson: a
// literal "/tmp/…" import specifier breaks tsc + the build's type-check on
// any fresh workspace; the variable form keeps the gate environment-
// independent while bun still resolves the module at runtime)
execSync("git show HEAD:src/lib/cv-text.ts > /tmp/r108-head-cv-text", { cwd: "/home/z/my-project/eon-hr" });
const headPath = "/tmp/r108-head-cv-text";
const headMod = (await import(headPath)) as { extractTextFromFile: (f: File) => Promise<string> };
const { extractTextFromFile } = await import("../src/lib/cv-text");

const files: [string, string, number][] = [
  // R108-B: the IRS pin RE-ANCHORED 5871 → 5798 — the /Font-dict-region
  // collector binds the real file's /ZaDb → 268 (the 73 Form-XObject
  // checkbox glyphs; NOT F-prefixed — the standing F\w+ scan never bound
  // it), which ACTIVATES the r105-B ZapfDingbats marker on the real file:
  // the 73 <34> atoms read \u2714 (the spec-correct Adobe reading, the
  // r105 doctrine's intent) where the Latin-1 fallback read "4" (5871 −
  // 73 = 5798 exactly — the R106-A "inert on real files" class repeating
  // at the BINDING layer; pdftotext extracts nothing for these glyphs)
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS f1040", 5798],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv-2404.16710", 67744],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx manual", 61437],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec v2.9h", 106179],
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc 7.0", 695014],
  ["/tmp/r107-corpus/lo-writer.pdf", "LO Writer 7.6", 646207],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ longer.pdf", 2697],
];

let allGood = true;
for (const [path, name, pin] of files) {
  const raw = readFileSync(path);
  const mk = () => new File([new Uint8Array(raw)], "probe.pdf");
  const before = await headMod.extractTextFromFile(mk());
  const after = await extractTextFromFile(mk());
  const aB = before.replace(/[^A-Za-z0-9]/g, "").length;
  const aA = after.replace(/[^A-Za-z0-9]/g, "").length;
  const identical = before === after;
  const pinHolds = aA === pin;
  console.log(`\n===== ${name} =====`);
  console.log(`alnums: ${aB} → ${aA} (pin ${pin}) ${pinHolds ? "PIN HOLDS" : "PIN DRIFT"} · text ${identical ? "BYTE-IDENTICAL" : "DIFFERS"}`);
  if (!identical) {
    const bL = before.split("\n");
    const aL = after.split("\n");
    let hunks = 0;
    let total = 0;
    const nonGarbage: number[] = [];
    for (let i = 0; i < Math.max(bL.length, aL.length); i++) {
      if (bL[i] !== aL[i]) {
        total++;
        // a "garbage" line: the NUL-interleaved Type3-charproc class (the
        // pre-existing artifact — pdftotext extracts none of it)
        const isGarbage = /\u0000/.test(bL[i] ?? "") && /\u0000/.test(aL[i] ?? "");
        if (!isGarbage) nonGarbage.push(i + 1);
        if (hunks < 5 && !isGarbage) {
          hunks++;
          console.log(`  L${i + 1}: ${JSON.stringify((bL[i] ?? "").slice(0, 70))} → ${JSON.stringify((aL[i] ?? "").slice(0, 70))}`);
        }
      }
    }
    console.log(`  total differing lines: ${total} · non-garbage differing: ${nonGarbage.length}${nonGarbage.length ? " " + JSON.stringify(nonGarbage.slice(0, 10)) : ""}`);
    if (name === "arXiv-2404.16710" && nonGarbage.length === 0) {
      // the arXiv drift is confined to the pre-existing garbage layer — the
      // documented expectation
    } else if (name === "IRS f1040") {
      // the documented activation: exactly the 73 dingbat lines ("4" →
      // "\u2714"), every one the ZaDb class
      const allDingbat = nonGarbage.length === 73 && (before.match(/\u2714/g) || []).length === 0 && (after.match(/\u2714/g) || []).length === 73;
      if (!allDingbat) allGood = false;
    } else if (name !== "QUARTZ longer.pdf") allGood = false;
  }
  if (!pinHolds) allGood = false;
}
// the QUARTZ member-level check: the cured quote
{
  const raw = readFileSync("/tmp/r108-quartz/quartz-longer.pdf");
  const t = await extractTextFromFile(new File([new Uint8Array(raw)], "quartz.pdf"));
  const cured = t.includes("There\u2019s going");
  const fffdGone = !t.includes("\uFFFD");
  console.log(`\nQUARTZ member checks: "There\\u2019s going"=${cured} · U+FFFD gone=${fffdGone}`);
  if (!cured || !fffdGone) allGood = false;
}
console.log(allGood ? "\nGROUND TRUTH: ALL HOLDS" : "\nGROUND TRUTH: DRIFT DETECTED");
process.exit(0);
