#!/usr/bin/env node
// r107-blast-radius.mjs — the two fixes' blast radius across the corpus:
//   FIX A (the display-kern band conditional): behavior changes ONLY for
//   kerns in (-200,-100) in streams WITH standalone space-glyph atoms.
//   Census: per file — band kerns, their streams' space-glyph status, and
//   what the neighbors decode to (the damage/innocence preview).
//   FIX B (the /Font-ref page form): census the page forms — inline
//   /Resources with a REFERENCED /Font value (the form-(c) blind spot) —
//   and the F-name candidate multiplicities (the theft vector when a
//   form-(c) page's F-name has multiple candidates).
import fs from "node:fs";

const { inflate } = await import("./r101-inflate.ts");
const files = [
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS f1040"],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv-2404.16710"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx manual"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec v2.9h"],
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc 7.0"],
  ["/tmp/r107-corpus/lo-writer.pdf", "LO Writer 7.6"],
];

for (const [path, name] of files) {
  const bytes = fs.readFileSync(path);
  const ascii = Buffer.from(bytes).toString("latin1");
  console.log(`\n===== ${name} =====`);

  // ---- PASS 1: the band + space-glyph census (stream-level) ----
  const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
  let m;
  let bandStreams = 0, bandWithSpace = 0, bandSamples = [];
  const fCands = new Map();
  const pageForms = { inline: 0, resRef: 0, fontRefInline: 0, other: 0 };
  while ((m = streamRe.exec(ascii))) {
    if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
    const dictStart = Math.max(0, ascii.lastIndexOf("endobj", m.index) + 6);
    const dictRegion = ascii.slice(dictStart, m.index);
    if (/\/Subtype\s*\/Image\b/.test(dictRegion) || /\/FontFile[23]?\b/.test(dictRegion)) {
      const endSkip = ascii.indexOf("endstream", m.index + m[0].length);
      if (endSkip < 0) break;
      streamRe.lastIndex = endSkip + "endstream".length;
      continue;
    }
    const start = m.index + m[0].length;
    const end = ascii.indexOf("endstream", start);
    if (end < 0) break;
    streamRe.lastIndex = end + "endstream".length;
    let chunkEnd = end;
    if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
    else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
    let text = "";
    for (const trimmed of [bytes.subarray(start, chunkEnd), bytes.subarray(start, end)]) {
      try { text = new TextDecoder().decode(await inflate(trimmed)); break; } catch {
        try { text = new TextDecoder().decode(await inflate(trimmed, true)); break; } catch { text = ""; }
      }
    }
    if (!text) continue;
    if (/\/Type\s*\/ObjStm\b/.test(dictRegion)) continue;
    if (text.includes("beginbfchar") || text.includes("beginbfrange")) continue;
    if (!/\]\s*TJ/.test(text)) continue;
    // band kerns + standalone space atoms in THIS stream
    let band = 0;
    for (const tj of text.matchAll(/\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ/g)) {
      const atomRe = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>|(-?[\d.]+)/g;
      let a; let kern = 0; let prev = ""; let prevKind = "lit";
      while ((a = atomRe.exec(tj[1]))) {
        if (a[1] !== undefined || a[2] !== undefined) {
          if (kern !== 0 && kern <= -100 && kern > -200) {
            band++;
            if (bandSamples.length < 5) bandSamples.push({ stream: m.index, kern, prev: (prevKind === "lit" ? prev : "<" + prev + ">").slice(0, 16) });
          }
          kern = 0; prev = a[1] ?? a[2] ?? ""; prevKind = a[1] !== undefined ? "lit" : "hex";
        } else kern += parseFloat(a[3]);
      }
    }
    if (band > 0) {
      bandStreams++;
      // standalone space atoms: an atom whose entire literal is whitespace
      // (the hex case needs the CMap — approximate with the literal census;
      // LO writes spaces as hex glyphs too, so ALSO count hex atoms that
      // are 2-char codes AND the stream has literal standalone spaces)
      const litSpace = /\(\s+\)/.test(text);
      if (litSpace) bandWithSpace++;
    }
  }
  console.log(`FIX-A blast: band streams=${bandStreams} (of which literal-space-glyph=${bandWithSpace}); samples=${JSON.stringify(bandSamples.slice(0, 3))}`);

  // ---- PASS 2: the page forms + candidate multiplicities (raw) ----
  for (const rm of ascii.matchAll(/(\d+)\s+0\s+obj\s*([\s\S]*?)endobj/g)) {
    const body = rm[2];
    for (const fm of body.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) {
      if (fm[1] === "Font") continue; // the dict-key false capture
      if (!fCands.has(fm[1])) fCands.set(fm[1], new Map());
      fCands.get(fm[1]).set(fm[2], (fCands.get(fm[1]).get(fm[2]) ?? 0) + 1);
    }
    if (/\/Type\s*\/Page\b/.test(body) && /\/Contents/.test(body)) {
      if (/\/Resources\s+\d+\s+0\s+R/.test(body)) pageForms.resRef++;
      else if (/\/Resources\s*<<[\s\S]*\/Font\s+\d+\s+0\s+R/.test(body)) pageForms.fontRefInline++;
      else if (/\/Resources\s*<<[\s\S]*\/Font\s*<</.test(body)) pageForms.inline++;
      else pageForms.other++;
    }
  }
  const multi = [...fCands.entries()].filter(([n, m2]) => m2.size > 1);
  console.log(`FIX-B blast: page forms=${JSON.stringify(pageForms)}; F-names with MULTIPLE candidates: ${multi.length}${multi.length ? " → " + multi.slice(0, 6).map(([n, mm]) => `${n}:${mm.size}`).join(",") : ""}`);
}
console.log("\nBLAST RADIUS DONE");
process.exit(0);
