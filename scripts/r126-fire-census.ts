// r126-fire-census.ts — the corpus-wide fire-separation census for the
// R126-A cure: which members carry (a) Form XObjects whose /Resources
// /Font pairs include names the F-scan's \w class rejects (hyphens, #, +,
// slashes — the matplotlib f-0-N class), (b) PAGES with the same shape
// (the page branch's identical miss — a page with inline hyphen pairs
// binds nothing and falls to the candidate chain), in BOTH the raw site
// and the ObjStm bodies. Plus the same-named collision sets per member.
// Usage: bun scripts/r126-fire-census.ts
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const members: [string, string][] = [
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

const FSCAN = /\/([Ff]\w+(?:\.\w+)*)\s+(\d+)\s+0\s+R/g;
const REGION = /\/Font\s*<<\s*([\w#+\-./\s]+)>>/g;
const PAIR = /\/([\w#+.-]+)\s+(\d+)\s+0\s+R/g;

for (const [path, name] of members) {
  const raw = readFileSync(path);
  const ascii = raw.toString("latin1");
  let hyphenForms = 0, hyphenPages = 0;
  const collisions = new Map<string, Set<number>>();
  const sampleNames = new Set<string>();

  // the raw site
  for (const rm of ascii.matchAll(/(\d+)\s+0\s+obj\s*([\s\S]*?)endobj/g)) {
    const body = rm[2];
    const isForm = /\/Subtype\s*\/Form\b/.test(body);
    const isPage = /\/Type\s*\/Page\b/.test(body);
    if (!isForm && !isPage) continue;
    const regionPairs = new Map<string, number>();
    for (const fm of body.matchAll(REGION))
      for (const pm of fm[1].matchAll(PAIR))
        if (pm[1] !== "Font") regionPairs.set(pm[1], parseInt(pm[2], 10));
    const fscanNames = new Set<string>();
    for (const fm of body.matchAll(FSCAN)) fscanNames.add(fm[1]);
    const missed = [...regionPairs.keys()].filter((k) => !fscanNames.has(k));
    if (missed.length) {
      if (isForm) hyphenForms++;
      if (isPage) hyphenPages++;
      for (const k of missed) {
        sampleNames.add(k);
        const set = collisions.get(k) ?? collisions.set(k, new Set()).get(k)!;
        set.add(regionPairs.get(k)!);
      }
    }
  }

  // the ObjStm site (page dicts can ride ObjStms; forms can't — streams)
  let objStmPages = 0;
  for (const sm of ascii.matchAll(/ObjStm[\s\S]{0,400}?stream\r?\n([\s\S]*?)endstream/g)) {
    let body: string;
    try { body = inflateSync(Buffer.from(sm[1], "latin1")).toString("latin1"); } catch { continue; }
    for (const rm of body.matchAll(/(\d+)\s+0\s+obj\s*<<([\s\S]*?)>>/g)) {
      const dict = rm[2];
      if (!/\/Type\s*\/Page\b/.test(dict)) continue;
      const regionPairs = new Map<string, number>();
      for (const fm of dict.matchAll(REGION))
        for (const pm of fm[1].matchAll(PAIR))
          if (pm[1] !== "Font") regionPairs.set(pm[1], parseInt(pm[2], 10));
      const fscanNames = new Set<string>();
      for (const fm of dict.matchAll(FSCAN)) fscanNames.add(fm[1]);
      const missed = [...regionPairs.keys()].filter((k) => !fscanNames.has(k));
      if (missed.length) { objStmPages++; for (const k of missed) sampleNames.add(k); }
    }
  }

  const colliding = [...collisions.entries()].filter(([, v]) => v.size > 1).map(([k, v]) => `${k}(${v.size}x)`).join(", ");
  console.log(`${name}: hyphen-forms ${hyphenForms} · hyphen-pages ${hyphenPages} · objstm-hyphen-pages ${objStmPages}${colliding ? " · collisions: " + colliding : ""}${sampleNames.size ? " · names: " + [...sampleNames].slice(0, 6).join("/") : ""}`);
}
