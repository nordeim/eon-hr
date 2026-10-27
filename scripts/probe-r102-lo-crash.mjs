// probe-r102-lo-crash.mjs — confirm the crash mechanism (which stream, what
// is it) and test the guard: (a) identify the giant streams, (b) reproduce
// the throw on the real stream, (c) run the full pipeline with a per-stream
// content gate + try/catch to see the real LibreOffice yield.
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const path = process.argv[2];
const buf = readFileSync(path);
const bytes = new Uint8Array(buf);
const ascii = Buffer.from(buf).toString("latin1");

// (a) identify the giant streams
const giants = [];
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m;
while ((m = streamRe.exec(ascii))) {
  if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
  const start = m.index + m[0].length;
  const end = ascii.indexOf("endstream", start);
  if (end < 0) break;
  streamRe.lastIndex = end + "endstream".length;
  let chunkEnd = end;
  if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
  else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
  // look at the dict BEFORE the stream for /Type hints
  const dictHead = ascii.slice(Math.max(0, m.index - 220), m.index);
  const typeHint = (dictHead.match(/\/Subtype\s*\/(\w+)/) ?? [])[1] || (dictHead.match(/\/Type\s*\/(\w+)/) ?? [])[1] || "?";
  const isFontish = /\/FontFile|\/Font\b|Type1|TrueType|\/FontDescriptor/.test(dictHead);
  const chunk = bytes.subarray(start, chunkEnd);
  let text = "";
  try { text = new TextDecoder().decode(await inflate(chunk)); } catch {
    try { text = new TextDecoder().decode(await inflate(chunk, true)); } catch { continue; }
  }
  if (!text) continue;
  if (text.length > 200000 || isFontish) giants.push({ len: text.length, typeHint, isFontish, hasBT: /\bBT\b/.test(text), hasTJop: /\]\s*TJ\b|\)\s*Tj\b|>\s*Tj\b/.test(text), head: text.slice(0, 60) });
}
giants.sort((a, b) => b.len - a.len);
console.log("giant/fontish streams (top 8):");
for (const g of giants.slice(0, 8)) console.log(` len=${g.len} type=${g.typeHint} fontish=${g.isFontish} BT=${g.hasBT} TJop=${g.hasTJop} head=${JSON.stringify(g.head.slice(0, 50))}`);

// (b) reproduce the throw on the biggest stream
const biggest = giants[0];
if (biggest) {
  console.log(`\nreproducing on the biggest stream (len ${biggest.len})...`);
  const streamRe2 = /stream[ \t]*(?:\r\n|\r|\n)/g;
  let m2;
  outer:
  while ((m2 = streamRe2.exec(ascii))) {
    if (m2.index >= 3 && ascii.startsWith("end", m2.index - 3)) continue;
    const start = m2.index + m2[0].length;
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
    if (text.length === biggest.len) {
      const ops = /\/\S+\s+([\d.+-]+)\s+Tf|(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]|T\*|\(((?:\\.|[^\\()])*)\)\s*(Tj|TJ|'|")|\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*(Tj|TJ|'|")|Tm/g;
      try { let c = 0; while (ops.exec(text)) c++; console.log(`  scan OK (${c} matches)`); }
      catch (e) { console.log(`  THROWS: ${String(e).slice(0, 80)}`); }
      // where is the first huge literal?
      const lit = text.match(/\(/g);
      console.log(`  parens: ${lit ? lit.length : 0}, BT: ${(text.match(/\bBT\b/g) ?? []).length}`);
      break outer;
    }
  }
}
