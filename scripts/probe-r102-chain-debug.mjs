// probe-r102-chain-debug.mjs — debug each link of the font chain on the real file
import { readFileSync } from "node:fs";

const path = "/home/z/my-project/tmp-r102/lo-writer-guide.pdf";
const buf = readFileSync(path);
const ascii = Buffer.from(buf).toString("latin1");

// link 1: F-name → font object
const fToObj = new Map();
for (const fm of ascii.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) fToObj.set(fm[1], parseInt(fm[2], 10));
console.log("link1 fToObj:", JSON.stringify([...fToObj.entries()].slice(0, 18)));

// link 2: font object → ToUnicode object
const objToTu = new Map();
const objFontRe = /(\d+)\s+0\s+obj\s*<<([^<>]*(?:<<[^<>]*>>[^<>]*)*)>>/g;
let om;
while ((om = objFontRe.exec(ascii))) {
  const body = om[2];
  if (!/\/Type\s*\/Font\b/.test(body)) continue;
  const tu = body.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
  if (tu) objToTu.set(parseInt(om[1], 10), parseInt(tu[1], 10));
}
console.log("link2 objToTu:", JSON.stringify([...objToTu.entries()].slice(0, 18)));

// link 3: the stream objNum lookback — find the ToUnicode streams and their object numbers
// replicate the walk: for each stream, the dictStart = last endobj before the stream keyword
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m;
const cmapObjs = [];
while ((m = streamRe.exec(ascii))) {
  if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
  const dictStart = ascii.lastIndexOf("endobj", m.index) + 6;
  const objMatch = ascii.slice(dictStart, m.index).match(/(\d+)\s+0\s+obj\s*$/);
  const objNum = objMatch ? parseInt(objMatch[1], 10) : -1;
  const dictRegion = ascii.slice(dictStart, m.index);
  if (/\/ToUnicode/.test(dictRegion)) continue; // the font dict, not a stream
  // note: ToUnicode STREAMS have plain dicts — check if this objNum is a tu target
  const isTuTarget = [...objToTu.values()].includes(objNum);
  if (isTuTarget) cmapObjs.push({ objNum, dictLen: dictRegion.length, objMatchFound: !!objMatch });
}
console.log("link3 tu-streams found by objNum:", cmapObjs.length, JSON.stringify(cmapObjs.slice(0, 5)));

// what does a real content stream's Tf look like? confirm font names in content
const sample = ascii.indexOf("stream");
console.log("\ncheck: does '/F1 16 Tf' appear in inflated content? (from the census: yes)");
console.log("fToObj has F1:", fToObj.has("F1"), "→ obj", fToObj.get("F1"));
console.log("objToTu has that obj:", objToTu.has(fToObj.get("F1") ?? -1), "→ tu", objToTu.get(fToObj.get("F1") ?? -1));
