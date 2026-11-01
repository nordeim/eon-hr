// r116-blast-radius.ts — session 116 / parity round 115: measure the
// R116-A prototype's blast radius over the FULL corpus — every downloaded
// member + every regenerated family. For each member: HEAD md5/alnums vs
// PROTO md5/alnums vs pdftotext, with the toward/away classification of
// every change (whitespace-aligned word diff, the r115 discipline).
// Usage: bun scripts/r116-blast-radius.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import crypto from "node:crypto";

const head = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const proto = await import("/tmp/r116-proto/cv-text");
const md5 = (s: string) => crypto.createHash("md5").update(s).digest("hex").slice(0, 8);
const na = (s: string) => s.replace(/[^A-Za-z0-9]/g, "");
const nl = (s: string) => (s.match(/\n/g) || []).length;

// word-level diff for toward/away classification (the r115 discipline):
// align on alnum-stripped words, then compare the separators around the
// changed pairs
function classify(head: string, proto: string, ref: string): string {
  const hw = head.split(/\s+/).filter(Boolean);
  const pw = proto.split(/\s+/).filter(Boolean);
  const rw = ref.split(/\s+/).filter(Boolean);
  if (hw.join("\u0000") === pw.join("\u0000")) return proto === head ? "IDENTICAL" : "SEPARATOR-ONLY (word stream stable)";
  return `WORD STREAM CHANGED: head ${hw.length} proto ${pw.length} ref ${rw.length}`;
}

const members: [string, string][] = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
  ["/tmp/typst-cv/resume.pdf", "Typst resume"],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2"],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter"],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2"],
];

console.log("member | head md5 | proto md5 | same? | nl head→proto | nl ref | classification");
for (const [p, n] of members) {
  const raw = readFileSync(p);
  const f = () => new File([new Uint8Array(raw)], "m.pdf");
  const h = await head.extractTextFromFile(f());
  const pr = await proto.extractTextFromFile(f());
  const rf = execSync(`pdftotext ${p} -`, { encoding: "utf8" });
  const cls = classify(h, pr, rf);
  console.log(`${n} | ${md5(h)} | ${md5(pr)} | ${h === pr ? "SAME" : "DRIFT"} | ${nl(h)}→${nl(pr)} | ${nl(rf)} | ${cls}`);
}
