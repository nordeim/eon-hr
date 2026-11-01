// r113-member-checks.ts — the WeasyPrint members' ground-truth checks (the
// r109–r112 standard): our extraction vs pdftotext, member-for-member, on
// the FINAL source. Also re-runs the standing corpus pins.
// Usage: bun scripts/r113-member-checks.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const modPath = process.argv[2] ?? "/home/z/my-project/eon-hr/src/lib/cv-text";
const mod = await import(modPath);

const members: [string, string][] = [
  ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint CV (the hunt target)"],
  ["/tmp/r113-writers/weasy-variant-control.pdf", "WeasyPrint control"],
  ["/tmp/r113-writers/weasy-variant-floatlast.pdf", "WeasyPrint floatlast"],
  ["/tmp/r113-writers/weasy-variant-absolute.pdf", "WeasyPrint absolute"],
  ["/tmp/r113-writers/weasy-variant-twopage.pdf", "WeasyPrint twopage"],
  ["/tmp/r113-writers/weasy-variant-display.pdf", "WeasyPrint display"],
];

for (const [pdf, name] of members) {
  const raw = readFileSync(pdf);
  const ours = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "probe.pdf"));
  const ref = execSync(`pdftotext ${pdf} -`, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  const norm = (s: string) => s.replace(/[^A-Za-z0-9]+/g, "");
  const oa = norm(ours);
  const ra = norm(ref);
  const soup = /([A-Za-z] ){3,}/.test(ours.slice(0, 300));
  console.log(`${name}: ours ${oa.length} | pdftotext ${ra.length} | ratio ${(oa.length / ra.length * 100).toFixed(2)}% | soup: ${soup ? "YES" : "no"}`);
}

// the ORDER probes — the r112 standard on the WeasyPrint CV (the float class)
{
  const raw = readFileSync("/tmp/r113-writers/weasy-cv.pdf");
  const ours = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "probe.pdf"));
  const ref = execSync("pdftotext /tmp/r113-writers/weasy-cv.pdf -", { encoding: "utf8" });
  const checks: [string, boolean, boolean][] = [
    ["name before dates", ours.indexOf("John Smith") < ours.indexOf("Mar 2021"), ref.indexOf("John Smith") < ref.indexOf("Mar 2021")],
    ["role before its bullet", ours.indexOf("Senior HR Manager") < ours.indexOf("Led a team"), ref.indexOf("Senior HR Manager") < ref.indexOf("Led a team")],
    ["summary before experience", ours.indexOf("SUMMARY") < ours.indexOf("EXPERIENCE"), ref.toUpperCase().indexOf("SUMMARY") < ref.toUpperCase().indexOf("EXPERIENCE")],
    ["skills before certifications", ours.indexOf("SKILLS") < ours.indexOf("CERTIFICATIONS"), ref.toUpperCase().indexOf("SKILLS") < ref.toUpperCase().indexOf("CERTIFICATIONS")],
    ["education after experience", ours.indexOf("EDUCATION") > ours.indexOf("EXPERIENCE"), ref.toUpperCase().indexOf("EDUCATION") > ref.toUpperCase().indexOf("EXPERIENCE")],
  ];
  console.log("\n=== ORDER PROBES (the WeasyPrint CV) ===");
  for (const [n, o, r] of checks) console.log(`${o === r ? "MATCH" : "*** DIVERGE ***"} — ${n}: ours=${o} pdftotext=${r}`);
  console.log("zero U+FFFD:", !ours.includes("\uFFFD"));
  console.log("\n--- ours (first 320) ---\n" + ours.slice(0, 320));
  console.log("\n--- pdftotext (first 320) ---\n" + ref.slice(0, 320));
}

// the standing corpus pins (the 17 re-sourced members)
console.log("\n=== STANDING CORPUS PINS ===");
const pins: [string, string, number][] = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", 70646],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx", 61437],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", 106179],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS", 5798],
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc", 695014],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ", 2697],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab", 213160],
  ["/tmp/r110-prawn-manual.pdf", "Prawn", 83657],
  ["/tmp/typst-cv/resume.pdf", "Typst resume", 2422],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2", 2013],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter", 1872],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2", 2083],
  ["/tmp/skia-cv/john-smith-cv.pdf", "Skia resume", 1553],
  ["/tmp/skia-cv/variant-floatlast.pdf", "Skia floatlast", 438],
  ["/tmp/skia-cv/variant-absolute.pdf", "Skia absolute", 433],
  ["/tmp/skia-cv/variant-control.pdf", "Skia control", 423],
  ["/tmp/skia-cv/variant-twopage.pdf", "Skia twopage", 1616],
];
for (const [p, n, pin] of pins) {
  const raw = readFileSync(p);
  const text = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const alnums = text.replace(/[^A-Za-z0-9]/g, "").length;
  console.log(`${n}: ${alnums} (pin ${pin}) ${alnums === pin ? "PIN HOLDS" : "*** PIN DRIFT ***"}`);
}
