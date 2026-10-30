#!/usr/bin/env bun
// r109-rl-measure.ts — the 14th-writer forensics on the sourced ReportLab
// user guide: (1) our extraction vs pdftotext, member-for-member; (2) the
// WinAnsi font census (which fonts, which encodings, ToUnicode present?);
// (3) the raw-literal C1 census in actual page content streams.
// Usage: bun scripts/r109-rl-measure.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { inflateSync } from "node:zlib";
import { extractTextFromFile } from "../src/lib/cv-text";

const PATH = "/tmp/r109-hunt/rl-userguide.pdf";
const raw = readFileSync(PATH);
const buf = Buffer.from(raw);
const DEC = new TextDecoder("latin1");
const text = DEC.decode(raw);

// (1) our extraction
const ours = await extractTextFromFile(new File([new Uint8Array(raw)], "probe.pdf"));
const ourAlnum = (ours.match(/[A-Za-z0-9]/g) || []).length;
console.log(`our extraction: ${ours.length} chars, ${ourAlnum} alnums, ${ours.split("\n").length} lines`);

// pdftotext
const ref = execSync(`pdftotext -enc UTF-8 ${PATH} -`, { stdio: "pipe", maxBuffer: 64 << 20 }).toString();
const refAlnum = (ref.match(/[A-Za-z0-9]/g) || []).length;
console.log(`pdftotext:      ${ref.length} chars, ${refAlnum} alnums, ${ref.split("\n").length} lines`);

// C1 census in OUR output
let c1 = 0;
const c1Hist = new Map<string, number>();
for (const ch of ours) if (/[\u0080-\u009f]/.test(ch)) { c1++; c1Hist.set("U+" + ch.charCodeAt(0).toString(16).padStart(4, "0"), (c1Hist.get("U+" + ch.charCodeAt(0).toString(16).padStart(4, "0")) || 0) + 1); }
console.log(`our C1 chars: ${c1} hist=${JSON.stringify([...c1Hist.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10))}`);

// WinAnsi-mapped chars in pdftotext (the smart-punctuation family)
const smart = (ref.match(/[\u2018\u2019\u201C\u201D\u2013\u2014\u2026\u2022\u20AC\u2122\u2030\u2039\u203A]/g) || []).length;
const smartHist = new Map<string, number>();
for (const ch of ref.match(/[\u2018\u2019\u201C\u201D\u2013\u2014\u2026\u2022\u20AC\u2122\u2030\u2039\u203A]/g) || []) smartHist.set(ch, (smartHist.get(ch) || 0) + 1);
console.log(`pdftotext WinAnsi-mapped chars: ${smart} hist=${JSON.stringify([...smartHist.entries()])}`);

// ours reading the same family
const ourSmart = (ours.match(/[\u2018\u2019\u201C\u201D\u2013\u2014\u2026\u2022\u20AC\u2122\u2030\u2039\u203A]/g) || []).length;
const ourSmartHist = new Map<string, number>();
for (const ch of ours.match(/[\u2018\u2019\u201C\u201D\u2013\u2014\u2026\u2022\u20AC\u2122\u2030\u2039\u203A]/g) || []) ourSmartHist.set(ch, (ourSmartHist.get(ch) || 0) + 1);
console.log(`our WinAnsi-mapped chars:       ${ourSmart} hist=${JSON.stringify([...ourSmartHist.entries()])}`);

// (2) the font census: find font objects and their encodings + ToUnicode
const fontObjs: string[] = [];
const objRe = /(\d+)\s+0\s+obj\s*(<<[\s\S]*?>>)\s*(stream|endobj)/g;
let m: RegExpExecArray | null;
while ((m = objRe.exec(text)) !== null) {
  const body = m[2];
  if (/\/Type\s*\/Font/.test(body)) {
    const enc = (body.match(/\/Encoding\s*(\/\w+|\d+\s+0\s+R)/) || [])[1] || "none";
    const base = (body.match(/\/BaseFont\s*\/([\w#+,-]+)/) || [])[1] || "?";
    const tu = /\/ToUnicode/.test(body) ? "TU" : "--";
    fontObjs.push(`obj${m[1]}:${base}:${enc === "none" ? "noEnc" : enc.replace(/\s+/g, "")}:${tu}`);
  }
}
console.log(`\nfont objects (${fontObjs.length}):`);
for (const f of fontObjs) console.log("  " + f);

// (3) page-content raw-literal C1 census — streams referenced by /Contents
// simpler: every inflated stream that contains BT..ET text blocks
const contentStreams: string[] = [];
const streamRe = /stream\r?\n/g;
while ((m = streamRe.exec(text)) !== null) {
  const start = m.index + m[0].length;
  const end = text.indexOf("endstream", start);
  if (end < 0) break;
  try {
    const s = DEC.decode(inflateSync(buf.subarray(start, end)));
    if (/BT[\s\S]*?ET/.test(s) && /Tf|Tj|TJ/.test(s)) contentStreams.push(s);
  } catch { /* not flate */ }
}
console.log(`\ncontent streams: ${contentStreams.length}`);
let c1Lits = 0;
const c1LitHist = new Map<number, number>();
const litSamples: string[] = [];
for (const s of contentStreams) {
  const re = /\((?:\\.|[^\\()]){1,600}\)/g;
  let mm: RegExpExecArray | null;
  while ((mm = re.exec(s)) !== null) {
    const stripped = mm[0].replace(/\\[0-7]{1,3}|\\[nrtbf]|\\[()\\]|\\\r?\n/g, "");
    const c1m = stripped.match(/[\u0080-\u009f]/g);
    if (c1m) {
      c1Lits++;
      for (const c of c1m) c1LitHist.set(c.charCodeAt(0), (c1LitHist.get(c.charCodeAt(0)) || 0) + 1);
      if (litSamples.length < 6) litSamples.push(stripped.slice(1, 70).replace(/[\u0080-\u009f]/g, (c) => `<${c.charCodeAt(0).toString(16)}>`));
    }
  }
}
console.log(`raw C1 literals in content streams: ${c1Lits} byteHist=${JSON.stringify([...c1LitHist.entries()].map(([k, v]) => ["0x" + (k as number).toString(16), v] as [string, number]).sort((a, b) => b[1] - a[1]).slice(0, 12))}`);
for (const s of litSamples) console.log(`  ex: ${JSON.stringify(s)}`);
