// r127-f01-ops.ts — dump the text-showing ops (BT..ET blocks) from the
// motivation form's content stream, focusing on the f-0-1 row ("to create
// different sized models with shared weights" — ps 54 display class). The
// Type0/Identity-H encoding means 2-byte CID codes; the /W covers only CID 0
// (278) and 1 (556) — what CID does the ﬀ ligature ride, and what advance
// does the walk give it?
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const raw = readFileSync("/tmp/r106-corpus/arxiv-2404.16710.pdf");
const latin = new TextDecoder("latin1");
const src = latin.decode(raw);

const objIdx = src.indexOf("321 0 obj");
const streamIdx = src.indexOf("stream", objIdx);
const dataStart = streamIdx + "stream".length;
const skip = src[dataStart] === "\n" ? 1 : src[dataStart] === "\r" && src[dataStart + 1] === "\n" ? 2 : 0;
const dataEnd = src.indexOf("endstream", dataStart);
const content = inflateSync(raw.subarray(dataStart + skip, dataEnd)).toString("latin1");

// Extract every BT..ET block; inside, show the Tf/Td/Tm/Tj/TJ ops.
const btRe = /BT([\s\S]*?)ET/g;
let m: RegExpExecArray | null;
let blocks = 0;
const rows: string[] = [];
while ((m = btRe.exec(content))) {
  blocks++;
  const body = m[1];
  if (!/(Tj|TJ|'|")/.test(body)) continue;
  rows.push(body.replace(/\s+/g, " ").trim());
}
console.log(`BT blocks: ${blocks}, text-bearing: ${rows.length}`);

// The f-0-1 rows: find blocks with /f-0-1
const f01 = rows.filter((r) => r.includes("f-0-1"));
console.log(`\nf-0-1 text blocks: ${f01.length}`);
for (const r of f01.slice(0, 30)) console.log(`  ${r.slice(0, 400)}`);

// Also the f-0-0 rows for the same figure (the 'z' row)
const f00 = rows.filter((r) => r.includes("f-0-0"));
console.log(`\nf-0-0 text blocks: ${f00.length}`);
for (const r of f00.slice(0, 12)) console.log(`  ${r.slice(0, 400)}`);
