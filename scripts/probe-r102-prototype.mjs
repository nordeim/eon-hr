// probe-r102-prototype.mjs — the full R102 fix prototype on the REAL file:
// (A) the pre-inflate dict gate (skip /Image + /FontFile streams — they are
//     not content streams; one of them blows the V8 regex stack today)
// (B) the post-inflate content gate (printable-dominant + a real text-op
//     shape) + the per-stream try/catch guard
// (C) the font-scoped CMap chain: /F-name → font object → /ToUnicode object
//     → that font's OWN CMap (the LibreOffice 15-font subset form where
//     every font restarts codes at <01>); fallback = the standing
//     first-covering walk
import { readFileSync, writeFileSync } from "node:fs";

let src = readFileSync("/home/z/my-project/tmp-r102/probe/cv-text-probe.ts", "utf8");

// ---- (R102-C) the sign rule: only NEGATIVE sums are gaps
src = src.replace(
  `          if (kern > 0) {
            moved = true;
            pendingEm = kern >= 100 ? 1.0 : 0; // the gap fires the space rule; a kern joins
          }`,
  `          if (kern !== 0) {
            moved = true;
            pendingEm = kern <= -100 ? 1.0 : 0; // R102-C: only a NEGATIVE sum >= 100 thousandths is a gap (pdfTeX's -209..-442 glue, the R97 fixture's -120); POSITIVE sums are kerns — LibreOffice's +110..+149 T-overhang class (the sign census)
          }`
);
src = src.replace("kern += Math.abs(parseFloat(a[3]));", "kern += parseFloat(a[3]);");
src = src.replace("let kern = 0; // |sum| of consecutive numbers since the last atom", "let kern = 0; // SIGNED sum of consecutive numbers since the last atom");

// ---- (C) the font chain: TextPiece gains a font name; decode goes scoped
src = src.replace(
  `type TextPiece = { sep: string } & ({ kind: "lit"; text: string } | { kind: "hex"; hex: string });`,
  `type TextPiece = { sep: string; font?: string } & ({ kind: "lit"; text: string } | { kind: "hex"; hex: string });
interface FontChain { fToObj: Map<string, number>; objToTu: Map<number, number>; tuToCmap: Map<number, any>; }`
);

// pdfTextPieces: track the current font from the Tf match text (zero group churn)
src = src.replace(
  `  let effSize = 1; // the last Tf size operand (the em denominator)`,
  `  let effSize = 1; // the last Tf size operand (the em denominator)
  let curFont = ""; // the last Tf font NAME (the R102-B scoping key)`
);
src = src.replace(
  `  const push = (piece: { kind: "lit"; text: string } | { kind: "hex"; hex: string }) => {`,
  `  const push = (piece: { kind: "lit"; text: string } | { kind: "hex"; hex: string }) => {`
);
src = src.replace(
  `    if (pieces.length === 0) sep = ""; // no leading separator on the first piece
    pieces.push({ sep, ...piece });`,
  `    if (pieces.length === 0) sep = ""; // no leading separator on the first piece
    pieces.push({ sep, font: curFont, ...piece });`
);
src = src.replace(
  `    if (m[1] !== undefined) {
      effSize = parseFloat(m[1]) || 1;
      continue;
    }`,
  `    if (m[1] !== undefined) {
      effSize = parseFloat(m[1]) || 1;
      curFont = (m[0].split(/\\s+/)[0] || "").replace(/^\\//, "");
      continue;
    }`
);
// the next-line shows carry the font too
src = src.replace(
  `        pieces.push({ sep: pieces.length === 0 ? "" : "\\n", kind: "lit", text });`,
  `        pieces.push({ sep: pieces.length === 0 ? "" : "\\n", font: curFont, kind: "lit", text });`
);
src = src.replace(
  `        pieces.push({ sep: pieces.length === 0 ? "" : "\\n", kind: "hex", hex });`,
  `        pieces.push({ sep: pieces.length === 0 ? "" : "\\n", font: curFont, kind: "hex", hex });`
);

// extractPdfText: the chain build + the gates + the scoped decode
src = src.replace(
  `  const cmaps: CodeMap[] = [];
  const pending: TextPiece[][] = [];`,
  `  const cmaps: CodeMap[] = [];
  const pending: TextPiece[][] = [];
  // R102-B: the font chain — /F-name → font object → /ToUnicode object.
  // All three scans ride the RAW ascii (object headers are never compressed
  // in this writer family). objNum → the CMap fills in during the stream walk.
  const fToObj = new Map<string, number>();
  const objToTu = new Map<number, number>();
  const tuToCmap = new Map<number, any>();
  for (const fm of ascii.matchAll(/\\/(F\\w+)\\s+(\\d+)\\s+0\\s+R/g)) fToObj.set(fm[1], parseInt(fm[2], 10));
  for (const fm of ascii.matchAll(/\\/(\\d+)\\s+0\\s+R\\s*>>\\s*(\\d+)\\s+0\\s+obj\\s*<<[^<]*\\/Type\\/Font|\\/ToUnicode\\s+(\\d+)\\s+0\\s+R/g)) {
    // simpler second pass below — this alternation is fragile; do it in two passes
  }
  for (const fm of ascii.matchAll(/(\\d+)\\s+0\\s+obj\\s*<<([^<>]*(?:<<[^<>]*>>[^<>]*)*)>>/g)) {
    const body = fm[2];
    if (!/\\/Type\\s*\\/Font\\b/.test(body)) continue;
    const tu = body.match(/\\/ToUnicode\\s+(\\d+)\\s+0\\s+R/);
    if (tu) objToTu.set(parseInt(fm[1], 10), parseInt(tu[1], 10));
  }`
);

// the CMap collection gains the object number (look back from the stream
// keyword to the nearest "N 0 obj")
src = src.replace(
  `    const start = m.index + m[0].length;
    const end = ascii.indexOf("endstream", start);
    if (end < 0) break;`,
  `    const start = m.index + m[0].length;
    const end = ascii.indexOf("endstream", start);
    if (end < 0) break;
    // R102-B: this stream's object number (the nearest "N 0 obj" since the
    // last endobj — the dict region boundary)
    const dictStart = ascii.lastIndexOf("endobj", m.index) + 6;
    const __region = ascii.slice(dictStart, m.index);
    const objMatch = __region.match(/^\\s*(\\d+)\\s+0\\s+obj\\b/) ?? __region.match(/(\\d+)\\s+0\\s+obj\\b/);
    const objNum = objMatch ? parseInt(objMatch[1], 10) : -1;
    // R102-A leg 1: the PRE-INFLATE dict gate — a stream whose object dict
    // declares /Subtype /Image or a /FontFile is NOT a content stream; one
    // such stream (26MB of image bytes) blows the V8 regex stack today.
    const objDict = ascii.slice(dictStart, m.index);
    if (/\\/Subtype\\s*\\/Image\\b/.test(objDict) || /\\/FontFile[23]?\\b/.test(objDict)) {
      streamRe.lastIndex = end + "endstream".length;
      continue;
    }`
);

// the CMap branch records objNum
src = src.replace(
  `    if (text.includes("beginbfchar") || text.includes("beginbfrange")) {
      const cm = parseToUnicode(text);
      if (cm) cmaps.push(cm);
      continue;
    }`,
  `    if (text.includes("beginbfchar") || text.includes("beginbfrange")) {
      const cm = parseToUnicode(text);
      if (cm) { cmaps.push(cm); if (objNum >= 0) tuToCmap.set(objNum, cm); }
      continue;
    }`
);

// R102-A leg 2: the post-inflate content gate + the guard
src = src.replace(
  `    const pieces = pdfTextPieces(text);
    if (pieces.length) pending.push(pieces);`,
  `    // R102-A leg 2: only walk streams that LOOK like content — a real
    // text-op shape and a printable-ASCII-dominant body. Binary garbage that
    // slipped past the dict gate must never reach the regex.
    if (!/(?:\\)|\\]|>)\\s*(?:Tj|TJ|'|")/.test(text)) continue;
    let printable = 0;
    const samples = Math.min(text.length, 4096);
    const stride = Math.max(1, Math.floor(text.length / samples));
    for (let i = 0; i < text.length; i += stride) { const c = text.charCodeAt(i); if ((c >= 32 && c < 127) || c === 10 || c === 13 || c === 9) printable++; }
    const taken = Math.ceil(text.length / stride);
    if (printable / taken < 0.6) continue;
    let pieces;
    try { pieces = pdfTextPieces(text); } catch { continue; } // the stack-overflow class — skip, never fatal
    if (pieces.length) pending.push(pieces);`
);

// the scoped decode
src = src.replace(
  `  const parts = pending.map((pieces) =>
    pieces.map((p) => p.sep + (p.kind === "hex" ? decodeHexString(p.hex, cmaps) : p.text)).join("")
  );`,
  `  const cmapsFor = (font?: string): CodeMap[] => {
    if (font) {
      const obj = fToObj.get(font);
      const tu = obj !== undefined ? objToTu.get(obj) : undefined;
      const cm = tu !== undefined ? tuToCmap.get(tu) : undefined;
      if (cm) return [cm, ...cmaps];
    }
    return cmaps;
  };
  const parts = pending.map((pieces) =>
    pieces.map((p) => p.sep + (p.kind === "hex" ? decodeHexString(p.hex, cmapsFor(p.font)) : p.text)).join("")
  );`
);

src = src.replace("async function extractPdfText(file: File): Promise<string> {",
                  "export async function extractPdfText(file: File): Promise<string> {");
writeFileSync("/home/z/my-project/tmp-r102/probe/cv-text-prototype.ts", src);
console.log("prototype written");

const { extractPdfText } = await import("/home/z/my-project/tmp-r102/probe/cv-text-prototype.ts");
for (const path of process.argv.slice(2)) {
  console.log(`\n=== ${path} ===`);
  const buf = readFileSync(path);
  const file = new File([buf], "real.pdf", { type: "application/pdf" });
  const t0 = Date.now();
  try {
    const text = await extractPdfText(file);
    const alnum = text.replace(/[^A-Za-z0-9]/g, "");
    console.log(` OK: len ${text.length}, alnum ${alnum.length} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    console.log(" first 500:", JSON.stringify(text.slice(0, 500)));
    const soup = text.match(/\b[A-Za-z] [A-Za-z] [A-Za-z] /g);
    console.log(` letter-soup runs: ${soup ? soup.length : 0}`);
  } catch (e) {
    console.log(" THREW:", String(e).slice(0, 150));
  }
}
