// probe-r102-lo-guarded.mjs — run the pipeline with the candidate fix
// (content-stream gate + per-stream guard) and inspect the LibreOffice yield:
// is the text readable? Is the first-covering-CMap decode good enough?
import { readFileSync, writeFileSync } from "node:fs";

let src = readFileSync("/home/z/my-project/tmp-r102/probe/cv-text-probe.ts", "utf8");
// (1) the content-stream gate: only walk streams with BT + a real text-op
src = src.replace(
  `    const pieces = pdfTextPieces(text);
    if (pieces.length) pending.push(pieces);`,
  `    if (!/\\bBT\\b/.test(text) || !/(?:\\)\\s*|\\]\\s*|>\\s*)(?:Tj|TJ|'|")/.test(text)) continue;
    let pieces;
    try { pieces = pdfTextPieces(text); } catch { continue; }
    if (pieces.length) pending.push(pieces);`
);
src = src.replace("async function extractPdfText(file: File): Promise<string> {",
                  "export async function extractPdfText(file: File): Promise<string> {");
writeFileSync("/home/z/my-project/tmp-r102/probe/cv-text-guarded.ts", src);

const { extractPdfText } = await import("/home/z/my-project/tmp-r102/probe/cv-text-guarded.ts");
for (const path of process.argv.slice(2)) {
  console.log(`\n=== ${path} ===`);
  const buf = readFileSync(path);
  const file = new File([buf], "real.pdf", { type: "application/pdf" });
  try {
    const t0 = Date.now();
    const text = await extractPdfText(file);
    const alnum = text.replace(/[^A-Za-z0-9]/g, "");
    console.log(` OK: len ${text.length}, alnum ${alnum.length} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    console.log(" first 400:", JSON.stringify(text.slice(0, 400)));
    const soup = text.match(/\b[A-Za-z] [A-Za-z] [A-Za-z] /g);
    console.log(` letter-soup runs: ${soup ? soup.length : 0}`);
    const fused = text.match(/[A-Za-z]{25,}/g);
    console.log(` fused 25+ words: ${fused ? fused.length : 0}${fused ? " e.g. " + JSON.stringify(fused.slice(0, 2)) : ""}`);
  } catch (e) {
    console.log(" THREW:", String(e).slice(0, 150));
  }
}
