// r127-f01-binding.ts — verify the f-0-1 binding target: the form declares
// /f-0-1 440 0 R, but obj 440 looks like a FontFile STREAM (a raw Type1
// program with /Length1), not a font dict. Map the objects 435-445 and find
// where f-0-1's REAL font dict lives (the /FontFile2 back-reference trail),
// then check how the walk's widthFor/ToUnicode resolution handles the
// FontFile-as-font misbinding.
import { readFileSync } from "node:fs";

const raw = readFileSync("/tmp/r106-corpus/arxiv-2404.16710.pdf");
const latin = new TextDecoder("latin1");
const src = latin.decode(raw);

function obj(n: number): string {
  const re = new RegExp(`(?:^|\\s)${n} 0 obj([\\s\\S]*?)endobj`, "g");
  const m = re.exec(src);
  return m ? m[1] : "";
}

console.log("=== the object neighborhood 435-445 ===");
for (let n = 435; n <= 445; n++) {
  const o = obj(n);
  if (!o) { console.log(`obj ${n}: NOT FOUND`); continue; }
  const isStream = /stream\r?\n/.test(o);
  const head = o.slice(0, 260).replace(/\s+/g, " ");
  console.log(`obj ${n} (${isStream ? "STREAM" : "dict"}): ${head}${o.length > 260 ? " …" : ""}`);
}

// Who references 440? (the /FontFile2 trail) — and who references the OTHER
// font dicts (436-438, 441-442)?
console.log("\n=== the reference census (which objects reference 435-445) ===");
for (let n = 435; n <= 445; n++) {
  const re = new RegExp(`${n} 0 R`, "g");
  const hits: string[] = [];
  let m: RegExpExecArray | null;
  const objRe = /(?:^|\s)(\d+) 0 obj/g;
  const positions: Array<{ start: number; num: string }> = [];
  let om: RegExpExecArray | null;
  while ((om = objRe.exec(src))) positions.push({ start: om.index, num: om[1] });
  while ((m = re.exec(src))) {
    // find the object containing this position
    let lo = 0;
    for (const p of positions) { if (p.start < m.index) lo = p.start; else break; }
    const num = positions.find((p) => p.start === lo)?.num ?? "?";
    hits.push(num);
  }
  console.log(`${n} 0 R referenced by objects: ${[...new Set(hits)].join(", ") || "NONE"}`);
}

// The full form 321 dict (already known) — re-print the /Font line, and the
// OTHER matplotlib forms' /Font lines for comparison (181, 547, 548).
for (const n of [181, 321, 547, 548]) {
  const o = obj(n);
  const fm = o.match(/\/Font\s*<<\s*([\s\S]*?)>>/);
  console.log(`\nform obj ${n} /Font: ${fm ? fm[1].replace(/\s+/g, " ").trim() : "NONE"}`);
}
