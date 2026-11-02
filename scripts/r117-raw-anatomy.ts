// r117-raw-anatomy.ts — dump the raw Typst operators around the description
// line (py≈560.5) and the title line (py≈588.5) to decode the exact Tm/cm
// form — which operator carries the word x-offset, and what the R112-A
// stamp actually captures.
// Usage: bun scripts/r117-raw-anatomy.ts
import { readFileSync } from "node:fs";
import zlib from "node:zlib";

const raw = readFileSync("/tmp/typst-cv/resume.pdf");
const rawStr = raw.toString("latin1");
const streamRe = /stream\r?\n/g;
let m: RegExpExecArray | null;
const streams: string[] = [];
while ((m = streamRe.exec(rawStr))) {
  const start = m.index + m[0].length;
  const end = rawStr.indexOf("endstream", start);
  if (end < 0) continue;
  const chunk = rawStr.slice(start, end);
  for (const attempt of [() => zlib.inflateSync(Buffer.from(chunk, "latin1")), () => zlib.inflateRawSync(Buffer.from(chunk, "latin1"))]) {
    try {
      const out = attempt().toString("latin1");
      if (out.includes("BT")) streams.push(out);
      break;
    } catch { /* next */ }
  }
}
console.log("content streams:", streams.length);
const content = streams.join("\n");

// find the block containing the description text "onbo" + "arding"
// (the justified line) and "chCorp" (the title line)
for (const needle of ["arding compliance", "chCorp", "Mar 2021", "TechCorp"]) {
  const i = content.indexOf(needle);
  console.log(`\n===== raw context around "${needle}" (idx ${i}) =====`);
  if (i < 0) { console.log("not found"); continue; }
  // print 500 chars back and 120 forward, newlines visible
  const s = Math.max(0, i - 500);
  console.log(content.slice(s, i + 140).replace(/\n/g, "⏎"));
}
