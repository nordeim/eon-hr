#!/usr/bin/env node
// r107-stream-2836-trace.mjs — the band-kern stream's decoded output: what
// do the <01> <02> <03>… atoms decode to through the font chain, and what
// does the walk's separator produce between them? This decides whether the
// −113..−154 kerns split REAL WORDS (the defect) or subset-glyph sequences
// whose decode is harmless.
import { execSync } from "node:child_process";
import fs from "node:fs";

const { inflate } = await import("./r101-inflate.ts");
const path = "/tmp/r107-corpus/lo-calc.pdf";
const bytes = fs.readFileSync(path);
const ascii = Buffer.from(bytes).toString("latin1");

// locate stream @9729698 (obj 2836)
const m = { index: 9729698 };
const streamRe = /stream[ \t]*(?:\r\n|\r|\n)/;
const at = ascii.slice(m.index).match(streamRe);
const start = m.index + at.index + at[0].length;
const end = ascii.indexOf("endstream", start);
let chunkEnd = end;
if (ascii.charCodeAt(chunkEnd - 2) === 13 && ascii.charCodeAt(chunkEnd - 1) === 10) chunkEnd -= 2;
else if (ascii.charCodeAt(chunkEnd - 1) === 10 || ascii.charCodeAt(chunkEnd - 1) === 13) chunkEnd -= 1;
const text = new TextDecoder().decode(await inflate(bytes.subarray(start, chunkEnd)));
console.log("stream 2836 length:", text.length);

// the fonts this stream selects (the Tf census)
for (const tf of text.matchAll(/\/(F\w+)\s+([\d.]+)\s+Tf/g)) console.log("Tf:", tf[1], tf[2]);

// dump the full TJ arrays carrying band kerns with 4 atoms of context each
const atomRe = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>|(-?[\d.]+)/g;
for (const tj of text.matchAll(/\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ/g)) {
  const atoms = [];
  let a;
  while ((a = atomRe.exec(tj[1]))) {
    if (a[1] !== undefined) atoms.push({ t: "lit", v: a[1] });
    else if (a[2] !== undefined) atoms.push({ t: "hex", v: a[2].replace(/\s+/g, "") });
    else atoms.push({ t: "num", v: parseFloat(a[3]) });
  }
  // any consecutive-number sum in the band?
  let kern = 0; let band = false;
  for (const x of atoms) {
    if (x.t === "num") kern += x.v;
    else {
      if (kern <= -100 && kern >= -200) { band = true; break; }
      kern = 0;
    }
  }
  if (!band) continue;
  // print the whole array compactly
  console.log("\nBAND TJ ARRAY:", atoms.map((x) => (x.t === "num" ? x.v : x.t === "lit" ? `(${x.v})` : `<${x.v}>`)).join(" ").slice(0, 600));
}
console.log("\nTRACE DONE");
process.exit(0);
