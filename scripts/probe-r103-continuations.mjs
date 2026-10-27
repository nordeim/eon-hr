// probe-r103-continuations.mjs — dump ALL same-BT Td(ty=0) continuation moves
// between shows (no Tm between) with their decoded shows + em values, across
// all content streams of the gdocs file. The R103-B/C design evidence.
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const path = process.argv[2] || "/home/z/my-project/tmp-r103/gdocs-cv-template.pdf";
const buf = readFileSync(path);
const ascii = Buffer.from(buf).toString("latin1");

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

let contCount = 0;
const emHisto = new Map();
const samples = [];
for (const text of streams) {
  if (!/Tj/.test(text) || !text.includes("Tm")) continue;
  const re = /\/(F\d+)\s+([\d.]+)\s+Tf|(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]|<([0-9A-Fa-f\s]+)>\s*Tj|Tm/g;
  let mm;
  let effSize = 1; let lastShow = null; let pendingTx = null; let pendingTy = 0; let sawTm = false;
  while ((mm = re.exec(text))) {
    if (mm[1]) { effSize = parseFloat(mm[2]) || 1; continue; }
    if (mm[3] !== undefined) {
      // a Td: remember as pending unless a Tm intervened
      if (lastShow !== null && !sawTm) { pendingTx = (pendingTx ?? 0) + parseFloat(mm[3]); pendingTy += parseFloat(mm[4]); }
      continue;
    }
    if (mm[5] !== undefined) {
      const dec = decode(mm[5]);
      if (lastShow !== null && !sawTm && pendingTx !== null && pendingTy === 0) {
        // a same-BT ty=0 continuation between two shows
        const em = Math.abs(pendingTx) / effSize;
        const key = em >= 3 ? "3+" : em >= 2 ? "2-3" : em >= 1 ? "1-2" : em >= 0.5 ? "0.5-1" : "<0.5";
        emHisto.set(key, (emHisto.get(key) ?? 0) + 1);
        contCount++;
        if (samples.length < 40 && (em >= 0.5 || dec.length > 0)) samples.push(`"${lastShow.replace(/\s/g, "·")}" +${em.toFixed(2)}em → "${dec.replace(/\s/g, "·")}"`);
      }
      lastShow = dec; pendingTx = null; pendingTy = 0; sawTm = false;
      continue;
    }
    // Tm
    sawTm = true; pendingTx = null; pendingTy = 0;
  }
}
console.log("same-BT ty=0 continuations:", contCount);
console.log("em histogram:", JSON.stringify([...emHisto.entries()]));
console.log("\nsamples (≥0.5em or non-empty):");
for (const s of samples) console.log(" ", s);
