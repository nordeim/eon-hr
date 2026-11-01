// r114-member-checks.ts — the fpdf2 members' ground-truth checks (the
// r109–r113 standard): our extraction vs pdftotext, member-for-member, on
// the FINAL source. Also re-runs the standing corpus pins (byte-level) and
// the form probes (the r113 count-pin blind-spot lesson: joined-word and
// single-space assertions beside the count pins).
// Usage: bun scripts/r114-member-checks.ts [module-path]
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import crypto from "node:crypto";

const modPath = process.argv[2] ?? "/home/z/my-project/eon-hr/src/lib/cv-text";
const mod = await import(modPath);

const members: [string, string][] = [
  ["/tmp/r114-writers/fpdf-cv.pdf", "fpdf2 CV (the hunt target)"],
  ["/tmp/r114-writers/fpdf-variant-control.pdf", "fpdf2 control"],
  ["/tmp/r114-writers/fpdf-variant-absolute.pdf", "fpdf2 absolute"],
  ["/tmp/r114-writers/fpdf-variant-twopage.pdf", "fpdf2 twopage"],
  ["/tmp/r114-writers/fpdf-variant-letterspaced.pdf", "fpdf2 letterspaced"],
  ["/tmp/r114-writers/fpdf-variant-corefont.pdf", "fpdf2 corefont"],
];

for (const [pdf, name] of members) {
  const raw = readFileSync(pdf);
  const ours = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "probe.pdf"));
  const ref = execSync(`pdftotext ${pdf} -`, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  const norm = (s: string) => s.replace(/[^A-Za-z0-9]+/g, "");
  const oa = norm(ours);
  const ra = norm(ref);
  const dbl = /(\S)  (\S)/.test(ours.slice(0, 400));
  console.log(`${name}: ours ${oa.length} | pdftotext ${ra.length} | ratio ${(oa.length / ra.length * 100).toFixed(2)}% | double-space: ${dbl ? "YES" : "no"} | U+FFFD: ${ours.includes("\uFFFD") ? "YES" : "no"}`);
}

// the ORDER + FORM probes on the hunt target (the r112/r113 standard)
{
  const raw = readFileSync("/tmp/r114-writers/fpdf-cv.pdf");
  const ours = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "probe.pdf"));
  const ref = execSync("pdftotext /tmp/r114-writers/fpdf-cv.pdf -", { encoding: "utf8" });
  const checks: [string, boolean, boolean][] = [
    ["name before dates", ours.indexOf("John Smith") < ours.indexOf("Mar 2021"), ref.indexOf("John Smith") < ref.indexOf("Mar 2021")],
    ["role before its bullet", ours.indexOf("Senior HR Manager") < ours.indexOf("Led a team"), ref.indexOf("Senior HR Manager") < ref.indexOf("Led a team")],
    ["summary before experience", ours.indexOf("SUMMARY") < ours.indexOf("EXPERIENCE"), ref.toUpperCase().indexOf("SUMMARY") < ref.toUpperCase().indexOf("EXPERIENCE")],
    ["skills before certifications", ours.indexOf("SKILLS") < ours.indexOf("CERTIFICATIONS"), ref.toUpperCase().indexOf("SKILLS") < ref.toUpperCase().indexOf("CERTIFICATIONS")],
    ["education after experience", ours.indexOf("EDUCATION") > ours.indexOf("EXPERIENCE"), ref.toUpperCase().indexOf("EDUCATION") > ref.toUpperCase().indexOf("EXPERIENCE")],
  ];
  console.log("\n=== ORDER PROBES (the fpdf2 CV) ===");
  for (const [n, o, r] of checks) console.log(`${o === r ? "MATCH" : "*** DIVERGE ***"} — ${n}: ours=${o} pdftotext=${r}`);
  console.log("FORM probe (joined name):", ours.includes("John Smith"));
  console.log("FORM probe (single-spaced body):", ours.includes("Human resources leader with twelve years"));
  console.log("FORM probe (no doubled gaps):", !/\S  \S/.test(ours.slice(0, 600)));
  console.log("zero U+FFFD:", !ours.includes("\uFFFD"));
  console.log("\n--- ours (first 320) ---\n" + ours.slice(0, 320));
}

// the standing corpus pins + the byte-level blast radius (the r113 final md5s)
console.log("\n=== STANDING CORPUS (byte-level vs the r113 final md5s) ===");
const pins: [string, string, string, number][] = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", "4d55b9e8", 70646],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx", "997b1521", 61437],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", "dc116383", 106179],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS", "3b8da084", 5798],
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc", "4e6f6a0c", 695014],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ", "7c7e6529", 2697],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab", "155ca508", 213160],
  ["/tmp/r110-prawn-manual.pdf", "Prawn", "82da488f", 83657],
  ["/tmp/typst-cv/resume.pdf", "Typst resume", "1af269ca", 2422],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2", "a711b996", 2013],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter", "20921140", 1872],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2", "d404f096", 2083],
  ["/tmp/skia-cv/john-smith-cv.pdf", "Skia resume", "0b1dae3c", 1553],
  ["/tmp/skia-cv/variant-floatlast.pdf", "Skia floatlast", "e6c25218", 438],
  ["/tmp/skia-cv/variant-absolute.pdf", "Skia absolute", "9c591cbd", 433],
  ["/tmp/skia-cv/variant-control.pdf", "Skia control", "a58c1a41", 423],
  ["/tmp/skia-cv/variant-twopage.pdf", "Skia twopage", "bed461b6", 1616],
];
let drift = 0;
for (const [p, n, pin, alnumPin] of pins) {
  const raw = readFileSync(p);
  const t = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const md5 = crypto.createHash("md5").update(t).digest("hex").slice(0, 8);
  const alnums = t.replace(/[^A-Za-z0-9]/g, "").length;
  const ok = md5 === pin && alnums === alnumPin;
  if (!ok) { drift++; console.log(`${n}: md5 ${md5} (pin ${pin}) alnums ${alnums} (pin ${alnumPin}) *** DRIFT ***`); }
}
console.log(drift === 0 ? "ALL 17 BYTE-IDENTICAL + ALNUM PINS HOLD" : `${drift} MEMBERS DRIFTED`);

// the WeasyPrint members (the r113 class — the newest standing family)
console.log("\n=== THE WEASYPRINT MEMBERS (the r113 family re-verified) ===");
const weasy: [string, string, number][] = [
  ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint CV", 692],
  ["/tmp/r113-writers/weasy-variant-control.pdf", "WeasyPrint control", 423],
  ["/tmp/r113-writers/weasy-variant-floatlast.pdf", "WeasyPrint floatlast", 438],
  ["/tmp/r113-writers/weasy-variant-absolute.pdf", "WeasyPrint absolute", 433],
  ["/tmp/r113-writers/weasy-variant-twopage.pdf", "WeasyPrint twopage", 1616],
  ["/tmp/r113-writers/weasy-variant-display.pdf", "WeasyPrint display", 243],
];
for (const [p, n, pin] of weasy) {
  const raw = readFileSync(p);
  const t = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const alnums = t.replace(/[^A-Za-z0-9]/g, "").length;
  console.log(`${n}: ${alnums} (pin ${pin}) ${alnums === pin ? "PIN HOLDS" : "*** PIN DRIFT ***"}`);
}
