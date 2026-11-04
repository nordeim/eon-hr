// r125-fire-census.ts — the fire-separation census for the three r125
// cure candidates, measured across every corpus member + family member:
//   C1 the /Contents-ARRAY form (pages whose content is a stream array)
//      + mid-array streams whose FIRST text-show precedes any Tf in that
//      stream (the inherited-text-state class — the IRS pocket's cause)
//   C2 the MIXED /W array form (array entries `c [w…]` interleaved with
//      bare-number groups — read today as PAIRS, the spec's range arms)
//   C3 the zero-width-in-map entries (codes the /Widths//W map covers at
//      width 0 — the legitimate-zero class vs the unknown-code class)
// Usage: bun scripts/r125-fire-census.ts
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
  ["/tmp/typst-cv/resume.pdf", "Typst resume"],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2"],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter"],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2"],
  ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint"],
  ["/tmp/r114-writers/fpdf-variant-control.pdf", "fpdf2"],
  ["/tmp/skia-cv/john-smith-cv.pdf", "Skia CV"],
];

function streamsOf(ascii: string): Map<number, string> {
  // decompressed stream bodies keyed by objNum (Flate only — the corpus form)
  const out = new Map<number, string>();
  for (const om of ascii.matchAll(/(\d+)\s+0\s+obj\s*<<([^>]*)>>\s*stream\r?\n/g)) {
    const start = om.index! + om[0].length;
    const es = ascii.indexOf("endstream", start);
    if (es < 0) continue;
    const dict = om[2];
    if (/\/ObjStm/.test(dict)) continue; // content streams are not ObjStms themselves
    if (!/\/Filter/.test(dict)) {
      out.set(parseInt(om[1], 10), ascii.slice(start, es)); // uncompressed
      continue;
    }
    if (!/FlateDecode/.test(dict)) continue;
    try {
      out.set(parseInt(om[1], 10), inflateSync(Buffer.from(ascii.slice(start, es), "latin1")).toString("latin1"));
    } catch { /* not flate */ }
  }
  return out;
}

function objStmBodies(ascii: string): string[] {
  const out: string[] = [];
  for (const om of ascii.matchAll(/(\d+)\s+0\s+obj\s*<<([^>]*)>>\s*stream\r?\n/g)) {
    if (!/\/ObjStm/.test(om[2])) continue;
    const start = om.index! + om[0].length;
    const es = ascii.indexOf("endstream", start);
    try { out.push(inflateSync(Buffer.from(ascii.slice(start, es), "latin1")).toString("latin1")); } catch { /* skip */ }
  }
  return out;
}

console.log("member | pages-with-Contents-ARRAY | mid-array Tf-less-first-show streams | mixed-/W arrays | zero-width-in-map entries (font objects)");
for (const [path, name] of members) {
  let raw: Buffer;
  try { raw = readFileSync(path); } catch { console.log(`${name}: MISSING`); continue; }
  const ascii = raw.toString("latin1");
  const streams = streamsOf(ascii);
  const stmBodies = objStmBodies(ascii);

  // C1: /Contents arrays — find them in raw dicts AND ObjStm bodies
  let arrPages = 0;
  const arrays: number[][] = [];
  const scanContents = (body: string) => {
    for (const cm of body.matchAll(/\/Contents\s*\[([^\]]*)\]/g)) {
      const refs = [...cm[1].matchAll(/(\d+)\s+0\s+R/g)].map((m) => parseInt(m[1], 10));
      if (refs.length >= 2) { arrPages++; arrays.push(refs); }
    }
  };
  scanContents(ascii);
  for (const b of stmBodies) scanContents(b);

  // C1b: mid-array streams whose first text-show precedes any Tf
  let tfless = 0;
  for (const refs of arrays) {
    for (const r of refs) {
      const s = streams.get(r);
      if (!s) continue;
      const firstShow = s.search(/\)\s*(Tj|TJ|'|\")|>\s*(Tj|TJ|'|\")/);
      if (firstShow < 0) continue;
      const firstTf = s.search(/\/\S+\s+[\d.+-]+\s+Tf/);
      if (firstTf < 0 || firstTf > firstShow) tfless++;
    }
  }

  // C2: mixed /W arrays (contains '[' AND bare numbers between arrays)
  let mixed = 0, zeroInMap = 0;
  const scanFonts = (body: string) => {
    for (const wm of body.matchAll(/\/W\s*\[([^\]]*)\]/g)) {
      const inner = wm[1];
      if (!inner.includes("[")) continue;
      // mixed form: a number followed by [ AND bare-number groups between ] and the next number/[
      const hasArrayEntries = /\[\s*-?[\d.]+/.test(inner);
      // strip the array entries, see if bare triples remain
      const bare = inner.replace(/\[[^\]]*\]/g, " ");
      const bareNums = (bare.match(/-?[\d.]+/g) ?? []).length;
      if (hasArrayEntries && bareNums >= 3) mixed++;
    }
  };
  scanFonts(ascii);
  for (const b of stmBodies) scanFonts(b);

  // C3: /Widths or /W entries at value 0 for a code the map covers
  const scanZero = (body: string) => {
    for (const wm of body.matchAll(/\/Widths\s*\[([^\]]*)\]/g)) {
      const nums = (wm[1].match(/-?[\d.]+/g) ?? []).map(Number);
      zeroInMap += nums.filter((n) => n === 0).length;
    }
    for (const wm of body.matchAll(/\/W\s*\[([^\]]*)\]/g)) {
      // count explicit zero widths in /W (both forms)
      const inner = wm[1];
      for (const am of inner.matchAll(/\[([^\]]*)\]/g)) {
        zeroInMap += (am[1].match(/(^|\s)0(\s|$)/g) ?? []).length;
      }
    }
  };
  scanZero(ascii);
  for (const b of stmBodies) scanZero(b);

  console.log(`${name} | ${arrPages} | ${tfless} | ${mixed} | ${zeroInMap}`);
}
