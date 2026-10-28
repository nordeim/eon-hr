// r106-stream-atoms.mjs — session 106: dump one content stream's hex atoms
// with the winner-map decode + source, to localize the F→D member.
// Usage: node scripts/r106-stream-atoms.mjs <file.pdf> <streamObjNum> [maxAtoms]
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const path = process.argv[2];
const wantObj = parseInt(process.argv[3], 10);
const maxAtoms = parseInt(process.argv[4] || "40", 10);
const buf = readFileSync(path);
const ascii = Buffer.from(buf).toString("latin1");

const fCandidates = new Map();
const pushCandidate = (name, obj, pos) => {
  const list = fCandidates.get(name) ?? [];
  if (!list.some((c) => c.obj === obj)) list.push({ pos, obj });
  fCandidates.set(name, list);
};
for (const fm of ascii.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) pushCandidate(fm[1], parseInt(fm[2], 10), fm.index ?? 0);
const objToTu = new Map();
const objBaseFont = new Map();
for (const fm of ascii.matchAll(/(\d+)\s+0\s+obj\s*<<([^<>]*(?:<<[^<>]*>>[^<>]*)*)>>/g)) {
  if (!/\/Type\s*\/Font\b/.test(fm[2])) continue;
  const tu = fm[2].match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
  if (tu) objToTu.set(parseInt(fm[1], 10), parseInt(tu[1], 10));
  const bf = fm[2].match(/\/BaseFont\s*\/([\w#+-]+)/);
  if (bf) objBaseFont.set(parseInt(fm[1], 10), bf[1]);
}
function utf16be(hex) {
  const h = hex.length % 4 === 0 ? hex : hex.padStart(Math.ceil(hex.length / 4) * 4, "0");
  let out = "";
  for (let i = 0; i < h.length; i += 4) out += String.fromCharCode(parseInt(h.slice(i, i + 4), 16));
  return out;
}
function parseCMap(text) {
  if (!text.includes("beginbfchar") && !text.includes("beginbfrange")) return null;
  const map = new Map();
  let codeLen = 2;
  const cs = text.match(/begincodespacerange([\s\S]*?)endcodespacerange/);
  if (cs) { const first = cs[1].match(/<([0-9A-Fa-f]+)>/); if (first) codeLen = first[1].length > 2 ? 2 : 1; }
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
  return map.size ? { codeLen, map } : null;
}
const tuToCmap = new Map();
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m;
let target = null;
while ((m = streamRe.exec(ascii))) {
  if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
  const dictRegion = ascii.slice(Math.max(0, ascii.lastIndexOf("endobj", m.index) + 6), m.index);
  if (/\/Subtype\s*\/Image\b/.test(dictRegion) || /\/FontFile[23]?\b/.test(dictRegion)) {
    const endSkip = ascii.indexOf("endstream", m.index + m[0].length);
    if (endSkip < 0) break;
    streamRe.lastIndex = endSkip + "endstream".length;
    continue;
  }
  const om = dictRegion.match(/(\d+)\s+0\s+obj\b/);
  const objNum = om ? parseInt(om[1], 10) : -1;
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
        const body = text.slice(s, e);
        if (/\/Type\s*\/Font\b/.test(body)) {
          const tu = body.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
          if (tu) objToTu.set(entries[i].obj, parseInt(tu[1], 10));
          const bf = body.match(/\/BaseFont\s*\/([\w#+-]+)/);
          if (bf) objBaseFont.set(entries[i].obj, bf[1]);
        }
        for (const fm of body.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) pushCandidate(fm[1], parseInt(fm[2], 10), m.index + (fm.index ?? 0));
      }
    }
    continue;
  }
  if (text.includes("beginbfchar") || text.includes("beginbfrange")) {
    const cm = parseCMap(text);
    if (cm && objNum >= 0) tuToCmap.set(objNum, cm);
    continue;
  }
  if (objNum === wantObj && /(?:\)|\]|>)\s*(?:Tj|TJ|'|")/.test(text)) target = text;
}
if (!target) { console.log(`stream ${wantObj} not found / not content`); process.exit(1); }
let curFont = "";
const ops = /\/(\S+)\s+[\d.+-]+\s+Tf|<([0-9A-Fa-f\s]+)>\s*(Tj|TJ|'|")|\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ/g;
let om;
let shown = 0;
while ((om = ops.exec(target)) && shown < maxAtoms) {
  if (om[1] !== undefined) { curFont = om[1]; continue; }
  const hexes = om[2] !== undefined ? [om[2]] : om[4] ? [...om[4].matchAll(/<([0-9A-Fa-f\s]+)>/g)].map((x) => x[1]) : [];
  for (const hx of hexes) {
    if (shown >= maxAtoms) break;
    const hex = hx.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
    if (!hex || hex.length % 2) continue;
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.slice(i, i + 2), 16));
    // chain decode
    let decoded = null; let src = "LATIN1";
    const cands = fCandidates.get(curFont) ?? [];
    for (const c of [...cands].sort((a, b) => a.pos - b.pos)) {
      const tu = objToTu.get(c.obj);
      if (tu === undefined) continue;
      const cm = tuToCmap.get(tu);
      if (!cm) continue;
      if (cm.codeLen === 2 && bytes.length >= 2 && bytes.length % 2 === 0) {
        let ok = true; const out = [];
        for (let i = 0; i < bytes.length; i += 2) { const code = bytes[i] * 256 + bytes[i + 1]; const v = cm.map.get(code); if (v === undefined) { ok = false; break; } out.push(v); }
        if (ok) { decoded = out.join(""); src = `obj ${c.obj} ${objBaseFont.get(c.obj) ?? ""}`; break; }
      } else if (cm.codeLen === 1 && bytes.every((b) => cm.map.has(b))) {
        decoded = bytes.map((b) => cm.map.get(b)).join(""); src = `obj ${c.obj} ${objBaseFont.get(c.obj) ?? ""}`; break;
      }
    }
    if (decoded === null) decoded = bytes.map((b) => (b >= 32 && b < 127) || b >= 0xa0 ? String.fromCharCode(b) : " ").join("");
    shown++;
    console.log(`  /${curFont} <${hex}> → ${JSON.stringify(decoded)}  [${src}]`);
  }
}
process.exit(0);
