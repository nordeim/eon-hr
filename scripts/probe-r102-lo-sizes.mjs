// probe-r102-lo-sizes.mjs — measure the oversized atoms/arrays/literals in
// the LibreOffice streams: what exactly blows the regex stack?
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const path = process.argv[2];
const buf = readFileSync(path);
const bytes = new Uint8Array(buf);
const ascii = Buffer.from(buf).toString("latin1");

let maxHexAtom = 0, maxHexSample = "";
let maxArray = 0, maxArraySample = "";
let maxLiteral = 0;
let arraySizes = [];
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m; let streams = 0;
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
  if (!text || !/T[Jj]\b/.test(text)) continue;
  streams++;
  // hex atoms (raw <...> occurrences)
  for (const h of text.matchAll(/<([0-9A-Fa-f\s]*)>/g)) {
    const len = h[1].length;
    if (len > maxHexAtom) { maxHexAtom = len; maxHexSample = h[0].slice(0, 80); }
  }
  // TJ arrays
  for (const t of text.matchAll(/\[([^\]]*)\]\s*TJ/g)) {
    const len = t[1].length;
    arraySizes.push(len);
    if (len > maxArray) { maxArray = len; maxArraySample = t[1].slice(0, 120); }
  }
  // literals
  for (const l of text.matchAll(/\(((?:\\.|[^\\()])*)\)/g)) {
    if (l[1].length > maxLiteral) maxLiteral = l[1].length;
  }
  // biggest single stream
  if (text.length > (globalThis.maxStream ?? 0)) globalThis.maxStream = text.length;
}
arraySizes.sort((a, b) => b - a);
console.log(`content streams: ${streams}, max stream len: ${globalThis.maxStream}`);
console.log(`max hex atom body: ${maxHexAtom} chars — sample: ${JSON.stringify(maxHexSample.slice(0, 70))}`);
console.log(`max TJ array body: ${maxArray} chars — sample: ${JSON.stringify(maxArraySample.slice(0, 100))}`);
console.log(`max literal body: ${maxLiteral}`);
console.log(`top-10 array sizes: ${arraySizes.slice(0, 10).join(", ")}`);

// the stack probe: at what hex-atom body length does the ops regex blow?
const ops = /\/\S+\s+([\d.+-]+)\s+Tf|(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]|T\*|\(((?:\\.|[^\\()])*)\)\s*(Tj|TJ|'|")|\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*(Tj|TJ|'|")|Tm/g;
function testAt(n) {
  const content = `BT /F1 12 Tf[<${"1C".repeat(n)}>]TJ ET`;
  ops.lastIndex = 0;
  try { let c = 0; let mm; while ((mm = ops.exec(content))) { c++; if (mm.index === ops.lastIndex) ops.lastIndex++; } return `OK at n=${n} (matches ${c})`; }
  catch (e) { return `THROWS at n=${n}: ${String(e).slice(0, 60)}`; }
}
for (const n of [1000, 5000, 10000, 20000, 50000, 100000]) console.log(testAt(n));
