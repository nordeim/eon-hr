// probe-r102-lo-kerns.mjs — census the LibreOffice TJ inter-atom numbers:
// do they stay under the 0.1-em (100 thousandths) kern boundary, or do some
// cross it and falsely split words ("T eam")? Correlate with word boundaries.
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const path = process.argv[2];
const buf = readFileSync(path);
const bytes = new Uint8Array(buf);
const ascii = Buffer.from(buf).toString("latin1");

const hist = new Map(); // |number| bucket → count
const bigOnes = []; // numbers ≥ 100 with context
let total = 0;
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m; let streams = 0;
while ((m = streamRe.exec(ascii))) {
  if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
  const dictStart = ascii.lastIndexOf("endobj", m.index) + 6;
  const objDict = ascii.slice(dictStart, m.index);
  if (/\/Subtype\s*\/Image\b/.test(objDict) || /\/FontFile[23]?\b/.test(objDict)) {
    const end0 = ascii.indexOf("endstream", m.index + m[0].length);
    if (end0 < 0) break;
    streamRe.lastIndex = end0 + "endstream".length;
    continue;
  }
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
  if (!text || !/(?:\)|\]|>)\s*(?:Tj|TJ|'|")/.test(text)) continue;
  streams++;
  // walk TJ arrays, collect inter-atom numbers with atom context
  for (const tj of text.matchAll(/\[([^\]]*)\]\s*TJ/g)) {
    const atomRe = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>|(-?[\d.]+)/g;
    let a; let prevAtom = "";
    while ((a = atomRe.exec(tj[1]))) {
      if (a[1] !== undefined || a[2] !== undefined) prevAtom = a[1] ?? a[2];
      else {
        const n = parseFloat(a[3]);
        total++;
        const b = Math.min(Math.abs(n), 500);
        hist.set(Math.floor(b / 25) * 25, (hist.get(Math.floor(b / 25) * 25) ?? 0) + 1);
        if (Math.abs(n) >= 100 && bigOnes.length < 12) {
          const rest = tj[1].slice(atomRe.lastIndex, atomRe.lastIndex + 40);
          bigOnes.push({ n, prev: prevAtom.slice(0, 14), next: rest });
        }
      }
    }
  }
  if (streams >= 60) break; // a representative sample
}
console.log(`streams sampled: ${streams}, inter-atom numbers: ${total}`);
console.log("|n| histogram (bucket of 25):");
for (const k of [...hist.keys()].sort((x, y) => x - y)) console.log(` ${String(k).padStart(3)}-${String(k + 24).padStart(3)}: ${hist.get(k)}`);
console.log("\nnumbers ≥ 100 with context:");
for (const b of bigOnes) console.log(` n=${b.n} after atom ${JSON.stringify(b.prev)} next: ${JSON.stringify(b.next.slice(0, 30))}`);
