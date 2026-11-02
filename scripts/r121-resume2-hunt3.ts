// r121-resume2-hunt3.ts — the raw content-stream anatomy of the mis-tracked
// line (py 525.3 -> PDF y ~316.7): every show op, Td/Tm, Tf, and TJ kern
// between the line origin and the date block, to see what the walk SHOULD
// have accumulated.
// Usage: bun scripts/r121-resume2-hunt3.ts
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const raw = new Uint8Array(readFileSync("/tmp/typst-cv/resume2.pdf"));
const latin = Buffer.from(raw).toString("latin1");
const streamRe = /stream\r?\n/g;
let m: RegExpExecArray | null;
let found = 0;
while ((m = streamRe.exec(latin))) {
  const start = m.index + m.length;
  const end = latin.indexOf("endstream", start);
  if (end < 0) continue;
  const chunk = raw.subarray(start, end);
  let text = "";
  try { text = inflateSync(chunk).toString("latin1"); } catch { continue; }
  // the body-text line: Td/Tm placing at x 42.5, y ~316-318 (flip-y 842-525.3)
  if (!/42\.5/.test(text) || !/T[Jj]/.test(text)) continue;
  if (!/(316|317|318)\.\d+/.test(text)) continue;
  found++;
  if (found > 2) break;
  console.log(`=== stream (len ${text.length}) ===`);
  // dump every op line containing a show or a positioning op
  const ops = text.split(/(?=\b(?:BT|ET|Tm|Td|TD|TJ|Tj|Tf|T\*|Tw|Tz|cm|q|Q)\b)/);
  for (const op of ops) {
    const t = op.replace(/\s+/g, " ").trim();
    if (!t) continue;
    if (/^(\d+\s+\d+\s+(Td|TD)|[-\d.]+\s+[-\d.]+\s+[-\d.]+\s+[-\d.]+\s+[-\d.]+\s+[-\d.]+\s+Tm|\/f\w+\s+[\d.]+\s+Tf|.*TJ|.*Tj\b|BT|ET|T\*|[-\d.]+\s+Tw|[-\d.]+\s+Tz)/.test(t)) {
      console.log(t.slice(0, 220));
    }
  }
}
if (!found) console.log("no matching stream — dumping stream inventory instead");
