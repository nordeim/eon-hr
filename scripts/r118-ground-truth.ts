// r118-ground-truth.ts — the drift ledger at the final source: verify the
// Typst family's contacts splits fire (the phone line ends, the icon leads
// the email line — pdftotext's exact form) and NOTHING else drifted; the
// word streams match; the form probes (no " \n" in the new forms, no
// doubled gaps); the icons join the FOLLOWING content.
// Usage: bun scripts/r118-ground-truth.ts
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
  // the cure target: the phone line ends with 9911; the mail icon leads the next line
  const lines = ours.split("\n");
  const phoneIdx = lines.findIndex(l => l.includes("010-9911"));
  const phoneLine = lines[phoneIdx] ?? "";
  const nextLine = lines[phoneIdx + 1] ?? "";
  const iconLed = nextLine.startsWith("\uF0E0");
  const emailOnNext = nextLine.includes("john.smith@example.com");
  console.log(`phone line: ${JSON.stringify(phoneLine.slice(0, 60))}`);
  console.log(`next line:  ${JSON.stringify(nextLine.slice(0, 60))}`);
  console.log(`contacts split: ${iconLed && emailOnNext ? "CURED (icon-led email line)" : "NOT CURED"}`);
  // the icons stay on the line with their content (the phone icon leads the phone line)
  const phoneIconLeads = phoneLine.startsWith("\uF098");
  console.log(`phone icon leads the phone line: ${phoneIconLeads ? "yes" : "no"}`);
  // pdftotext reads the same two lines
  const refLines = ref.split("\n").map(s => s.trim()).filter(Boolean);
  const refPhone = refLines.find(l => l.includes("010-9911")) ?? "";
  const refMail = refLines.find(l => l.includes("john.smith@example.com")) ?? "";
  console.log(`pdftotext phone: ${JSON.stringify(refPhone.slice(0, 50))} | mail: ${JSON.stringify(refMail.slice(0, 50))}`);
  // the form probes
  const dirtySpaceNewline = (ours.match(/ \n/g) ?? []).length;
  const doubledGaps = (ours.match(/ {2,}/g) ?? []).length;
  const iconFirst = ours.indexOf("\uF098"), iconMail = ours.indexOf("\uF0E0");
  console.log(`form: " \\n" count ${dirtySpaceNewline} | doubled spaces ${doubledGaps} | icons present ${iconFirst >= 0 && iconMail > iconFirst}`);
  // the word stream (the alnum stream) matches pdftotext's
  const strip = (s: string) => (s.match(/[A-Za-z0-9]/g) ?? []).join("");
  console.log(`word-stream match: ${strip(ours) === strip(ref) ? "EXACT" : "DRIFT"}`);
}
