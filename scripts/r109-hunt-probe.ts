#!/usr/bin/env bun
// r109-hunt-probe.ts — probe any downloaded file for the WinAnsi
// raw-literal shape: /Encoding /WinAnsiEncoding on a font + literal atoms
// carrying raw C1 bytes (0x80–0x9F) inside INFLATED streams, PLUS the
// crucial check — the C1 byte must be in a TEXT-SHOWING context (near a
// Tj/TJ/'/" operator), not a font program.
// Usage: bun scripts/r109-hunt-probe.ts <file.pdf> [more.pdf ...]
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const DEC = new TextDecoder("latin1");

for (const path of process.argv.slice(2)) {
  try {
    const raw = readFileSync(path);
    const buf = Buffer.from(raw);
    const text = DEC.decode(raw);
    const producer = (text.match(/Producer\s*\(([^)]{0,70})\)/) || [])[1] || "?";
    const creator = (text.match(/Creator\s*\(([^)]{0,70})\)/) || [])[1] || "?";

    let rawWin = (text.match(/\/Encoding\s+\/WinAnsiEncoding/g) || []).length;
    let objWin = 0;
    // TEXT-CONTEXT C1 literals: a literal with a raw C1 byte, within 200
    // chars of a Tj/TJ operator (heuristic: the operator usually follows
    // immediately; font programs have no text-show operators)
    let c1TextLits = 0;
    let samples: string[] = [];
    const streamRe = /stream\r?\n/g;
    let m: RegExpExecArray | null;
    while ((m = streamRe.exec(text)) !== null) {
      const start = m.index + m[0].length;
      const end = text.indexOf("endstream", start);
      if (end < 0) break;
      let s: string | null = null;
      try { s = DEC.decode(inflateSync(buf.subarray(start, end))); } catch { continue; }
      objWin += (s.match(/\/Encoding\s+\/WinAnsiEncoding/g) || []).length;
      if (!/Tj|TJ|'|"/.test(s)) continue; // skip non-content streams
      const re = /\((?:\\.|[^\\()]){1,400}\)\s*(Tj|TJ|'|"|)|\((?:\\.|[^\\()]){1,400}\)/g;
      let mm: RegExpExecArray | null;
      while ((mm = re.exec(s)) !== null) {
        const stripped = mm[0].replace(/\\[0-7]{1,3}|\\[nrtbf]|\\[()\\]|\\\r?\n/g, "");
        if (/[\u0080-\u009f]/.test(stripped)) {
          c1TextLits++;
          if (samples.length < 4) {
            samples.push(
              stripped.slice(1, 60)
                .replace(/[\u0080-\u009f]/g, (c) => `<${c.charCodeAt(0).toString(16)}>`)
            );
          }
        }
      }
    }

    const hit = (rawWin > 0 || objWin > 0) && c1TextLits > 0;
    console.log(
      `${path.split("/").pop()!.padEnd(24)} ${hit ? "*** CANDIDATE ***" : "                "} win=${rawWin}/${objWin} c1TextLits=${c1TextLits}\n    producer="${producer}" creator="${creator}"${samples.length ? "\n    ex=" + JSON.stringify(samples) : ""}`
    );
  } catch (e) {
    console.log(`${path}: ERR ${String(e).slice(0, 80)}`);
  }
}
