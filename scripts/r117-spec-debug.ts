// r117-spec-debug.ts — reproduce the interplay fixture exactly as the spec
// builds it and print HEAD's extraction + the piece stamps.
import { writeFileSync, readFileSync, rmSync } from "node:fs";

const encS = (s: string) => new TextEncoder().encode(s);
const encL = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

async function pdfWithLatin1Streams(objects: ({ raw: string } | { dict: string; stream: string })[]): Promise<Uint8Array> {
  const parts: Uint8Array[] = [];
  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    if ("raw" in obj) parts.push(encS(`${i + 1} 0 obj\n${obj.raw}\nendobj\n`));
    else {
      const deflated = new Uint8Array(await new Response(new Blob([encL(obj.stream)]).stream().pipeThrough(new CompressionStream("deflate"))).arrayBuffer());
      parts.push(encS(`${i + 1} 0 obj\n<< ${obj.dict} /Length ${deflated.length} >>\nstream\r\n`));
      parts.push(deflated);
      parts.push(encS("\r\nendstream\nendobj\n"));
    }
  }
  parts.push(encS("trailer\n<< /Root 1 0 R >>\n%%EOF"));
  const total = parts.reduce((n, p) => n + p.length, 0);
  const pdf = new Uint8Array(total);
  let o = 0;
  for (const p of parts) { pdf.set(p, o); o += p.length; }
  return pdf;
}

const PAD = "payrolladmincompliancetrainingonboardingspecialistplatform";
const PHRASE = `${PAD}experience SeniorHRManager TechCorp Mar2021Present nextword ticks trail`;
const codeFor = (i: number) => i + 1;
const spaceCodes = new Set([...PHRASE].map((c, i) => (c === " " ? codeFor(i) : -1)).filter((x) => x >= 0));
const cmapForPhrase = () => {
  const pairs = [...PHRASE].map((c, i) => `<${codeFor(i).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`).join("\n");
  return "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" + `${PHRASE.length} beginbfchar\n${pairs}\nendbfchar\nendcmap\n`;
};
const wTriple = () => [...PHRASE].map((_, i) => `${codeFor(i)} ${codeFor(i)} ${spaceCodes.has(codeFor(i)) ? 250 : 500}`).join(" ");
const codesFor = (text: string) => {
  const idx = PHRASE.indexOf(text);
  if (idx < 0) throw new Error(`missing "${text}"`);
  return [...text].map((_, i) => `\\000\\${codeFor(idx + i).toString(8).padStart(3, "0")}`).join("");
};
const typstBlock = (tx: number, ty: number, size: number, text: string) =>
  `q\n1 0 0 -1 ${tx} ${ty} cm\nBT 0 Tr /f0 ${size} Tf 1 0 0 -1 0 0 Tm (${codesFor(text)}) Tj\nET\nQ`;

const interplay =
  typstBlock(50, 750, 9, PAD) + "\n" +
  typstBlock(50, 700, 12, "SeniorHRManager") + "\n" +
  typstBlock(150, 700, 11, " ") + "\n" +
  typstBlock(508.8, 660, 11, "TechCorp");

const pdf = await pdfWithLatin1Streams([
  { raw: "<< /Type /Catalog /Pages 7 0 R >>" },
  { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /AAAAAA+Test /Encoding /Identity-H /ToUnicode 3 0 R /DescendantFonts [4 0 R] >>" },
  { dict: "/Filter /FlateDecode", stream: cmapForPhrase() },
  { raw: `<< /Type /Font /Subtype /CIDFontType0 /BaseFont /AAAAAA+Test /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /DW 500 /W [${wTriple()}] >>` },
  { dict: "/Filter /FlateDecode", stream: interplay },
  { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
  { raw: "<< /Type /Page /Contents 5 0 R /Resources << /Font << /f0 2 0 R >> >> >>" },
]);
writeFileSync("/tmp/r117-interplay.pdf", pdf);

const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const text = await mod.extractTextFromFile(new File([readFileSync("/tmp/r117-interplay.pdf")], "m.pdf"));
console.log("=== interplay extraction at HEAD ===");
console.log(JSON.stringify(text));
