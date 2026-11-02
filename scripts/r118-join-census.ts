// r118-join-census.ts — the definitive JOIN-gap census: for every pdftotext
// OUTPUT LINE (a true join is words on one output line), measure the true
// internal word gaps from pdftotext -bbox. This is the ground truth for
// "what gap does pdftotext actually keep joined" — the r117 claim "the
// highest measured true-gap join = 11.78em (Prawn chart ticks)" re-verified
// from scratch. Usage: bun scripts/r118-join-census.ts <pdf>
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const path = process.argv[2] ?? "/tmp/r110-prawn-manual.pdf";
const xml = execSync(`pdftotext -bbox ${path} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }).toString();

type W = { text: string; x0: number; y0: number; x1: number; y1: number };
const words: W[] = [];
const wRe = /<word xMin="([\d.-]+)" yMin="([\d.-]+)" xMax="([\d.-]+)" yMax="([\d.-]+)">([^<]*)<\/word>/g;
let m: RegExpExecArray | null;
while ((m = wRe.exec(xml))) words.push({ text: m[5], x0: +m[1], y0: +m[2], x1: +m[3], y1: +m[4] });

// reconstruct pdftotext's default output lines from the bbox words: poppler
// emits words in the same order as the text output; the LINE breaks in the
// default output are the boundaries. Simplest ground truth: read the default
// output text and match each output LINE's word sequence against the bbox
// stream to find its words' geometry.
const text = execSync(`pdftotext ${path} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 }).toString();
const lines = text.split("\n").filter(l => l.trim().length > 0);

// build a word stream with line indices from the default output itself:
// the output preserves word order; words per line split on whitespace.
const outWords: { text: string; line: number }[] = [];
lines.forEach((l, li) => { for (const w of l.split(/\s+/)) if (w) outWords.push({ text: w, line: li }); });

// match outWords against bbox words in order (both follow the extraction order)
if (outWords.length > words.length + 50) { console.error(`word count mismatch: out ${outWords.length} vs bbox ${words.length}`); }
let wi = 0;
const maxGapPerLine = new Map<number, number>();
const pairDetail: { line: number; gap: number; em: number; h: number; a: string; b: string; li: number }[] = [];
for (let oi = 0; oi < outWords.length && wi < words.length; oi++) {
  // find the bbox word matching outWords[oi] at/after wi
  let j = wi;
  while (j < words.length && words[j].text !== outWords[oi].text) j++;
  if (j >= words.length) continue; // unmatched (unicode fold differences)
  const cur = words[j];
  if (oi > 0 && outWords[oi].line === outWords[oi - 1].line) {
    const prev = words[wi - 1 >= 0 ? wi - 1 : 0];
    // prev bbox word = the one matched at oi-1: track via a small map instead
  }
  wi = j + 1;
}
// simpler second pass: pair consecutive bbox matches directly
wi = 0;
const matched: { text: string; line: number; w: W }[] = [];
for (let oi = 0; oi < outWords.length; oi++) {
  let j = wi;
  while (j < words.length && words[j].text !== outWords[oi].text) j++;
  if (j >= words.length) continue;
  matched.push({ text: outWords[oi].text, line: outWords[oi].line, w: words[j] });
  wi = j + 1;
}
for (let k = 1; k < matched.length; k++) {
  const a = matched[k - 1], b = matched[k];
  if (a.line !== b.line) continue;
  const gap = b.w.x0 - a.w.x1;
  const h = Math.max(1e-6, Math.min(a.w.y1 - a.w.y0, b.w.y1 - b.w.y0));
  pairDetail.push({ line: a.line, gap, em: gap / h, h, a: a.text, b: b.text, li: k });
}
pairDetail.sort((p, q) => q.em - p.em);
console.log(`matched ${matched.length}/${outWords.length} output words; same-line pairs ${pairDetail.length}`);
console.log("TOP 25 same-line true-gap pairs (em):");
for (const p of pairDetail.slice(0, 25)) {
  console.log(`  line ${p.line}: ${p.em.toFixed(2)}em (${p.gap.toFixed(1)}pt, h=${p.h.toFixed(1)}) ${JSON.stringify(p.a)} -> ${JSON.stringify(p.b)}`);
}
