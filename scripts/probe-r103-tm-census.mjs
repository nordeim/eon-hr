// probe-r103-tm-census.mjs — census the Tm/td/BT patterns in the real corpus
// files: how many Tm per line, do same-line words share identical Tm
// translations, and the Td-after-Tm ty shapes. For the R103-B fix design.
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

for (const path of process.argv.slice(2)) {
  console.log(`\n=== ${path} ===`);
  const buf = readFileSync(path);
  const ascii = Buffer.from(buf).toString("latin1");
  const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
  let m; let tmTotal = 0, btTotal = 0, tdAfterTmTy = 0, tdAfterShowTy = 0, tdTyValues = new Map();
  let sample = "";
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
    tmTotal += (text.match(/\bTm\b/g) ?? []).length;
    btTotal += (text.match(/\bBT\b/g) ?? []).length;
    if (!sample && text.includes("Td")) sample = text.slice(0, 500);
    // the Td-after-Tm vs Td-after-show ty census (approximate: split on Tm)
    for (const seg of text.split(/\bTm\b/).slice(1)) {
      const tdm = seg.match(/^\s*([\d.-]+)\s+([\d.-]+)\s+T[dD]/);
      if (tdm && parseFloat(tdm[2]) !== 0) tdAfterTmTy++;
    }
    for (const mm of text.matchAll(/(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]\b/g)) {
      const v = mm[2];
      tdTyValues.set(v, (tdTyValues.get(v) ?? 0) + 1);
    }
  }
  console.log(` Tm=${tmTotal} BT=${btTotal} · Td-ty value census: ${JSON.stringify([...tdTyValues.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6))}`);
  console.log(` Td-with-ty≠0 immediately after a Tm: ${tdAfterTmTy}`);
  if (sample) console.log(` sample: ${JSON.stringify(sample.slice(0, 350))}`);
}
