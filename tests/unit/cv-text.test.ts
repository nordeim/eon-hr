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

  // Session 100 (R100-A): the per-glyph Tj+Td positioning form — the
  // Acrobat/LiveCycle XFA writer class, pinned on the REAL IRS f1040 (PDF
  // 1.7, 30 ObjStm objects). LiveCycle writes each glyph as its OWN (X)Tj
  // show with a glyph-advance Td move between them (0.2–0.65 em) while
  // word gaps are bigger Td moves (1.2+ em) and spaces ride INSIDE atoms
  // ((IRA distributions )Tj). The old walk joined EVERY atom with " " —
  // a per-glyph word extracted as letter soup and the scorer's tokenizer
  // (<3-char tokens dropped) could never match a keyword. The fix: the
  // position-aware join — em = |tx| / Tf_size (the Tm scale cancels);
  // < 1.0 em same-line forward move → NO space; ≥ 1.0 em, backwards, or
  // ty ≠ 0 → space / newline.
  it("joins per-glyph Tj shows separated by glyph-advance Td moves into words (the Acrobat/LiveCycle form — R100-A)", async () => {
    // the IRS f1040's verbatim shapes: per-glyph runs at 0.2–0.65 em,
    // word gaps at 2.0+ em, whole-word label atoms, spaces inside atoms
    const file = await pdfWithContent(
      "BT /T1_0 1 Tf 6.79 0 0 7 472 676.002 Tm\n" +
        "(S)Tj 0.641 0 Td (p)Tj 0.603 0 Td (o)Tj 0.603 0 Td (u)Tj 0.585 0 Td (s)Tj 0.529 0 Td (e)Tj\n" +
        "2.356 0 Td (IRA distributions )Tj\n" +
        "(A)Tj 0.62 0 Td (d)Tj 0.55 0 Td (m)Tj 0.65 0 Td (i)Tj 0.3 0 Td (n)Tj\n" +
        "2.0 0 Td (p)Tj 0.62 0 Td (a)Tj 0.55 0 Td (y)Tj 0.52 0 Td (r)Tj 0.4 0 Td (o)Tj 0.58 0 Td (l)Tj 0.3 0 Td (l)Tj\n" +
        "2.0 0 Td (s)Tj 0.5 0 Td (e)Tj 0.5 0 Td (n)Tj 0.55 0 Td (i)Tj 0.3 0 Td (o)Tj 0.55 0 Td (r)Tj\n" +
        "1.8 0 Td (e)Tj 0.5 0 Td (x)Tj 0.55 0 Td (p)Tj 0.55 0 Td (e)Tj 0.5 0 Td (r)Tj 0.4 0 Td (i)Tj 0.3 0 Td (e)Tj 0.5 0 Td (n)Tj 0.55 0 Td (c)Tj 0.5 0 Td (e)Tj\n" +
        "ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("Spouse"); // ← RED before the fix: "S p o u s e"
    expect(text).toContain("Admin"); // ← RED before the fix: "A d m i n"
    expect(text).toContain("payroll"); // ← RED before the fix: "p a y r o l l"
    expect(text).toContain("senior experience"); // ← RED before the fix: letter soup
    expect(text).toContain("IRA distributions"); // the whole-word atom (old-code green member)
  });

  it("applies the em rule through the Tf size (a size-12 writer's point-unit Td moves)", async () => {
    // /F1 12 Tf + identity Tm: the Td operands are POINT units — the em
    // denominator must come from the Tf size (6.2/12 = 0.52 em joins;
    // 14.5/12 = 1.21 em separates)
    const file = await pdfWithContent(
      "BT /F1 12 Tf 1 0 0 1 72 720 Tm\n" +
        "(p)Tj 6.2 0 Td (a)Tj 5.9 0 Td (y)Tj 6.1 0 Td (r)Tj 4.2 0 Td (o)Tj 5.8 0 Td (l)Tj 3.1 0 Td (l)Tj\n" +
        "14.5 0 Td (admin)Tj 13.0 0 Td (specialist)Tj 15.2 0 Td (compliance)Tj 14.9 0 Td (training)Tj 13.8 0 Td (GOSI)Tj\n" +
        "ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("payroll admin"); // ← RED before the fix: "p a y r o l l admin"
    expect(text).toContain("specialist compliance"); // whole-word atoms (old-code green member)
    expect(text).toContain("training GOSI");
  });

  it("splits words at the 1.0-em boundary (0.9 em joins, 1.1 em separates)", async () => {
    // the real form's classes: glyph advances ≤ 0.65 em, word gaps ≥ 1.2 em
    // — the threshold pin. The long leading atom clears the 40-alnum guard
    // so the extraction reaches the assertions.
    const file = await pdfWithContent(
      "BT /F1 10 Tf (HRIS administration onboarding payroll compliance GOSI training)Tj 20 0 Td (ab)Tj 9.0 0 Td (cd)Tj 11.0 0 Td (ef)Tj ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("abcd"); // ← RED before the fix: "ab cd"
    expect(text).toContain("abcd ef"); // ← RED before the fix: "ab cd ef"
  });

  it("starts a new line at a ty≠0 Td move (the line-break rule)", async () => {
    const file = await pdfWithContent(
      "BT /F1 12 Tf (Admin specialist payroll experience)Tj 0 -14.4 Td (HRIS training onboarding GOSI compliance)Tj ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("experience\nHRIS"); // ← RED before the fix: "experience HRIS"
  });

  // Session 100 (R100-A) guards: the join fix must NOT eat the standing
  // space semantics — adjacent shows with NO positioning between them and
  // the TJ-array internals keep their spaces (the R97 fixture's -120 IS a
  // word gap; over-joining would break the r97/r98/r99 regression net).
  it("keeps the standing space join between adjacent shows with no positioning between them (the guard)", async () => {
    // the body clears the 40-alnum guard (the r97 fixture-length lesson)
    const file = await pdfWithContent(
      "BT /F1 12 Tf (Senior HR Manager)Tj (with)Tj (payroll compliance GOSI training onboarding)Tj ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("Manager with"); // a space, never "Managerwith"
    expect(text).toContain("with payroll");
  });

  it("keeps the TJ-array internal space join (the R97 semantics — the over-fix guard)", async () => {
    const file = await pdfWithContent(
      "BT /F1 12 Tf [(Senior HR Manager) -120 (with payroll, GOSI, and compliance skills)] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("Manager with payroll"); // the -120 keeps its space
  });

  // Session 100 (R100-B): the ObjStm/compressed-object form — the
  // classification pin. ISO 32000-1 §7.5.7 FORBIDS stream objects inside
  // object streams, so a compliant PDF's content streams are ALWAYS
  // standalone stream…endstream objects (what the scanner walks) while the
  // ObjStm bodies carry only dicts. Pinned on the REAL IRS f1040 (30
  // ObjStm) and the arXiv paper (11 ObjStm): both extract. This fixture
  // locks the walk green — the ObjStm body contributes NOTHING, the
  // standalone content stream extracts.
  it("extracts a PDF whose non-stream objects ride compressed object streams (the ObjStm form — R100-B pin)", async () => {
    const objstmBody =
      "12 dict begin\n" +
      "6 0 obj\n<< /Type /Page /Parent 2 0 R /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n" +
      "7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n" +
      "end";
    const content = "BT /F1 12 Tf (HRIS administration onboarding payroll compliance GOSI training specialist)Tj ET";
    const file = await multiPartPdf([{ content: objstmBody }, { content }]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("HRIS administration"); // the standalone content stream extracts
    expect(text).not.toContain("Helvetica"); // the ObjStm body contributes nothing
    expect(text).not.toContain("endobj"); // no dict garbage ever reaches the yield
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
