// r111-member-checks.ts — the Typst members' ground-truth checks (the
// r109/r110 standard): our extraction vs pdftotext, member-for-member.
// Usage: bun scripts/r111-member-checks.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const modPath = process.argv[2] ?? "/home/z/my-project/eon-hr/src/lib/cv-text";
const mod = await import(modPath);

const members: [string, string, string][] = [
  ["/tmp/typst-cv/resume.pdf", "Typst resume", "/tmp/typst-cv/ref-resume.txt"],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2", "/tmp/typst-cv/ref-resume2.txt"],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter", "/tmp/typst-cv/ref-coverletter.txt"],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2", "/tmp/typst-cv/ref-coverletter2.txt"],
];

for (const [pdf, name, refPath] of members) {
  const raw = readFileSync(pdf);
  const ours = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "probe.pdf"));
  const ref = readFileSync(refPath, "utf8");
  const norm = (s: string) => s.replace(/[^A-Za-z0-9]+/g, "");
  const oa = norm(ours);
  const ra = norm(ref);
  console.log(`\n===== ${name} =====`);
  console.log(`ours alnums: ${oa.length} | pdftotext alnums: ${ra.length} | ratio: ${(oa.length / ra.length * 100).toFixed(2)}%`);
  const checks: [string, boolean][] = [
    ["probe 'John Smith'", ours.includes("John") && ours.includes("Smith")],
    ["probe 'Software Engineer'", ours.includes("Software Engineer")],
    ["probe 'Experience'", ours.includes("Experience")],
    ["probe 'Skills'", ours.includes("Skills")],
    ["ZERO U+FFFD", !ours.includes("\uFFFD")],
  ];
  if (name.includes("resume")) {
    checks.push(
      ["probe 'Lorem ipsum'", ours.includes("Lorem ipsum")],
      ["probe 'thread pool library'", ours.includes("thread pool library")],
      ["probe 'Example University'", ours.includes("Example University")],
      ["probe 'B.S. in Computer Science'", ours.includes("B.S. in Computer Science")],
      ["probe 'consectetur adipiscing'", ours.includes("consectetur adipiscing")],
    );
  } else {
    checks.push(
      ["probe 'Company Recruitement Team'", ours.includes("Company Recruitement")],
      ["probe 'Google, Inc.'", ours.includes("Google, Inc.")],
    );
  }
  for (const [n, ok] of checks) console.log(`${ok ? "PASS" : "*** FAIL ***"} — ${n}`);
}
