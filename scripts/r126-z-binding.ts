// r126-z-binding.ts — which objNum carries the 'z' piece, what the
// pageFonts map binds f-0-0 to there (the page binding vs the candidate
// chain), and the pdftotext -bbox ground truth for the 'z' glyph advance.
// Usage: bun scripts/r126-z-binding.ts
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const SRC = "/home/z/my-project/eon-hr/scripts/protos/cv-text-proto.ts";
const PATCHED = "/tmp/r126-bind-proto.ts";
let src = readFileSync(SRC, "utf8");

// log the f-0-0 width resolutions with the part's objNum + page binding
const anchor = `        const we = widthFor(piece.font);
        if (!we) { blind = true; continue; }`;
const patched = `        const we = widthFor(piece.font);
        if (piece.font === "f-0-0") { const __arr = ((globalThis as any).__r126f00 ??= []); __arr.push({ objNum, pageBind: pageMap?.get("f-0-0"), text: (piece as any).text?.slice(0, 8), px: piece.px, got: !!we, def: we?.def, codeLen: we?.codeLen }); }
        if (!we) { blind = true; continue; }`;
if (!src.includes(anchor)) throw new Error("anchor not found");
src = src.replace(anchor, patched);
writeFileSync("/tmp/r126-bind-proto.ts", src);

const mod = await import(PATCHED);
const path = "/tmp/r106-corpus/arxiv-2404.16710.pdf";
const raw = readFileSync(path);

(globalThis as any).__r126f00 = [];
(globalThis as any).__r119pages = [];
(globalThis as any).__r118pieces = [];
await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
const binds = ((globalThis as any).__r126f00 ?? []) as any[];
console.log(`f-0-0 width resolutions: ${binds.length}`);
const byObj = new Map<number, any[]>();
for (const b of binds) (byObj.get(b.objNum) ?? byObj.set(b.objNum, []).get(b.objNum)!).push(b);
for (const [obj, list] of [...byObj.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 12)) {
  const binds0 = list[0].pageBind;
  const texts = list.map((b) => b.text).join("").slice(0, 60);
  console.log(`obj ${obj}: ${list.length} f-0-0 pieces · pageBind=${binds0} · def=${list[0].def} codeLen=${list[0].codeLen} · text="${texts}"`);
  const blind = list.filter((b) => b.text === "z");
  for (const z of blind) console.log(`   the z: px=${z.px.toFixed(2)} got=${z.got}`);
}

// the pdftotext bbox ground truth for the 'z' region (page 8)
console.log("\n--- pdftotext -bbox -f 8 -l 8 ground truth (words near the sized row) ---");
try {
  const bbox = execSync(`pdftotext -bbox -f 8 -l 8 ${path} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
  const words = [...bbox.matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]+)<\/word>/g)];
  const zWords = words.filter((w) => Math.abs(Number(w[2]) - 38) < 30 && Number(w[1]) > 1000);
  for (const w of zWords) console.log(`pdftotext word: xMin=${w[1]} yMin=${w[2]} xMax=${w[3]} text="${w[5]}"`);
} catch (e) { console.log("bbox failed:", String(e).slice(0, 200)); }
