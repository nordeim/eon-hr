// probe-r103-tm-shapes.mjs — census the Tm matrix d-component (the flip
// signature) across the corpus files: which writers write FLIPPED Tms
// (d<0, the top-down Skia/Chrome form) and what ty their first Td after a
// flipped vs normal Tm carries.
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

for (const path of process.argv.slice(2)) {
  const name = path.split("/").pop();
  const buf = readFileSync(path);
  const ascii = Buffer.from(buf).toString("latin1");
  const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
  let m;
  let flipped = 0, normal = 0, other = 0;
  let flippedTyTd = new Map(), normalTyTd = new Map();
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
    if (!text || !/Tj|TJ/.test(text)) continue;
    // split on Tm; for each segment after a Tm, classify the Tm shape and the first Td
    const parts = text.split(/\bTm\b/);
    for (let i = 1; i < parts.length; i++) {
      const prevTail = parts[i - 1].slice(-100);
      // the Tm's SIX operands a b c d e f — grab all trailing numbers, read the 4th-from-last-group = d
      const dm = prevTail.match(/(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s*$/);
      if (!dm) { other++; continue; }
      const d = parseFloat(dm[4]);
      const tdm = parts[i].match(/^\s*([\d.-]+)\s+([\d.-]+)\s+T[dD]/);
      const ty = tdm ? parseFloat(tdm[2]) : null;
      if (d < 0) {
        flipped++;
        if (ty !== null && ty !== 0) flippedTyTd.set(ty, (flippedTyTd.get(ty) ?? 0) + 1);
      } else {
        normal++;
        if (ty !== null && ty !== 0) normalTyTd.set(ty, (normalTyTd.get(ty) ?? 0) + 1);
      }
    }
  }
  const top = (mp) => JSON.stringify([...mp.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4));
  console.log(`${name}: flipped-Tm=${flipped} (ty≠0 first-Td: ${flippedTyTd.size ? top(flippedTyTd) : "none"}) · normal-Tm=${normal} (ty≠0 first-Td: ${normalTyTd.size ? top(normalTyTd) : "none"})`);
}
