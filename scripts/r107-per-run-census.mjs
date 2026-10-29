#!/usr/bin/env node
// r107-per-run-census.mjs — the band-kern classes measured PER RUN (BT
// block): does the run carrying band kerns ALSO carry standalone space-glyph
// atoms? The hypothesis: the LO cover run does (the spaces are glyphs, the
// kerns are display tracking AROUND them); the fontspec/arXiv runs don't
// (the gaps ride the kerns themselves). If the classes separate per-run,
// the fix gates the band conditional on the RUN's space-glyph presence.
import fs from "node:fs";

const { inflate } = await import("./r101-inflate.ts");
const targets = [
  { path: "/tmp/r107-corpus/lo-calc.pdf", label: "LO Calc (the cover @9729698)", at: 9729698 },
];

for (const t of targets) {
  const bytes = fs.readFileSync(t.path);
  const ascii = Buffer.from(bytes).toString("latin1");
  const m = ascii.slice(t.at).match(/stream[ \t]*(?:\r\n|\r|\n)/);
  const start = t.at + m.index + m[0].length;
  const end = ascii.indexOf("endstream", start);
  let chunkEnd = end;
  if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
  else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
  const text = new TextDecoder().decode(await inflate(bytes.subarray(start, chunkEnd)));
  console.log(`\n===== ${t.label} — per-BT-block census =====`);
  // split the BT..ET blocks; census each: space-glyph atoms + band kerns
  const blocks = [...text.matchAll(/BT([\s\S]*?)ET/g)].map((b) => b[1]);
  blocks.forEach((b, i) => {
    const shows = [...b.matchAll(/\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ|\(((?:\\.|[^\\()])*)\)\s*(?:Tj|TJ|'|")|<([0-9A-Fa-f\s]+)>\s*(?:Tj|TJ|'|")/g)];
    let band = 0, spaceLit = 0, atoms = 0;
    for (const s of shows) {
      const body = s[1] ?? s[2] ?? s[3] ?? "";
      if (s[1] !== undefined) {
        // TJ array: census atoms + numbers
        const atomRe = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>|(-?[\d.]+)/g;
        let a; let kern = 0; let prevAtom = "";
        while ((a = atomRe.exec(body))) {
          if (a[1] !== undefined || a[2] !== undefined) {
            if (kern !== 0 && kern <= -100 && kern > -200) band++;
            kern = 0; atoms++;
            const lit = a[1] ?? "";
            if (a[1] !== undefined && /^\s+$/.test(lit)) spaceLit++;
          } else kern += parseFloat(a[3]);
        }
      } else {
        atoms++;
        const lit = s[2] ?? "";
        if (s[2] !== undefined && /^\s+$/.test(lit)) spaceLit++;
      }
    }
    if (band > 0 || spaceLit > 0) console.log(`  block ${i}: atoms=${atoms} bandKerns=${band} spaceLitAtoms=${spaceLit} :: ${JSON.stringify(b.trim().slice(0, 100))}`);
  });
}
console.log("\n=== now fontspec + arXiv: find the streams carrying the drifting lines ===");
// fontspec L1277 "any effect on text in this font" — find the stream + block
// arXiv "J(X; Y; t)" — same
for (const [path, label, needle] of [
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", "any effect on text in this font"],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", "per-layer loss scale"],
]) {
  const bytes = fs.readFileSync(path);
  const ascii = Buffer.from(bytes).toString("latin1");
  const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
  let m;
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
    // the needle words might be hex-coded — probe the literal + hex-space forms:
    // find blocks with band kerns and check their space-atom state directly
    const blocks = [...text.matchAll(/BT([\s\S]*?)ET/g)].map((b) => b[1]);
    let streamHasBand = false;
    const lines = [];
    blocks.forEach((b, i) => {
      const shows = [...b.matchAll(/\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ|\(((?:\\.|[^\\()])*)\)\s*(?:Tj|TJ|'|")/g)];
      let band = 0, spaceLit = 0, atoms = 0;
      for (const s of shows) {
        const body = s[1] ?? s[2] ?? "";
        if (s[1] !== undefined) {
          const atomRe = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>|(-?[\d.]+)/g;
          let a; let kern = 0;
          while ((a = atomRe.exec(body))) {
            if (a[1] !== undefined || a[2] !== undefined) {
              if (kern !== 0 && kern <= -100 && kern > -200) band++;
              kern = 0; atoms++;
              if (a[1] !== undefined && /^\s+$/.test(a[1])) spaceLit++;
            } else kern += parseFloat(a[3]);
          }
        } else {
          atoms++;
          if (/^\s+$/.test(s[2] ?? "")) spaceLit++;
        }
      }
      if (band > 0) { streamHasBand = true; lines.push({ i, band, spaceLit, atoms, head: b.trim().slice(0, 90) }); }
    });
    if (streamHasBand) {
      console.log(`\n${label} stream @${m.index}: band-carrying blocks:`);
      for (const l of lines.slice(0, 5)) console.log(`  block ${l.i}: atoms=${l.atoms} bandKerns=${l.band} spaceLitAtoms=${l.spaceLit} :: ${JSON.stringify(l.head)}`);
    }
  }
}
console.log("\nPER-RUN CENSUS DONE");
process.exit(0);
