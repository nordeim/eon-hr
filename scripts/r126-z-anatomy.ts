// r126-z-anatomy.ts — the deep anatomy of the 'z' pocket: which page, the
// full line text, the f-0-0 font's /Widths bounds, and the pdftotext -bbox
// ground truth for the glyph's real advance.
// Usage: bun scripts/r126-z-anatomy.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("/home/z/my-project/eon-hr/scripts/protos/cv-text-proto");
const path = "/tmp/r106-corpus/arxiv-2404.16710.pdf";
const raw = readFileSync(path);
const ascii = raw.toString("latin1");

(globalThis as any).__r119pages = [];
(globalThis as any).__r118pieces = [];
await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
const pages = ((globalThis as any).__r119pages ?? []) as any[][];
const flat = ((globalThis as any).__r118pieces ?? []) as any[];

// find the 'z' piece and its page
let zPageIdx = -1, zPiece: any = null;
pages.forEach((parts, pi) => {
  for (const d of parts) {
    const e = d as any;
    if (e?.p?.font === "f-0-0" && e.text === "z") { zPageIdx = pi; zPiece = e; }
  }
});
console.log(`the 'z' piece: page index ${zPageIdx} (page ${zPageIdx + 1}), px=${zPiece?.p?.px} py=${zPiece?.p?.py} ps=${zPiece?.p?.ps}`);

// the full page text around the 'z' — same py band, sorted by px
if (zPiece) {
  const band = flat.filter((p: any) => p.py !== undefined && Math.abs(p.py - zPiece.p.py) < 3).sort((a: any, b: any) => a.px - b.px);
  console.log(`\nthe py band (${band.length} pieces):`);
  console.log(band.map((p: any) => (p.text || "·").replace(/\s+/g, "␣")).join(""));
  const near = flat.filter((p: any) => p.px !== undefined && Math.abs(p.py - (zPiece.p.py ?? 0)) < 60 && p.px > zPiece.p.px - 300 && p.px < zPiece.p.px + 300).sort((a: any, b: any) => (a.py ?? 0) - (b.py ?? 0));
  console.log(`\nnearby rows (py window ±60):`);
  const rows = new Map<number, any[]>();
  for (const p of near) { const k = Math.round(p.py ?? 0); (rows.get(k) ?? rows.set(k, []).get(k)!).push(p); }
  for (const [py, ps] of [...rows.entries()].sort((a, b) => a[0] - b[0]).slice(0, 12)) {
    console.log(`  py=${py}: ${ps.sort((a: any, b: any) => a.px - b.px).map((p: any) => (p.text || "·").slice(0, 40)).join(" | ")}`);
  }
}

// the f-0-0 font objects — find ALL font dicts (the /Widths in the dict, no stream needed)
console.log("\n--- the f-0-0-class font dicts (Type1 subsets with /Widths) ---");
const seen = new Set<number>();
for (const m of ascii.matchAll(/(\d+) 0 obj\s*<<([\s\S]{0,1200}?)>>/g)) {
  const body = m[2];
  if (!body.includes("/Widths") || !body.includes("/FontFile")) {
    // font dicts may be small: match /Subtype /Type1 + /Widths without FontFile
    if (!body.includes("/Widths")) continue;
  }
  const num = Number(m[1]);
  if (seen.has(num)) continue;
  const fc = body.match(/\/FirstChar\s+(\d+)/)?.[1];
  const lc = body.match(/\/LastChar\s+(\d+)/)?.[1];
  if (!fc || !lc) continue;
  const wArr = body.match(/\/Widths\s*\[([\s\S]*?)\]/)?.[1];
  const bf = body.match(/\/BaseFont\s*\/([^\s/>]+)/)?.[1];
  const sub = body.match(/\/Subtype\s*\/(\w+)/)?.[1];
  const enc = body.match(/\/Encoding[^\/]*?(\/WinAnsiEncoding|\/MacRomanEncoding|\/Differences)/)?.[1];
  const mw = body.match(/\/MissingWidth\s+(-?\d+)/)?.[1];
  if (wArr) {
    const widths = wArr.trim().split(/[\s]+/).map(Number).filter((n: number) => !Number.isNaN(n));
    seen.add(num);
    console.log(`obj ${num}: ${bf ?? "?"} (${sub}) FC=${fc} LC=${lc} n=${widths.length} MW=${mw ?? "-"} enc=${enc ?? "-"} | code122: ${122 >= Number(fc) && 122 - Number(fc) < widths.length ? widths[122 - Number(fc)] : "OUTSIDE"} | last width ${widths[widths.length - 1]}`);
  }
}
