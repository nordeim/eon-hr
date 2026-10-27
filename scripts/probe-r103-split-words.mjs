// probe-r103-split-words.mjs — decode the gdocs CMap and dump the show
// sequences with their Td context to find the exact operator shape of the
// split words ("W ith", "Of fice", "COMP ANY") — the overhang-letter class.
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const path = "/home/z/my-project/tmp-r103/gdocs-cv-template.pdf";
const buf = readFileSync(path);
const ascii = Buffer.from(buf).toString("latin1");

// collect ToUnicode CMaps (the two-phase walk)
const cmaps = [];
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
let m;
const streams = [];
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
    try { text = new TextDecoder().decode(await inflate(chunk, true)); } catch { continue; }
  }
  if (text) streams.push(text);
}

// parse CMaps (bfchar + bfrange base-offset + array forms)
function utf16be(hex) {
  let out = "";
  for (let i = 0; i + 3 < hex.length + 1; i += 4) out += String.fromCharCode(parseInt(hex.slice(i, i + 4) || "0", 16));
  return out;
}
for (const text of streams) {
  if (!text.includes("beginbfchar")) continue;
  const map = new Map();
  let mm;
  const bfRe = /beginbfchar([\s\S]*?)endbfchar/g;
  while ((mm = bfRe.exec(text))) {
    const pairRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g;
    let p;
    while ((p = pairRe.exec(mm[1]))) map.set(parseInt(p[1], 16), utf16be(p[2]));
  }
  const brRe = /beginbfrange([\s\S]*?)endbfrange/g;
  while ((mm = brRe.exec(text))) {
    const offRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]{1,4})>/g;
    let r;
    while ((r = offRe.exec(mm[1]))) {
      const lo = parseInt(r[1], 16), hi = parseInt(r[2], 16), base = parseInt(r[3], 16);
      for (let c = lo; c <= hi && c - lo < 65536; c++) map.set(c, String.fromCharCode(base + (c - lo)));
    }
  }
  if (map.size) cmaps.push(map);
}
console.log("cmaps:", cmaps.length, "sizes:", cmaps.map((c) => c.size).join(","));

function decode(hex) {
  const clean = hex.replace(/[^0-9A-Fa-f]/g, "");
  const padded = clean.length % 2 ? clean + "0" : clean;
  const bytes = [];
  for (let i = 0; i < padded.length; i += 2) bytes.push(parseInt(padded.slice(i, i + 2), 16));
  for (const cm of cmaps) {
    if (bytes.length % 2) continue;
    const codes = [];
    let covered = true;
    for (let i = 0; i < bytes.length; i += 2) {
      const c = bytes[i] * 256 + bytes[i + 1];
      if (!cm.has(c)) { covered = false; break; }
      codes.push(c);
    }
    if (covered) return codes.map((c) => cm.get(c)).join("");
  }
  return "?";
}

// find a content stream and dump shows with Td context, decoded
for (const text of streams) {
  if (!/Tj/.test(text) || !text.includes("Tm")) continue;
  // walk: track Tm-td-show sequences
  const re = /\/(F\d+)\s+[\d.]+\s+Tf|(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]|<([0-9A-Fa-f\s]+)>\s*Tj|Tm/g;
  let mm; let lastTd = null; let lastTm = false; const seq = [];
  while ((mm = re.exec(text))) {
    if (mm[1]) { seq.push(`[${mm[1]}]`); continue; }
    if (mm[2] !== undefined) { lastTd = `${mm[2]},${mm[3]}`; lastTm = false; seq.push(`Td(${lastTd})`); continue; }
    if (mm[4] !== undefined) { seq.push(`"${decode(mm[4]).replace(/\n/g, "\\n")}"`); continue; }
    seq.push("Tm"); lastTm = true;
  }
  const joined = seq.join(" ");
  // print segments around split-word candidates
  for (const word of ["ith", "fice", "ANY"]) {
    const idx = joined.indexOf(word);
    if (idx >= 0) {
      console.log(`\n--- context around "${word}" ---`);
      console.log(joined.slice(Math.max(0, idx - 220), idx + 60));
    }
  }
  break;
}
