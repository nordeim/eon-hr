// r107-prototype-diff.ts — the FIX-A prototype (the band conditional),
// applied as a THROWAWAY patch to a COPY of the extractor — NOT the source.
// Measures the expected real-file drift before the TDD round: per corpus
// member, the before/after extraction diff (separator-sensitive), so the
// plan's verification protocol carries the exact expected outcomes.
//
// THE PROTOTYPE RULE: in the TJ handler, a kern in (-200,-100] becomes
// CONDITIONAL (condGap) — resolving to a JOIN in space-glyph streams; kerns
// <= -200 keep the unconditional gap; the fromKern restriction stays for
// everything else.
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const src = readFileSync("src/lib/cv-text.ts", "utf8");

// The patch: the TJ kern rule — the band (-200,-100] joins conditionally
const OLD = `          if (kern !== 0) {
            moved = true;
            pendingEm = kern <= -100 ? 1.0 : 0; // the negative gap fires the space rule; a kern (either sign, under the boundary) joins
          }
          push(a[1] !== undefined ? { kind: "lit", text: unescape(a[1]) } : { kind: "hex", hex: a[2] }, kern !== 0);`;
const NEW = `          if (kern !== 0) {
            moved = true;
            pendingEm = kern <= -100 ? 1.0 : 0; // the negative gap fires the space rule; a kern (either sign, under the boundary) joins
          }
          push(a[1] !== undefined ? { kind: "lit", text: unescape(a[1]) } : { kind: "hex", hex: a[2] }, kern !== 0, kern <= -100 && kern > -200);`;

if (!src.includes(OLD)) { console.log("PATCH ANCHOR NOT FOUND — the TJ rule shape changed"); process.exit(1); }

// the push signature gains the bandGap flag → condGap allowed for band kerns
const OLD_PUSH = `  const push = (piece: { kind: "lit"; text: string } | { kind: "hex"; hex: string }, fromKern = false) => {
    let sep = " "; // the standing join: adjacent shows separate
    let condGap = false;
    if (moved) {
      if (pendingTy !== 0) sep = "\\n"; // a line move is a line break
      else if (backward || pendingEm >= 1.0) {
        sep = " "; // a word gap / backstep
        condGap = !backward && !fromKern; // a forward MOVE-driven em-gap MIGHT be a split-word continuation (R103-C)
      } else sep = ""; // a same-line forward move under 1.0 em — the glyph advance
    }`;
const NEW_PUSH = `  const push = (piece: { kind: "lit"; text: string } | { kind: "hex"; hex: string }, fromKern = false, bandGap = false) => {
    let sep = " "; // the standing join: adjacent shows separate
    let condGap = false;
    if (moved) {
      if (pendingTy !== 0) sep = "\\n"; // a line move is a line break
      else if (backward || pendingEm >= 1.0) {
        sep = " "; // a word gap / backstep
        condGap = !backward && (!fromKern || bandGap); // R107-A: a band kern (-200,-100] MAY be a display kern (the LO convention)
      } else sep = ""; // a same-line forward move under 1.0 em — the glyph advance
    }`;

if (!src.includes(OLD_PUSH)) { console.log("PUSH ANCHOR NOT FOUND"); process.exit(1); }

const patched = src.replace(OLD, NEW).replace(OLD_PUSH, NEW_PUSH);
const dir = mkdtempSync(join(tmpdir(), "r107-proto-"));
const modPath = join(dir, "cv-text-proto.ts");
// rewrite the relative import inside the copy (it imports from ./ — none exist; cv-text is self-contained except node: imports; check)
writeFileSync(modPath, patched);
const mod = await import(modPath);
const { extractTextFromFile } = await import("../src/lib/cv-text");

const files = [
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS f1040", 5871],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv-2404.16710", 67744],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx manual", 61437],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec v2.9h", 106179],
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc 7.0", 695014],
  ["/tmp/r107-corpus/lo-writer.pdf", "LO Writer 7.6", 646207],
];

for (const [path, name, pin] of files) {
  const raw = readFileSync(path);
  const f = new File([new Uint8Array(raw)], "probe.pdf");
  const before = await extractTextFromFile(f);
  const after = await mod.extractTextFromFile(f);
  const aB = before.replace(/[^A-Za-z0-9]/g, "").length;
  const aA = after.replace(/[^A-Za-z0-9]/g, "").length;
  const identical = before === after;
  console.log(`\n===== ${name} =====`);
  console.log(`alnum: ${aB} → ${aA} ${aB === aA ? "(separator-only change expected)" : "(COUNT CHANGED!)"} · text ${identical ? "BYTE-IDENTICAL" : "DIFFERS"}`);
  if (!identical) {
    // the first 6 diff hunks (line-level)
    const bL = before.split("\n"); const aL = after.split("\n");
    let hunks = 0;
    for (let i = 0; i < Math.max(bL.length, aL.length) && hunks < 6; i++) {
      if (bL[i] !== aL[i]) {
        hunks++;
        console.log(`  L${i + 1}: ${JSON.stringify(bL[i]?.slice(0, 80))} → ${JSON.stringify(aL[i]?.slice(0, 80))}`);
      }
    }
    const diffLines = bL.filter((l, i) => l !== aL[i]).length;
    console.log(`  total differing lines: ${diffLines}`);
  }
}
console.log("\nPROTOTYPE DIFF DONE");
process.exit(0);
