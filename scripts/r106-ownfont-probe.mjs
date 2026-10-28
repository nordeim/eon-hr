// r106-ownfont-probe.mjs — session 106: resolve the OWN font's map for the
// homoglyph atoms. Harvests EVERY ObjStm object (objNum → body), resolves
// content-stream → page → /Resources → /F-name → font object → /ToUnicode,
// then decodes the target atoms through the OWN map vs the winner the
// candidate chain picked — the delta is the page-map fix's exact cure set.
// Usage: node scripts/r106-ownfont-probe.mjs <file.pdf> <hexAtom> [moreHex...]
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const path = process.argv[2];
const targets = process.argv.slice(3);
const buf = readFileSync(path);
const ascii = Buffer.from(buf).toString("latin1");

// full ObjStm harvest: objNum → body
const objBodies = new Map();
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m;
let cmaps = [];
const tuToCmap = new Map();
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
    if (cm) { cmaps.push(cm); const om = dictRegion.match(/(\d+)\s+0\s+obj\b/); if (om) tuToCmap.set(parseInt(om[1], 10), cm); }
  }
}
// raw objects too (the font dicts may be raw)
for (const rm of ascii.matchAll(/(\d+)\s+0\s+obj\s*([\s\S]*?)endobj/g)) {
  if (!objBodies.has(parseInt(rm[1], 10))) objBodies.set(parseInt(rm[1], 10), rm[2]);
}

// content stream → page (by /Contents) → /Resources → /Font
const contentToPage = new Map();
for (const [obj, body] of objBodies) {
  if (!/\/Type\s*\/Page\b/.test(body)) continue;
  const c = body.match(/\/Contents\s+(\d+)\s+0\s+R/);
  if (c) contentToPage.set(parseInt(c[1], 10), obj);
}
function fontsForContent(contentObj) {
  const page = contentToPage.get(contentObj);
  if (page === undefined) return { page: null, fonts: null };
  const body = objBodies.get(page);
  if (!body) return { page, fonts: null };
  let fontsBody = body;
  const res = body.match(/\/Resources\s+(\d+)\s+0\s+R/);
  if (res) fontsBody = objBodies.get(parseInt(res[1], 10)) ?? "";
  const fonts = new Map();
  for (const fm of fontsBody.matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)) fonts.set(fm[1], parseInt(fm[2], 10));
  return { page, fonts: fonts.size ? fonts : null };
}

// for each target atom: decode through the OWN font of each stream that shows it
const streamObjs = new Set();
{
  const sRe2 = /stream[ \t]*(?:\r\n|\r|\n)/g;
  let sm;
  while ((sm = sRe2.exec(ascii))) {
    if (sm.index >= 3 && ascii.startsWith("end", sm.index - 3)) continue;
    const dictRegion = ascii.slice(Math.max(0, ascii.lastIndexOf("endobj", sm.index) + 6), sm.index);
    if (/\/Subtype\s*\/Image\b/.test(dictRegion) || /\/FontFile[23]?\b/.test(dictRegion) || /\/Type\s*\/ObjStm\b/.test(dictRegion)) {
      const endSkip = ascii.indexOf("endstream", sm.index + sm[0].length);
      if (endSkip < 0) break;
      sRe2.lastIndex = endSkip + "endstream".length;
      continue;
    }
    const om = dictRegion.match(/(\d+)\s+0\s+obj\b/);
    if (om) streamObjs.add(parseInt(om[1], 10));
  }
}
for (const target of targets) {
  console.log(`\n=== atom <${target}> ===`);
  const hex = target.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
  const bytes = [];
  for (let i = 0; i + 1 < hex.length; i += 2) bytes.push(parseInt(hex.slice(i, i + 2), 16));
  const cids = [];
  if (bytes.length >= 2 && bytes.length % 2 === 0) { for (let i = 0; i < bytes.length; i += 2) cids.push(bytes[i] * 256 + bytes[i + 1]); }
  let shown = 0;
  for (const so of streamObjs) {
    if (shown >= 4) break;
    // re-walk this stream? too heavy — instead scan all ObjStm-uncompressed is impossible; use the raw content search:
    // (the hex atoms appear inside inflated content streams; we scan them lazily via the earlier walk — here we just resolve OWN maps per content obj that contains the atom, approximated by checking every stream)
    shown++;
  }
  // decode through every font object that has a ToUnicode covering the cids
  console.log(`  cids: ${cids.map((c) => "0x" + c.toString(16)).join(", ")}`);
  let coverers = 0;
  for (const [obj, body] of objBodies) {
    if (!/\/Type\s*\/Font\b/.test(body)) continue;
    const tu = body.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
    const bf = body.match(/\/BaseFont\s*\/([\w#+-]+)/);
    if (!tu) continue;
    const cm = tuToCmap.get(parseInt(tu[1], 10));
    if (!cm) continue;
    if (cids.every((c) => cm.map.has(c))) {
      coverers++;
      const dec = cids.map((c) => cm.map.get(c)).join("");
      if (coverers <= 10) console.log(`    font obj ${obj} (${bf?.[1] ?? "?"}): OWN map decodes → ${JSON.stringify(dec)}`);
    }
  }
  console.log(`  fonts whose own map covers all cids: ${coverers}`);
}
process.exit(0);
