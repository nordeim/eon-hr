// probe-r102-lo-split.mjs — how frequent is the "T eam"-class artifact
// (a single letter + space + the rest of the word)? Find the operator
// sequence that produces it.
import { readFileSync, writeFileSync } from "node:fs";

let src = readFileSync("/home/z/my-project/tmp-r102/probe/cv-text-probe.ts", "utf8");
// instrument pdfTextPieces: log the ops around each show (bounded)
src = src.replace(
  `  let m: RegExpExecArray | null;
  while ((m = ops.exec(content))) {`,
  `  let m: RegExpExecArray | null;
  globalThis.__oplog = globalThis.__oplog || [];
  const __log = (s) => { if (globalThis.__oplog.length < 4000) globalThis.__oplog.push(s); };
  let __lastOps = [];
  while ((m = ops.exec(content))) { __lastOps.push(m[0].slice(0, 50)); if (__lastOps.length > 6) __lastOps.shift();`
);
src = src.replace(
  `    if (pieces.length === 0) sep = ""; // no leading separator on the first piece
    pieces.push({ sep, ...piece });`,
  `    if (pieces.length === 0) sep = ""; // no leading separator on the first piece
    if (piece.kind === "lit" && /^[A-Z]$/.test(piece.text)) __log("SPLIT? " + JSON.stringify(__lastOps) + " → " + JSON.stringify(piece.text));
    pieces.push({ sep, ...piece });`
);
src = src.replace("async function extractPdfText(file: File): Promise<string> {",
                  "export async function extractPdfText(file: File): Promise<string> {");
// apply the R102 gates (dict gate + content gate + guard) — same as prototype
src = src.replace(
  `    const start = m.index + m[0].length;
    const end = ascii.indexOf("endstream", start);
    if (end < 0) break;`,
  `    const start = m.index + m[0].length;
    const end = ascii.indexOf("endstream", start);
    if (end < 0) break;
    const dictStart = ascii.lastIndexOf("endobj", m.index) + 6;
    const objDict = ascii.slice(dictStart, m.index);
    if (/\\/Subtype\\s*\\/Image\\b/.test(objDict) || /\\/FontFile[23]?\\b/.test(objDict)) { streamRe.lastIndex = end + "endstream".length; continue; }`
);
src = src.replace(
  `    const pieces = pdfTextPieces(text);
    if (pieces.length) pending.push(pieces);`,
  `    if (!/(?:\\)|\\]|>)\\s*(?:Tj|TJ|'|")/.test(text)) continue;
    let pieces;
    try { pieces = pdfTextPieces(text); } catch { continue; }
    if (pieces.length) pending.push(pieces);`
);
writeFileSync("/home/z/my-project/tmp-r102/probe/cv-text-split.ts", src);

const { extractPdfText } = await import("/home/z/my-project/tmp-r102/probe/cv-text-split.ts");
const buf = readFileSync("/home/z/my-project/tmp-r102/lo-writer-guide.pdf");
const file = new File([buf], "real.pdf", { type: "application/pdf" });
const text = await extractPdfText(file);
const alnum = text.replace(/[^A-Za-z0-9]/g, "");
console.log(`yield: len ${text.length}, alnum ${alnum.length}`);
// the artifact pattern: single capital + space + lowercase run (the "T eam" shape)
const caps = text.match(/\b[A-Z] [a-z]{2,}/g) ?? [];
console.log(`"X yy" capital-split artifacts: ${caps.length} — e.g. ${JSON.stringify(caps.slice(0, 8))}`);
const singleLow = text.match(/\b[a-z] [a-z]{2,}/g) ?? [];
console.log(`"x yy" lowercase-split artifacts: ${singleLow.length} — e.g. ${JSON.stringify(singleLow.slice(0, 5))}`);
// sample the op log
console.log("\nop log entries (the SPLIT? candidates):");
for (const e of (globalThis.__oplog ?? []).slice(0, 6)) console.log(" ", e.slice(0, 220));
