// r127-rl-boundary.ts — examine the actual content-stream ops around a
// ReportLab site-2 boundary ("we tell you in the next " | "This manual does
// not cov") to see why the walk reads moved=false (no positioning between the
// shows). Also dump one arXiv bibliography boundary ("(" | "2023").
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

function allStreams(path: string): string[] {
  const raw = readFileSync(path);
  const latin = new TextDecoder("latin1");
  const src = latin.decode(raw);
  const out: string[] = [];
  // every stream..endstream that inflates (skip font files etc.)
  const re = /stream\r?\n/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const dataStart = m.index + m[0].length;
    const dataEnd = src.indexOf("endstream", dataStart);
    if (dataEnd < 0) break;
    try {
      const inf = inflateSync(raw.subarray(dataStart, dataEnd));
      const t = inf.toString("latin1");
      if (/BT|Tj|TJ/.test(t)) out.push(t);
    } catch { /* not flate */ }
    re.lastIndex = dataEnd;
  }
  return out;
}

// ReportLab: find the boundary ops
const rl = allStreams("/tmp/r109-corpus/rl-userguide.pdf");
console.log(`ReportLab: ${rl.length} text streams`);
for (const s of rl) {
  const i = s.indexOf("This manual does not cov");
  if (i < 0) continue;
  // walk back to the previous show op; print the op window between the two shows
  const prevShow = s.lastIndexOf(")Tj", i);
  const window = s.slice(Math.max(0, prevShow - 200), i + 100);
  console.log("=== the op window around the boundary ===");
  console.log(JSON.stringify(window));
  break;
}

// arXiv: a bibliography boundary "(" | "2023"
const ax = allStreams("/tmp/r106-corpus/arxiv-2404.16710.pdf");
console.log(`\narXiv: ${ax.length} text streams`);
let found = 0;
for (const s of ax) {
  const re2 = /\((\d{4})\)\s*Tj/g;
  let m2: RegExpExecArray | null;
  while ((m2 = re2.exec(s)) && found < 3) {
    const i = m2.index;
    const prev = s.lastIndexOf("Tj", i - 1);
    if (prev < 0) continue;
    const window = s.slice(Math.max(0, prev - 120), i + 60);
    if (window.includes("Tf") && !window.includes("Td") && !window.includes("Tm")) {
      console.log(`=== arXiv boundary window (${m2[1]}) ===`);
      console.log(JSON.stringify(window));
      found++;
    }
  }
  if (found >= 3) break;
}
