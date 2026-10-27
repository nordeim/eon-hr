// probe-r102-lo-trace.mjs — replicate extractPdfText stage by stage on the
// LibreOffice file and instrument where the text dies: streams → pieces →
// hex decode → alnum yield.
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const path = process.argv[2];
const buf = readFileSync(path);
const bytes = new Uint8Array(buf);
const ascii = Buffer.from(buf).toString("latin1");

const cmaps = [];
const pending = [];
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m; let nInflated = 0, nCmap = 0, nPieceStreams = 0;
let atomStats = { hexAtoms: 0, litAtoms: 0, hexBytes: 0 };
let unmappedCodeCount = new Map();

while ((m = streamRe.exec(ascii))) {
  if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
  const start = m.index + m[0].length;
  const end = ascii.indexOf("endstream", start);
  if (end < 0) break;
  streamRe.lastIndex = end + "endstream".length;
  let chunkEnd = end;
  if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
  else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
  const chunk = bytes.subarray(start, chunkEnd);
  let text = "";
  try { text = new TextDecoder().decode(await inflate(chunk)); } catch {
    try { text = new TextDecoder().decode(await inflate(chunk, true)); } catch { continue; }
  }
  if (!text) continue;
  nInflated++;
  if (text.includes("beginbfchar") || text.includes("beginbfrange")) {
    nCmap++;
    // replicate parseToUnicode
    const map = new Map();
    let codeLen = 2;
    const cs = text.match(/begincodespacerange([\s\S]*?)endcodespacerange/);
    if (cs) { const first = cs[1].match(/<([0-9A-Fa-f]+)>/); if (first) codeLen = first[1].length > 2 ? 2 : 1; }
    const bfRe = /beginbfchar([\s\S]*?)endbfchar/g;
    let bm;
    while ((bm = bfRe.exec(text))) {
      const pairRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g;
      let p;
      while ((p = pairRe.exec(bm[1]))) {
        const h = p[2].length % 4 === 0 ? p[2] : p[2].padStart(Math.ceil(p[2].length / 4) * 4, "0");
        let out = "";
        for (let i = 0; i < h.length; i += 4) out += String.fromCharCode(parseInt(h.slice(i, i + 4), 16));
        map.set(parseInt(p[1], 16), out);
      }
    }
    if (map.size) cmaps.push({ codeLen, map });
    continue;
  }
  // replicate pdfTextPieces — hex atoms only matter here; count them
  const tjRe = /\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*(Tj|TJ|'|")/g;
  let tm2;
  let streamPieces = false;
  while ((tm2 = tjRe.exec(text))) {
    streamPieces = true;
    if (tm2[1] !== undefined) {
      const atomRe = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>|(-?[\d.]+)/g;
      let a;
      while ((a = atomRe.exec(tm2[1]))) {
        if (a[1] !== undefined) atomStats.litAtoms++;
        else if (a[2] !== undefined) { atomStats.hexAtoms++; atomStats.hexBytes += a[2].replace(/\s/g, "").length / 2; }
      }
    } else if (tm2[2] !== undefined) {
      atomStats.hexAtoms++; atomStats.hexBytes += tm2[2].replace(/\s/g, "").length / 2;
    }
  }
  if (streamPieces) nPieceStreams++;
}

console.log(`streams inflated: ${nInflated}, cmaps: ${nCmap}, piece-streams: ${nPieceStreams}`);
console.log(`cmap sizes: ${cmaps.map(c => c.map.size).join(", ")}`);
console.log(`atoms: ${JSON.stringify(atomStats)}`);

// now the decode test: sample every distinct 2-hex-digit code in the first
// few content streams and check coverage across all cmaps
const allCodes = new Set();
{
  const sample = ascii; // raw scan is enough for a coverage census: find hex atoms
  const hexRe = /<([0-9A-Fa-f]{2}(?:[0-9A-Fa-f\s]{1,40}?)?)>/g;
  // simpler: collect from inflated streams again (first 20 content streams)
}
// decode the first content stream's atoms through the cmaps
const streamRe2 = /stream[ \t]*(?:\r\n|\r|\n)/g;
let decoded = 0, decodedSamples = [];
while ((m = streamRe2.exec(ascii))) {
  if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
  const start = m.index + m[0].length;
  const end = ascii.indexOf("endstream", start);
  if (end < 0) break;
  streamRe2.lastIndex = end + "endstream".length;
  let chunkEnd = end;
  if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
  else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
  const chunk = bytes.subarray(start, chunkEnd);
  let text = "";
  try { text = new TextDecoder().decode(await inflate(chunk)); } catch {
    try { text = new TextDecoder().decode(await inflate(chunk, true)); } catch { continue; }
  }
  if (!text || text.includes("beginbfchar") || text.includes("beginbfrange")) continue;
  // decode each hex atom in this stream
  const tjRe = /\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*(Tj|TJ|'|")/g;
  let tm2;
  while ((tm2 = tjRe.exec(text))) {
    const atoms = [];
    if (tm2[1] !== undefined) {
      const atomRe = /<([0-9A-Fa-f\s]+)>/g;
      let a;
      while ((a = atomRe.exec(tm2[1]))) atoms.push(a[1]);
    } else if (tm2[2] !== undefined) atoms.push(tm2[2]);
    for (const rawHex of atoms) {
      const hex = rawHex.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
      if (!hex) continue;
      const padded = hex.length % 2 ? hex + "0" : hex;
      const bytesArr = [];
      for (let i = 0; i < padded.length; i += 2) bytesArr.push(parseInt(padded.slice(i, i + 2), 16));
      bytesArr.forEach(b => allCodes.add(b));
      decoded++;
      if (decodedSamples.length < 8) decodedSamples.push({ hex: hex.slice(0, 30), bytes: bytesArr.slice(0, 12) });
    }
  }
  if (decoded > 3000) break;
}

// coverage: how many distinct codes are covered by at least one cmap?
let covered = 0;
const uncovered = [];
for (const c of allCodes) {
  const hit = cmaps.some(cm => cm.codeLen === 1 && cm.map.has(c));
  if (hit) covered++; else uncovered.push(c);
}
console.log(`\ndistinct codes seen: ${allCodes.size}, covered by a 1-byte cmap: ${covered}, uncovered: ${uncovered.length}`);
console.log("uncovered codes (hex):", uncovered.slice(0, 24).map(c => c.toString(16).padStart(2, "0")).join(" "));
console.log("sample atoms:", JSON.stringify(decodedSamples.slice(0, 5)));
