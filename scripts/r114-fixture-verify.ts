// r114-fixture-verify.ts — the fixture-geometry verification BEFORE writing
// the specs (the r112 lesson: a miscalculated fixture reads 0 RED under its
// mutation because other legs cover it). Each planned fixture through HEAD
// and the prototype; the exact designed signatures must appear.
// Usage: bun scripts/r114-fixture-verify.ts (the module paths ride the
// variable-path import per the R108-A lesson — a literal .ts import breaks
// TS5097 on a fresh clone)
import { readFileSync } from "node:fs";

const headPath = process.argv[2] ?? "/home/z/my-project/eon-hr/src/lib/cv-text";
const protoPath = process.argv[3] ?? "/home/z/proto/proto-cv-text";
const head = await import(headPath);
const proto = await import(protoPath);

const encS = (s: string) => new TextEncoder().encode(s);
const encL = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

async function pdfWithLatin1Streams(objects: ({ raw: string } | { dict: string; stream: string })[]): Promise<File> {
  const parts: Uint8Array[] = [];
  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    if ("raw" in obj) {
      parts.push(encS(`${i + 1} 0 obj\n${obj.raw}\nendobj\n`));
    } else {
      const deflated = new Uint8Array(
        await new Response(new Blob([encL(obj.stream)]).stream().pipeThrough(new CompressionStream("deflate"))).arrayBuffer()
      );
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
  return new File([pdf], "resume.pdf", { type: "application/pdf" });
}

const run = async (name: string, file: File) => {
  const a = await head.extractTextFromFile(file);
  const b = await proto.extractTextFromFile(file);
  console.log(`\n=== ${name} ===`);
  console.log(`HEAD (${a.length}ch): ${JSON.stringify(a.slice(0, 150))}`);
  console.log(`PROTO(${b.length}ch): ${JSON.stringify(b.slice(0, 150))}`);
};

// ---- Fixture 1 (R114-A RED): the raw-code literal stream, un-padded ----
const PHRASE = "JohnSmithSeniorHRManagerPayrollGOSIComplianceOnboarding";
const codeFor = (i: number) => (i + 1 >= 40 ? i + 3 : i + 1);
const cmapForPhrase = () => {
  const pairs = [...PHRASE]
    .map((c, i) => `<${codeFor(i).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`)
    .join("\n");
  return (
    "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
    `${PHRASE.length} beginbfchar\n${pairs}\nendbfchar\nendcmap\n`
  );
};
const rawByteLiteral = () => [...PHRASE].map((_, i) => String.fromCharCode(0, codeFor(i))).join("");
{
  const content = `BT /F1 12 Tf (${rawByteLiteral()}) Tj ET`;
  const file = await pdfWithLatin1Streams([
    { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
    { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /AAAAAA+LibSans /Encoding /Identity-H /ToUnicode 3 0 R >>" },
    { dict: "/Filter /FlateDecode", stream: cmapForPhrase() },
    { raw: "<< /Font << /F1 2 0 R >> >>" },
    { dict: "/Filter /FlateDecode", stream: content },
    { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
    { raw: "<< /Type /Page /Contents 5 0 R /Resources 4 0 R >>" },
  ]);
  await run("F1: raw-code literal stream (R114-A RED)", file);
}

// ---- Fixture 2 (R114-B RED): the 1-byte kern+leading-space form ----
{
  const content =
    "BT /F1 12 Tf (payroll admin compliance training onboarding specialist platform experience) Tj " +
    "[(JohnSmith) -177.696( SeniorHRManager)] TJ ET";
  const file = await pdfWithLatin1Streams([
    { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
    { dict: "/Filter /FlateDecode", stream: content },
    { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
    { raw: "<< /Type /Page /Contents 2 0 R >>" },
  ]);
  await run("F2: 1-byte kern+space (R114-B RED)", file);
}

// ---- Fixture 3 (R114-B RED): the 2-byte cmap kern+space-code form ----
{
  // codes: 1..10 → "JohnSmith", 0x30 → ' ', 11.. → "SeniorHRManager"
  const w1 = "JohnSmith";
  const w2 = "SeniorHRManager";
  const pairs: string[] = [];
  w1.split("").forEach((c, i) => pairs.push(`<${(i + 1).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`));
  pairs.push(`<0030> <0020>`);
  w2.split("").forEach((c, i) => pairs.push(`<${(20 + i).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`));
  const cmap =
    "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
    `${pairs.length} beginbfchar\n${pairs.join("\n")}\nendbfchar\nendcmap\n`;
  const atom1 = w1.split("").map((_, i) => String.fromCharCode(0, i + 1)).join("");
  const atom2 = String.fromCharCode(0, 0x30) + w2.split("").map((_, i) => String.fromCharCode(0, 20 + i)).join("");
  const pad = "payroll admin compliance training onboarding specialist platform experience";
  const content = `BT /F1 12 Tf (${pad}) Tj [(${atom1}) -177.696(${atom2})] TJ ET`;
  const file = await pdfWithLatin1Streams([
    { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
    { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /AAAAAA+LibSans /Encoding /Identity-H /ToUnicode 3 0 R >>" },
    { dict: "/Filter /FlateDecode", stream: cmap },
    { raw: "<< /Font << /F1 2 0 R >> >>" },
    { dict: "/Filter /FlateDecode", stream: content },
    { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
    { raw: "<< /Type /Page /Contents 5 0 R /Resources 4 0 R >>" },
  ]);
  await run("F3: 2-byte cmap kern+space-code (R114-B RED)", file);
}

// ---- Fixture 4 (R114-B RED): the hex-atom kern+space-code form ----
{
  const w1 = "JohnSmith";
  const w2 = "SeniorHRManager";
  const pairs: string[] = [];
  w1.split("").forEach((c, i) => pairs.push(`<${(i + 1).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`));
  pairs.push(`<0030> <0020>`);
  w2.split("").forEach((c, i) => pairs.push(`<${(20 + i).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`));
  const cmap =
    "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
    `${pairs.length} beginbfchar\n${pairs.join("\n")}\nendbfchar\nendcmap\n`;
  const hex1 = w1.split("").map((_, i) => (i + 1).toString(16).padStart(4, "0")).join("");
  const hex2 = "0030" + w2.split("").map((_, i) => (20 + i).toString(16).padStart(4, "0")).join("");
  const pad = "payroll admin compliance training onboarding specialist platform experience";
  const content = `BT /F1 12 Tf (${pad}) Tj [<${hex1}> -177.696<${hex2}>] TJ ET`;
  const file = await pdfWithLatin1Streams([
    { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
    { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /AAAAAA+LibSans /Encoding /Identity-H /ToUnicode 3 0 R >>" },
    { dict: "/Filter /FlateDecode", stream: cmap },
    { raw: "<< /Font << /F1 2 0 R >> >>" },
    { dict: "/Filter /FlateDecode", stream: content },
    { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
    { raw: "<< /Type /Page /Contents 5 0 R /Resources 4 0 R >>" },
  ]);
  await run("F4: hex-atom kern+space-code (R114-B RED)", file);
}

// ---- Fixture 5 (guard): the scrub-class kern gap keeps its space ----
{
  const content =
    "BT /F1 12 Tf (payroll admin compliance training onboarding specialist platform experience) Tj " +
    "[(training,) -378 (\\034netuning)] TJ ET";
  const file = await pdfWithLatin1Streams([
    { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
    { dict: "/Filter /FlateDecode", stream: content },
    { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
    { raw: "<< /Type /Page /Contents 2 0 R >>" },
  ]);
  await run("F5: scrub-class kern gap (guard)", file);
}

// ---- Fixture 6 (guard): the -92.953 join keeps the single space ----
{
  const content =
    "BT /F1 12 Tf (payroll admin compliance training onboarding specialist platform experience) Tj " +
    "[(Talent) -92.953( Acquisition Skills)] TJ ET";
  const file = await pdfWithLatin1Streams([
    { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
    { dict: "/Filter /FlateDecode", stream: content },
    { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
    { raw: "<< /Type /Page /Contents 2 0 R >>" },
  ]);
  await run("F6: sub-threshold kern join (guard)", file);
}

// ---- Fixture 7 (guard): the paren-free binary decoy stays rejected ----
{
  const garbage = "\uFFFD".repeat(1500) + ") Tj " + "\uFFFD".repeat(1500);
  const good = "BT /F1 12 Tf (Senior HR Manager with payroll and compliance skills) Tj ET";
  const file = await pdfWithLatin1Streams([
    { raw: "<< /Type /Catalog /Pages 5 0 R >>" },
    { dict: "/Filter /FlateDecode", stream: garbage },
    { dict: "/Filter /FlateDecode", stream: good },
    { raw: "<< /Type /Pages /Kids [6 0 R] >>" },
    { raw: "<< /Type /Page /Contents 2 0 R >>" },
  ]);
  await run("F7: paren-free binary decoy (guard)", file);
}
void readFileSync;
