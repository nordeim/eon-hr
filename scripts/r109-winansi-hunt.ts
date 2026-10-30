#!/usr/bin/env bun
// r109-winansi-hunt.ts — source the 14th-writer specimen: a real file with
// /Encoding /WinAnsiEncoding fonts whose CONTENT-stream literal atoms carry
// raw C1-zone bytes (0x80–0x9F — curly quotes, dashes, €). Word's "Save as
// PDF" writes exactly this shape. Probes the surviving r108 Quartz-hunt
// candidates first (they're real-world files already downloaded).
// Usage: bun scripts/r109-winansi-hunt.ts
import { readFileSync, readdirSync } from "node:fs";
import { inflateSync } from "node:zlib";

const DEC = new TextDecoder("latin1");

const dir = "/tmp/r108-quartz";
const files = readdirSync(dir).filter((f) => f.endsWith(".pdf"));

for (const f of files) {
  const raw = readFileSync(`${dir}/${f}`);
  const buf = Buffer.from(raw);
  const text = DEC.decode(raw);
  const producer = (text.match(/Producer\s*\(([^)]{0,60})\)/) || [])[1] || "?";

  const rawWin = (text.match(/\/Encoding\s+\/WinAnsiEncoding/g) || []).length;

  // content-stream C1 raw-literal probe (inflated streams only — the real
  // text-showing path) + WinAnsi in ObjStms
  let objWin = 0;
  let c1Lits = 0;
  let samples: string[] = [];
  const streamRe = /stream\r?\n/g;
  let m: RegExpExecArray | null;
  while ((m = streamRe.exec(text)) !== null) {
    const start = m.index + m[0].length;
    const end = text.indexOf("endstream", start);
    if (end < 0) break;
    const chunk = buf.subarray(start, end);
    let s: string | null = null;
    try { s = DEC.decode(inflateSync(chunk)); } catch { continue; }
    objWin += (s.match(/\/Encoding\s+\/WinAnsiEncoding/g) || []).length;
    // literal atoms with raw C1 bytes
    const re = /\((?:\\.|[^\\()])*\)/g;
    let mm: RegExpExecArray | null;
    while ((mm = re.exec(s)) !== null) {
      const stripped = mm[0].replace(/\\[0-7]{1,3}|\\[nrtbf]|\\[()\\]|\\\r?\n/g, "");
      if (/[\u0080-\u009f]/.test(stripped)) {
        c1Lits++;
        if (samples.length < 3) samples.push(stripped.slice(1, 50).replace(/[^\u0020-\u007e]/g, "\u00b7"));
      }
    }
  }

  const hit = (rawWin > 0 || objWin > 0) && c1Lits > 0;
  console.log(`${f.padEnd(20)} ${hit ? "*** CANDIDATE ***" : "                 "} producer="${producer.slice(0, 40)}" rawWin=${rawWin} objWin=${objWin} c1Lits=${c1Lits}${samples.length ? " ex=" + JSON.stringify(samples) : ""}`);
}
