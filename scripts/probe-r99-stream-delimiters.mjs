// R99-A probe: does the space-variant stream delimiter ("stream \r\n" /
// "stream\n" — a SPACE between the keyword and the EOL, emitted by some
// real-world writers) get extracted, or silently lost?
// Also probes: the bare-CR form ("stream\r") and EOL-less "endstream" tail.
import { extractTextFromFile } from "../src/lib/cv-text.ts";

const enc = new TextEncoder();

async function deflate(s) {
  const zlib = new CompressionStream("deflate");
  return new Uint8Array(
    await new Response(new Blob([s]).stream().pipeThrough(zlib)).arrayBuffer()
  );
}

async function pdfWithDelimiter(delim, content) {
  const d = await deflate(content);
  const head = enc.encode(delim);
  const tail = enc.encode("\r\nendstream\r\nendobj");
  const pdf = new Uint8Array(2 + head.length + d.length + tail.length);
  pdf.set(enc.encode("<<"), 0);
  pdf.set(head, 2);
  pdf.set(d, 2 + head.length);
  pdf.set(tail, 2 + head.length + d.length);
  return new File([pdf], "probe.pdf", { type: "application/pdf" });
}

const content =
  "BT /F1 12 Tf (Senior HR Manager with payroll, GOSI, compliance skills and long meaningful text) Tj ET";

const variants = [
  ["stream\\r\\n (standard)", "stream\r\n"],
  ["stream\\n (LF only)", "stream\n"],
  ["stream\\r (CR only)", "stream\r"],
  ["stream \\r\\n (SPACE + CRLF)", "stream \r\n"],
  ["stream \\n (SPACE + LF)", "stream \n"],
  ["stream  \\r\\n (2 spaces + CRLF)", "stream  \r\n"],
];

for (const [label, delim] of variants) {
  const file = await pdfWithDelimiter(delim, content);
  const text = await extractTextFromFile(file);
  const ok = text.includes("Senior HR Manager");
  console.log(`${label.padEnd(32)} → ${ok ? "EXTRACTED" : "LOST (''" + text.slice(0, 20) + "'')"}`);
}
