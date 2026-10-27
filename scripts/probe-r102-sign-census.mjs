// probe-r102-sign-census.mjs — the decisive sign census: are ALL ≥100-magnitude
// inter-atom numbers in the LibreOffice files POSITIVE (kerns)? And what's
// the max magnitude? (the sign rule: gaps are negative in every real writer)
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

for (const path of process.argv.slice(2)) {
  const buf = readFileSync(path);
  const bytes = new Uint8Array(buf);
  const ascii = Buffer.from(buf).toString("latin1");
  let pos100 = 0, neg100 = 0, maxPos = 0, minNeg = 0, total = 0;
  let negSamples = [], posMaxSample = "";
  const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
  let m; let streams = 0;
  while ((m = streamRe.exec(ascii))) {
    if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
    const dictStart = ascii.lastIndexOf("endobj", m.index) + 6;
    const objDict = ascii.slice(dictStart, m.index);
    if (/\/Subtype\s*\/Image\b/.test(objDict) || /\/FontFile[23]?\b/.test(objDict)) {
      const end0 = ascii.indexOf("endstream", m.index + m[0].length);
      if (end0 < 0) break;
      streamRe.lastIndex = end0 + 9;
      continue;
    }
    const start = m.index + m[0].length;
    const end = ascii.indexOf("endstream", start);
    if (end < 0) break;
    streamRe.lastIndex = end + 9;
    let chunkEnd = end;
    if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
    else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
    const chunk = bytes.subarray(start, chunkEnd);
    let text = "";
    try { text = new TextDecoder().decode(await inflate(chunk)); } catch {
      try { text = new TextDecoder().decode(await inflate(chunk, true)); } catch { continue; }
    }
    if (!text || !/(?:\)|\]|>)\s*(?:Tj|TJ|'|")/.test(text)) continue;
    streams++;
    for (const tj of text.matchAll(/\[([^\]]*)\]\s*TJ/g)) {
      const numRe = /(-?[\d.]+)/g;
      let n;
      while ((n = numRe.exec(tj[1]))) {
        // skip numbers that are part of atoms' context — only standalone
        // numbers between > or ) and < or ( count; approximate: all numbers
        // in the array body (atoms' hex digits contain no dots/minuses)
        const v = parseFloat(n[1]);
        if (!Number.isFinite(v)) continue;
        total++;
        if (v >= 100) { pos100++; if (v > maxPos) { maxPos = v; posMaxSample = tj[1].slice(Math.max(0, n.index - 30), n.index + 20); } }
        else if (v <= -100) { neg100++; if (v < minNeg) minNeg = v; if (negSamples.length < 5) negSamples.push({ v, ctx: tj[1].slice(Math.max(0, n.index - 25), n.index + 15) }); }
      }
    }
  }
  console.log(`\n=== ${path.split("/").pop()} (${streams} content streams) ===`);
  console.log(` total numbers: ${total}`);
  console.log(` ≥ +100 (positive): ${pos100} — max +${maxPos}`);
  console.log(` ≤ -100 (negative): ${neg100} — min ${minNeg}`);
  if (posMaxSample) console.log(` max-pos context: ${JSON.stringify(posMaxSample)}`);
  if (negSamples.length) console.log(` negative samples: ${JSON.stringify(negSamples)}`);
}
