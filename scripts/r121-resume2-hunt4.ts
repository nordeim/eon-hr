// r121-resume2-hunt4.ts — stream inventory + the ops of the streams that
// carry TJ shows. Typst packs content streams; find where the body text
// lives and dump a window around the first big TJ.
// Usage: bun scripts/r121-resume2-hunt4.ts
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const raw = new Uint8Array(readFileSync("/tmp/typst-cv/resume2.pdf"));
const latin = Buffer.from(raw).toString("latin1");
const streamRe = /stream\r?\n/g;
let m: RegExpExecArray | null;
let n = 0;
while ((m = streamRe.exec(latin))) {
  const start = m.index + m.length;
  const end = latin.indexOf("endstream", start);
  if (end < 0) continue;
  const chunk = raw.subarray(start, end);
  let text = "";
  try { text = inflateSync(chunk).toString("latin1"); } catch { continue; }
  n++;
  const tjCount = (text.match(/TJ/g) ?? []).length;
  const tmCount = (text.match(/Tm\b/g) ?? []).length;
  const tdCount = (text.match(/Td\b/g) ?? []).length;
  console.log(`stream #${n}: len ${text.length} TJ ${tjCount} Tm ${tmCount} Td ${tdCount} BT ${(text.match(/BT/g) ?? []).length}`);
  if (tjCount > 5) {
    // dump the op sequence (first 120 ops)
    const ops = text.split(/(?=\b(?:BT|ET|Tm|Td|TD|TJ|Tj|Tf|T\*|Tw|Tz)\b)/);
    let shown = 0;
    for (const op of ops) {
      const t = op.replace(/\s+/g, " ").trim();
      if (!t) continue;
      if (/^(BT|ET|\d+\s+\d+\s+(Td|TD)|[-\d.]+[-\d.]+\s+Tm|\/f\w+\s+[\d.]+\s+Tf|.*T[Jj]\b|T\*|[-\d.]+\s+Tw|[-\d.]+\s+Tz)/.test(t) || t.includes("TJ")) {
        console.log("   ", t.slice(0, 200));
        if (++shown > 90) break;
      }
    }
  }
}
