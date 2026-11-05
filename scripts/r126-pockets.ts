// r126-pockets.ts — the r126 hunt's anatomy leg: for each measured blind
// event on arXiv (the 11 empty-raw events + the 1 code-uncovered 'z'),
// dump (a) the block context — the pieces sharing the blind piece's
// origin/baseline run, and whether subsequent pieces were blinded (the
// damage census); (b) the f-0-0 font object's /Widths + /FirstChar +
// /LastChar + /MissingWidth for the 'z' class; (c) the pdftotext -bbox
// ground truth around the 'z' piece.
// Usage: bun scripts/r126-pockets.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("/home/z/my-project/eon-hr/scripts/protos/cv-text-proto");

const path = "/tmp/r106-corpus/arxiv-2404.16710.pdf";
const raw = readFileSync(path);
const ascii = raw.toString("latin1");

(globalThis as any).__r119pages = [];
(globalThis as any).__r118pieces = [];
await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
const allPieces = ((globalThis as any).__r118pieces ?? []) as any[];

// ---- (a) the empty-raw pieces: find them in the decoded piece stream ----
console.log("=== (a) the empty-raw blind pieces (kind=lit, raw empty, codeLen-2 fonts) ===");
const empties = allPieces.filter((p: any) => p.kind === "lit" && (p.raw ?? "") === "" && p.px !== undefined && p.ps !== undefined);
console.log(`empty-raw positioned pieces: ${empties.length}`);
for (const e of empties.slice(0, 12)) {
  // the block = pieces on the same run (same origin px within 0.01, same py)
  const block = allPieces.filter((p: any) => p.px !== undefined && Math.abs((p.py ?? e.py ?? 0) - (e.py ?? 0)) < 0.01 && p.px >= (e.px ?? 0) - 300 && p.px <= (e.px ?? 0) + 300 && Math.abs(p.px - (e.px ?? 0)) < 300);
  const after = block.filter((p: any) => p.px > (e.px ?? 0) + 0.01 || (p.px === e.px && p !== e));
  const afterBlind = after.filter((p: any) => p.bx === undefined && p.text && p.text.length > 0);
  console.log(`- font=${e.font} px=${e.px?.toFixed?.(2)} py=${e.py?.toFixed?.(2)} ps=${e.ps} | block=${block.length} pieces, ${after.length} after, ${afterBlind.length} text-pieces after it WITHOUT bx (the damage)`);
  if (afterBlind.length) console.log(`  damaged samples: ${afterBlind.slice(0, 3).map((p: any) => JSON.stringify((p.text ?? "").slice(0, 18))).join(" ")}`);
}

// ---- (b) the 'z' piece + the f-0-0 font anatomy ----
console.log("\n=== (b) the 'z' piece + the f-0-0 font anatomy ===");
const zPieces = allPieces.filter((p: any) => p.font === "f-0-0" && (p.text ?? "").includes("z") && p.px !== undefined);
const zBlind = zPieces.filter((p: any) => p.bx === undefined);
console.log(`f-0-0 pieces containing 'z': ${zPieces.length}, of which bx-blind: ${zBlind.length}`);
for (const z of zBlind.slice(0, 3)) {
  const near = allPieces.filter((p: any) => p.py !== undefined && Math.abs(p.py - (z.py ?? 0)) < 2 && p.px !== undefined && Math.abs(p.px - (z.px ?? 0)) < 250).sort((a: any, b: any) => a.px - b.px);
  console.log(`- px=${z.px?.toFixed?.(2)} py=${z.py?.toFixed?.(2)} ps=${z.ps} rawLen=${(z.raw ?? "").length} text=${JSON.stringify((z.text ?? "").slice(0, 30))}`);
  console.log(`  line context: ${near.slice(0, 6).map((p: any) => JSON.stringify((p.text ?? "").slice(0, 14))).join(" ")}`);
}

// the f-0-0 font objects: dump every font object carrying /Widths + f-0-0-adjacent names
console.log("\n--- the f-0-0 font objects (the /Widths + /FirstChar + /LastChar) ---");
const fontObjs = [...ascii.matchAll(/(\d+) 0 obj\s*<<([^>]*\/Widths[^>]*)>>/g)];
let shown = 0;
for (const m of ascii.matchAll(/(\d+) 0 obj\s*<<([\s\S]{0,800}?)>>\s*stream/g)) {
  const body = m[2];
  if (!body.includes("/Widths")) continue;
  if (!/\/BaseFont[^\n]*(z|ZZ|f-0)/.test(body) && !body.includes("Subset")) { /* keep all */ }
  const fc = body.match(/\/FirstChar\s+(\d+)/)?.[1];
  const lc = body.match(/\/LastChar\s+(\d+)/)?.[1];
  const wArr = body.match(/\/Widths\s*\[([\s\S]*?)\]/)?.[1];
  const mw = body.match(/\/MissingWidth\s+(-?\d+)/)?.[1];
  const bf = body.match(/\/BaseFont\s*\/([^\s/>]+)/)?.[1];
  if (fc && lc && wArr) {
    const widths = wArr.trim().split(/[\s\n]+/).map(Number);
    console.log(`obj ${m[1]}: ${bf ?? "?"} FirstChar=${fc} LastChar=${lc} widths=${widths.length} MissingWidth=${mw ?? "(absent)"} | covers ${fc}..${Number(fc) + widths.length - 1} | width[122] ${122 >= Number(fc) && 122 < Number(fc) + widths.length ? widths[122 - Number(fc)] : "OUTSIDE"}`);
    if (++shown > 12) break;
  }
}
