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

  // Session 101 (R101-A): the TJ-array INTERNAL kerns — pinned on three NEW
  // real writers (the r101 real-file leg): Word for Office 365 (pitt), the
  // Adobe PDF Library (tisch), and pdfTeX (arXiv — the standing corpus file
  // re-read). All three write TJ arrays whose inter-atom numbers are KERNING
  // adjustments in thousandths of text space (Word ≤ 11, Adobe ≤ 92, pdfTeX
  // ≤ 52) while the words' SPACES ride INSIDE atoms — pdfTeX additionally
  // encodes word GAPS as numbers (209–442). The blind space-join split every
  // kerned word ("In for m ation", "Car eer", "Lay erSkip"). The fix: the
  // 0.1-em threshold — |N| ≥ 100 thousandths is a gap (the typographic kern
  // boundary; the R97 fixture's -120 stays a gap), under is a kern → join.
  it("joins TJ atoms across kerning numbers (the real Word writer form — R101-A)", async () => {
    // verbatim from the real pitt-word.pdf stream (the Office-365 writer):
    // [(In)-4(for)7(m)-6(ation)-2( T)-2(e)4(c)4(h)-3(n)-3(o)10(logy)] TJ
    const file = await pdfWithContent(
      "BT /F2 12 Tf [(Pitt)] TJ ET BT /F2 12 Tf [(In)-4(for)7(m)-6(ation)-2( T)-2(e)4(c)4(h)-3(n)-3(o)10(logy)] TJ ET BT /F1 12 Tf [(tec)6(hnology.pi)-3(tt)-3(.e)4(du)] TJ ET BT /F1 12 Tf [(La)5(st Upda)3(ted: 11/01/)-3(19)] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("Information Technology"); // ← RED before the fix: "In for m ation T e c h n o logy"
    expect(text).toContain("technology.pitt.edu"); // ← RED before the fix: "tec hnology.pi tt .e du"
    expect(text).toContain("Last Updated: 11/01/19"); // ← RED before the fix: "La st Upda ted: 11/01/ 19"
  });

  it("joins TJ atoms across the Adobe PDF Library kerns (the tisch writer form)", async () => {
    // verbatim from the real tisch-resume.pdf stream: the +18 kerns inside
    // "Office" and "Career" (the InDesign family writes positive kerns)
    const file = await pdfWithContent(
      "BT /T1_1 1 Tf 9 0 0 9 243.36 65.682 Tm [(Tisch Of)18(fice of Car)18(eer Development)]TJ ET BT /T1_2 1 Tf 0 -1.417 TD [(726 Br)18(oadway)92(, 2nd Floor)]TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("Tisch Office of Career Development"); // ← RED before the fix: "Car eer"
    expect(text).toContain("726 Broadway, 2nd Floor"); // ← RED before the fix: "Br oadway)92(, 2nd Floor" splits
  });

  it("joins pdfTeX kerns while keeping its numeric word gaps (the arXiv writer form)", async () => {
    // verbatim from the real arXiv stream: the +25 kern inside "LayerSkip"
    // and the -322/-211 GAP numbers between words (pdfTeX's interword glue)
    const file = await pdfWithContent(
      "BT /F41 18.1831 Tf 87.797 696.158 Td [(Lay)25(erSkip:)-322(Enabling)-211(Early)-211(Exit)-211(Inference)-211(and)]TJ 0 -19.343 Td [(Self-Speculativ)25(e)-211(Decoding)]TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("LayerSkip: Enabling Early Exit Inference and"); // ← RED before the fix: "Lay erSkip:"
    expect(text).toContain("Self-Speculative Decoding"); // ← RED before the fix: "Speculativ e"
  });

  // The r101 boundary spec (99 joins / 100 gaps, sign-blind) was REDESIGNED
  // at session 102 (R102-C): the real LibreOffice files write the classic
  // T-overhang kerns as POSITIVE +110…+149 thousandths, which the sign-blind
  // rule read as word gaps ("T eam", "T ool", "T ables" — 471 artifacts on
  // the real writer guide). The sign census: every REAL word gap is NEGATIVE.
  // The sign-aware redesign lives in the session-102 block below ("splits
  // the TJ kern/gap boundary by SIGN at 0.1 em").

  it("sums consecutive TJ numbers before the threshold test (the spec's array form)", async () => {
    // the PDF spec allows multiple consecutive numbers between atoms — they
    // SUM: -30 + -30 = 60 thousandths = a kern → join; each alone is sub-100
    const file = await pdfWithContent(
      "BT /F1 12 Tf [(ad)4(min)4(istration )] TJ [(HR)3(IS )] TJ [(compliance training onboarding specialist platform payroll admin experience systems technology securely here)] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("administration"); // ← RED before the fix: "ad min istration"
    expect(text).toContain("HRIS"); // ← RED before the fix: "HR IS"
  });

  it("joins hex atoms across TJ kerns (the hex-in-array kern path)", async () => {
    // <61 62> = "ab", kern 18, <63 64> = "cd", no number, <65 66> = "ef":
    // the kern joins, the adjacency keeps the standing space join
    const file = await pdfWithContent(
      "BT /F1 12 Tf [(payroll admin compliance training onboarding specialist platform experience listed)] TJ [<61 62> 18 <63 64> <65 66>] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("abcd"); // ← RED before the fix: "ab cd"
  });

  // Session 101 (R101-A) guards: the kern fix must NOT eat the standing
  // space semantics — adjacent atoms with NO number between them keep the
  // space join, and the ≥100 gap numbers keep theirs (the over-fix guards).
  it("keeps the standing space join between adjacent TJ atoms with no number (the guard)", async () => {
    const file = await pdfWithContent(
      "BT /F1 12 Tf [(Senior HR Manager) (with payroll, GOSI, and compliance skills)] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("Manager with payroll"); // a space, never "Managerwith"
  });

  it("keeps the TJ gap numbers' spaces (the pdfTeX gap class — the over-fix guard)", async () => {
    // pdfTeX's -322 interword glue is a GAP: the kern join must never fuse
    // across it (the r100 over-fix pattern applied at the array layer)
    const file = await pdfWithContent(
      "BT /F1 12 Tf [(payroll admin) -322 (specialist compliance) -250 (training onboarding)] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("payroll admin specialist compliance training onboarding"); // the gaps keep their spaces
  });

  // Session 101 (R101-C): the Type3-font classification pin — the arXiv
  // paper's 7 Type3 fonts (the Matplotlib pdf backend) declare
  // /Subtype /Type3 with /Encoding /Differences arrays that map ASCII-valued
  // codes to the standard Latin glyph names (43 /plus, 48 /zero …), so their
  // literal shows carry bytes that already decode correctly through the
  // standing Latin-1 path. A non-ASCII /Differences remap would need the
  // Differences parse — no real file in the corpus has one (the watch).
  it("extracts a Type3-declared font's literal shows (the Matplotlib form — R101-C pin)", async () => {
    const file = await pdfWithContent(
      "BT /T3_0 9.9626 Tf 1 0 0 1 103.473 129.118 Tm (stochastic depth training with early exit inference layers) Tj ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("stochastic depth training"); // the Type3 shape extracts via the literal path
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

  // Session 102 (R102-A/B/C): the LibreOffice real-writer round — the 8th
  // writer family (LibreOffice 26.2 / PDF 2.0, pinned on the real Writer +
  // Calc guides) exposed three defect classes: (A) the non-content-stream
  // crash — a 26MB /Subtype /Image stream's binary garbage blows the V8
  // regex stack inside pdfTextPieces and kills the WHOLE file's extraction;
  // (B) the font-scoped CMap decode — 15 subset fonts each restart glyph
  // codes at <01>, and the first-covering-CMap rule decodes every font's
  // atoms through the wrong map (gibberish); (C) the T-overhang kerns —
  // LibreOffice writes the classic T-lowercase kerns as POSITIVE +110…+149
  // thousandths, which the r101 |sum| rule read as word gaps ("T eam").
  async function pdfWithObjects(
    objects: ({ raw: string } | { dict: string; stream: string })[]
  ): Promise<File> {
    const encS = (s: string) => new TextEncoder().encode(s);
    const parts: Uint8Array[] = [];
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      if ("raw" in obj) {
        parts.push(encS(`${i + 1} 0 obj\n${obj.raw}\nendobj\n`));
      } else {
        const deflated = new Uint8Array(
          await new Response(new Blob([obj.stream]).stream().pipeThrough(new CompressionStream("deflate"))).arrayBuffer()
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
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  it("skips /Image and binary streams without losing the text (the LibreOffice crash — R102-A)", async () => {
    // the real writer-guide shape: a /Subtype /Image object carrying
    // text-op-shaped decoys, a dict-less binary stream (the ratio-gate
    // member), and a real content stream. Before the fix the garbage
    // streams' decoys polluted the yield (and at the real file's 26MB
    // scale the regex walk itself dies in a RangeError).
    const file = await pdfWithObjects([
      { raw: "/Type /Catalog /Pages 2 0 R" },
      {
        dict: "/Type /XObject /Subtype /Image /Width 2000 /Height 4000 /ColorSpace /DeviceRGB",
        stream: "(IMAGEGARBAGE999) Tj ".repeat(200),
      },
      {
        dict: "/Filter /FlateDecode",
        stream: "\uFFFD\uFFFD\uFFFD".repeat(1200) + " (TEXTGARBAGE888) Tj " + "\uFFFD\uFFFD\uFFFD".repeat(1200),
      },
      {
        dict: "/Filter /FlateDecode",
        stream: "BT /F1 12 Tf (Senior HR Manager with payroll and compliance skills) Tj ET",
      },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("Senior HR Manager with payroll"); // ← the real text survives
    expect(text).not.toContain("IMAGEGARBAGE999"); // ← RED before the fix: the image decoys pollute
    expect(text).not.toContain("TEXTGARBAGE888"); // ← RED before the fix: the binary decoys pollute
  });

  it("decodes each font's hex atoms through its OWN ToUnicode CMap (the 15-font subset form — R102-B)", async () => {
    // the real LibreOffice form: every subset font restarts its glyph codes
    // at <01>. F1's CMap maps 01→"A"; F2's maps 01→"B". The standing
    // first-covering rule decoded BOTH through F1's map ("A A"); the fix
    // resolves the /F-name → font object → /ToUnicode object chain.
    const cmap = (code: string, ch: string) =>
      `/CIDInit/ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo<< /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName/Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<00> <FF>\nendcodespacerange\n1 beginbfchar\n<${code}> <${ch}>\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
    const file = await pdfWithObjects([
      { raw: "<< /Type /Catalog /Pages 8 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmap("01", "0041") },
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /SubsetOne /ToUnicode 2 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmap("01", "0042") },
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /SubsetTwo /ToUnicode 4 0 R >>" },
      { raw: "<< /Font << /F1 3 0 R /F2 5 0 R >> >>" },
      { raw: "<< /Type /Page /Resources 6 0 R >>" },
      {
        dict: "/Filter /FlateDecode",
        stream: "BT /F1 12 Tf <01> Tj 20 0 Td /F2 12 Tf <01> Tj ET\nBT /F3 12 Tf (payroll admin compliance training onboarding specialist platform systems technology) Tj ET",
      },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("A B"); // ← RED before the fix: "A A" (both through F1's map — F1's CMap covers the code)
    expect(text).toContain("payroll admin compliance"); // the guard-clearing literal (F3 has no CMap — the literal path)
  });

  it("joins TJ atoms across the POSITIVE T-overhang kerns (the LibreOffice form — R102-C)", async () => {
    // verbatim from the real writer-guide stream: <05>18<01>110<0B> — F2's
    // 05 is the SPACE GLYPH, 01 = "T": the +110 between the T-atom and the
    // eam-atom is the classic T-lowercase overhang kern (~0.11 em in
    // LiberationSans — the biggest kern class in common fonts). LibreOffice
    // encodes word spaces as GLYPHS, never as numbers.
    const file = await pdfWithContent(
      "BT /F1 12 Tf [(T) 110 (eam )] TJ [(T) 125 (ools )] TJ [(payroll admin compliance training onboarding specialist platform systems technology)] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("Team"); // ← RED before the fix: "T eam"
    expect(text).toContain("Tools"); // ← RED before the fix: "T ools"
  });

  it("splits the TJ kern/gap boundary by SIGN at 0.1 em (-100 gaps, +100 joins — the R102-C redesign)", async () => {
    // the r102 sign census (both real LibreOffice files, every inter-atom
    // number): every REAL word gap is NEGATIVE (pdfTeX's -209…-442 glue,
    // the R97 fixture's -120/-250) while the positive >= 100 class is
    // kerns (LibreOffice's +110…+149 T-overhangs). The r101 |sum| rule
    // read the positives as gaps — the r97 lesson, sixth application:
    // real files override fixture assumptions.
    const file = await pdfWithContent(
      "BT /F1 12 Tf [(wordwordword) 99 (joinjoinjoin)] TJ [(gapgapgap) -100 (separated)] TJ [(joinword) 100 (edword)] TJ [(payroll admin compliance training onboarding experience platform listed here for the guard)] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("wordwordwordjoinjoinjoin"); // the sub-100 kern joins (unchanged)
    expect(text).toContain("gapgapgap separated"); // the NEGATIVE 100 gap keeps its space (unchanged)
    expect(text).toContain("joinwordedword"); // ← RED before the fix: "joinword edword" (the positive 100 joins — the LibreOffice T-kern class)
  });

  it("walks a pure-graphics stream without crashing and keeps the file's text (the content-gate guard)", async () => {
    // a stream with no text operators contributes nothing — the gate must
    // never turn that into a lost file
    const file = await pdfWithObjects([
      { raw: "<< /Type /Catalog >>" },
      { dict: "/Filter /FlateDecode", stream: "1 w\nq 0 0.028 595.276 841.861 re\nW* n\n50.95 388.139 m\n524.45 388.139 l\nh\nf*\nQ" },
      {
        dict: "/Filter /FlateDecode",
        stream: "BT /F1 12 Tf (payroll specialist with compliance and onboarding training experience) Tj ET",
      },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("payroll specialist with compliance");
  });

  // Session 103 (R103-B/C): the Google Docs/Skia + LuaTeX real-writer round —
  // the 9th and 10th writer families (gdocs-cv-template.pdf, Producer "Skia/PDF
  // m158 Google Docs Renderer"; martino-lualatex.pdf, Producer "LuaTeX-0.80.0")
  // carry their word positioning in the Tm TRANSLATION, which the walk
  // blind-reset. The Skia form: every word its own BT block — a FLIPPED
  // axis-aligned Tm + a CONSTANT-baseline Td (-14.2578125 on every word) + a
  // hex Tj, with the line geometry in the enclosing q…cm…Q block — the ty≠0
  // rule fired a newline for EVERY word (word-per-line soup) and the same-BT
  // split-word continuations ("COMP" Td(47.6875,0) "ANY") fired the ≥1-em
  // gap rule ("COMP ANY"). The LuaTeX form: every word AND every glyph its
  // own Tm — the blind reset space-joined every letter (1,012 letter-soup
  // runs, every keyword dead).
  it("joins the Skia form's words with spaces through the constant-baseline Td (the Google Docs word-per-line fix — R103-B)", async () => {
    // the real gdocs shape: Tm(1 0 0 -1 ex ey) + Td(tx, -14.25) per word,
    // explicit space-glyph pieces between words (the tx = the offset from
    // the line origin — verbatim from the real file's MCID 4 block)
    const word = (w: string, tx: number) =>
      `BT /F1 16 Tf 1 0 0 -1 465.14063 1.10218716 Tm ${tx} -14.2578125 Td (${w}) Tj ET`;
    const content = [
      word("securely", 0),
      word(" ", 45.7),
      word("support", 49.7),
      word(" ", 105.4),
      word("specialist", 109.4),
      word(" ", 187.6),
      word("platform", 191.6),
      word(" ", 253.4),
      word("systems", 257.4),
      word(" ", 312.8),
      word("admin", 316.8),
    ].join("\n");
    const file = await pdfWithContent(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("securely support specialist platform"); // ← RED before the fix: "securely\n \nsupport" (every word on its own line)
    expect(text).toContain("platform systems admin"); // the tail words through the same join
  });

  it("joins the Skia same-BT split-word continuations in a space-glyph stream (the R103-C conditional)", async () => {
    // the real gdocs split shape: (s) then Td(40.2, 0) then (ystems) inside
    // ONE BT block — the tx is exactly the preceding part's width (the
    // kern-pair shaping split). The stream writes explicit space pieces
    // (the Skia/LO convention: word gaps are glyphs, never bare moves), so
    // the bare em-gap move is a CONTINUATION — the assembly-time
    // conditional joins it.
    const content = [
      "BT /F1 16 Tf 1 0 0 -1 100 50 Tm 0 -14.25 Td (payroll admin compliance training onboarding experience) Tj ET",
      "BT /F1 16 Tf 1 0 0 -1 100 50 Tm 300 -14.25 Td ( ) Tj ET",
      "BT /F1 16 Tf 1 0 0 -1 100 50 Tm 304 -14.25 Td (s) Tj 40.2 0 Td (ystems) Tj ET",
    ].join("\n");
    const file = await pdfWithContent(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("systems"); // ← RED before the fix: "s" and "ystems" split by the ≥1-em gap rule
  });

  it("assembles per-glyph Tm blocks into words (the LuaTeX form — R103-B)", async () => {
    // the real martino-luatex shape: every glyph its own BT+Tm block, the
    // letter advances at 0.45–0.55 em, the word gaps at 1.2+ em (a
    // single-code TJ array in the real file — a literal Tj here, the same
    // operator walk)
    const glyph = (ch: string, x: number) =>
      `BT /F1 10 Tf 1 0 0 1 ${x} 650 Tm (${ch}) Tj ET`;
    const xs = { t: 100, e: 105, c: 110, h: 114.5, n: 119, o: 123.5, l: 128, g: 137, y: 141.5, a: 160, d: 165, m: 170.5, i: 173.5 };
    const content = [
      "BT /F1 12 Tf 1 0 0 1 100 700 Tm (payroll specialist compliance onboarding training experience) Tj ET",
      glyph("t", xs.t), glyph("e", xs.e), glyph("c", xs.c), glyph("h", xs.h), glyph("n", xs.n),
      glyph("o", xs.o), glyph("l", xs.l), glyph("o", 132.5), glyph("g", xs.g), glyph("y", xs.y),
      glyph("a", xs.a), glyph("d", xs.d), glyph("m", xs.m), glyph("i", xs.i), glyph("n", 176.5),
    ].join("\n");
    const file = await pdfWithContent(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("technology admin"); // ← RED before the fix: "t e c h n o l o g y  a d m i n" (every letter spaced)
  });

  it("keeps the pdfTeX per-line Tm steps as line breaks through the fresh-run baseline suppression (the R103-B guard)", async () => {
    // the arXiv form: a Tm per line + a Td(0, -1.2em) baseline — the line
    // signal lives in the Tm-origin dy (the suppression of the fresh-run
    // Td's ty must not lose it)
    const content = [
      "BT /F1 10 Tf 1 0 0 1 100 700 Tm 0 -12 Td (payroll admin compliance first line) Tj ET",
      "BT /F1 10 Tf 1 0 0 1 100 688 Tm 0 -12 Td (training onboarding second line) Tj ET",
    ].join("\n");
    const file = await pdfWithContent(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("first line\ntraining"); // the per-line Tm dy (-1.2 em) keeps its newline
    expect(text).toContain("payroll admin compliance");
  });

  it("keeps the standing reset for ROTATED Tm matrices (the IRS sideways-label form — the R103-B guard)", async () => {
    // the real IRS f1040 form: /T1_0 with a rotated matrix (0 7 -6.9999 0 …)
    // — the origin-delta math has no meaning there; the rotated branch must
    // keep the standing blind-reset behavior and not break the next
    // axis-aligned run
    const content = [
      "BT /T1_0 1 Tf 0 7 -6.9999 0 41.598 748.001 Tm (Form) Tj ET",
      "BT /T1_1 1 Tf 24 0 0 24 43.2 748.062 Tm (1040 payroll admin compliance training onboarding specialist experience guard) Tj ET",
    ].join("\n");
    const file = await pdfWithContent(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("Form");
    expect(text).toContain("1040 payroll admin compliance");
  });

  it("never joins TJ-array internal numeric gaps in a space-glyph stream (the fromKern restriction — the arXiv regression guard)", async () => {
    // the prototype's own dead end, pinned: pdfTeX writes a FEW standalone
    // space pieces in some streams — the first draft's "any space piece ⇒
    // all gaps join" conditional fused 350 arXiv words through their -322
    // TJ-internal numeric gaps. A TJ-internal NUMBER is the writer's
    // explicit kern/gap intent and is NEVER conditional — only Td/Tm
    // move-driven gaps are.
    const content =
      "BT /F1 12 Tf (payroll admin compliance training onboarding experience guard words here) Tj ( ) Tj [(wordgap) -322 (separated)] TJ ET";
    const file = await pdfWithContent(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("wordgap separated"); // the numeric gap keeps its space even though the stream writes space pieces
  });

  // Session 104 (R104-C/D): the XeTeX real-writer round — the 12th writer
  // family (Tanmay_CV.pdf, Producer "xdvipdfmx \(20210318\)"; plus the 2026
  // dvipdfmx manual and fontspec.pdf) exposed TWO defect classes: (C) every
  // word its own BT block with an ABSOLUTE Td and NO Tm — same-line words
  // share the identical ty, the next line's ty differs by the leading — and
  // the walk (no BT awareness, shownSinceTm still true) fired the
  // between-shows ty rule per word: word-per-line soup ("Zooked\nis\na\n…");
  // (D) the R102-B font chain's fToObj is a LAST-WINS Map — a 60+-page doc
  // (fontspec.pdf) names each page's fonts /F1…/F10, so every page's /F1
  // atoms decoded through the LAST page's /F1 CMap ("Font selection for" →
  // "Dnms rdkdbshnm knq").
  it("joins the XeTeX per-word-BT absolute-Td form's words into lines (the word-per-line fix — R104-C)", async () => {
    // the real Tanmay_CV.pdf shape: every word its own BT block —
    // /F Tf tx ty Td [word] TJ ET — the SAME absolute ty for every word on
    // a line (word origins spaced by the word widths + spaces), the next
    // line's ty one leading lower. No Tm anywhere.
    const word = (w: string, tx: number, ty: number) =>
      `BT /F1 12 Tf ${tx} ${ty} Td (${w}) Tj ET`;
    const content = [
      word("securely", 20, 700),
      word("support", 90, 700), // dx 70pt = 5.8em — a word gap
      word("specialist", 160, 700), // dx 70pt — a word gap
      word("systems", 250, 700), // dx 90pt — a word gap
      word("training", 20, 683), // dy -17pt = 1.4em — a line move
      word("onboarding", 95, 683), // dx 75pt — a word gap
      word("compliance", 185, 683), // dx 90pt — a word gap
    ].join("\n");
    const file = await pdfWithContent(content);
    const text = await extractTextFromFile(file);
    // ← RED before the fix: "securely\nsupport\nspecialist\nsystems\n…" —
    // every word on its own line (the between-shows ty rule fired per word)
    expect(text).toContain("securely support specialist systems");
    expect(text).toContain("training onboarding compliance");
    expect(text).toContain("specialist systems\ntraining"); // the line move between the lines
  });

  it("joins the XeTeX same-line sub-em fresh Tds (the glyph-continuation class — the narrow-word residual, by design)", async () => {
    // the real form's bullet→word class: a narrow first piece whose origin
    // delta from the previous word is under 1.0 em — a glyph continuation
    // (the join), the same unthresholdable residual as the r103 LuaTeX
    // narrow-ending word gaps (the two-pass width table watch)
    const content = [
      "BT /F1 12 Tf 20 700 Td (payroll) Tj ET",
      "BT /F1 12 Tf 92 700 Td (admin) Tj ET", // dx 72pt = 6em — a word gap
      "BT /F1 12 Tf 96 700 Td (compliance) Tj ET", // dx 4pt = 0.33em — a continuation
      "BT /F1 12 Tf 170 700 Td (training) Tj ET", // dx 74pt — a word gap
      "BT /F1 12 Tf 240 700 Td (onboarding) Tj ET", // dx 70pt — a word gap
      "BT /F1 12 Tf 312 700 Td (specialist) Tj ET", // dx 72pt — a word gap
    ].join("\n");
    const file = await pdfWithContent(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("payroll admin"); // the first ≥1em gap keeps its space (the join lands BELOW)
    expect(text).toContain("training onboarding specialist"); // the ≥1em gaps keep their spaces
    expect(text).toContain("admincompliance"); // ← the sub-em delta JOINS (the designed residual, pinned)
  });

  it("keeps pdfTeX's per-line absolute Tds as line breaks (the R104-C guard — the fresh-Td dy rule)", async () => {
    // the pdfTeX form is the SAME shape with a different rhythm: one BT
    // block per LINE, the whole line's text inside the TJ array, each
    // line's absolute Td one leading apart — the dy rule must keep the
    // newlines (the line moves) these always carried
    const content = [
      "BT /F1 10 Tf 134.765 657.632 Td [(payroll admin compliance first line) -322 (guard)] TJ ET",
      "BT /F1 10 Tf 134.765 645.678 Td [(training onboarding second line) -250 (guard)] TJ ET",
    ].join("\n");
    const file = await pdfWithContent(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("first line guard");
    expect(text).toContain("first line guard\ntraining"); // the 1.2em dy keeps its newline
    expect(text).toContain("second line guard");
  });

  it("decodes each page's /F1 atoms through that page's OWN ToUnicode map (the multi-page F-name collision — R104-D)", async () => {
    // the real fontspec.pdf shape: TWO resource dicts each naming a
    // DIFFERENT font object /F1, each font with its OWN ToUnicode CMap.
    // Font A's map covers codes 0001-0010 (the "systems support specialist
    // platform securely training" letters); font B's map covers 0001-0010
    // with DIFFERENT letters PLUS 0011-001D (its own "admin oriented
    // management" letters — B-exclusive codes). The last-wins rule decoded
    // EVERY /F1 atom through font B's map (font A's words came out
    // garbled); the fix collects EVERY /F1 candidate and the
    // first-FULLY-COVERING rule picks the atom's own page's map: A's words
    // through A (A covers its codes), B's words through B (A does not
    // cover 0011+).
    const cmapPairs = (name: string, pairs: [string, string][]) =>
      `/CIDInit/ProcSet findresource begin\n12 dict begin\nbegincmap\n/CMapName/${name} def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n${pairs.length} beginbfchar\n${pairs.map(([c, u]) => `<${c}> <${u}>`).join("\n")}\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
    const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(4, "0");
    const uni = (ch: string) => ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0");
    // font A: the distinct letters of its vocabulary, codes 0001+
    const aWords = ["systems", "support", "specialist", "platform", "securely", "training"];
    const aLetters = [...new Set(aWords.join(""))];
    const aCode = new Map(aLetters.map((ch, i) => [ch, hex2(i + 1)]));
    const cmapA = cmapPairs("FontA-UTF16", aLetters.map((ch) => [aCode.get(ch)!, uni(ch)]));
    // font B: the SAME codes map to WRONG letters, plus B-exclusive codes for its own words
    const bWords = ["admin", "oriented", "management"];
    const bLetters = [...new Set(bWords.join(""))];
    const wrong = "qwzvxjk"; // the wrong letters for the colliding codes
    const bPairs: [string, string][] = [];
    aLetters.forEach((_, i) => bPairs.push([hex2(i + 1), uni(wrong[i % wrong.length])]));
    const bCode = new Map(bLetters.map((ch, i) => [ch, hex2(0x11 + i)]));
    bLetters.forEach((ch) => bPairs.push([bCode.get(ch)!, uni(ch)]));
    const cmapB = cmapPairs("FontB-UTF16", bPairs);
    // the content: ONE BT block, the two vocabularies as two TJ lines (the
    // pdfTeX whole-line form — the words separated by TJ-array gap numbers,
    // the lines by a between-shows Td; the fixture rides NO fresh-Td rule
    // so the two fixes' mutation teeth stay isolated)
    const line = (codes: string[][]) => `[${codes.map((w) => `<${w.join("")}> -322 `).join("")}] TJ`;
    const content = `BT /F1 12 Tf 20 700 Td ${line(aWords.map((w) => [...w].map((ch) => aCode.get(ch)!)))}\n0 -20 Td ${line(bWords.map((w) => [...w].map((ch) => bCode.get(ch)!)))} ET`;
    const file = await pdfWithObjects([
      { raw: "<< /Type /Catalog /Pages 9 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmapA }, // obj 2 — font A's ToUnicode
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /FontA /ToUnicode 2 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmapB }, // obj 4 — font B's ToUnicode
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /FontB /ToUnicode 4 0 R >>" },
      { raw: "<< /Font << /F1 3 0 R >> >>" }, // obj 6 — page A's resources: /F1 = font A
      { raw: "<< /Font << /F1 5 0 R >> >>" }, // obj 7 — page B's resources: /F1 = font B
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [] >>" },
    ]);
    const text = await extractTextFromFile(file);
    // ← RED before the fix: the LAST /F1 mapping (font B) wins for BOTH
    // vocabularies — font A's words decode through B's wrong letters
    expect(text).toContain("systems support specialist");
    expect(text).toContain("platform securely training");
    expect(text).toContain("admin oriented management"); // B's own words through B
    expect(text).not.toContain("qqq"); // the wrong-letter decode must not appear
  });

  // Session 105 (R105): the inflate budget round — four defect classes:
  // (A) the inflate has NO output cap (the audit's M-1: a crafted deflate
  // bomb inside a NON-image stream — an ObjStm/Form stream passes the
  // R102-A dict gate — expands unbounded in the tab; the fix: the streaming
  // byte budget, 8MB, two orders above every legitimate stream in the
  // 12-writer corpus); (B) the no-ToUnicode simple-font marker decode (the
  // r105 queue's Dingbats class: /BaseFont /ZapfDingbats's <33> is
  // ✓ U+2713, not "3" — the standard-14 tables as static CodeMaps);
  // (C) the page-tree-aware font chain (the fontspec.pdf one-letter
  // residual: two pages' /F1 maps BOTH fully cover an atom's codes while
  // mapping them differently — the candidate chain's file order picks the
  // wrong one; the fix resolves the content stream's OWN page's mapping
  // through the /Type /Page tree); (D) the two hardenings — lastFreshTd
  // cleared when a Tm run intervenes (a mixed XeTeX+Skia stream must not
  // delta against a stale origin) and the cmapsFor memo.
  it("aborts a stream whose inflated output exceeds the budget without losing the file's real text (the deflate-bomb guard — R105-A)", async () => {
    // a NON-image stream (passes the R102-A dict gate — the fixed path, the
    // §116 fixture lesson) carrying ~8.8MB of text-op-shaped content: before
    // the fix the whole body inflates and its decoys pollute the yield;
    // after, the budget aborts the inflate and the per-stream continue
    // contract keeps the real stream's text
    const bomb = "(BOMBGARBAGE777) Tj ".repeat(420_000);
    const file = await pdfWithObjects([
      { raw: "/Type /Catalog /Pages 3 0 R" },
      { dict: "/Filter /FlateDecode", stream: bomb },
      {
        dict: "/Filter /FlateDecode",
        stream: "BT /F1 12 Tf (Senior HR Manager with payroll and compliance skills) Tj ET",
      },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("Senior HR Manager with payroll"); // the real stream's text survives
    expect(text).not.toContain("BOMBGARBAGE777"); // ← RED before the fix: the bomb inflates fully and pollutes
  });

  it("decodes a ZapfDingbats font's hex atoms through the standard marker table (the no-ToUnicode simple font — R105-B)", async () => {
    // /BaseFont /ZapfDingbats, NO /ToUnicode: <33> is ✓ (U+2713) and <34> is
    // ✔ — the resume-decoration class — never the Latin-1 "34" fallback
    const file = await pdfWithObjects([
      { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /ZapfDingbats >>" },
      { raw: "<< /Font << /F1 2 0 R >> >>" },
      {
        dict: "/Filter /FlateDecode",
        stream:
          "BT /F1 12 Tf <3334> Tj ET\nBT /F2 12 Tf (payroll admin compliance training onboarding specialist platform systems technology) Tj ET",
      },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>" },
      { raw: "<< /Font << /F2 5 0 R >> >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("\u2713\u2714"); // ← RED before the fix: "34" through the Latin-1 fallback
    expect(text).toContain("payroll admin compliance"); // the guard-clearing literal
  });

  it("decodes a Symbol font's hex atoms through the standard marker table (the Greek-letter class — R105-B twin)", async () => {
    // /BaseFont /Symbol, NO /ToUnicode: <41> is Α (U+0391) and <61> is α —
    // the technical-resume Greek class — never the Latin-1 "Aa"
    const file = await pdfWithObjects([
      { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /Symbol >>" },
      { raw: "<< /Font << /F1 2 0 R >> >>" },
      {
        dict: "/Filter /FlateDecode",
        stream:
          "BT /F1 12 Tf <4161> Tj ET\nBT /F2 12 Tf (payroll admin compliance training onboarding specialist platform systems technology) Tj ET",
      },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>" },
      { raw: "<< /Font << /F2 5 0 R >> >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("\u0391\u03B1"); // ← RED before the fix: "Aa" through the Latin-1 fallback
    expect(text).toContain("payroll admin compliance"); // the guard-clearing literal
  });

  it("resolves each page's /F1 atoms through that page's OWN font map — the page-tree chain (the fully-covering collision — R105-C)", async () => {
    // the fontspec.pdf residual class: TWO pages each name their font /F1,
    // and BOTH fonts' ToUnicode maps FULLY cover the same code set while
    // mapping it to DIFFERENT letters (the first-covering blind spot — the
    // R104-D fixture discriminated by B-exclusive codes, this one removes
    // that tell). Page B's resource dict appears FIRST in file order, so the
    // candidate chain decodes page A's atoms through page B's map — the
    // "Dont selection" residual; the page tree binds each content stream to
    // ITS page's mapping.
    const cmapPairs = (name: string, pairs: [string, string][]) =>
      `/CIDInit/ProcSet findresource begin\n12 dict begin\nbegincmap\n/CMapName/${name} def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n${pairs.length} beginbfchar\n${pairs.map(([c, u]) => `<${c}> <${u}>`).join("\n")}\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
    const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(4, "0");
    const uni = (ch: string) => ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0");
    const aWords = ["font", "selection", "for", "the", "xelatex", "writer"];
    const aLetters = [...new Set(aWords.join(""))];
    const aCode = new Map(aLetters.map((ch, i) => [ch, hex2(i + 1)]));
    const cmapA = cmapPairs("FontA-UTF16", aLetters.map((ch) => [aCode.get(ch)!, uni(ch)]));
    // font B's map: the SAME codes → WRONG letters (both maps fully cover
    // the collision set), plus B's own words at B-exclusive codes
    const bWords = ["unicode", "mapping", "tables"];
    const bLetters = [...new Set(bWords.join(""))];
    const wrong = "qwzvxjk";
    const bPairs: [string, string][] = [];
    aLetters.forEach((_, i) => bPairs.push([hex2(i + 1), uni(wrong[i % wrong.length])]));
    const bCode = new Map(bLetters.map((ch, i) => [ch, hex2(0x20 + i)]));
    bLetters.forEach((ch) => bPairs.push([bCode.get(ch)!, uni(ch)]));
    const cmapB = cmapPairs("FontB-UTF16", bPairs);
    const line = (codes: string[][]) => `[${codes.map((w) => `<${w.join("")}> -322 `).join("")}] TJ`;
    const contentA = `BT /F1 12 Tf 20 700 Td ${line(aWords.map((w) => [...w].map((ch) => aCode.get(ch)!)))} ET`;
    const contentB = `BT /F1 12 Tf 20 700 Td ${line(bWords.map((w) => [...w].map((ch) => bCode.get(ch)!)))} ET`;
    const file = await pdfWithObjects([
      { raw: "<< /Type /Catalog /Pages 10 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmapA }, // obj 2 — font A's ToUnicode
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /FontA /ToUnicode 2 0 R >>" }, // obj 3
      { dict: "/Filter /FlateDecode", stream: cmapB }, // obj 4 — font B's ToUnicode
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /FontB /ToUnicode 4 0 R >>" }, // obj 5
      // page B FIRST in file order — its /F1 candidate (font 5) leads the chain
      { raw: "<< /Type /Page /Contents 9 0 R /Resources << /Font << /F1 5 0 R >> >> >>" }, // obj 6
      { raw: "<< /Type /Page /Contents 8 0 R /Resources << /Font << /F1 3 0 R >> >> >>" }, // obj 7
      { dict: "/Filter /FlateDecode", stream: contentA }, // obj 8 — page A's content
      { dict: "/Filter /FlateDecode", stream: contentB }, // obj 9 — page B's content
      { raw: "<< /Type /Pages /Kids [6 0 R 7 0 R] >>" }, // obj 10
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("font selection"); // ← RED before the fix: page A's atoms decode through page B's wrong letters
    expect(text).toContain("xelatex writer");
    expect(text).toContain("unicode mapping tables"); // B's own words — correct on both sides
  });

  it("does not delta a fresh BT's absolute Td against a stale pre-Tm origin (the mixed-form hardening — R105-D)", async () => {
    // XeTeX word → Skia Tm word → XeTeX word: the THIRD block's fresh Td
    // must not delta against the FIRST block's origin (the Tm form
    // intervened — the stale-origin hazard, the audit's L-2). Without the
    // clear the 0.5-em dx joins "beta" onto the Skia word ("skiabeta");
    // with it the conservative word gap separates them.
    const content = [
      "BT /F1 12 Tf 20 700 Td (alpha) Tj ET",
      "BT /F1 12 Tf 1 0 0 1 500 100 Tm (skia) Tj ET",
      "BT /F1 12 Tf 26 698 Td (beta) Tj ET",
      "BT /F1 12 Tf 20 100 Td (payroll admin compliance training onboarding specialist platform systems technology) Tj ET",
    ].join("\n");
    const file = await pdfWithContent(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("skia beta"); // ← RED before the fix: "skiabeta" (the stale-origin sub-em join)
    expect(text).not.toContain("skiabeta");
  });
});
