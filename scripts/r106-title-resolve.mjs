// r106-title-resolve.mjs — session 106: resolve the REAL font of a content
// stream (stream → page → /Resources → /F-name → font obj → BaseFont) and
// dump its ToUnicode coverage for named CIDs. Decides whether the page-map
// fix cures the F→D member.
// Usage: node scripts/r106-title-resolve.mjs <file.pdf> <streamObj> <cid> [cid...]
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const path = process.argv[2];
const wantStream = parseInt(process.argv[3], 10);
const cids = process.argv.slice(4).map((x) => parseInt(x, 16));
const buf = readFileSync(path);
const ascii = Buffer.from(buf).toString("latin1");

const objBodies = new Map();
function utf16be(hex) {
  const h = hex.length % 4 === 0 ? hex : hex.padStart(Math.ceil(hex.length / 4) * 4, "0");
  let out = "";
  for (let i = 0; i < h.length; i += 4) out += String.fromCharCode(parseInt(h.slice(i, i + 4), 16));
  return out;
}
function parseCMap(text) {
  if (!text.includes("beginbfchar") && !text.includes("beginbfrange")) return null;
  const map = new Map();
  let mm;
  const bfRe = /beginbfchar([\s\S]*?)endbfchar/g;
  while ((mm = bfRe.exec(text))) {
    const pairRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g; let p;
    while ((p = pairRe.exec(mm[1]))) map.set(parseInt(p[1], 16), utf16be(p[2]));
  }
  const brRe = /beginbfrange([\s\S]*?)endbfrange/g;
  while ((mm = brRe.exec(text))) {
    let r;
    const arrRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[([^\]]*)\]/g;
    while ((r = arrRe.exec(mm[1]))) {
      const lo = parseInt(r[1], 16); const hi = parseInt(r[2], 16);
      (r[3].match(/<([0-9A-Fa-f]+)>/g) ?? []).forEach((d, i) => { const c = lo + i; if (c <= hi) map.set(c, utf16be(d.slice(1, -1))); });
    }
    const offRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]{1,4})>/g;
    while ((r = offRe.exec(mm[1]))) {
      const lo = parseInt(r[1], 16); const hi = parseInt(r[2], 16); const base = parseInt(r[3], 16);
      for (let c = lo; c <= hi && c - lo < 65536; c++) map.set(c, String.fromCharCode(base + (c - lo)));
    }
  }
  return map.size ? map : null;
}
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m;
const tuToCmap = new Map();
while ((m = streamRe.exec(ascii))) {
  if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
  const dictRegion = ascii.slice(Math.max(0, ascii.lastIndexOf("endobj", m.index) + 6), m.index);
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
  for (const t of [buf.subarray(start, chunkEnd), buf.subarray(start, end)]) {
    try { text = new TextDecoder().decode(await inflate(t)); break; } catch { try { text = new TextDecoder().decode(await inflate(t, true)); break; } catch { text = ""; } }
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
        if (s > e || e > text.length) continue;
        objBodies.set(entries[i].obj, text.slice(s, e));
      }
    }
    continue;
  }
  if (text.includes("beginbfchar") || text.includes("beginbfrange")) {
    const cm = parseCMap(text);
    const om = dictRegion.match(/(\d+)\s+0\s+obj\b/);
    if (cm && om) tuToCmap.set(parseInt(om[1], 10), cm);
  }
}
for (const rm of ascii.matchAll(/(\d+)\s+0\s+obj\s*([\s\S]*?)endobj/g)) {
  if (!objBodies.has(parseInt(rm[1], 10))) objBodies.set(parseInt(rm[1], 10), rm[2]);
}
// stream → page → resources → fonts
const contentToPage = new Map();
for (const [obj, body] of objBodies) {
  if (!/\/Type\s*\/Page\b/.test(body)) continue;
  const c = body.match(/\/Contents\s*\[?\s*(\d+)\s+\d+\s+R/);
  if (c) contentToPage.set(parseInt(c[1], 10), obj);
}
const page = contentToPage.get(wantStream);
console.log(`stream ${wantStream} → page obj ${page}`);
if (page === undefined) process.exit(1);
const pageBody = objBodies.get(page) ?? "";
const resRef = pageBody.match(/\/Resources\s+(\d+)\s+0\s+R/);
const resBody = resRef ? (objBodies.get(parseInt(resRef[1], 10)) ?? "") : pageBody;
console.log(`  /Resources ${resRef ? resRef[1] + " (body: " + resBody.replace(/\s+/g, " ").slice(0, 160) + ")" : "inline"}`);
const fonts = new Map();
for (const fm of resBody.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) fonts.set(fm[1], parseInt(fm[2], 10));
for (const [name, obj] of fonts) {
  const fbody = objBodies.get(obj) ?? "(unresolved)";
  const bf = fbody.match(/\/BaseFont\s*\/([\w#+-]+)/);
  const tu = fbody.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
  const cm = tu ? tuToCmap.get(parseInt(tu[1], 10)) : null;
  console.log(`  /${name} → font obj ${obj} = ${bf?.[1] ?? "?"} | ToUnicode ${tu?.[1] ?? "none"}${cm ? ` (${cm.size} entries)` : ""}`);
  if (cm) {
    for (const cid of cids) {
      const v = cm.get(cid);
      console.log(`      CID 0x${cid.toString(16)} → ${v === undefined ? "(NOT COVERED by own map)" : JSON.stringify(v)}`);
    }
  }
}
process.exit(0);
