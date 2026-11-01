// r115-member-checks.ts — session 115 / parity round 114: the real-file
// ground truth on the FINAL source. The Typst family (the hunt target) at
// 100.00% with the ORDER + FORM probes; the standing corpus pins (the four
// re-pinned members documented as toward-pdftotext improvements: arXiv/IRS/
// Prawn/ReportLab — the r111 re-pin precedent); the byte-identical members.
// Usage: bun scripts/r115-member-checks.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import crypto from "node:crypto";

const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const na = (s: string) => s.replace(/[^A-Za-z0-9]/g, "");
const dbl = (s: string) => (s.match(/\S  +\S/g) || []).length;

// 1) THE TYPST FAMILY — the hunt target (the 16th writer's form round)
console.log("=== THE TYPST FAMILY (the Typst duality hunt target) ===");
const typst: [string, string, number][] = [
  ["/tmp/typst-cv/resume.pdf", "Typst resume", 793],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2", 793],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter", 897],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2", 871],
];
for (const [p, n, pin] of typst) {
  const raw = readFileSync(p);
  const ours = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const ref = execSync(`pdftotext ${p} -`, { encoding: "utf8" });
  const ok = na(ours).length === pin && na(ours).length === na(ref).length;
  console.log(`${n}: ours ${na(ours).length} (pin ${pin}) pdftotext ${na(ref).length} — ${ok ? "100.00%" : "*** DRIFT ***"} | dbl ours ${dbl(ours)} ref ${dbl(ref)} | U+FFFD: ${ours.includes("\uFFFD") ? "YES" : "no"}`);
}

// the ORDER + FORM probes on the Typst resume (the r112-r114 standard)
{
  const raw = readFileSync("/tmp/typst-cv/resume.pdf");
  const ours = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "probe.pdf"));
  const ref = execSync("pdftotext /tmp/typst-cv/resume.pdf -", { encoding: "utf8" });
  const checks: [string, boolean, boolean][] = [
    ["name before dates", ours.indexOf("John Smith") < ours.indexOf("Mar 2021"), ref.indexOf("John Smith") < ref.indexOf("Mar 2021")],
    ["role before its bullet", ours.indexOf("Senior HR Manager") < ours.indexOf("Led a team"), ref.indexOf("Senior HR Manager") < ref.indexOf("Led a team")],
    ["summary before experience", ours.toUpperCase().indexOf("SUMMARY") < ours.toUpperCase().indexOf("EXPERIENCE"), ref.toUpperCase().indexOf("SUMMARY") < ref.toUpperCase().indexOf("EXPERIENCE")],
    ["skills before certifications", ours.toUpperCase().indexOf("SKILLS") < ours.toUpperCase().indexOf("CERTIFICATIONS"), ref.toUpperCase().indexOf("SKILLS") < ref.toUpperCase().indexOf("CERTIFICATIONS")],
    ["education after experience", ours.toUpperCase().indexOf("EDUCATION") > ours.toUpperCase().indexOf("EXPERIENCE"), ref.toUpperCase().indexOf("EDUCATION") > ref.toUpperCase().indexOf("EXPERIENCE")],
  ];
  console.log("\n=== ORDER PROBES (the Typst resume) ===");
  for (const [n, o, r] of checks) console.log(`${o === r ? "MATCH" : "*** DIVERGE ***"} — ${n}`);
  console.log("FORM probe (joined name):", ours.includes("John Smith"));
  console.log("FORM probe (single-spaced body):", ours.includes("Human resources leader with twelve years"));
  console.log("FORM probe (no doubled gaps):", !/\S  \S/.test(ours.slice(0, 600)));
  console.log("zero U+FFFD:", !ours.includes("\uFFFD"));
  console.log("\n--- ours (first 300) ---\n" + ours.slice(0, 300));
}

// 2) THE STANDING CORPUS — the byte-level pins (the unchanged members) + the
//    re-pinned members (documented toward-pdftotext improvements)
console.log("\n=== THE STANDING CORPUS (byte-level) ===");
const bytePins: [string, string, string, number][] = [
  // unchanged members (the r114 pins hold)
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx", "997b1521", 61437],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", "dc116383", 106179],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ", "7c7e6529", 2697],
  // re-pinned members (the R115 duality cures — toward pdftotext, the r111 precedent)
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", "R115_REPIN", 70646],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS", "R115_REPIN", 5798],
  ["/tmp/r110-prawn-manual.pdf", "Prawn", "R115_REPIN", 83657],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab", "R115_REPIN", 213160],
];
for (const [p, n, pin, alnumPin] of bytePins) {
  const raw = readFileSync(p);
  const t = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const md5 = crypto.createHash("md5").update(t).digest("hex").slice(0, 8);
  const alnums = na(t).length;
  const ref = execSync(`pdftotext ${p} -`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const refDbl = dbl(ref);
  if (pin === "R115_REPIN") {
    console.log(`${n}: alnums ${alnums} (pin ${alnumPin}) ${alnums === alnumPin ? "ALNUM PIN HOLDS" : "*** DRIFT ***"} | new extraction md5 ${md5} | dbl ${dbl(t)} (pdftotext ${refDbl}) — RE-PINNED (the toward-pdftotext cure)`);
  } else {
    const ok = md5 === pin && alnums === alnumPin;
    console.log(`${n}: md5 ${md5} (pin ${pin}) alnums ${alnums} ${ok ? "PIN HOLDS" : "*** DRIFT ***"}`);
  }
}

// 3) THE REGENERATED FAMILIES — WeasyPrint, fpdf2, Skia (the r113/r114 pins)
console.log("\n=== THE REGENERATED FAMILIES ===");
const fams: [string, string, number][] = [
  ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint CV", 782],
  ["/tmp/r113-writers/weasy-variant-control.pdf", "WeasyPrint control", 423],
  ["/tmp/r113-writers/weasy-variant-floatlast.pdf", "WeasyPrint floatlast", 438],
  ["/tmp/r113-writers/weasy-variant-absolute.pdf", "WeasyPrint absolute", 433],
  ["/tmp/r113-writers/weasy-variant-twopage.pdf", "WeasyPrint twopage", 1616],
  ["/tmp/r113-writers/weasy-variant-display.pdf", "WeasyPrint display", 243],
  ["/tmp/r114-writers/fpdf-cv.pdf", "fpdf2 CV", 860],
  ["/tmp/r114-writers/fpdf-variant-control.pdf", "fpdf2 control", 860],
  ["/tmp/r114-writers/fpdf-variant-absolute.pdf", "fpdf2 absolute", 860],
  ["/tmp/r114-writers/fpdf-variant-twopage.pdf", "fpdf2 twopage", 1020],
  ["/tmp/r114-writers/fpdf-variant-letterspaced.pdf", "fpdf2 letterspaced", 860],
  ["/tmp/r114-writers/fpdf-variant-corefont.pdf", "fpdf2 corefont", 860],
  ["/tmp/skia-cv/john-smith-cv.pdf", "Skia resume", 1553],
  ["/tmp/skia-cv/variant-floatlast.pdf", "Skia floatlast", 438],
  ["/tmp/skia-cv/variant-absolute.pdf", "Skia absolute", 433],
  ["/tmp/skia-cv/variant-control.pdf", "Skia control", 423],
  ["/tmp/skia-cv/variant-twopage.pdf", "Skia twopage", 1616],
];
for (const [p, n, pin] of fams) {
  const raw = readFileSync(p);
  const t = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const ref = execSync(`pdftotext ${p} -`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const ok = na(t).length === pin && na(t).length === na(ref).length;
  console.log(`${n}: ours ${na(t).length} (pin ${pin}) pdftotext ${na(ref).length} ${ok ? "PIN+REF HOLD" : "*** DRIFT ***"} | dbl ${dbl(t)} (ref ${dbl(ref)})`);
}
