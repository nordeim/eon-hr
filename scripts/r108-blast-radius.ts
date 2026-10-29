// r108-blast-radius.ts — measure BOTH fix legs' blast radius before any
// code change (the r107 plan-validation discipline):
//   LEG A (the latin1 stream decode): census the inflated content streams
//     of every corpus member for bytes >= 0x80 inside LITERAL atoms — a
//     latin1 decode changes exactly those members' output (U+FFFD today).
//   LEG B (the MacRoman remap): census the font dicts for
//     /Encoding /MacRomanEncoding declarations — the remap fires only in
//     files that carry one (expected: only the Quartz member).
// Usage: bun scripts/r108-blast-radius.ts
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const files: [string, string][] = [
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS f1040"],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r107-corpus/lo-calc.pdf", "lo-calc"],
  ["/tmp/r107-corpus/lo-writer.pdf", "lo-writer"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ"],
];

for (const [path, name] of files) {
  const raw = readFileSync(path);
  const latin = raw.toString("latin1");
  // LEG B: the raw MacRoman declarations
  const macRoman = (latin.match(/\/Encoding\s+\/MacRomanEncoding/g) || []).length;
  const winAnsi = (latin.match(/\/Encoding\s+\/WinAnsiEncoding/g) || []).length;
  // LEG A: the inflated content streams' literal high bytes
  const re = /stream\r?\n([\s\S]*?)endstream/g;
  let m: RegExpExecArray | null;
  let highInLit = 0;
  let streams = 0;
  const samples: string[] = [];
  while ((m = re.exec(latin)) !== null) {
    const dictStart = latin.lastIndexOf("<<", m.index);
    const dict = latin.slice(Math.max(0, dictStart), m.index);
    let body = m[1];
    if (/\/FlateDecode/.test(dict)) {
      try { body = inflateSync(Buffer.from(body, "latin1")).toString("latin1"); } catch { continue; }
    } else continue; // uncompressed streams ride the raw latin1 path already
    if (!/(?:\)|\]|>)\s*(?:Tj|TJ|'|")/.test(body)) continue;
    streams++;
    const litRe = /\((?:\\.|[^\\()])*\)/g;
    let lm: RegExpExecArray | null;
    while ((lm = litRe.exec(body)) !== null) {
      for (const ch of lm[0]) {
        const c = ch.charCodeAt(0);
        if (c >= 0x80) {
          highInLit++;
          if (samples.length < 5) samples.push("0x" + c.toString(16) + " in " + JSON.stringify(lm[0].slice(0, 24)));
        }
      }
    }
  }
  console.log(`${name.padEnd(10)} MacRoman=${macRoman} WinAnsi=${winAnsi} · inflated content streams=${streams} · high-byte literal chars=${highInLit}`);
  for (const s of samples) console.log("   ", s);
}
process.exit(0);
