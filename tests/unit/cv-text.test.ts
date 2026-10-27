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

  // Session 97 (R97-A): the TJ ARRAY form — the dominant text operator in
  // real-world PDFs (Word's Save-as-PDF, Acrobat, kerned LaTeX). The
  // strings ride inside [ (…) -120 (…) ] TJ where each is followed by
  // positioning numbers and ], NOT by the operator itself.
  async function pdfWithContent(content: string): Promise<File> {
    const zlib = new CompressionStream("deflate");
    const deflated = new Uint8Array(
      await new Response(new Blob([content]).stream().pipeThrough(zlib)).arrayBuffer()
    );
    const head = new TextEncoder().encode("stream\r\n");
    const tail = new TextEncoder().encode("\r\nendstream\r\nendobj");
    const pdf = new Uint8Array(2 + head.length + deflated.length + tail.length);
    pdf.set(new Uint8Array([0x3c, 0x3c]), 0);
    pdf.set(head, 2);
    pdf.set(deflated, 2 + head.length);
    pdf.set(tail, 2 + head.length + deflated.length);
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  it("extracts the strings inside a TJ array (the real-world PDF form — R97-A)", async () => {
    const file = await pdfWithContent(
      "BT /F1 12 Tf [(Senior HR Manager) -120 (with payroll, GOSI, and compliance skills)] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("Senior HR Manager");
    expect(text).toContain("payroll, GOSI, and compliance skills");
  });

  it("extracts a mixed Tj + TJ stream keeping both operators' strings", async () => {
    const file = await pdfWithContent(
      "BT /F1 12 Tf (Jane Doe) Tj [(Senior HR Manager) -250 (with GOSI)] TJ [(and payroll)] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("Jane Doe");
    expect(text).toContain("Senior HR Manager");
    expect(text).toContain("with GOSI");
    expect(text).toContain("and payroll");
  });

  it("unescapes parentheses inside TJ array strings", async () => {
    // the content runs past the 40-alphanumeric guard (a bare short string
    // would surface "" for the right reason — the guard, not the regex)
    const file = await pdfWithContent(
      "BT [(Senior HR \\(Manager\\) with payroll, GOSI, onboarding, and compliance skills)] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("Senior HR (Manager) with payroll");
  });

  // Session 98 (R98-A): the multi-stream PDF — the real multi-page shape.
  // The scan regex /stream\r?\n/g re-matched the "stream" INSIDE the
  // previous "endstream", so every chunk after the first started at the
  // PREVIOUS endstream (object-dict garbage + the next stream's bytes)
  // and failed to inflate — page 2+ text was silently lost. The r97
  // queue named it "the scanner handles it but it's never been pinned";
  // the pin found the scanner does NOT handle it (the fixture-form blind
  // spot, §109, one round deeper).
  async function twoStreamPdf(): Promise<File> {
    const content1 =
      "BT /F1 12 Tf (Senior HR Manager with payroll, GOSI, and compliance skills) Tj ET";
    const content2 =
      "BT /F1 12 Tf (Second page: training, onboarding, and recruitment experience) Tj ET";
    const deflate = async (s: string): Promise<Uint8Array> => {
      const zlib = new CompressionStream("deflate");
      return new Uint8Array(
        await new Response(new Blob([s]).stream().pipeThrough(zlib)).arrayBuffer()
      );
    };
    const d1 = await deflate(content1);
    const d2 = await deflate(content2);
    const enc = (s: string) => new TextEncoder().encode(s);
    const parts: Uint8Array[] = [
      enc("1 0 obj\n<< /Length " + d1.length + " >>\nstream\r\n"),
      d1,
      enc("\r\nendstream\r\nendobj\n"),
      enc("2 0 obj\n<< /Length " + d2.length + " >>\nstream\r\n"),
      d2,
      enc("\r\nendstream\r\nendobj\ntrailer\n<< /Root 3 0 R >>\n%%EOF"),
    ];
    const total = parts.reduce((n, p) => n + p.length, 0);
    const pdf = new Uint8Array(total);
    let o = 0;
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  it("extracts EVERY stream of a multi-stream (multi-page) PDF in reading order — R98-A", async () => {
    const file = await twoStreamPdf();
    const text = await extractTextFromFile(file);
    expect(text).toContain("Senior HR Manager"); // page 1
    expect(text).toContain("Second page"); // page 2 — the stream the old scan lost
    // reading order preserved across streams
    expect(text.indexOf("Senior HR Manager")).toBeLessThan(text.indexOf("Second page"));
  });

  // Session 98 (R98-B): the octal-escape class — how Word/Acrobat write
  // the non-ASCII characters CVs are full of (\227 = em-dash, \351 = é in
  // WinAnsiEncoding; curly quotes \223/\224 the same family). The old
  // unescape left them as literal "\227" garbage in the extracted text.
  it("unescapes octal escapes (WinAnsi/Latin-1) in PDF strings — R98-B", async () => {
    const file = await pdfWithContent(
      "BT [(Senior HR Manager \\227 ten years of payroll, GOSI, r\\351sum\\351, compliance, and onboarding experience)] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("Manager \u2014 ten years"); // \227 → WinAnsi em-dash
    expect(text).toContain("r\u00e9sum\u00e9"); // \351 → é (Latin-1 == WinAnsi here)
    expect(text).not.toContain("\\227"); // no literal escape garbage remains
    expect(text).not.toContain("\\351");
  });

  it("keeps an escaped backslash followed by digits literal (the \\\\ddd disambiguation)", async () => {
    // \\\\ is an escaped backslash; the following "053" is literal text,
    // NOT an octal escape — a sequential replace would corrupt it.
    const file = await pdfWithContent(
      "BT [(HR systems engineer \\\\053 payroll, GOSI, compliance, onboarding, and training skills)] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("\\053"); // the literal backslash + digits survive
  });

  // Session 99 (R99-A): the stream-delimiter matrix. The r98 close-out's
  // queue named the space forms ("some writers emit `stream \r\n` with a
  // space"); the probe found the bare-CR form lost too. The old regex
  // /stream\r?\n/g required the EOL IMMEDIATELY after the keyword — every
  // variant below lost the WHOLE stream (extraction "" on a file any
  // viewer reads fine).
  async function pdfWithDelimiter(delim: string, content: string): Promise<File> {
    const zlib = new CompressionStream("deflate");
    const deflated = new Uint8Array(
      await new Response(new Blob([content]).stream().pipeThrough(zlib)).arrayBuffer()
    );
    const head = new TextEncoder().encode(delim);
    const tail = new TextEncoder().encode("\r\nendstream\r\nendobj");
    const pdf = new Uint8Array(2 + head.length + deflated.length + tail.length);
    pdf.set(new TextEncoder().encode("<<"), 0);
    pdf.set(head, 2);
    pdf.set(deflated, 2 + head.length);
    pdf.set(tail, 2 + head.length + deflated.length);
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  it("extracts every stream-delimiter variant (space forms + bare CR) — R99-A", async () => {
    const content =
      "BT /F1 12 Tf (Senior HR Manager with payroll, GOSI, compliance, and onboarding skills) Tj ET";
    // the two standard forms stay green (the regression members)…
    for (const delim of ["stream\r\n", "stream\n"]) {
      const text = await extractTextFromFile(await pdfWithDelimiter(delim, content));
      expect(text).toContain("Senior HR Manager");
    }
    // …and the three lost variants come back (the RED members)
    for (const delim of ["stream\r", "stream \r\n", "stream \n"]) {
      const text = await extractTextFromFile(await pdfWithDelimiter(delim, content));
      expect(text).toContain("Senior HR Manager"); // ← RED before the fix: ""
    }
  });

  it("never treats the stream inside endstream as a stream start (the R98-A guard, hardened)", async () => {
    // a PDF whose FIRST stream is space-delimited and whose endstream is
    // followed by a space+CRLF — the shape where a naive space-tolerant
    // regex could re-match inside "endstream \r\n" and garble the walk
    const content1 =
      "BT /F1 12 Tf (Senior HR Manager with payroll, GOSI, compliance, and onboarding skills) Tj ET";
    const content2 =
      "BT /F1 12 Tf (Second page: training, recruitment, and administration experience) Tj ET";
    const deflate = async (s: string): Promise<Uint8Array> => {
      const zlib = new CompressionStream("deflate");
      return new Uint8Array(
        await new Response(new Blob([s]).stream().pipeThrough(zlib)).arrayBuffer()
      );
    };
    const d1 = await deflate(content1);
    const d2 = await deflate(content2);
    const enc = (s: string) => new TextEncoder().encode(s);
    const parts: Uint8Array[] = [
      enc("1 0 obj\n<< /Length " + d1.length + " >>\nstream \r\n"), // space delimiter
      d1,
      enc("\r\nendstream \r\nendobj\n"), // endstream followed by space+CRLF
      enc("2 0 obj\n<< /Length " + d2.length + " >>\nstream \r\n"),
      d2,
      enc("\r\nendstream \r\nendobj\n%%EOF"),
    ];
    const total = parts.reduce((n, p) => n + p.length, 0);
    const pdf = new Uint8Array(total);
    let o = 0;
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    const file = new File([pdf], "resume.pdf", { type: "application/pdf" });
    const text = await extractTextFromFile(file);
    expect(text).toContain("Senior HR Manager");
    expect(text).toContain("Second page"); // both streams, reading order
    expect(text.indexOf("Senior HR Manager")).toBeLessThan(text.indexOf("Second page"));
  });

  // Session 99 (R99-B): hex strings + subset-font ToUnicode CMaps — the
  // real-writer pin. The round's downloaded W3C dummy.pdf (a REAL,
  // unencrypted, text-carrying PDF) extracted 0 chars: its content stream
  // writes text as <01020303> Tj (hex, not literal) and its hex bytes are
  // GLYPH INDICES mapped to characters by a trailing bfchar CMap stream
  // (<01>→D, <02>→u, <03>→m… spelling "Dummy PDF file").
  async function multiPartPdf(streams: { delim?: string; content: string }[]): Promise<File> {
    const deflate = async (s: string): Promise<Uint8Array> => {
      const zlib = new CompressionStream("deflate");
      return new Uint8Array(
        await new Response(new Blob([s]).stream().pipeThrough(zlib)).arrayBuffer()
      );
    };
    const enc = (s: string) => new TextEncoder().encode(s);
    const parts: Uint8Array[] = [];
    for (let i = 0; i < streams.length; i++) {
      const d = await deflate(streams[i].content);
      parts.push(enc(`${i + 1} 0 obj\n<< /Length ${d.length} >>\n${streams[i].delim ?? "stream\r\n"}`));
      parts.push(d);
      parts.push(enc("\r\nendstream\r\nendobj\n"));
    }
    parts.push(enc("trailer\n<< /Root 3 0 R >>\n%%EOF"));
    const total = parts.reduce((n, p) => n + p.length, 0);
    const pdf = new Uint8Array(total);
    let o = 0;
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  it("extracts hex-string text through a trailing bfchar ToUnicode CMap (the W3C dummy.pdf shape) — R99-B", async () => {
    // glyph 05 = space; every distinct letter gets its own glyph code;
    // the CV-shaped body runs past the 40-alnum guard through the map
    const glyphFor: Record<string, string> = {};
    const codes: string[] = [];
    const words = "Dummy PDF file Senior HR Manager with payroll GOSI compliance and onboarding skills";
    for (const ch of words) {
      if (ch === " ") {
        codes.push("05");
        continue;
      }
      let code = Object.keys(glyphFor).find((k) => glyphFor[k] === ch);
      if (!code) {
        code = (0x10 + Object.keys(glyphFor).length).toString(16).padStart(2, "0");
        glyphFor[code] = ch;
      }
      codes.push(code);
    }
    const cmapLines = Object.entries(glyphFor)
      .map(([c, ch]) => `<${c}> <${ch.charCodeAt(0).toString(16).padStart(4, "0").toUpperCase()}>`)
      .join("\n");
    const cmap = [
      "/CIDInit/ProcSet findresource begin\n12 dict begin\nbegincmap",
      "/CIDSystemInfo<< /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def",
      "/CMapName/Adobe-Identity-UCS def\n/CMapType 2 def",
      "1 begincodespacerange\n<00> <FF>\nendcodespacerange",
      `${Object.keys(glyphFor).length + 1} beginbfchar`,
      `<05> <0020>\n${cmapLines}`,
      "endbfchar\nendcmap\nend",
    ].join("\n");
    const hexText = codes.join("");
    const file = await multiPartPdf([
      { content: `BT /F1 12 Tf <${hexText}> Tj ET` }, // hex, no literal anywhere
      { content: cmap }, // the CMap rides AFTER the content stream (dummy.pdf order)
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("Dummy PDF file");
    expect(text).toContain("payroll");
    expect(text).toContain("onboarding");
  });

  it("extracts hex atoms inside TJ arrays in reading order (mixed with literals)", async () => {
    // [<…> -120 (…)] TJ — hex atoms ride inside the array body today but
    // the atom walk only collected (…) groups; the hex atoms were dropped.
    // The literals alone clear the 40-alnum guard, so the RED pins the hex
    // atoms specifically (the r97 fixture-length lesson): "training" and
    // "and development" appear ONLY in the hex atoms.
    const file = await pdfWithContent(
      "BT /F1 12 Tf [(Senior HR Manager with GOSI, compliance, onboarding, administration, recruitment experience) -250 <747261696E696E67>] TJ [<20616E6420646576656C6F706D656E74> (skills listed here)] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("Senior HR Manager"); // the literal (old-code green)
    expect(text).toContain("recruitment experience");
    expect(text).toContain("training"); // ← RED before the fix: the hex atom dropped
    expect(text).toContain("and development"); // ← RED before the fix: the leading hex atom
    expect(text).toContain("skills listed here");
  });

  it("decodes hex-encoded Latin-1 text without a CMap (the Word-style hex form)", async () => {
    // <44756D6D79…> Tj — hex-encoded WinAnsi/Latin-1, no ToUnicode map:
    // printable bytes kept, the WinAnsi high block mapped, controls → space.
    // The hex is computed from the string (ASCII → latin1 hex is identity).
    const body = "Dummy PDF file with payroll and GOSI compliance onboarding";
    const hex = Buffer.from(body, "latin1").toString("hex").toUpperCase();
    const file = await pdfWithContent(`BT /F1 12 Tf <${hex}> Tj ET`);
    const text = await extractTextFromFile(file);
    expect(text).toContain("Dummy PDF file");
    expect(text).toContain("payroll and GOSI");
  });

  it("decodes through bfrange CMaps (base-offset and array forms)", async () => {
    // bfrange base-offset: 20..27 map to 0041..0048 (A..H);
    // bfrange array: 30..32 map to [0050 0051 0052] (P Q R)
    const cmap = [
      "/CIDInit/ProcSet findresource begin\nbegincmap",
      "1 begincodespacerange\n<00> <FF>\nendcodespacerange",
      "1 beginbfrange\n<20> <27> <0041>\nendbfrange",
      "1 beginbfrange\n<30> <32> [<0050> <0051> <0052>]\nendbfrange",
      "endcmap\nend",
    ].join("\n");
    const file = await multiPartPdf([
      // A B C H P Q R repeated — the mapped yield clears the 40-alnum guard
      { content: "BT /F1 12 Tf <202122273031322021222730313220212227303132202122273031322021222730313220212227303132> Tj ET" },
      { content: cmap },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("ABCH");
    expect(text).toContain("PQR");
  });

  it("decodes 2-byte codes through an Identity-H-shaped CMap (the CID form)", async () => {
    // codespace <0000> <FFFF> → 2-byte codes; 0001→'H', 0002→'R', 0003→' '
    const cmap = [
      "/CIDInit/ProcSet findresource begin\nbegincmap",
      "1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange",
      "3 beginbfchar\n<0001> <0048>\n<0002> <0052>\n<0003> <0020>\nendbfchar",
      "endcmap\nend",
    ].join("\n");
    // 21 code triples (0001 0002 0003) = "HR HR … HR" — 42 alnums, past
    // the 40-alnum guard (the r97 fixture-length lesson)
    const body = "000100020003".repeat(21);
    const file = await multiPartPdf([
      { content: `BT /F1 12 Tf <${body}> Tj ET` },
      { content: cmap },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("HR HR HR HR");
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
