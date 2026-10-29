#!/usr/bin/env node
// r107-f14-decode.mjs — decode the F14 title/subtitle atoms (the missing
// cover text) through every F14 candidate's ToUnicode. The extraction head
// starts at the legalese — the F14 26pt/20pt/13pt shows are absent.
import fs from "node:fs";

const { inflate } = await import("./r101-inflate.ts");
const bytes = fs.readFileSync("/tmp/r107-corpus/lo-calc.pdf");
const ascii = Buffer.from(bytes).toString("latin1");

const objToTu = new Map();
const objBaseFont = new Map();
const fCandidates = new Map(); // F-name → [{obj, pos}]
for (const rm of ascii.matchAll(/(\d+)\s+0\s+obj\s*([\s\S]*?)endobj/g)) {
  const body = rm[2];
  if (/\/Type\s*\/Font\b/.test(body)) {
    const tu = body.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
    if (tu) objToTu.set(parseInt(rm[1], 10), parseInt(tu[1], 10));
    const bf = body.match(/\/BaseFont\s*\/([\w#+-]+)/);
    if (bf) objBaseFont.set(parseInt(rm[1], 10), bf[1]);
  }
  for (const fm of body.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) {
    if (!fCandidates.has(fm[1])) fCandidates.set(fm[1], []);
    fCandidates.get(fm[1]).push({ obj: parseInt(fm[2], 10), pos: rm.index });
  }
}
// ObjStm pass for font objects
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m;
const cmaps = [];
const objFonts = new Map(); // resources obj → fonts
const pendingRes = [];
const pageFonts = new Map(); // content obj → fonts (incl. 2836)
const contentsRefs = (body) => {
  const at = body.indexOf("/Contents");
  if (at < 0) return [];
  const after = body.slice(at + "/Contents".length);
  const br = after.match(/^\s*\[([^\]]*)\]/);
  if (br) return [...br[1].matchAll(/(\d+)\s+\d+\s+R/g)].map((x) => parseInt(x[1], 10));
  const sc = after.match(/^\s*(\d+)\s+\d+\s+R/);
  return sc ? [parseInt(sc[1], 10)] : [];
};
for (const rm of ascii.matchAll(/(\d+)\s+0\s+obj\s*([\s\S]*?)endobj/g)) {
  const body = rm[2];
  if (/\/Type\s*\/Page\b/.test(body)) {
    const refs = contentsRefs(body);
    if (!refs.length) continue;
    const fonts = new Map();
    for (const fm of body.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) fonts.set(fm[1], parseInt(fm[2], 10));
    const res = body.match(/\/Resources\s+(\d+)\s+0\s+R/);
    if (fonts.size) refs.forEach((r) => pageFonts.set(r, fonts));
    else if (res) pendingRes.push({ contents: refs, res: parseInt(res[1], 10) });
  } else {
    const fonts = new Map();
    for (const fm of body.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) fonts.set(fm[1], parseInt(fm[2], 10));
    if (fonts.size) objFonts.set(parseInt(rm[1], 10), fonts);
  }
}
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
          const bf = body.match(/\/BaseFont\s*\/([\w#+-]+)/);
          if (bf) objBaseFont.set(entries[i].obj, bf[1]);
        }
        if (/\/Type\s*\/Page\b/.test(body)) {
          const refs = contentsRefs(body);
          if (refs.length) {
            const fonts = new Map();
            for (const fm of body.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) fonts.set(fm[1], parseInt(fm[2], 10));
            const res = body.match(/\/Resources\s+(\d+)\s+0\s+R/);
            if (fonts.size) refs.forEach((r) => pageFonts.set(r, fonts));
            else if (res) pendingRes.push({ contents: refs, res: parseInt(res[1], 10) });
          }
        } else {
          const fonts = new Map();
          for (const fm of body.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) fonts.set(fm[1], parseInt(fm[2], 10));
          if (fonts.size) objFonts.set(entries[i].obj, fonts);
        }
      }
    }
    continue;
  }
  if (text.includes("beginbfchar") || text.includes("beginbfrange")) {
    const map = new Map();
    for (const bc of text.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      const cid = parseInt(bc[1], 16);
      let out = "";
      for (let i = 0; i + 3 < bc[2].length + 1; i += 4) {
        const cp = parseInt(bc[2].slice(i, i + 4), 16);
        if (cp) out += String.fromCodePoint(cp);
      }
      map.set(cid, out || " ");
    }
    const objMatch = dictRegion.match(/(\d+)\s+0\s+obj/);
    cmaps.push({ objNum: objMatch ? parseInt(objMatch[1], 10) : -1, map });
  }
}
// post-walk resolution (the R106-A ordering)
for (const p of pendingRes) {
  const fonts = objFonts.get(p.res);
  if (fonts) p.contents.forEach((c) => pageFonts.set(c, fonts));
}
console.log("pageFonts has 2836:", pageFonts.has(2836), pageFonts.get(2836) ? JSON.stringify([...pageFonts.get(2836).entries()]) : "");

const cmapByObj = new Map(cmaps.map((c) => [c.objNum, c.map]));
const decode = (cid, cmap) => cmap.get(cid) ?? "";
const pageMap = pageFonts.get(2836);
for (const fname of ["F14", "F15", "F3"]) {
  const obj = pageMap?.get(fname);
  const tu = obj !== undefined ? objToTu.get(obj) : undefined;
  const cmap = tu !== undefined ? cmapByObj.get(tu) : undefined;
  const cands = fCandidates.get(fname) ?? [];
  console.log(`\n${fname}: page-own obj=${obj} (basefont ${obj !== undefined ? objBaseFont.get(obj) : "?"}) → ToUnicode=${tu} → cmap=${cmap ? cmap.size + " entries" : "UNRESOLVED"} | raw candidates: ${cands.map((c) => c.obj + (objToTu.get(c.obj) !== undefined ? "(tu:" + objToTu.get(c.obj) + ")" : "(no-tu)")).join(",")}`);
  if (fname === "F14" && cmap) {
    const title = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0x0a].map((c) => decode(c, cmap)).join("");
    const subtitle = [0x0b, 0x0c, 0x0d, 0x0e, 0x08, 0x0f, 0x10, 0x05, 0x0b, 0x08, 0x11, 0x12, 0x05, 0x13, 0x14, 0x0d, 0x0a, 0x02, 0x09, 0x15].map((c) => decode(c, cmap)).join("");
    const line13 = [0x16, 0x17, 0x0c, 0x07, 0x11, 0x05, 0x11, 0x12, 0x08, 0x15, 0x05, 0x17, 0x0c, 0x0c, 0x0e, 0x18].map((c) => decode(c, cmap)).join("");
    console.log(`  F14 title (26pt):   ${JSON.stringify(title)}`);
    console.log(`  F14 subtitle (20pt): ${JSON.stringify(subtitle)}`);
    console.log(`  F14 line13 (13pt):   ${JSON.stringify(line13)}`);
  }
}
process.exit(0);
