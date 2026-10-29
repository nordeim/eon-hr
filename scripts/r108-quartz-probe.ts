// r108-quartz-probe.ts — the 13th-writer hunt's success follow-up: measure
// how the current extractor reads the FIRST-EVER-SOURCED macOS Quartz
// PDFContext file (longer.pdf — Producer "macOS Version 26.5 (Build 25F71)
// Quartz PDFContext", Bear-authored, PDF 1.3, 2 pages). The protocol: the
// extraction yield, the writer-form census (BT/TJ/Tj/Td/Tm/Tf operator
// counts, the atom forms, the kern magnitudes), the word-integrity probes,
// and — where the yield looks wrong — the pdftotext reference read.
// Usage: bun scripts/r108-quartz-probe.ts
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { extractTextFromFile } from "../src/lib/cv-text";

const path = "/tmp/r108-quartz/quartz-longer.pdf";
const raw = readFileSync(path);
console.log("file:", path, raw.length, "bytes");

// (1) the extraction
const blob = new File([new Uint8Array(raw)], "quartz.pdf", { type: "application/pdf" });
const text = await extractTextFromFile(blob);
const alnums = text.replace(/[^A-Za-z0-9]/g, "").length;
console.log("\n===== THE EXTRACTION =====");
console.log("alnums:", alnums, "· lines:", text.split("\n").length);
console.log("HEAD:");
console.log(text.slice(0, 1200));
console.log("TAIL:");
console.log(text.slice(-500));

// (2) the word-integrity probes (the standing corpus discipline)
const soupRuns = text.match(/\b[a-z](?:\s+[a-z]){2,}/gi) || [];
console.log("\nletter-soup runs:", soupRuns.length, soupRuns.slice(0, 6));
const words = ["Lorem", "ipsum", "dolor", "commodo", "consequat", "Excepteur", "occaecat", "second", "page"];
console.log("word probes:", words.map((w) => `${w}=${text.includes(w)}`).join(" "));

// (3) the writer-form census (every content stream, decompressed)
console.log("\n===== THE WRITER-FORM CENSUS =====");
let streams = 0;
const kerns: number[] = [];
const gapBand: number[] = [];
let bt = 0, tj = 0, tjSimple = 0, td = 0, tm = 0, tf = 0, tStar = 0;
let hexAtoms = 0, litAtoms = 0;
const re = /stream\r?\n([\s\S]*?)endstream/g;
let m: RegExpExecArray | null;
while ((m = re.exec(raw.toString("latin1"))) !== null) {
  const dictStart = raw.toString("latin1").lastIndexOf("<<", m.index);
  const dict = raw.toString("latin1").slice(Math.max(0, dictStart), m.index);
  let body = m[1];
  if (/\/FlateDecode/.test(dict)) {
    try { body = inflateSync(Buffer.from(body, "latin1")).toString("latin1"); } catch { continue; }
  }
  if (!/(BT|Tj|TJ)/.test(body)) continue;
  streams++;
  bt += (body.match(/\bBT\b/g) || []).length;
  tj += (body.match(/\bTJ\b/g) || []).length;
  tjSimple += (body.match(/\bTj\b/g) || []).length;
  td += (body.match(/\bTd\b/g) || []).length;
  tm += (body.match(/\bTm\b/g) || []).length;
  tf += (body.match(/\bTf\b/g) || []).length;
  tStar += (body.match(/\bT\*/g) || []).length;
  hexAtoms += (body.match(/<[0-9A-Fa-f]+>/g) || []).length;
  litAtoms += (body.match(/\((?:[^()\\]|\\.)*\)/g) || []).length;
  for (const km of body.matchAll(/\((-?\d+(?:\.\d+)?)\)\s*(?=[<(]|Tj|TJ)/g)) {
    const v = parseFloat(km[1]);
    if (v < 0) { kerns.push(v); if (v <= -100 && v > -200) gapBand.push(v); }
  }
}
console.log(`content streams: ${streams} · BT=${bt} TJ=${tj} Tj=${tjSimple} Td=${td} Tm=${tm} Tf=${tf} T*=${tStar}`);
console.log(`atoms: hex=${hexAtoms} literal=${litAtoms}`);
console.log(`negative inter-atom numbers: ${kerns.length}; in the (−200,−100] band: ${gapBand.length}`, gapBand.slice(0, 10));
console.log(`kern range: ${kerns.length ? Math.min(...kerns) + " .. " + Math.max(...kerns) : "none"}`);
process.exit(0);
