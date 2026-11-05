// r127-ff-anatomy.ts — the ﬀ ligature anatomy in the motivation form: the
// content stream's actual ops around the ligature glyph, the width tables of
// the form's own subsets (obj 439 f-0-0, obj 440 f-0-1), and the per-glyph
// positions of the "to create different sized..." row.
import { readFileSync } from "node:fs";

const raw = readFileSync("/tmp/r106-corpus/arxiv-2404.16710.pdf");
const latin = new TextDecoder("latin1");
const src = latin.decode(raw);

// find object N
function obj(n: number): string {
  const re = new RegExp(`${n} 0 obj([\\s\\S]*?)endobj`, "g");
  const m = re.exec(src);
  return m ? m[1] : "";
}

// The motivation form = obj 321, its fonts f-0-0 -> 439, f-0-1 -> 440.
for (const n of [321, 439, 440]) {
  const o = obj(n);
  const head = o.slice(0, 600).replace(/\s+/g, " ");
  console.log(`=== obj ${n} (first 600 chars) ===\n${head}\n`);
}

// The form's stream content: decode the Flate stream. Use node zlib.
import { inflateSync } from "node:zlib";
const form = obj(321);
const sm = form.match(/stream\r?\n([\s\S]*?)endstream/);
if (!sm) { console.log("no stream in obj 321"); process.exit(1); }
const streamBytes = raw.subarray(raw.indexOf(Buffer.from("stream\n", "latin1"), raw.indexOf(Buffer.from("321 0 obj", "latin1"))) + 7);
// simpler: find via index arithmetic on the matched string region
const objIdx = src.indexOf("321 0 obj");
const streamIdx = src.indexOf("stream", objIdx);
const dataStart = streamIdx + "stream".length;
const skip = src[dataStart] === "\n" ? 1 : src[dataStart] === "\r" && src[dataStart + 1] === "\n" ? 2 : 0;
const dataEnd = src.indexOf("endstream", dataStart);
const zbuf = raw.subarray(dataStart + skip, dataEnd);
let content: string;
try {
  content = inflateSync(zbuf).toString("latin1");
  console.log(`obj 321 stream: ${zbuf.length} compressed -> ${content.length} inflated`);
} catch (e) {
  console.log("inflate failed:", String(e));
  process.exit(1);
}

// Show the ops: every Tf/Td/Tm/Tj around the ﬀ code. The ﬀ in f-0-1 — find
// the font's code for ﬀ via obj 440's ToUnicode (or infer from the walk).
// Print a window of the content around each single-glyph show sequence.
const lines = content.split("\n");
console.log(`\n=== the content ops (first 120 lines) ===`);
for (const l of lines.slice(0, 120)) console.log(l);

// The width tables: obj 439 + 440 /W arrays
for (const n of [439, 440]) {
  const o = obj(n);
  const wm = o.match(/\/W\s*\[([\s\S]*?)\]/);
  console.log(`\n=== obj ${n} /W ===`);
  console.log(wm ? wm[1].replace(/\s+/g, " ").slice(0, 800) : "NO /W");
  const fc = o.match(/\/FirstChar\s+(\d+)/); const lc = o.match(/\/LastChar\s+(\d+)/);
  console.log(`FirstChar ${fc?.[1]} LastChar ${lc?.[1]}`);
}
