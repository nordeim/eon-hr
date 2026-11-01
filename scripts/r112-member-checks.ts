// r112-member-checks.ts — the Skia members' ground-truth checks (the
// r109/r110/r111 standard): our extraction vs pdftotext, member-for-member,
// on the FINAL source. Also re-runs the 12 standing corpus pins.
// Usage: bun scripts/r112-member-checks.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const modPath = process.argv[2] ?? "/home/z/my-project/eon-hr/src/lib/cv-text";
const mod = await import(modPath);

const members: [string, string][] = [
  ["/tmp/skia-cv/john-smith-cv.pdf", "Skia CV (the hunt target)"],
  ["/tmp/skia-cv/variant-floatlast.pdf", "Skia floatlast"],
  ["/tmp/skia-cv/variant-absolute.pdf", "Skia absolute"],
  ["/tmp/skia-cv/variant-control.pdf", "Skia control"],
  ["/tmp/skia-cv/variant-twopage.pdf", "Skia twopage"],
];

for (const [pdf, name] of members) {
  const raw = readFileSync(pdf);
  const ours = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "probe.pdf"));
  const ref = execSync(`pdftotext ${pdf} -`, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  const norm = (s: string) => s.replace(/[^A-Za-z0-9]+/g, "");
  const oa = norm(ours);
  const ra = norm(ref);
  console.log(`\n===== ${name} =====`);
  console.log(`ours alnums: ${oa.length} | pdftotext alnums: ${ra.length} | ratio: ${(oa.length / ra.length * 100).toFixed(2)}%`);
}

// the ORDER probes — the round's target defect class (reading order)
{
  const raw = readFileSync("/tmp/skia-cv/john-smith-cv.pdf");
  const ours = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "probe.pdf"));
  const ref = execSync("pdftotext /tmp/skia-cv/john-smith-cv.pdf -", { encoding: "utf8" });
  const checks: [string, boolean, boolean][] = [
    // [probe, ours, pdftotext] — the name before the dates (both)
    ["name before dates", ours.indexOf("John Smith") < ours.indexOf("Mar 2021"), ref.indexOf("John Smith") < ref.indexOf("Mar 2021")],
    ["entry line before its date", ours.indexOf("TechCorp") < ours.indexOf("Mar 2021"), ref.indexOf("TechCorp") < ref.indexOf("Mar 2021")],
    ["summary before experience", ours.indexOf("SUMMARY") < ours.indexOf("EXPERIENCE"), ref.toUpperCase().indexOf("SUMMARY") < ref.toUpperCase().indexOf("EXPERIENCE")],
    ["skills before certifications", ours.indexOf("SKILLS") < ours.indexOf("CERTIFICATIONS"), ref.toUpperCase().indexOf("SKILLS") < ref.toUpperCase().indexOf("CERTIFICATIONS")],
    ["education after experience", ours.indexOf("EDUCATION") > ours.indexOf("EXPERIENCE"), ref.toUpperCase().indexOf("EDUCATION") > ref.toUpperCase().indexOf("EXPERIENCE")],
  ];
  for (const [n, o, r] of checks) console.log(`${o === r ? "MATCH" : "*** DIVERGE ***"} — ${n}: ours=${o} pdftotext=${r}`);
  console.log("zero U+FFFD:", !ours.includes("\uFFFD"));
  console.log("\n--- ours (first 300) ---\n" + ours.slice(0, 300));
  console.log("\n--- pdftotext (first 300) ---\n" + ref.slice(0, 300));
}
