// r117-ground-truth.ts — the drift ledger at the final source: diff the
// Typst family outputs against pdftotext line-by-line (which column splits
// fired, which missed), and verify the form (no " \n", no doubled gaps).
// Usage: bun scripts/r117-ground-truth.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");

for (const [p, name] of [
  ["/tmp/typst-cv/resume.pdf", "resume"],
  ["/tmp/typst-cv/resume2.pdf", "resume2"],
  ["/tmp/typst-cv/coverletter.pdf", "coverletter"],
  ["/tmp/typst-cv/coverletter2.pdf", "coverletter2"],
] as [string, string][]) {
  const raw = readFileSync(p);
  const ours = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const ref = execSync(`pdftotext ${p} -`, { encoding: "utf8" });
  console.log(`\n===== ${name} =====`);
  const oursLines = ours.split("\n").map(s => s.trim()).filter(Boolean);
  const refLines = ref.split("\n").map(s => s.trim()).filter(Boolean);
  console.log(`our lines ${oursLines.length} | pdftotext lines ${refLines.length}`);
  // the cure targets: our lines that now match SPLIT pdftotext pairs
  const targets = [
    ["Senior HR Manager", "TechCorp"], ["HR Business Partner", "InnovateLLC"],
    ["Mar 2021 - Present"], ["Jun 2018 - Feb 2021"], ["2020"], ["2017"],
    ["University of California, Berkeley"], ["john.smith@example.com"],
  ];
  for (const [a, b] of targets.map(t => [t[0], t[1] ?? null])) {
    const ourJoined = oursLines.find(l => b && l.includes(a) && l.includes(b));
    const ourSplit = !ourJoined && oursLines.some(l => l.includes(a)) && (b ? oursLines.some(l => l.includes(b)) : false);
    const refSplit = b ? refLines.some(l => l.trim() === a) && refLines.some(l => l.trim().startsWith(b ?? "")) : refLines.some(l => l.includes(a));
    if (ourJoined || ourSplit) console.log(`  ${a}${b ? " | " + b : ""}: ${ourJoined ? "JOINED (missed)" : "SPLIT (cured)"}`);
  }
  // the form probes
  const dirtySpaceNewline = (ours.match(/ \n/g) ?? []).length;
  const doubledGaps = (ours.match(/ {2,}/g) ?? []).length;
  console.log(`form: " \\n" count ${dirtySpaceNewline} (want 0 in the upgraded forms) | doubled spaces ${doubledGaps}`);
  // show our experience/cert/education sections
  const section = ours.split("\n").filter(l => /TechCorp|Innovate|Mar 2021|Jun 2018|SHRM|PHR|Psychology|Berkeley|example\.com|010-9911/.test(l));
  console.log("our lines of interest:");
  section.forEach(l => console.log("   |" + l.slice(0, 90)));
}
