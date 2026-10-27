// probe-r103-luatex-trace.mjs — trace the piece walk (sep decisions + decoded
// text) on the LuaTeX file to find the "N o v" letter-soup mechanism.
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

// walk the pieces exactly like pdfTextPieces (the current algorithm) and print
// a trace line per piece
let count = 0;
for (const text of streams) {
  if (!/Tj|TJ/.test(text)) continue;
  let effSize = 1, curFont = "", pendingEm = 0, pendingTy = 0, moved = false, backward = false;
  let sawTm = false;
  const reset = () => { pendingEm = 0; pendingTy = 0; moved = false; backward = false; };
  const ops = /\/\S+\s+([\d.+-]+)\s+Tf|(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]|T\*|\(((?:\\.|[^\\()])*)\)\s*(Tj|TJ|'|")|\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*(Tj|TJ|'|")|Tm/g;
  let mm;
  const trace = [];
  while ((mm = ops.exec(text))) {
    if (mm[1] !== undefined) { effSize = parseFloat(mm[1]) || 1; curFont = mm[0].split(/\s+/)[0].replace(/^\//, ""); continue; }
    if (mm[2] !== undefined) {
      const tx = parseFloat(mm[2]);
      pendingEm += Math.abs(tx) / effSize;
      pendingTy += parseFloat(mm[3]);
      moved = true;
      if (tx < 0) backward = true;
      continue;
    }
    if (mm[0] === "T*") { moved = true; pendingTy = 1; continue; }
    if (mm[4] !== undefined) { trace.push({ t: "lit", text: mm[4], font: curFont, moved, pendingEm: +pendingEm.toFixed(2), pendingTy, backward }); reset(); continue; }
    if (mm[6] !== undefined) {
      // TJ array: walk atoms
      const atomRe = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>|(-?[\d.]+)/g;
      let a; let kern = 0;
      while ((a = atomRe.exec(mm[6]))) {
        if (a[1] !== undefined || a[2] !== undefined) {
          if (kern !== 0) { moved = true; pendingEm = kern <= -100 ? 1.0 : 0; }
          trace.push({ t: a[1] !== undefined ? "lit" : "hex", text: a[1] ?? decode(a[2]), font: curFont, moved, pendingEm: +pendingEm.toFixed(2), pendingTy, backward, kern });
          reset(); kern = 0;
        } else kern += parseFloat(a[3]);
      }
      continue;
    }
    if (mm[7] !== undefined) { trace.push({ t: "hex", text: decode(mm[7]), font: curFont, moved, pendingEm: +pendingEm.toFixed(2), pendingTy, backward }); reset(); continue; }
    sawTm = true; reset();
  }
  // print the region around "N", "o", "v" single letters and "Exp"
  const joined = trace.map((p) => `[${p.t === "hex" ? "H:" : ""}${p.text}]em=${p.pendingEm},ty=${p.pendingTy}${p.moved ? ",moved" : ""}`).join(" ");
  for (const probe of ["Exp", "Nov", "System"]) {
    const i = joined.indexOf(probe.slice(0, 3));
    if (i >= 0 && count < 3) {
      console.log(`\n--- around "${probe}" (stream) ---`);
      console.log(joined.slice(Math.max(0, i - 260), i + 200));
      count++;
    }
  }
  if (count >= 3) break;
}
