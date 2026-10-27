// probe-r102-lo-diag.mjs — diagnose WHY the LibreOffice PDF yields zero:
// does the file carry ToUnicode CMaps? What do its font dicts look like?
// Where do the CMap streams sit relative to the content streams?
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const path = process.argv[2];
const buf = readFileSync(path);
const ascii = Buffer.from(buf).toString("latin1");

console.log("header:", JSON.stringify(ascii.slice(0, 16)));
console.log("has XRefStream:", /\/Type\s*\/XRef/.test(ascii));
console.log("ObjStm count:", (ascii.match(/\/ObjStm/g) ?? []).length);

// walk streams; classify each: content (text ops), CMap (bfchar/bfrange), other
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m;
let nContent = 0, nCmap = 0, nOther = 0, nFail = 0;
let cmapSamples = [], contentSamples = [];
const cmapCodeLens = new Map();
let bfcharTotal = 0, bfrangeTotal = 0;
while ((m = streamRe.exec(ascii))) {
  if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
  const start = m.index + m[0].length;
  const end = ascii.indexOf("endstream", start);
  if (end < 0) break;
  streamRe.lastIndex = end + "endstream".length;
  let chunkEnd = end;
  if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
  else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
  const chunk = buf.subarray(start, chunkEnd);
  let text = "";
  try { text = new TextDecoder().decode(await inflate(chunk)); } catch {
    try { text = new TextDecoder().decode(await inflate(chunk, true)); } catch { nFail++; continue; }
  }
  if (!text) { nFail++; continue; }
  if (text.includes("beginbfchar") || text.includes("beginbfrange")) {
    nCmap++;
    bfcharTotal += (text.match(/beginbfchar/g) ?? []).length;
    bfrangeTotal += (text.match(/beginbfrange/g) ?? []).length;
    const cs = text.match(/begincodespacerange([\s\S]*?)endcodespacerange/);
    const firstHex = cs ? (cs[1].match(/<([0-9A-Fa-f]+)>/) ?? [])[1] : null;
    const codeLen = firstHex ? (firstHex.length > 2 ? 2 : 1) : null;
    cmapCodeLens.set(String(codeLen) + "-byte", (cmapCodeLens.get(String(codeLen) + "-byte") ?? 0) + 1);
    if (cmapSamples.length < 2) cmapSamples.push(text.slice(0, 500));
  } else if (/T[Jj]\b|BT\b/.test(text)) {
    nContent++;
    if (contentSamples.length < 1) contentSamples.push(text.slice(0, 400));
  } else nOther++;
}
console.log(`\nstreams: content=${nContent} cmap=${nCmap} other=${nOther} fail=${nFail}`);
console.log(`cmap blocks: bfchar=${bfcharTotal} bfrange=${bfrangeTotal}`);
console.log("cmap codeLens:", JSON.stringify([...cmapCodeLens]));
console.log("\nCMap sample 0:\n" + cmapSamples[0]);
console.log("\ncontent sample:\n" + (contentSamples[0] ?? "(none)").slice(0, 350));
