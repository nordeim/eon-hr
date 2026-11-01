// r112-proto-measure.ts — the prototype measurement: the Skia specimen's
// reading order + the variants + the 12-member corpus full-text pins.
// Usage: bun scripts/r112-proto-measure.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import crypto from "node:crypto";

const protoPath = "/tmp/r112-proto/cv-text.ts"; // variable-path import per the R108-A lesson
const mod = await import(protoPath);
const extract = async (p: string) => {
  const raw = readFileSync(p);
  return mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
};

console.log("========== THE SKIA SPECIMEN (reading order) ==========");
const cv = await extract("/tmp/skia-cv/john-smith-cv.pdf");
console.log(JSON.stringify(cv.slice(0, 420)));
console.log("...");
const d1 = cv.indexOf("Mar 2021");
const name = cv.indexOf("John Smith");
console.log(`\n'John Smith' at ${name} | 'Mar 2021' at ${d1} | name-before-dates: ${name < d1}`);
const role1 = cv.indexOf("Senior HR Manager \u2014 TechCorp");
console.log(`role-1 at ${role1} | dates after their role: ${d1 > role1}`);
const alnums = cv.replace(/[^A-Za-z0-9]/g, "").length;
console.log(`alnums: ${alnums} (pdftotext 1553) ${alnums === 1553 ? "EXACT" : "*** DRIFT ***"}`);

console.log("\n========== THE VARIANTS ==========");
for (const v of ["control", "floatlast", "absolute", "twopage"]) {
  const t = await extract(`/tmp/skia-cv/variant-${v}.pdf`);
  const tag = v === "floatlast" ? "Jan 2020 - Dec 2024" : v === "absolute" ? "ABS-TAG-99" : v === "twopage" ? "PG1-FLOAT" : "";
  const h1 = t.indexOf(v === "control" ? "Anna Control" : v === "floatlast" ? "Bob Floatlast" : v === "absolute" ? "Clara Absolute" : "Dora Twopage");
  const tp = tag ? t.indexOf(tag) : -1;
  console.log(`${v}: h1@${h1} tag@${tp} ${tag ? (h1 < tp ? "h1-first (ORDER OK)" : "*** STILL HOISTED ***") : "(no tag)"}`);
}

console.log("\n========== THE CORPUS BLAST RADIUS (full-text md5) ==========");
const members: [string, string][] = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
  ["/tmp/typst-cv/resume.pdf", "Typst resume"],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2"],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter"],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2"],
];
const src = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
for (const [p, name] of members) {
  const raw = readFileSync(p);
  const file = new File([new Uint8Array(raw)], "m.pdf");
  const ours = await mod.extractTextFromFile(file);
  const head = await src.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const mh = crypto.createHash("md5").update(ours).digest("hex").slice(0, 10);
  const sh = crypto.createHash("md5").update(head).digest("hex").slice(0, 10);
  console.log(`${name}: proto ${mh} | HEAD ${sh} ${mh === sh ? "BYTE-IDENTICAL" : "*** DRIFT ***"}`);
}
