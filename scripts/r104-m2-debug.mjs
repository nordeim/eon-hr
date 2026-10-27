// r104-m2-debug.mjs — probe why the M2 (last-wins) mutation doesn't bite the
// collision fixture: dump fCandidates + the decode of the A-line codes.
import { readFileSync } from "node:fs";

const src = readFileSync("src/lib/cv-text.ts", "utf8");
console.log("M2 mutation live:", src.includes("M2 MUTATION"));

// Build the same fixture as the spec and run extractTextFromFile
const { extractTextFromFile } = await import("../src/lib/cv-text.ts");
const FileCls = (await import("node:buffer")).File;

const cmapPairs = (name, pairs) =>
  `/CIDInit/ProcSet findresource begin\n12 dict begin\nbegincmap\n/CMapName/${name} def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n${pairs.length} beginbfchar\n${pairs.map(([c, u]) => `<${c}> <${u}>`).join("\n")}\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
const hex2 = (n) => n.toString(16).toUpperCase().padStart(4, "0");
const uni = (ch) => ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0");
const aWords = ["systems", "support", "specialist", "platform", "securely", "training"];
const aLetters = [...new Set(aWords.join(""))];
const aCode = new Map(aLetters.map((ch, i) => [ch, hex2(i + 1)]));
const cmapA = cmapPairs("FontA-UTF16", aLetters.map((ch) => [aCode.get(ch), uni(ch)]));
const bWords = ["admin", "oriented", "management"];
const bLetters = [...new Set(bWords.join(""))];
const wrong = "qwzvxjk";
const bPairs = [];
aLetters.forEach((_, i) => bPairs.push([hex2(i + 1), uni(wrong[i % wrong.length])]));
const bCode = new Map(bLetters.map((ch, i) => [ch, hex2(0x11 + i)]));
bLetters.forEach((ch) => bPairs.push([bCode.get(ch), uni(ch)]));
const cmapB = cmapPairs("FontB-UTF16", bPairs);
const line = (codes) => `[${codes.map((w) => `<${w.join("")}> -322 `).join("")}] TJ`;
const aLine = line(aWords.map((w) => [...w].map((ch) => aCode.get(ch))));
const bLine = line(bWords.map((w) => [...w].map((ch) => bCode.get(ch))));
const content = `BT /F1 12 Tf 20 700 Td ${aLine}\n0 -20 Td ${bLine} ET`;

// the pdfWithObjects shape
const enc = (s) => new TextEncoder().encode(s);
const deflate = async (s) => new Uint8Array(await new Response(new Blob([s]).stream().pipeThrough(new CompressionStream("deflate"))).arrayBuffer());
const parts = [];
const push = (s) => parts.push(enc(s));
push("1 0 obj\n<< /Type /Catalog /Pages 9 0 R >>\nendobj\n");
for (const [dict, stream] of [["2 0 obj\n<< /Filter /FlateDecode", cmapA], ["4 0 obj\n<< /Filter /FlateDecode", cmapB], ["8 0 obj\n<< /Filter /FlateDecode", content]]) {
  const d = await deflate(stream);
  push(`${dict} /Length ${d.length} >>\nstream\r\n`);
  parts.push(d);
  push("\r\nendstream\nendobj\n");
  if (dict.startsWith("2")) push("3 0 obj\n<< /Type /Font /Subtype /TrueType /BaseFont /FontA /ToUnicode 2 0 R >>\nendobj\n");
  if (dict.startsWith("4")) push("5 0 obj\n<< /Type /Font /Subtype /TrueType /BaseFont /FontB /ToUnicode 4 0 R >>\nendobj\n");
}
push("6 0 obj\n<< /Font << /F1 3 0 R >> >>\nendobj\n");
push("7 0 obj\n<< /Font << /F1 5 0 R >> >>\nendobj\n");
push("9 0 obj\n<< /Type /Pages /Kids [] >>\nendobj\n");
push("trailer\n<< /Root 1 0 R >>\n%%EOF");
const total = parts.reduce((n, p) => n + p.length, 0);
const pdf = new Uint8Array(total);
let o = 0;
for (const p of parts) { pdf.set(p, o); o += p.length; }
const text = await extractTextFromFile(new FileCls([pdf], "resume.pdf", { type: "application/pdf" }));
console.log("yield:", JSON.stringify(text.slice(0, 200)));
