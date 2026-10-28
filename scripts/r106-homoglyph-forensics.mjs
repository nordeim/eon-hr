// r106-homoglyph-forensics.mjs — session 106 / parity round 105: dissect the
// dvipdfmx Armenian-homoglyph class ("Tհe Dvipdfmx սser maոսal") and the
// fontspec F→D / e→Ǝ residuals. For each atom that decodes to a NON-Latin
// char, print the full resolution chain: the font name, the stream's page
// map, every candidate font object, its ToUnicode coverage of the atom's
// codes, its BaseFont, and its /Encoding /Differences array — so the wrong
// map that produced the homoglyph is identified member by member.
// Usage: node scripts/r106-homoglyph-forensics.mjs <file.pdf> [maxAtoms]
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const path = process.argv[2];
const maxAtoms = parseInt(process.argv[3] || "8", 10);
const buf = readFileSync(path);
const ascii = Buffer.from(buf).toString("latin1");

// --- the same scans the extractor runs (mirrored from src/lib/cv-text.ts) ---
const fCandidates = new Map();
const pushCandidate = (name, obj, pos) => {
  const list = fCandidates.get(name) ?? [];
  if (!list.some((c) => c.obj === obj)) list.push({ pos, obj });
  fCandidates.set(name, list);
};
for (const fm of ascii.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) pushCandidate(fm[1], parseInt(fm[2], 10), fm.index ?? 0);
const objToTu = new Map();
const objBaseFont = new Map();
const objDict = new Map(); // objNum -> full dict text (raw font-object scan)
for (const fm of ascii.matchAll(/(\d+)\s+0\s+obj\s*<<([^<>]*(?:<<[^<>]*>>[^<>]*)*)>>/g)) {
  if (!/\/Type\s*\/Font\b/.test(fm[2])) continue;
  const obj = parseInt(fm[1], 10);
  objDict.set(obj, fm[2]);
  const tu = fm[2].match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
  if (tu) objToTu.set(obj, parseInt(tu[1], 10));
  const bf = fm[2].match(/\/BaseFont\s*\/([\w#+-]+)/);
  if (bf) objBaseFont.set(obj, bf[1]);
}
// the full-object region scan: /Differences live inside /Encoding dicts that
// the flat font-object pattern cannot capture — scan every object region
const objDiffs = new Map(); // objNum -> differences source text
for (const rm of ascii.matchAll(/(\d+)\s+0\s+obj\s*([\s\S]*?)endobj/g)) {
  const dm = rm[2].match(/\/Differences\s*\[([^\]]*)\]/);
  if (dm) objDiffs.set(parseInt(rm[1], 10), dm[1].trim().slice(0, 400));
}
// page tree (raw region scan, mirrors the extractor)
const pageFonts = new Map();
{
  const objFonts = new Map();
  const pendingRes = [];
  for (const rm of ascii.matchAll(/(\d+)\s+0\s+obj\s*([\s\S]*?)endobj/g)) {
    const body = rm[2];
    const fonts = new Map();
    for (const fm of body.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) fonts.set(fm[1], parseInt(fm[2], 10));
    if (/\/Type\s*\/Page\b/.test(body)) {
      const contents = body.match(/\/Contents\s+(\d+)\s+0\s+R/);
      if (!contents) continue;
      const res = body.match(/\/Resources\s+(\d+)\s+0\s+R/);
      if (fonts.size) pageFonts.set(parseInt(contents[1], 10), fonts);
      else if (res) pendingRes.push({ contents: parseInt(contents[1], 10), res: parseInt(res[1], 10) });
    } else if (fonts.size) objFonts.set(parseInt(rm[1], 10), fonts);
  }
  for (const p of pendingRes) { const f = objFonts.get(p.res); if (f) pageFonts.set(p.contents, f); }
}

// --- the stream walk: CMaps + ObjStm harvest + content pieces ---
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
  let m;
  const bfRe = /beginbfchar([\s\S]*?)endbfchar/g;
  while ((m = bfRe.exec(text))) {
    const pairRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g; let p;
    while ((p = pairRe.exec(m[1]))) map.set(parseInt(p[1], 16), utf16be(p[2]));
  }
  const brRe = /beginbfrange([\s\S]*?)endbfrange/g;
  while ((m = brRe.exec(text))) {
    let r;
    const arrRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[([^\]]*)\]/g;
    while ((r = arrRe.exec(m[1]))) {
      const lo = parseInt(r[1], 16); const hi = parseInt(r[2], 16);
      (r[3].match(/<([0-9A-Fa-f]+)>/g) ?? []).forEach((d, i) => { const c = lo + i; if (c <= hi) map.set(c, utf16be(d.slice(1, -1))); });
    }
    const offRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]{1,4})>/g;
    while ((r = offRe.exec(m[1]))) {
      const lo = parseInt(r[1], 16); const hi = parseInt(r[2], 16); const base = parseInt(r[3], 16);
      for (let c = lo; c <= hi && c - lo < 65536; c++) map.set(c, String.fromCharCode(base + (c - lo)));
    }
  }
  return map.size ? { codeLen, map } : null;
}
const tuToCmap = new Map();
const cmaps = [];
const streams = []; // {objNum, text, isContent}
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m;
while ((m = streamRe.exec(ascii))) {
  if (m.index >= 3 && ascii.startsWith("end", m.index - 3)) continue;
  const dictStart = Math.max(0, ascii.lastIndexOf("endobj", m.index) + 6);
  const dictRegion = ascii.slice(dictStart, m.index);
  const objMatch = dictRegion.match(/^\s*(\d+)\s+0\s+obj\b/) ?? dictRegion.match(/(\d+)\s+0\s+obj\b/);
  const objNum = objMatch ? parseInt(objMatch[1], 10) : -1;
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
  for (const trimmed of [buf.subarray(start, chunkEnd), buf.subarray(start, end)]) {
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
        if (s > e || e > text.length) continue;
        const body = text.slice(s, e);
        if (/\/Type\s*\/Font\b/.test(body)) {
          const tu = body.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
          if (tu) objToTu.set(entries[i].obj, parseInt(tu[1], 10));
          const bf = body.match(/\/BaseFont\s*\/([\w#+-]+)/);
          if (bf) objBaseFont.set(entries[i].obj, bf[1]);
          objDict.set(entries[i].obj, body);
        }
        if (/\/Type\s*\/Page\b/.test(body)) {
          const contents = body.match(/\/Contents\s+(\d+)\s+0\s+R/);
          if (contents) {
            const fonts = new Map();
            for (const fm of body.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) fonts.set(fm[1], parseInt(fm[2], 10));
            if (fonts.size) pageFonts.set(parseInt(contents[1], 10), fonts);
          }
        }
        for (const fm of body.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) pushCandidate(fm[1], parseInt(fm[2], 10), m.index + (fm.index ?? 0));
      }
    }
    continue;
  }
  if (text.includes("beginbfchar") || text.includes("beginbfrange")) {
    const cm = parseCMap(text);
    if (cm) { cmaps.push(cm); if (objNum >= 0) tuToCmap.set(objNum, cm); }
    continue;
  }
  if (!/(?:\)|\]|>)\s*(?:Tj|TJ|'|")/.test(text)) continue;
  streams.push({ objNum, text });
}

// --- the target hunt: atoms decoding to non-Latin-1 chars ---
const ARM = /[\u0530-\u058F\u018E\u018F]/; // Armenian block + Ǝ Ԑ
let found = 0;
for (const st of streams) {
  if (found >= maxAtoms) break;
  const pageMap = pageFonts.get(st.objNum);
  // walk pieces with font names (the Tf/TJ regex pair)
  let curFont = "";
  const ops = /\/(\S+)\s+[\d.+-]+\s+Tf|<([0-9A-Fa-f\s]+)>\s*(Tj|TJ|'|")|\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ/g;
  let om;
  while ((om = ops.exec(st.text))) {
    if (om[1] !== undefined) { curFont = om[1]; continue; }
    const hexes = om[2] !== undefined ? [om[2]] : om[4] ? [...om[4].matchAll(/<([0-9A-Fa-f\s]+)>/g)].map((x) => x[1]) : [];
    for (const hx of hexes) {
      const hex = hx.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
      if (!hex || hex.length % 2) continue;
      const bytes = [];
      for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.slice(i, i + 2), 16));
      // resolve through the SAME chain the extractor uses
      const chain = [];
      const pageFontObj = pageMap?.get(curFont);
      if (pageFontObj !== undefined) {
        const tu = objToTu.get(pageFontObj);
        const cm = tu !== undefined ? tuToCmap.get(tu) : undefined;
        if (cm) chain.push({ src: `PAGE-MAP obj ${pageFontObj} (tu ${tu})`, cm });
      }
      const cands = fCandidates.get(curFont) ?? [];
      for (const c of [...cands].sort((a, b) => a.pos - b.pos)) {
        const tu = objToTu.get(c.obj);
        const cm = tu !== undefined ? tuToCmap.get(tu) : undefined;
        if (cm) chain.push({ src: `CAND obj ${c.obj} (tu ${tu})`, cm });
      }
      // decode: first FULLY-covering map
      let decoded = null; let usedSrc = "LATIN1-FALLBACK";
      for (const { src, cm } of chain) {
        if (cm.codeLen === 1) {
          if (bytes.every((b) => cm.map.has(b))) { decoded = bytes.map((b) => cm.map.get(b)).join(""); usedSrc = src; break; }
        } else if (bytes.length >= 2 && bytes.length % 2 === 0) {
          let ok = true; const codes = [];
          for (let i = 0; i < bytes.length; i += 2) { const c = bytes[i] * 256 + bytes[i + 1]; if (!cm.map.has(c)) { ok = false; break; } codes.push(c); }
          if (ok) { decoded = codes.map((c) => cm.map.get(c)).join(""); usedSrc = src; break; }
        }
      }
      if (decoded === null) decoded = bytes.map((b) => (b >= 32 && b < 127) || b >= 0xa0 ? String.fromCharCode(b) : " ").join("");
      if (ARM.test(decoded) && found < maxAtoms) {
        found++;
        console.log(`\n=== ARMENIAN ATOM #${found} ===`);
        console.log(`  stream obj ${st.objNum} | font /${curFont} | hex <${hex}> | decoded: ${JSON.stringify(decoded)} | via: ${usedSrc}`);
        console.log(`  page map present: ${!!pageMap}${pageMap ? ` → /${curFont} = obj ${pageFontObj}` : ""}`);
        for (const { src, cm } of chain.slice(0, 6)) {
          const cover = bytes.filter((b) => cm.map.has(b)).length + "/" + bytes.length;
          console.log(`    chain member ${src}: covers 1-byte ${cover}`);
        }
        for (const c of cands.slice(0, 6)) {
          const dict = objDict.get(c.obj);
          console.log(`    cand obj ${c.obj}: BaseFont=${objBaseFont.get(c.obj) ?? "?"} ToUnicode=${objToTu.get(c.obj) ?? "none"}${dict ? " | dict: " + dict.replace(/\s+/g, " ").slice(0, 220) : ""}`);
        }
        if (pageFontObj !== undefined) {
          const dict = objDict.get(pageFontObj);
          console.log(`    PAGE font obj ${pageFontObj} dict: ${dict ? dict.replace(/\s+/g, " ").slice(0, 220) : "(not in raw scan — ObjStm?)"}`);
        }
      }
    }
  }
}
console.log(`\nfound ${found} Armenian/homoglyph atoms (max ${maxAtoms})`);
// the /Differences census
console.log(`\n/Differences objects found: ${objDiffs.size}`);
for (const [obj, d] of [...objDiffs].slice(0, 6)) console.log(`  obj ${obj}: ${JSON.stringify(d.slice(0, 200))}`);
process.exit(0);
