// r117-hunt-measure.ts — session 117 / parity round 116: measure the r117
// queue's two lead classes at HEAD before designing any cure.
//   (A) the same-line x-gap column class (the Typst entry layout: title +
//       location on one visual line where pdftotext breaks them — UNMEASURED)
//   (B) the ReportLab TOC dot-order divergence (the dots-before-entry stream
//       form — phase-shift measurements documented in r116; re-quantified here
//       at HEAD for the narrower per-block signature design)
// Usage: bun scripts/r117-hunt-measure.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");

async function ours(path: string): Promise<string> {
  const raw = readFileSync(path);
  return mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
}
function pdftotext(path: string): string {
  return execSync(`pdftotext ${path} -`, { stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 }).toString();
}

// ---------- (A) the Typst same-line x-gap column class ----------
console.log("=".repeat(70));
console.log("(A) THE SAME-LINE X-GAP COLUMN CLASS — the Typst entry layout");
console.log("=".repeat(70));
for (const [p, name] of [
  ["/tmp/typst-cv/resume.pdf", "resume"],
  ["/tmp/typst-cv/coverletter.pdf", "coverletter"],
] as [string, string][]) {
  const ref = pdftotext(p);
  const mine = await ours(p);
  // line-by-line diff, aligned on the alnum streams (count-pin-safe)
  const refLines = ref.split("\n").map(s => s.trim()).filter(Boolean);
  const mineLines = mine.split("\n").map(s => s.trim()).filter(Boolean);
  // find pdftotext line breaks that fall INSIDE one of our lines (the column class)
  const joined = refLines.map(l => l.replace(/[^A-Za-z0-9]/g, ""));
  const mineJoined = mineLines.map(l => l.replace(/[^A-Za-z0-9]/g, ""));
  // naive walk: for each of our lines, check whether pdftotext needs 2+ lines to cover it
  let a = 0, b = 0, columnSplits = 0;
  const examples: string[] = [];
  while (a < mineJoined.length && b < joined.length) {
    if (mineJoined[a] === joined[b]) { a++; b++; continue; }
    // try: our line a == pdftotext lines b + b+1 concatenated (a column split)
    if (b + 1 < joined.length && mineJoined[a] === joined[b] + joined[b + 1] && mineJoined[a].length > 0) {
      columnSplits++;
      if (examples.length < 8) examples.push(`OURS: "${mineLines[a]}"  ==  REF: "${refLines[b]}" + "${refLines[b + 1]}"`);
      a++; b += 2; continue;
    }
    // fall back: advance the shorter one (alignment drift)
    a++; b++;
  }
  console.log(`\n${name}: our lines ${mineLines.length}, pdftotext lines ${refLines.length}`);
  console.log(`${name}: column-split boundaries (our one line == pdftotext's two): ${columnSplits}`);
  for (const e of examples) console.log("   " + e);
}

// ---------- (B) the ReportLab TOC dot-order divergence ----------
console.log("\n" + "=".repeat(70));
console.log("(B) THE TOC DOT-ORDER DIVERGENCE — ReportLab userguide");
console.log("=".repeat(70));
const rl = "/tmp/r109-corpus/rl-userguide.pdf";
const refRL = pdftotext(rl);
const mineRL = await ours(rl);
// find TOC-looking pdftotext lines (contain dot leaders or the chapter pattern)
const refTOC = refRL.split("\n").filter(l => /\.{4,}/.test(l));
const mineTOC = mineRL.split("\n").filter(l => /\.{4,}/.test(l));
console.log(`pdftotext TOC-shaped lines: ${refTOC.length}; ours: ${mineTOC.length}`);
// the signature: in pdftotext, a TOC row = "Title . . . . page" (dots AFTER title)
// in ours (the phase shift), the dots run PRECEDES its entry
// count: our lines that are dots-only or dots-leading
const dotsLeading = mineTOC.filter(l => /^\./.test(l.trim()));
const dotsAfter = refTOC.filter(l => /^[^.]+\.{4,}/.test(l.trim()));
console.log(`ours dots-LEADING lines: ${dotsLeading.length}; pdftotext title-then-dots lines: ${dotsAfter.length}`);
console.log("\nSample OURS TOC lines (first 6):");
mineTOC.slice(0, 6).forEach(l => console.log("   |" + l.slice(0, 90)));
console.log("Sample pdftotext TOC lines (first 6):");
refTOC.slice(0, 6).forEach(l => console.log("   |" + l.slice(0, 90)));
