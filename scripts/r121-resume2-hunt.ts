// r121-resume2-hunt.ts — the r121 queue's named hunt class: the resume2
// INTRA-BLOCK under-tracking (the per-word position surface). The r120
// kern-sign fix cured the inter-block form; the standing watch reads
// resume2's pair at 22.21 em vs the true 4.99 (poppler's word boxes).
// This census measures EVERY same-baseline boundary pair on resume2:
// our tracked gapEm vs poppler's true gap, isolating the mis-tracked
// pieces and their anatomy (per-word pieces? kerns? the walk's stamps?).
// Usage: bun scripts/r121-resume2-hunt.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("./protos/cv-text-proto");
type S = { px?: number; py?: number; ps?: number; bx?: number; font?: string };
type P = { p?: S; text: string };

const path = "/tmp/typst-cv/resume2.pdf";
const pageH = 842;

// poppler's own words (the ground truth)
const xml = execSync(`pdftotext -bbox-layout ${path} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 }).toString();
type W = { text: string; x0: number; y0: number; x1: number; y1: number; page: number; line: number };
const words: W[] = [];
let page = -1, lineId = 0;
const events: { at: number; kind: "p" | "l" }[] = [];
let m: RegExpExecArray | null;
const pageRe = /<page /g, lineRe = /<line /g, wordRe = /<word xMin="([\d.-]+)" yMin="([\d.-]+)" xMax="([\d.-]+)" yMax="([\d.-]+)">([^<]*)<\/word>/g;
while ((m = pageRe.exec(xml))) events.push({ at: m.index, kind: "p" });
while ((m = lineRe.exec(xml))) events.push({ at: m.index, kind: "l" });
events.sort((a, b) => a.at - b.at);
let ei = 0;
while ((m = wordRe.exec(xml))) {
  while (ei < events.length && events[ei].at < m.index) {
    if (events[ei].kind === "p") { page++; lineId = 0; } else lineId++;
    ei++;
  }
  words.push({ text: m[5], x0: +m[1], y0: +m[2], x1: +m[3], y1: +m[4], page, line: lineId });
}

// our extraction with the debug surfaces
(globalThis as unknown as { __r119pages: P[][] }).__r119pages = [];
await mod.extractTextFromFile(new File([new Uint8Array(readFileSync(path))], "m.pdf"));
const parts = (globalThis as unknown as { __r119pages: P[][] }).__r119pages;
console.log(`parts: ${parts.length}, poppler words: ${words.length}`);

// find the max-gap pair per part (the standing watch: 22.21 em)
for (let pi = 0; pi < parts.length; pi++) {
  const decoded = parts[pi];
  for (let i = 1; i < decoded.length; i++) {
    const d = decoded[i], e = decoded[i - 1];
    const p = d.p, q = e.p;
    if (!p || !q || p.px === undefined || p.py === undefined || p.ps === undefined) continue;
    if (q.px === undefined || q.py === undefined || q.ps === undefined || q.bx === undefined) continue;
    if (Math.abs(q.px - p.px) < 0.01) continue;
    if (Math.abs(q.py - p.py) >= 0.5 * Math.max(q.ps, p.ps)) continue;
    const gapEm = (p.px - q.bx) / Math.max(q.ps, p.ps);
    if (gapEm < 5) continue; // the big under-trackings only
    // poppler truth: the words nearest the boundary on this line
    const yTop = pageH - p.py;
    const cand = words.filter((w) => w.page === pi && Math.abs((w.y0 + w.y1) / 2 - yTop) < 8);
    // our left block: walk back over spaces
    let j = i - 1;
    while (j >= 0 && decoded[j].text.length > 0 && /^ +$/.test(decoded[j].text)) j--;
    const leftTxt = decoded[j]?.text ?? "";
    const rightTxt = d.text;
    const lw = cand.filter((w) => leftTxt.includes(w.text)).sort((a, b) => b.x1 - a.x1)[0];
    const rw = cand.filter((w) => rightTxt.includes(w.text)).sort((a, b) => a.x0 - b.x0)[0];
    const trueGap = lw && rw ? (rw.x0 - lw.x1) / Math.max(q.ps, p.ps) : null;
    const verdict = lw && rw ? (lw.line === rw.line ? "JOIN" : "SPLIT") : "?";
    console.log(
      `part ${pi} pair: ours ${gapEm.toFixed(2)} em | true ${trueGap === null ? "?" : trueGap.toFixed(2)} em | ${verdict}` +
      ` | left "${leftTxt.slice(0, 28)}" (px ${q.px?.toFixed(1)} bx ${q.bx?.toFixed(1)}) -> right "${rightTxt.slice(0, 20)}" (px ${p.px?.toFixed(1)})` +
      ` | font ${q.font ?? "?"}->${p.font ?? "?"} ps ${q.ps?.toFixed(1)}/${p.ps?.toFixed(1)}`
    );
    // the anatomy: dump the left block's piece run (the per-word surface)
    const runStart = Math.max(0, i - 14);
    for (let k = runStart; k <= i; k++) {
      const pk = decoded[k];
      const s = pk.p;
      console.log(
        `    [${k}] "${pk.text.slice(0, 24)}" px ${s?.px?.toFixed(1) ?? "-"} py ${s?.py?.toFixed(1) ?? "-"} ps ${s?.ps?.toFixed(1) ?? "-"} bx ${s?.bx?.toFixed(1) ?? "-"} font ${s?.font ?? "?"}`
      );
    }
  }
}
