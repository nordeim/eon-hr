// r127-standingjoin-census.ts — THE FIRE-SEPARATION CENSUS for the standing
// join: every piece boundary where sep=" " was decided by the NOT-MOVED rule
// (adjacent show ops, no positioning in between) — the matplotlib ﬀ-row genus.
// For each boundary: the member, the left/right piece texts, and what the
// corpus output vs pdftotext reads there. Usage: bun scripts/r127-standingjoin-census.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
const proto = await import("/home/z/my-project/eon-hr/scripts/protos/cv-text-proto");

const members: Array<[string, string]> = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ"],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"],
  ["/tmp/r110-prawn-manual.pdf", "Prawn"],
  ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint"],
  ["/tmp/typst-cv/resume.pdf", "Typst resume"],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2"],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter"],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2"],
];

// The proto's flat pieces don't carry sep — recompute the boundary census from
// the per-page nested form + a rewalk? NO: the proto exposes __r118pieces with
// the piece fields (text, sep?, px, py, ps, bx...). Check whether sep rides the
// flat dump (the hook spreads e.p — sep included).
for (const [p, n] of members) {
  const raw = readFileSync(p);
  (globalThis as any).__r118pieces = [];
  (globalThis as any).__r119pages = [];
  await proto.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const pieces = ((globalThis as any).__r118pieces ?? []) as Array<Record<string, any>>;
  let standing = 0;
  const samples: string[] = [];
  for (let i = 1; i < pieces.length; i++) {
    const prev = pieces[i - 1], cur = pieces[i];
    if (cur.sep === " " && cur.moved === false) {
      // moved isn't in the flat dump — approximate: sep===" " AND same px (same
      // block origin — the TJ/Tj atoms share the Tm origin) AND both have text
      const sameBlock = typeof cur.px === "number" && typeof prev.px === "number" && Math.abs(cur.px - prev.px) < 0.01
        && typeof cur.py === "number" && typeof prev.py === "number" && Math.abs(cur.py - prev.py) < 0.01;
      if (sameBlock && (cur.text ?? "").length > 0 && (prev.text ?? "").length > 0
        && !(prev.text ?? "").endsWith(" ") && !(cur.text ?? "").startsWith(" ")) {
        standing++;
        if (samples.length < 8) samples.push(`${JSON.stringify(prev.text)}|${JSON.stringify(cur.text)}`);
      }
    }
  }
  console.log(`${n}: ${standing} same-block standing-join space boundaries${samples.length ? " — e.g. " + samples.join(" · ") : ""}`);
}
