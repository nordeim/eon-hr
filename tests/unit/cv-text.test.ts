import { describe, expect, it } from "vitest";
import { deriveCandidateName, extractTextFromFile, scrubPrintable } from "@/lib/cv-text";
import { makeZip } from "./zip-fixture";

// Session 95 (R95-A): the REF's AI CV Upload tab is a FILE-UPLOAD surface
// ("PDF, DOC, DOCX — AI will parse & score automatically"). The clone's
// superset keeps the flow working without any new dependency: the
// browser-native DecompressionStream inflates the .docx zip's
// word/document.xml and the .pdf's FlateDecode streams, with a printable
// scrub fallback for text/legacy files. These specs pin the extraction
// contract with crafted fixtures (Node exposes File/CompressionStream —
// the same globals the browser flow uses).

async function zipBytes(): Promise<Uint8Array> {
  // word/document.xml carrying three <w:t> runs across two paragraphs.
  const xml =
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    "<w:body><w:p><w:r><w:t>Senior HR Manager</w:t></w:r></w:p>" +
    "<w:p><w:r><w:t>Java, payroll, compliance, GOSI, onboarding</w:t></w:r></w:p></w:body></w:document>";
  const enc = new TextEncoder();
  return makeZip([
    {
      name: "word/document.xml",
      data: enc.encode(xml),
    },
  ]);
}

describe("cv-text — the client-side CV extraction (session 95, R95-A)", () => {
  it("reads plain-text files directly", async () => {
    const file = new File(["Senior HR specialist. Skills: payroll, GOSI, compliance, onboarding, training."], "cv.txt", {
      type: "text/plain",
    });
    const text = await extractTextFromFile(file);
    expect(text).toContain("payroll");
    expect(text).toContain("GOSI");
  });

  it("extracts the <w:t> runs from a crafted .docx (the zip walk + deflate-raw)", async () => {
    const bytes = await zipBytes();
    const file = new File([bytes as unknown as BlobPart], "resume.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const text = await extractTextFromFile(file);
    expect(text).toContain("Senior HR Manager");
    expect(text).toContain("Java, payroll, compliance, GOSI, onboarding");
  });

  it("extracts the text operators from a crafted .pdf's inflated FlateDecode stream", async () => {
    // A minimal PDF: one content stream, zlib-deflated, carrying two Tj
    // text operators — the shape pdf.js-free extraction walks.
    const content = "BT /F1 12 Tf (Senior HR Manager with payroll, GOSI, and compliance skills) Tj (Second line of the resume text) Tj ET";
    const zlib = new CompressionStream("deflate"); // PDF streams are zlib-wrapped
    const deflated = new Uint8Array(
      await new Response(new Blob([content]).stream().pipeThrough(zlib)).arrayBuffer()
    );
    // << stream\r\n … \r\nendstream — the dict stub + the deflated bytes + the tail
    const head = new TextEncoder().encode("stream\r\n");
    const tail = new TextEncoder().encode("\r\nendstream\r\nendobj");
    const pdf = new Uint8Array(2 + head.length + deflated.length + tail.length);
    pdf.set(new Uint8Array([0x3c, 0x3c]), 0);
    pdf.set(head, 2);
    pdf.set(deflated, 2 + head.length);
    pdf.set(tail, 2 + head.length + deflated.length);
    const file = new File([pdf], "resume.pdf", { type: "application/pdf" });
    const text = await extractTextFromFile(file);
    expect(text).toContain("Senior HR Manager");
    expect(text).toContain("payroll");
  });

  it("falls back to the printable scrub when nothing structured matches (the .doc / degenerate path)", async () => {
    // A NUL-interleaved (UTF-16LE-shaped) blob — what a legacy .doc looks
    // like when read as text. The scrub strips NULs and keeps the words.
    const interleaved = "S\0e\0n\0i\0o\0r\0 \0H\0R\0 \0M\0a\0n\0a\0g\0e\0r\0";
    const scrubbed = scrubPrintable(interleaved);
    expect(scrubbed).toContain("Senior HR Manager");
  });

  it("returns empty for a too-short yield (the <40-alphanumeric guard)", async () => {
    const file = new File(["ab"], "tiny.txt", { type: "text/plain" });
    const text = await extractTextFromFile(file);
    expect(text).toBe("");
  });

  it("derives the candidate name from the filename (the extension stripped, separators spaced)", () => {
    expect(deriveCandidateName("john-smith-cv.pdf")).toBe("john smith cv");
    expect(deriveCandidateName("resume_jane_doe.docx")).toBe("resume jane doe");
    expect(deriveCandidateName("plain")).toBe("plain");
  });
});
