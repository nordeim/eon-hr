// the full-corpus drift ledger for the candidate: every member's output
// diffed vs HEAD (the pin state) + classified toward/away pdftotext.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import crypto from "node:crypto";
const mod = await import("/tmp/r119-proto/cv-text");
const modOld = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
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
  ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint CV"],
  ["/tmp/r114-writers/fpdf-variant-control.pdf", "fpdf2"],
  ["/tmp/skia-cv/john-smith-cv.pdf", "Skia CV"],
];
for (const [path, name] of members) {
  const raw = readFileSync(path);
  const file = new File([new Uint8Array(raw)], "m.pdf");
  const neu = await mod.extractTextFromFile(file);
  const old = await modOld.extractTextFromFile(file);
  const ref = execSync(`pdftotext ${path} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
  const md5n = crypto.createHash("md5").update(neu).digest("hex").slice(0, 8);
  const md5o = crypto.createHash("md5").update(old).digest("hex").slice(0, 8);
  const alnum = (s: string) => (s.match(/[A-Za-z0-9]/g) ?? []).join("");
  const same = md5n === md5o;
  let verdict = "IDENTICAL";
  if (!same) {
    // classify: compare alnum streams (must be identical) + count new lines matching ref lines
    const aln = alnum(neu) === alnum(old);
    const rl = new Set(ref.split("\n").map(s => s.trim()).filter(Boolean));
    const ol = new Set(old.split("\n"));
    let toward = 0, away = 0;
    for (const l of neu.split("\n")) {
      const t = l.trim();
      if (!t || ol.has(l)) continue;
      if (rl.has(t)) toward++; else away++;
    }
    for (const l of old.split("\n")) {
      const t = l.trim();
      if (!t) continue;
      if (rl.has(t) && !neu.split("\n").some(x => x.trim() === t)) away++;
    }
    verdict = `DRIFT alnums-preserved=${aln} toward~${toward} away~${away}`;
  }
  console.log(`${name}: ${md5o} -> ${md5n} ${verdict}`);
}
