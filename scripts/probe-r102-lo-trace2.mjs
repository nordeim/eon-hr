// probe-r102-lo-trace2.mjs — run the REAL extractPdfText internals with
// instrumentation: catch the throw, count pieces, sample the assembly.
import { readFileSync, writeFileSync } from "node:fs";

// instrument the copied module: export the internals
let src = readFileSync("/home/z/my-project/tmp-r102/probe/cv-text-probe.ts", "utf8");
src = src.replace("async function extractPdfText(file: File): Promise<string> {",
                  "export async function extractPdfText(file: File): Promise<string> {");
src = src.replace("function pdfTextPieces(content: string): TextPiece[] {",
                  "export function pdfTextPieces(content: string): TextPiece[] {");
src = src.replace("function decodeHexString(hexRaw: string, cmaps: CodeMap[]): string {",
                  "export function decodeHexString(hexRaw: string, cmaps: any[]): string {");
writeFileSync("/home/z/my-project/tmp-r102/probe/cv-text-probe2.ts", src);

const { extractPdfText } = await import("/home/z/my-project/tmp-r102/probe/cv-text-probe2.ts");

const path = process.argv[2];
const buf = readFileSync(path);
const file = new File([buf], "real.pdf", { type: "application/pdf" });
try {
  const text = await extractPdfText(file);
  const alnum = text.replace(/[^A-Za-z0-9]/g, "");
  console.log(`extractPdfText OK: length ${text.length}, alnum ${alnum.length}`);
  console.log("first 400:", JSON.stringify(text.slice(0, 400)));
} catch (e) {
  console.log("THREW:", String(e && e.stack || e).slice(0, 600));
}
