// probe-r103-tm-deltas.mjs — measure the Tm translation deltas between
// consecutive shows on the LuaTeX file (em-normalized): the continuation vs
// gap distribution for the position-aware Tm rule design.
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const path = process.argv[2] || "/home/z/my-project/tmp-r103/martino-lualatex.pdf";
const buf = readFileSync(path);
const ascii = Buffer.from(buf).toString("latin1");

const cmaps = [];
const streams = [];
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
  let text = "";
  try { text = new TextDecoder().decode(await inflate(buf.subarray(start, chunkEnd))); } catch {
    try { text = new TextDecoder().decode(await inflate(buf.subarray(start, chunkEnd), true)); } catch { continue; }
  }
  if (text) streams.push(text);
}
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
  if (map.size) cmaps.push(map);
}
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

// walk shows with their Tm positions; measure consecutive deltas
for (const text of streams) {
  if (!/TJ|Tj/.test(text)) continue;
  const re = /\/(F\d+)\s+([\d.]+)\s+Tf|(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+Tm|<([0-9A-Fa-f\s]+)>\s*(Tj|TJ)|\(((?:\\.|[^\\()])*)\)\s*(Tj|TJ)|\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ/g;
  let mm;
  let effSize = 1, a = 1, d = 1, last = null;
  const out = [];
  while ((mm = re.exec(text))) {
    if (mm[1]) { effSize = parseFloat(mm[2]) || 1; continue; }
    if (mm[3] !== undefined) {
      a = parseFloat(mm[5]); d = parseFloat(mm[8]);
      const pos = { x: parseFloat(mm[7]), y: parseFloat(mm[9]), scale: Math.abs(a) || 1 };
      if (last) {
        const dx = pos.x - last.x, dy = pos.y - last.y;
        const emDx = dx / (effSize * pos.scale), emDy = dy / (effSize * pos.scale);
        out.push(`Δ(${emDx.toFixed(2)}em, ${emDy.toFixed(2)}em)`);
      }
      last = pos;
      continue;
    }
    // a show — record its text
    if (mm[10] !== undefined || mm[13] !== undefined) {
      const t = mm[10] !== undefined ? decode(mm[10]) : (mm[13] ?? "");
      out.push(`"${t.slice(0, 12)}"`);
      // the show advances the position by its width (unknown) — mark unknown
      last = null; // can't track across shows without glyph widths — measure ONLY Tm-to-Tm gaps between ADJACENT blocks
      continue;
    }
    if (mm[14] !== undefined) {
      // TJ array — decode atoms roughly
      const atoms = [...mm[14].matchAll(/<([0-9A-Fa-f\s]+)>|\(((?:\\.|[^\\()])*)\)/g)].map((x) => (x[1] ? decode(x[1]) : x[2])).join("");
      out.push(`"${atoms.slice(0, 14)}"`);
      last = null;
      continue;
    }
  }
  console.log(out.slice(0, 80).join(" "));
  break;
}
