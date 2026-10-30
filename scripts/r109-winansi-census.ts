#!/usr/bin/env bun
// r109-winansi-census.ts — the r109 queue's NEW watch: which corpus members
// declare /WinAnsiEncoding fonts, and do any RAW literal atoms (unescaped
// high bytes) actually appear under them? Three legs:
//   (1) the raw object census — /Encoding /WinAnsiEncoding (or the
//       /WinAnsiEncoding name anywhere in a font-ish object);
//   (2) the ObjStm-carried census (decompressed, the r106 lesson);
//   (3) the C1-zone literal probe: inflate every content stream, decode
//       latin1, and look for literal atoms carrying bytes 0x80–0x9F —
//       the zone where WinAnsi diverges from Latin-1.
// Usage: bun scripts/r109-winansi-census.ts
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const members: [string, string][] = [
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS f1040"],
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec"],
  ["/tmp/r107-corpus/lo-calc.pdf", "LO Calc"],
  ["/tmp/r107-corpus/lo-writer.pdf", "LO Writer"],
  ["/tmp/r108-quartz/quartz-longer.pdf", "Quartz"],
];

const DEC = new TextDecoder("latin1");

for (const [path, name] of members) {
  const raw = readFileSync(path);
  const buf = Buffer.from(raw);
  const text = DEC.decode(raw);

  // (1) raw census
  const rawHits = (text.match(/\/Encoding\s+\/WinAnsiEncoding/g) || []).length;
  const rawMac = (text.match(/\/Encoding\s+\/MacRomanEncoding/g) || []).length;
  const rawStd = (text.match(/\/Encoding\s+\/StandardEncoding/g) || []).length;
  const rawPdf = (text.match(/\/Encoding\s+\/PDFDocEncoding/g) || []).length;
  const rawSym = (text.match(/\/Encoding\s+\/SymbolEncoding|\/Encoding\s+\/ZapfDingbatsEncoding/g) || []).length;

  // (2) ObjStm census — inflate every stream, look for the declarations
  let objstmHits = 0;
  let objstmMac = 0;
  const streamRe = /stream\r?\n/g;
  let m: RegExpExecArray | null;
  while ((m = streamRe.exec(text)) !== null) {
    const start = m.index + m[0].length;
    const end = text.indexOf("endstream", start);
    if (end < 0) break;
    const chunk = buf.subarray(start, end);
    try {
      const inf = inflateSync(chunk);
      const s = DEC.decode(inf);
      objstmHits += (s.match(/\/Encoding\s+\/WinAnsiEncoding/g) || []).length;
      objstmMac += (s.match(/\/Encoding\s+\/MacRomanEncoding/g) || []).length;
    } catch { /* not a flate stream */ }
  }

  // (3) the C1-zone raw-literal probe: literal atoms with bytes 0x80–0x9F
  // inside content streams (inflated + raw). We look for the pattern
  // (…\x8X…) or (…\x9X…) — a literal containing a C1 byte, not via octal.
  let c1Literals = 0;
  let samples: string[] = [];
  const probe = (s: string) => {
    const re = /\((?:\\.|[^\\()])*\)/g;
    let mm: RegExpExecArray | null;
    while ((mm = re.exec(s)) !== null) {
      const lit = mm[0];
      // strip escapes so only RAW bytes count
      const stripped = lit.replace(/\\[0-7]{1,3}|\\[nrtbf]|\\[()\\]|\\\r?\n/g, "");
      if (/[\u0080-\u009f]/.test(stripped)) {
        c1Literals++;
        if (samples.length < 3) samples.push(stripped.slice(0, 60).replace(/[^\u0020-\u007e\u00a0-\u00ff]/g, "\u00b7"));
      }
    }
  };
  // raw content scan
  probe(text);
  // inflated streams
  streamRe.lastIndex = 0;
  while ((m = streamRe.exec(text)) !== null) {
    const start = m.index + m[0].length;
    const end = text.indexOf("endstream", start);
    if (end < 0) break;
    const chunk = buf.subarray(start, end);
    try { probe(DEC.decode(inflateSync(chunk))); } catch { /* not flate */ }
  }

  console.log(
    `${name.padEnd(12)} rawWinAnsi=${rawHits} rawMac=${rawMac} rawStd=${rawStd} rawPdf=${rawPdf} rawSym=${rawSym} ` +
    `objstmWinAnsi=${objstmHits} objstmMac=${objstmMac} C1rawLiterals=${c1Literals}` +
    (samples.length ? ` samples=${JSON.stringify(samples)}` : "")
  );
}
