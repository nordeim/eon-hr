// probe-r102-real-pdf.mjs — run REAL downloaded PDFs through the extraction
// pipeline AND census the r102 queue's operator shapes in their inflated
// content streams: Tz (horizontal scaling), Ts (rise), Type3 fonts (d0/d1
// glyph procs), plus the standing metrics (producer, ObjStm, yield).
// Usage: node scripts/probe-r102-real-pdf.mjs file1.pdf [file2.pdf …]
import { readFileSync } from "node:fs";
import { inflate } from "./r101-inflate.ts";

const paths = process.argv.slice(2);
for (const path of paths) {
  console.log(`\n=== ${path} ===`);
  let buf;
  try { buf = readFileSync(path); } catch (e) { console.log(" READ FAIL:", String(e).slice(0, 120)); continue; }
  const ascii = Buffer.from(buf).toString("latin1");

  for (const key of ["Producer", "Creator"]) {
    const m = ascii.match(new RegExp(`${key}>([^<]*)<`)) || ascii.match(new RegExp(`/${key}\\s*\\(([^)]*)\\)`));
    console.log(` ${key}: ${m ? m[1] : "(not found)"}`);
  }
  console.log(" header:", JSON.stringify(ascii.slice(0, 9)));
  console.log(" ObjStm count:", (ascii.match(/\/ObjStm/g) ?? []).length);
  console.log(" Type3 fonts:", (ascii.match(/\/Type3/g) ?? []).length);
  console.log(" encrypted:", ascii.includes("/Encrypt"));

  // walk the streams, inflate, census the operators
  const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/g;
  let m; let tz = 0, ts = 0, d0d1 = 0, tj = 0, tJ = 0, tstar = 0, tm = 0;
  const tzValues = new Map();
  let inflatedSamples = [];
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
    if (!text) continue;
    tz += (text.match(/(^|\s)-?[\d.]+\s+Tz\b/g) ?? []).length;
    for (const mm of text.matchAll(/(-?[\d.]+)\s+Tz\b/g)) tzValues.set(mm[1], (tzValues.get(mm[1]) ?? 0) + 1);
    ts += (text.match(/(^|\s)-?[\d.]+\s+Ts\b/g) ?? []).length;
    d0d1 += (text.match(/\b[01]\s+d[01]\b/g) ?? []).length;
    tj += (text.match(/\)\s*Tj\b/g) ?? []).length;
    tJ += (text.match(/\]\s*TJ\b/g) ?? []).length;
    tstar += (text.match(/T\*/g) ?? []).length;
    tm += (text.match(/\bTm\b/g) ?? []).length;
    if (inflatedSamples.length < 2 && /\)\s*Tj|\]\s*TJ/.test(text)) {
      inflatedSamples.push(text.slice(0, 600));
    }
  }
  console.log(` operators: Tz=${tz} ${JSON.stringify([...tzValues.entries()].slice(0, 8))} · Ts=${ts} · d0/d1=${d0d1} · Tj=${tj} · TJ=${tJ} · T*=${tstar} · Tm=${tm}`);
  for (const [i, s] of inflatedSamples.entries()) {
    console.log(` content sample ${i}: ${JSON.stringify(s.slice(0, 400))}`);
  }
}
