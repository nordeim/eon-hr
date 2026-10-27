// probe-r103-fuse-debug.mjs — trace the Tm deltas in a fused region of the
// LuaTeX file to find why word gaps are joining.
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const buf = readFileSync("/home/z/my-project/tmp-r103/martino-lualatex.pdf");
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

// find the stream containing "backend" glyphs — walk with deltas like the fix
for (const text of streams) {
  if (!/TJ/.test(text) || !/Tm/.test(text)) continue;
  const ops = /\/\S+\s+([\d.]+)\s+Tf|(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]|(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+Tm|\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*Tj/g;
  let mm;
  let effSize = 1, lastTm = null, lastShow = "";
  const trace = [];
  while ((mm = ops.exec(text))) {
    if (mm[1] !== undefined) { effSize = parseFloat(mm[1]) || 1; continue; }
    if (mm[2] !== undefined) { trace.push(`Td(${mm[2]},${mm[3]})`); continue; }
    if (mm[4] !== undefined) {
      const e = parseFloat(mm[9]), f = parseFloat(mm[10]);
      const a = parseFloat(mm[6]), d = parseFloat(mm[8]);
      let dstr = "";
      if (lastTm) {
        const emDx = (e - lastTm.x) / (effSize * Math.abs(a || 1));
        const emDy = (f - lastTm.y) / (effSize * Math.abs(d || 1));
        dstr = `Δ(${emDx.toFixed(2)},${emDy.toFixed(2)})em`;
      }
      trace.push(`Tm${dstr}@${e.toFixed(1)},${f.toFixed(1)}(sz${effSize.toFixed(1)})`);
      lastTm = { x: e, y: f };
      continue;
    }
    if (mm[11] !== undefined) {
      const atoms = [...mm[11].matchAll(/<([0-9A-Fa-f\s]+)>|\(((?:\\.|[^\\()])*)\)|(-?[\d.]+)/g)].map((x) => (x[1] ? decode(x[1]) : x[2] !== undefined ? x[2] : `#${x[3]}`)).join("·");
      trace.push(`TJ[${atoms.slice(0, 30)}]`);
      continue;
    }
    if (mm[12] !== undefined) { trace.push(`Tj(${decode(mm[12]).slice(0, 12)})`); continue; }
  }
  const joined = trace.join(" ");
  // find a region with words (not '?')
  const idx = joined.indexOf("TJ[?"); if (idx < 0) { console.log(joined.slice(0, 1600)); break; }
  if (idx >= 0) {
    console.log(joined.slice(Math.max(0, idx - 100), idx + 1400));
    break;
  }
}
