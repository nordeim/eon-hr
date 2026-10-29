// r107-ground-truth.ts — the real-file ground truth for the round: the
// full member diff between HEAD's extractor (git show HEAD:src/lib/cv-text.ts,
// exported to /tmp) and the remediated working tree, across every corpus
// member. Expected: IRS/arXiv/dvipdfmx/fontspec/lo-writer BYTE-IDENTICAL;
// lo-calc with EXACTLY the two cover lines cured ("Calc Guide" /
// "Working With Spreadsheets"); the alnum pins all hold (separator-only
// change on lo-calc).
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { execSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

// export HEAD's extractor — through a VARIABLE path: a literal "/tmp/…"
// import specifier makes tsc (and the build's type-check phase) fail on
// any fresh workspace where the /tmp file does not exist (the R108-A
// fresh-clone gate break; the variable form keeps the gate
// environment-independent while bun still resolves the module at runtime)
execSync("git show HEAD:src/lib/cv-text.ts > /tmp/r107-head-cv-text", { cwd: "/home/z/my-project/eon-hr" });
const headPath = "/tmp/r107-head-cv-text";
const headMod = (await import(headPath)) as { extractTextFromFile: (f: File) => Promise<string> };
const { extractTextFromFile } = await import("../src/lib/cv-text");

const files: [string, string, number][] = [
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS f1040", 5871],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv-2404.16710", 67744],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx manual", 61437],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec v2.9h", 106179],
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc 7.0", 695014],
  ["/tmp/r107-corpus/lo-writer.pdf", "LO Writer 7.6", 646207],
];

let allGood = true;
for (const [path, name, pin] of files) {
  const raw = readFileSync(path);
  const f = () => new File([new Uint8Array(raw)], "probe.pdf", { type: "application/pdf" });
  const before = await headMod.extractTextFromFile(f());
  const after = await extractTextFromFile(f());
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
    for (let i = 0; i < Math.max(bL.length, aL.length); i++) {
      if (bL[i] !== aL[i]) {
        total++;
        if (hunks < 8) {
          hunks++;
          console.log(`  L${i + 1}: ${JSON.stringify((bL[i] ?? "").slice(0, 70))} → ${JSON.stringify((aL[i] ?? "").slice(0, 70))}`);
        }
      }
    }
    console.log(`  total differing lines: ${total}`);
    if (name !== "LO Calc 7.0") allGood = false; // only lo-calc may differ
  }
  if (!pinHolds) allGood = false;
}
// the lo-calc member checks: the cured covers
{
  const raw = readFileSync("/tmp/r107-corpus/lo-calc.pdf");
  const f = new File([new Uint8Array(raw)], "lo-calc.pdf");
  const t = await extractTextFromFile(f);
  const cured1 = t.includes("Calc Guide");
  const cured2 = t.includes("Working With Spreadsheets");
  const soupGone = !t.includes("C a l c");
  console.log(`\nlo-calc member checks: "Calc Guide"=${cured1} · "Working With Spreadsheets"=${cured2} · letter-soup gone=${soupGone}`);
  if (!cured1 || !cured2 || !soupGone) allGood = false;
}
console.log(allGood ? "\nGROUND TRUTH: ALL HOLDS" : "\nGROUND TRUTH: DRIFT DETECTED");
process.exit(0);
