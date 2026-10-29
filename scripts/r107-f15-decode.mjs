#!/usr/bin/env node
// r107-f15-decode.mjs — what do the band-kern glyphs decode to? Resolve
// F15 (and F14/F3) for stream 2836 through the file's font chain, decode
// the band arrays, and locate the result in the final extraction.
import fs from "node:fs";

const { inflate } = await import("./r101-inflate.ts");
const path = "/tmp/r107-corpus/lo-calc.pdf";
const bytes = fs.readFileSync(path);
const ascii = Buffer.from(bytes).toString("latin1");

// 1) find the page that references stream 2836 → its /Resources → /Font
// the raw + ObjStm census (the r106 pattern): collect font pairs + ToUnicode
const objToTu = new Map(); // font obj → ToUnicode obj
const fCandidates = new Map(); // /F-name → [{obj, pos}]
const pageOf = new Map(); // content obj → fonts map
// raw pass
for (const rm of ascii.matchAll(/(\d+)\s+0\s+obj\s*([\s\S]*?)endobj/g)) {
  const body = rm[2];
  if (/\/Type\s*\/Font\b/.test(body)) {
    const tu = body.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
    if (tu) objToTu.set(parseInt(rm[1], 10), parseInt(tu[1], 10));
  }
  for (const fm of body.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) {
    if (!fCandidates.has(fm[1])) fCandidates.set(fm[1], []);
    fCandidates.get(fm[1]).push({ obj: parseInt(fm[2], 10), pos: rm.index });
  }
  if (/\/Type\s*\/Page\b/.test(body) && body.includes("2836 0 R")) {
    const fonts = new Map();
    for (const fm of body.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) fonts.set(fm[1], parseInt(fm[2], 10));
    pageOf.set(2836, fonts);
    console.log("page with 2836 found (raw); fonts:", JSON.stringify([...fonts.entries()]));
  }
}
// stream walk for ObjStm-carried objects + CMaps
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m;
const cmaps = []; // {objNum, map}
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
  if (/\/Type\s*\/ObjStm\b/.test(dictRegion)) {
    const firstMatch = dictRegion.match(/\/First\s+(\d+)/);
    const hdr = text.match(/^\s*((?:\d+\s+\d+\s+)+)/);
    if (firstMatch && hdr) {
      const first = parseInt(firstMatch[1], 10);
      const nums = hdr[1].trim().split(/\s+/).map(Number);
      const entries = [];
      for (let i = 0; i + 1 < nums.length; i += 2) entries.push({ obj: nums[i], off: nums[i + 1] });
      for (let i = 0; i < entries.length; i++) {
        const s = first + entries[i].off;
        const e = i + 1 < entries.length ? first + entries[i + 1].off : text.length;
        const body = text.slice(s, e);
        if (/\/Type\s*\/Font\b/.test(body)) {
          const tu = body.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
          if (tu) objToTu.set(entries[i].obj, parseInt(tu[1], 10));
        }
      }
    }
    continue;
  }
  if (text.includes("beginbfchar") || text.includes("beginbfrange")) {
    // parse a minimal CMap: bfchar + bfrange
    const map = new Map();
    for (const bc of text.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      const cid = parseInt(bc[1], 16);
      let out = "";
      const hex = bc[2];
      for (let i = 0; i + 3 < hex.length + 1; i += 4) {
        const cp = parseInt(hex.slice(i, i + 4), 16);
        if (cp) out += String.fromCodePoint(cp);
      }
      map.set(cid, out || " ");
    }
    const objMatch = dictRegion.match(/(\d+)\s+0\s+obj/);
    cmaps.push({ objNum: objMatch ? parseInt(objMatch[1], 10) : -1, map });
  }
}
console.log("cmaps collected:", cmaps.length, "objToTu entries:", objToTu.size, "F15 candidates:", JSON.stringify(fCandidates.get("F15")?.slice(0, 6)));

// resolve F15 → its ToUnicode → decode the band atoms
const f15cands = fCandidates.get("F15") ?? [];
const tuObjs = f15cands.map((c) => objToTu.get(c.obj)).filter((x) => x !== undefined);
console.log("F15 candidate objs:", f15cands.map((c) => c.obj), "→ ToUnicode objs:", tuObjs);
const decode = (cid, cmap) => cmap.get(cid) ?? cmap.get(cid & 0xff) ?? "";
for (const cm of cmaps) {
  if (tuObjs.includes(cm.objNum)) {
    const arr1 = [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a];
    const arr2 = [0x0b, 0x0c, 0x0d, 0x0e, 0x08, 0x0f, 0x10, 0x05, 0x0b, 0x08, 0x11, 0x12, 0x05, 0x13, 0x14, 0x0d, 0x0a, 0x02, 0x09, 0x15];
    console.log(`cmap obj ${cm.objNum} (F15's ToUnicode):`);
    console.log("  array1 decodes:", JSON.stringify(arr1.map((c) => decode(c, cm.map)).join("")));
    console.log("  array2 decodes:", JSON.stringify(arr2.map((c) => decode(c, cm.map)).join("")));
  }
}
process.exit(0);
