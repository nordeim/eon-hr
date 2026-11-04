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
    // R116-A supersedes the separator FORM here: the skia→beta pair's
    // DEVICE y-delta (100 → 698, ~50 em at 12pt) is a true line move, and
    // the cm-carried rule upgrades the conservative word gap to a newline.
    // The R105-D CORE guard is unchanged: the stale-origin JOIN never fires.
    expect(text).toContain("skia\nbeta"); // ← RED before the R105-D fix: "skiabeta" (the stale-origin sub-em join)
    expect(text).not.toContain("skiabeta");
  });

  // Session 106 (R106-A): the page-tree chain's real-file activation. The
  // R105-C fixture used a raw page with a SCALAR /Contents — but BOTH real
  // xdvipdfmx builds (fontspec v2.9h, 71 pages; the dvipdfmx manual, 50
  // pages) carry 100% of their pages inside ObjStms with the /Contents[N 0 R]
  // ARRAY form and /Resources references that are THEMSELVES ObjStm-carried.
  // The scalar regex matched neither file's pages — the page map was empty
  // and every atom rode the file-order candidate chain (fontspec's title
  // 'F' stolen by EBGaramond's map: "Dont selection" where pdftotext reads
  // "Font selection"). Two specs: (1) the raw-pass array form with inline
  // fonts; (2) the real fontspec shape — an ObjStm-carried page with a
  // referenced ObjStm-carried /Resources.
  it("binds a raw /Contents[N 0 R] array-form page to its own font map (the raw-pass array form — R106-A)", async () => {
    // the R105-C collision shape, ARRAY /Contents: page B's resource pair
    // leads the candidate chain in file order, so without the page binding
    // page A's atoms decode through page B's wrong letters ("Dont
    // selection" — the real fontspec residual class)
    const cmapPairs = (name: string, pairs: [string, string][]) =>
      `/CIDInit/ProcSet findresource begin\n12 dict begin\nbegincmap\n/CMapName/${name} def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n${pairs.length} beginbfchar\n${pairs.map(([c, u]) => `<${c}> <${u}>`).join("\n")}\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
    const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(4, "0");
    const uni = (ch: string) => ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0");
    const aWords = ["font", "selection", "for", "the", "xelatex", "writer", "package", "manual"];
    const aLetters = [...new Set(aWords.join(""))];
    const aCode = new Map(aLetters.map((ch, i) => [ch, hex2(i + 1)]));
    const cmapA = cmapPairs("FontA-UTF16", aLetters.map((ch) => [aCode.get(ch)!, uni(ch)]));
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
      // page B FIRST in file order — its /F1 candidate (font 5) leads the chain;
      // the /Contents ARRAY form (the real xdvipdfmx writer shape)
      { raw: "<< /Type /Page /Contents[9 0 R] /Resources << /Font << /F1 5 0 R >> >> >>" }, // obj 6
      { raw: "<< /Type /Page /Contents [8 0 R] /Resources << /Font << /F1 3 0 R >> >> >>" }, // obj 7 — space after the key, both tolerated
      { dict: "/Filter /FlateDecode", stream: contentA }, // obj 8 — page A's content
      { dict: "/Filter /FlateDecode", stream: contentB }, // obj 9 — page B's content
      { raw: "<< /Type /Pages /Kids [6 0 R 7 0 R] >>" }, // obj 10
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("font selection"); // ← RED before the fix: page A's atoms decode through page B's wrong letters
    expect(text).toContain("xelatex writer");
    expect(text).toContain("unicode mapping tables"); // B's own words — correct on both sides
  });

  it("resolves an ObjStm-carried page's referenced ObjStm-carried /Resources (the real fontspec shape — R106-A)", async () => {
    // the measured real-file form: the /Type /Page object rides an ObjStm
    // with /Resources 20 0 R (a REFERENCE — no inline fonts) and
    // /Contents[8 0 R] (the array form); the resources object (obj 20)
    // rides a LATER ObjStm; a decoy /F1 → wrong-font pair sits in the raw
    // ascii BEFORE both. Without the three legs (the array form, the ObjStm
    // objFonts feed, the post-walk pendingRes resolution) the page never
    // binds and the decoy's map steals the atom
    const cmapPairs = (name: string, pairs: [string, string][]) =>
      `/CIDInit/ProcSet findresource begin\n12 dict begin\nbegincmap\n/CMapName/${name} def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n${pairs.length} beginbfchar\n${pairs.map(([c, u]) => `<${c}> <${u}>`).join("\n")}\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
    const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(4, "0");
    const uni = (ch: string) => ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0");
    const aWords = ["font", "selection", "for", "the", "xelatex", "writer", "package", "manual"];
    const aLetters = [...new Set(aWords.join(""))];
    const aCode = new Map(aLetters.map((ch, i) => [ch, hex2(i + 1)]));
    const cmapA = cmapPairs("FontA-UTF16", aLetters.map((ch) => [aCode.get(ch)!, uni(ch)]));
    const wrong = "qwzvxjk";
    const bPairs: [string, string][] = aLetters.map((_, i) => [hex2(i + 1), uni(wrong[i % wrong.length])]);
    const cmapB = cmapPairs("FontB-UTF16", bPairs);
    const line = (codes: string[][]) => `[${codes.map((w) => `<${w.join("")}> -322 `).join("")}] TJ`;
    const content = `BT /F1 12 Tf 20 700 Td ${line(aWords.map((w) => [...w].map((ch) => aCode.get(ch)!)))} ET`;
    // a real ObjStm builder: the header (objNum off) pairs, /First = the
    // header length, the bodies concatenated after it
    const buildObjStm = (entries: { obj: number; body: string }[]): { dict: string; stream: string } => {
      const bodyLens = entries.map((e) => e.body.length + 1);
      let headerLen = -1;
      for (let guard = 0; guard < 8; guard++) {
        const parts: string[] = [];
        let acc = 0;
        for (let i = 0; i < entries.length; i++) {
          parts.push(`${entries[i].obj} ${acc} `);
          acc += bodyLens[i];
        }
        const h = parts.join("").length;
        if (h === headerLen) {
          return { dict: `/Type /ObjStm /N ${entries.length} /First ${h} /Filter /FlateDecode`, stream: parts.join("") + entries.map((e) => e.body + "\n").join("") };
        }
        headerLen = h;
      }
      throw new Error("header length did not converge");
    };
    const objstmPage = buildObjStm([
      { obj: 30, body: "<< /Type /Page /Parent 11 0 R /Resources 20 0 R /Contents[8 0 R] >>" },
    ]);
    const objstmRes = buildObjStm([
      { obj: 20, body: "<< /Font << /F1 3 0 R >> >>" },
    ]);
    const file = await pdfWithObjects([
      { raw: "<< /Type /Catalog /Pages 11 0 R >>" }, // obj 1
      { dict: "/Filter /FlateDecode", stream: cmapA }, // obj 2 — font A's ToUnicode
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /FontA /ToUnicode 2 0 R >>" }, // obj 3 — the page's OWN font
      { dict: "/Filter /FlateDecode", stream: cmapB }, // obj 4 — the decoy's ToUnicode
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /FontB /ToUnicode 4 0 R >>" }, // obj 5 — the decoy font
      { raw: "<< /Font << /F1 5 0 R >> >>" }, // obj 6 — the decoy pair: LEADS the candidate chain in file order
      { dict: objstmPage.dict, stream: objstmPage.stream }, // obj 7 — the ObjStm carrying the page (obj 30)
      { dict: "/Filter /FlateDecode", stream: content }, // obj 8 — the page's content stream
      { dict: objstmRes.dict, stream: objstmRes.stream }, // obj 9 — the LATER ObjStm carrying the resources (obj 20)
      { raw: "<< >>" }, // obj 10 — filler
      { raw: "<< /Type /Pages /Kids [30 0 R] >>" }, // obj 11
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("font selection"); // ← RED before the fix: the decoy's map steals the atom ("Dont selection")
    expect(text).toContain("xelatex writer");
  });

  // Session 107 (R107-A): the LO display-tracking class. The re-sourced Calc
  // guide's cover title extracts as letter-split soup — "C a l c   G u i d e"
  // — because LibreOffice's display typography kerns (−113..−154 thousandths,
  // measured on the real cover) fire the kern ≤ −100 word-gap rule between
  // every letter, while the WORD gaps ride space-GLYPH atoms (<05> decodes to
  // " "). The naive band conditional is refuted by the prototype (it joins
  // xdvipdfmx's interword glue and pdfTeX's math thin-spaces); the
  // discriminator is the per-array display-tracking SIGNATURE: every
  // consecutive pair kerned, ALL kerns in (−200,−100], ALL atoms
  // single-glyph, count ≥ 4.
  it("joins a display-tracked TJ array's letters (the LO cover form — R107-A)", async () => {
    // the measured cover shape: 1-byte hex codes, a CMap mapping 01→C …
    // 05→space … 0A→e, and a TJ array with a −113..−116 kern between EVERY
    // pair (the display tracking). Body text clears the 40-alnum guard on
    // both sides of the mutation (the split letters are still alnums).
    const cmapPairs = (pairs: [string, string][]) =>
      `/CIDInit/ProcSet findresource begin\n12 dict begin\nbegincmap\n/CMapName/Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<00> <FF>\nendcodespacerange\n${pairs.length} beginbfchar\n${pairs.map(([c, u]) => `<${c}> <${u}>`).join("\n")}\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
    const uni = (ch: string) => ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0");
    const title = "Calc Guide";
    const letters = [...new Set(title)].filter((c) => c !== " ");
    const code = new Map(letters.map((ch, i) => [ch, (i + 1).toString(16).toUpperCase().padStart(2, "0")]));
    code.set(" ", (letters.length + 1).toString(16).toUpperCase().padStart(2, "0")); // a non-colliding code (the real cover's 05-shape, 0A here)
    const cmap = cmapPairs([...code.entries()].map(([ch, c]) => [c, uni(ch)]));
    // the measured form: <01>-116<02>-116<03>-113<04>-116<05>-113<06>-115<07>-114<08>-113<09>-114<0A>
    const kerns = [-116, -116, -113, -116, -113, -115, -114, -113, -114];
    const titleArray = `[${[...title].map((ch, i) => `<${code.get(ch)!}>${i < kerns.length ? kerns[i] : ""}`).join("")}] TJ`;
    const content =
      `BT /F1 26 Tf 33.5 687.689 Td ${titleArray} ET\n` +
      `BT /F2 13 Tf 33.5 603.789 Td (senior payroll compliance onboarding training for the spreadsheet specialist suite) Tj ET`;
    const file = await pdfWithObjects([
      { raw: "<< /Type /Catalog /Pages 10 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmap }, // obj 2 — F1's ToUnicode
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /DisplayTitle /ToUnicode 2 0 R >>" }, // obj 3
      { dict: "/Filter /FlateDecode", stream: content }, // obj 4 — the cover content
      { raw: "<< /Type /Page /Contents[4 0 R] /Resources << /Font << /F1 3 0 R >> >> >>" }, // obj 5
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" }, // obj 6
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("Calc Guide"); // ← RED before the fix: "C a l c   G u i d e" (every letter split by the tracking kerns)
    expect(text).toContain("senior payroll compliance"); // the body text rides the standing rules
  });

  it("keeps the xdvipdfmx interword glue's gaps (the multi-CID guard — R107-A)", async () => {
    // the fontspec form (measured): whole words ride as MULTI-CID hex chunks
    // with a −194 kern between every pair — the kerns ARE the interword
    // glue (pdftotext reads the words spaced). The single-glyph condition of
    // the display signature rejects it; removing that condition (the M2
    // mutation) must fuse the words.
    const cmapPairs = (pairs: [string, string][]) =>
      `/CIDInit/ProcSet findresource begin\n12 dict begin\nbegincmap\n/CMapName/Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n${pairs.length} beginbfchar\n${pairs.map(([c, u]) => `<${c}> <${u}>`).join("\n")}\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
    const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(4, "0");
    const uni = (ch: string) => ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0");
    const words = ["font", "selection", "for", "xelatex", "writer", "packages", "and", "manuals"];
    const letters = [...new Set(words.join(""))];
    const code = new Map(letters.map((ch, i) => [ch, hex2(i + 1)]));
    const cmap = cmapPairs(letters.map((ch) => [code.get(ch)!, uni(ch)]));
    const chunk = (w: string) => `<${[...w].map((ch) => code.get(ch)!).join("")}>`;
    const line = `[${words.map(chunk).join("-194")}] TJ`;
    const content = `BT /F1 9.9626 Tf 72.727 -63.761 Td ${line} ET`;
    const file = await pdfWithObjects([
      { raw: "<< /Type /Catalog /Pages 10 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmap }, // obj 2
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /XeFont /ToUnicode 2 0 R >>" }, // obj 3
      { dict: "/Filter /FlateDecode", stream: content }, // obj 4
      { raw: "<< /Type /Page /Contents[4 0 R] /Resources << /Font << /F1 3 0 R >> >> >>" }, // obj 5
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" }, // obj 6
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("font selection for"); // the −194 glue keeps its spaces (a multi-CID chunk is never display tracking)
    expect(text).toContain("xelatex writer packages");
  });

  it("keeps the pdfTeX math thin-spaces' gaps (the atom-count guard — R107-A)", async () => {
    // the arXiv form (measured): single-char literal atoms with −161..−185
    // kerns between punctuation and variables — 2- and 3-atom arrays. The
    // ≥4-atom condition of the display signature rejects them; removing it
    // (the M3 mutation) must join the math.
    const content =
      "BT /F1 9.9626 Tf 70.866 718.258 Td [(J)65(a)-161(b)-161(c)] TJ [(;) -167 (Y)] TJ ET\n" +
      "BT /F1 9.9626 Tf 70.866 700 Td (senior payroll compliance onboarding training specialist) Tj ET";
    const file = await pdfWithContent(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("a b c"); // the 3-atom math array keeps its thin-space gaps
    expect(text).toContain("; Y"); // the 2-atom form keeps its gap
  });

  // Session 107 (R107-B): the third page-form blind spot — the referenced
  // /Font dict inside INLINE /Resources (the measured lo-calc cover shape:
  // /Resources << /Font 4234 0 R >>), and the two-hop form (the measured
  // 545-page shape: /Resources N 0 R where obj N = << /Font 4234 0 R >>).
  // The F-pair regex captures the dict KEY "Font" as a font name — a false
  // pair that blocks both resolutions. Benign in the current corpus (single
  // candidates) but a live vector for the R102-B multi-candidate class.
  it("binds a page's inline-/Resources referenced /Font dict (the cover form — R107-B)", async () => {
    const cmapPairs = (name: string, pairs: [string, string][]) =>
      `/CIDInit/ProcSet findresource begin\n12 dict begin\nbegincmap\n/CMapName/${name} def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n${pairs.length} beginbfchar\n${pairs.map(([c, u]) => `<${c}> <${u}>`).join("\n")}\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
    const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(4, "0");
    const uni = (ch: string) => ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0");
    const aWords = ["font", "selection", "for", "the", "xelatex", "writer", "package", "manual"];
    const aLetters = [...new Set(aWords.join(""))];
    const aCode = new Map(aLetters.map((ch, i) => [ch, hex2(i + 1)]));
    const cmapA = cmapPairs("FontA-UTF16", aLetters.map((ch) => [aCode.get(ch)!, uni(ch)]));
    const wrong = "qwzvxjk";
    const bPairs: [string, string][] = aLetters.map((_, i) => [hex2(i + 1), uni(wrong[i % wrong.length])]);
    const cmapB = cmapPairs("FontB-UTF16", bPairs);
    const line = (codes: string[][]) => `[${codes.map((w) => `<${w.join("")}> -322 `).join("")}] TJ`;
    const content = `BT /F1 12 Tf 20 700 Td ${line(aWords.map((w) => [...w].map((ch) => aCode.get(ch)!)))} ET`;
    const file = await pdfWithObjects([
      { raw: "<< /Type /Catalog /Pages 10 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmapA }, // obj 2 — font A's ToUnicode
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /FontA /ToUnicode 2 0 R >>" }, // obj 3 — the page's OWN font
      { dict: "/Filter /FlateDecode", stream: cmapB }, // obj 4 — the decoy's ToUnicode
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /FontB /ToUnicode 4 0 R >>" }, // obj 5 — the decoy font
      { raw: "<< /Font << /F1 5 0 R >> >>" }, // obj 6 — the decoy pair: LEADS the candidate chain in file order
      { dict: "/Filter /FlateDecode", stream: content }, // obj 7 — the page's content
      { raw: "<< /Type /Page /Contents[7 0 R] /Resources << /Font 9 0 R >> >>" }, // obj 8 — the INLINE resources with a REFERENCED /Font dict
      { raw: "<< /F1 3 0 R >>" }, // obj 9 — the font dict (the /Font ref's target)
      { raw: "<< /Type /Pages /Kids [8 0 R] >>" }, // obj 10
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("font selection"); // ← RED before the fix: the decoy's map steals the atom (the page never binds)
    expect(text).toContain("xelatex writer");
  });

  it("resolves the two-hop /Resources → /Font reference (the 545-page form — R107-B)", async () => {
    const cmapPairs = (name: string, pairs: [string, string][]) =>
      `/CIDInit/ProcSet findresource begin\n12 dict begin\nbegincmap\n/CMapName/${name} def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n${pairs.length} beginbfchar\n${pairs.map(([c, u]) => `<${c}> <${u}>`).join("\n")}\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
    const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(4, "0");
    const uni = (ch: string) => ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0");
    const aWords = ["font", "selection", "for", "the", "xelatex", "writer", "package", "manual"];
    const aLetters = [...new Set(aWords.join(""))];
    const aCode = new Map(aLetters.map((ch, i) => [ch, hex2(i + 1)]));
    const cmapA = cmapPairs("FontA-UTF16", aLetters.map((ch) => [aCode.get(ch)!, uni(ch)]));
    const wrong = "qwzvxjk";
    const bPairs: [string, string][] = aLetters.map((_, i) => [hex2(i + 1), uni(wrong[i % wrong.length])]);
    const cmapB = cmapPairs("FontB-UTF16", bPairs);
    const line = (codes: string[][]) => `[${codes.map((w) => `<${w.join("")}> -322 `).join("")}] TJ`;
    const content = `BT /F1 12 Tf 20 700 Td ${line(aWords.map((w) => [...w].map((ch) => aCode.get(ch)!)))} ET`;
    const file = await pdfWithObjects([
      { raw: "<< /Type /Catalog /Pages 10 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmapA }, // obj 2 — font A's ToUnicode
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /FontA /ToUnicode 2 0 R >>" }, // obj 3 — the page's OWN font
      { dict: "/Filter /FlateDecode", stream: cmapB }, // obj 4 — the decoy's ToUnicode
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /FontB /ToUnicode 4 0 R >>" }, // obj 5 — the decoy font
      { raw: "<< /Font << /F1 5 0 R >> >>" }, // obj 6 — the decoy pair: LEADS the candidate chain
      { dict: "/Filter /FlateDecode", stream: content }, // obj 7 — the page's content
      { raw: "<< /Type /Page /Contents[7 0 R] /Resources 9 0 R >>" }, // obj 8 — the REFERENCED /Resources (the 545-page form)
      { raw: "<< /Font 11 0 R >>" }, // obj 9 — the resources object: its /Font VALUE is a reference
      { raw: "<< /Type /Pages /Kids [8 0 R] >>" }, // obj 10
      { raw: "<< /F1 3 0 R >>" }, // obj 11 — the font dict (the /Font ref's target)
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("font selection"); // ← RED before the fix: the false "Font" pair blocks the resolution, the decoy steals
    expect(text).toContain("xelatex writer");
  });

  // Session 108 (R108-B): the macOS Quartz 13th-writer round — the sourced
  // longer.pdf (Producer "macOS Version 26.5 (Build 25F71) Quartz
  // PDFContext", Bear-authored, PDF 1.3) exposed TWO stacked decode defects:
  // [LEG A] every INFLATED content stream decoded through `new TextDecoder()`
  // — the UTF-8 DEFAULT — so any byte >= 0x80 in a literal atom became U+FFFD
  // before the decode tables ever saw it (the outer raw scan already used
  // latin1; the inflated path silently bypassed it); [LEG B] the fonts
  // declare /Encoding /MacRomanEncoding and the high bytes are the MacRoman
  // block — 0xD5 is \u2019 (the right single quote), never \u00D5 —
  // pdftotext reads "There's". The fixture helper: a latin1-stream variant
  // of pdfWithObjects (the raw byte per char — a high byte in the stream
  // must deflate as ITS byte, not its UTF-8 encoding).
  const encS = (s: string) => new TextEncoder().encode(s); // local (the pdfWithObjects copy is scoped to another describe)
  const encL = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);
  async function pdfWithLatin1Streams(
    objects: ({ raw: string } | { dict: string; stream: string })[]
  ): Promise<File> {
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
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  it("decodes the MacRoman high byte in a compressed stream's literal (the Quartz quote — R108-B LEG A+B)", async () => {
    // the measured atom sequence from the real file's stream: the quote is a
    // RAW single-byte atom (0xD5) inside a Flate stream, kerned -0.1..35.5
    // (all joins) — the word reads "There's" where pdftotext agrees
    const content =
      "BT 11 0 0 -11 45 222 Tm /Tc2 1 Tf [(\\() -0.1 (T) 0.2 (h) 0.2 (e) 0.5 (r) 10.2 (e) 35.5 (\u00D5) 18.1 (s ) 0.5 (g) -0.4 (o) 0.4 (i) 0.2 (n) 0.2 (g)] TJ ET\n" +
      "BT 11 0 0 -11 45 260 Tm /Tc2 1 Tf (payroll admin compliance training onboarding specialist platform systems technology) Tj ET";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 5 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /AAAAAC+BearSansUI-Regular /Encoding /MacRomanEncoding /FirstChar 32 /LastChar 213 >>" },
      { raw: "<< /Font << /Tc2 2 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [6 0 R] >>" },
      { raw: "<< /Type /Page /Contents 4 0 R /Resources 3 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("There\u2019s going"); // RED before the fix: "There\ufffd going" (the UTF-8 stream decode) / "There\u00D5s going" (LEG A alone)
    expect(text).toContain("payroll admin compliance"); // the guard-clearing body text (both sides of every mutation)
  });

  it("keeps a compressed stream's raw high byte as its Latin-1 char (no declaration — R108-B LEG A)", async () => {
    // LEG A alone: a high byte with NO MacRoman declaration survives as its
    // Latin-1 codepoint — never the U+FFFD a UTF-8 decode produces
    const content =
      "BT /F1 12 Tf 20 700 Td (\u00C7) Tj 0 20 Td (payroll admin compliance training onboarding specialist platform systems technology) Tj ET";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog >>" },
      { dict: "/Filter /FlateDecode", stream: content },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("\u00C7"); // RED before the fix: U+FFFD (the UTF-8 default decode)
    expect(text).toContain("payroll admin compliance");
  });

  it("does NOT remap a non-MacRoman font's high byte (the WinAnsi guard — R108-B)", async () => {
    // the over-application guard: a font declaring /Encoding
    // /WinAnsiEncoding (or nothing) keeps the Latin-1 reading — the MacRoman
    // remap fires ONLY on the declared encoding (the WinAnsi raw-literal
    // class stays the documented watch)
    const content =
      "BT 11 0 0 -11 45 222 Tm /Tc2 1 Tf [(T) 0.2 (h) 0.2 (e) 0.5 (r) 10.2 (e) 35.5 (\u00D5) 18.1 (s )] TJ ET\n" +
      "BT 11 0 0 -11 45 260 Tm /Tc2 1 Tf (payroll admin compliance training onboarding specialist platform systems technology) Tj ET";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 5 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /SomeWinAnsiFont /Encoding /WinAnsiEncoding /FirstChar 32 /LastChar 255 >>" },
      { raw: "<< /Font << /Tc2 2 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [6 0 R] >>" },
      { raw: "<< /Type /Page /Contents 4 0 R /Resources 3 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("There\u00D5s"); // RED before the fix: U+FFFD; a Latin-1 reading after LEG A; \u2019 ONLY if LEG B over-applies
    expect(text).toContain("payroll admin compliance");
  });

  it("decodes the MacRoman font's hex atoms through the marker map (the cmapsFor leg — R108-B)", async () => {
    // the hex form: single-byte hex atoms under the MacRoman font — the
    // cmapsFor marker chain covers 0x20-0xFF, so <D5> reads U+2019 through
    // decodeHexString's covering rule (the literal remap is not involved)
    const content =
      "BT 11 0 0 -11 45 222 Tm /Tc2 1 Tf [<54> 0.2 <68> 0.2 <65> 0.5 <72> 10.2 <65> 35.5 <D5> 18.1 <73>] TJ ET\n" +
      "BT 11 0 0 -11 45 260 Tm /Tc2 1 Tf (payroll admin compliance training onboarding specialist platform systems technology) Tj ET";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 5 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /AAAAAC+BearSansUI-Regular /Encoding /MacRomanEncoding /FirstChar 32 /LastChar 213 >>" },
      { raw: "<< /Font << /Tc2 2 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [6 0 R] >>" },
      { raw: "<< /Type /Page /Contents 4 0 R /Resources 3 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("There\u2019s"); // RED before the fix: "There\u00D5s" (the hex path decodes through latin1Printable — no marker in the chain)
    expect(text).toContain("payroll admin compliance");
  });

  // Session 109 (R109-A/B/C): the ReportLab 14th-writer round — the sourced
  // user guide (Producer "ReportLab PDF Library - (opensource", 565,444
  // bytes, md5 0f64df85…) exposed THREE stacked defects: [R109-A] 138 of its
  // 147 streams declare /Filter [ /ASCII85Decode /FlateDecode ] and the
  // extractor had NO ASCII85Decode leg — the armored bytes failed to
  // inflate and EVERY content stream was silently dropped (0 chars from a
  // 213,156-alnum document); [R109-B] the fonts declare /Encoding
  // /WinAnsiEncoding (15+ base-14, no ToUnicode) and carry cp1252
  // typographic chars as RAW literal bytes — 0x97 is — U+2014, not U+0097
  // (pdftotext reads "To die—to sleep"); [R109-C] the bullets are
  // (\267) Tj octal literals under /Symbol — the marker tables fired only
  // on HEX atoms and SYMBOL_FONT had no high zone at all (0xB7 read · the
  // Latin-1 middle dot, not • U+2022).
  const encA = (s: string) => new TextEncoder().encode(s);
  const encL2 = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);
  // the fixture's own ASCII85 ARMOR encoder (the fixture-must-exercise-the-
  // fixed-path lesson, tenth application: a hand-written armored string is
  // frozen bytes; the encoder proves the decoder handles real armor —
  // full groups, the z zero-group, the partial final group, the ~>> EOD)
  const a85 = (bytes: Uint8Array): string => {
    let out = "";
    for (let i = 0; i < bytes.length; i += 4) {
      const chunk = bytes.subarray(i, i + 4);
      const n = chunk.length;
      let v = 0;
      for (let j = 0; j < 4; j++) v = v * 256 + (chunk[j] ?? 0);
      if (v === 0 && n === 4) {
        out += "z";
        continue;
      }
      const g: number[] = [];
      for (let j = 0; j < 5; j++) {
        g.unshift(v % 85);
        v = Math.floor(v / 85);
      }
      out += g.map((c) => String.fromCharCode(c + 33)).join("").slice(0, n + 1);
    }
    return out + "~>";
  };
  async function pdfWithA85Streams(
    objects: ({ raw: string } | { dict: string; stream: string; flate?: boolean })[]
  ): Promise<File> {
    const parts: Uint8Array[] = [];
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      if ("raw" in obj) {
        parts.push(encA(`${i + 1} 0 obj\n${obj.raw}\nendobj\n`));
      } else {
        let payload = encL2(obj.stream);
        if (obj.flate !== false) {
          payload = new Uint8Array(
            await new Response(new Blob([payload]).stream().pipeThrough(new CompressionStream("deflate"))).arrayBuffer()
          );
        }
        const armored = a85(payload);
        parts.push(encA(`${i + 1} 0 obj\n<< ${obj.dict} /Length ${armored.length} >>\nstream\r\n`));
        parts.push(encA(armored));
        parts.push(encA("\r\nendstream\nendobj\n"));
      }
    }
    parts.push(encA("trailer\n<< /Root 1 0 R >>\n%%EOF"));
    const total = parts.reduce((n, p) => n + p.length, 0);
    const pdf = new Uint8Array(total);
    let o = 0;
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  it("extracts an ASCII85+Flate stacked-filter stream (the ReportLab armor — R109-A)", async () => {
    // the measured ReportLab shape: /Filter [ /ASCII85Decode /FlateDecode ]
    // on the content stream; the extractor previously fed the ARMORED bytes
    // straight to inflate → failed → the stream silently dropped
    const content =
      "BT /F1 12 Tf 14.4 TL 20 700 Td (ReportLab PDF Library) Tj T* (payroll admin compliance training onboarding specialist platform systems technology) Tj ET";
    const file = await pdfWithA85Streams([
      { raw: "<< /Type /Catalog /Pages 5 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>" },
      { raw: "<< /Font << /F1 2 0 R >> >>" },
      { dict: "/Filter [ /ASCII85Decode /FlateDecode ]", stream: content },
      { raw: "<< /Type /Pages /Kids [6 0 R] >>" },
      { raw: "<< /Type /Page /Contents 4 0 R /Resources 3 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("ReportLab PDF Library"); // RED before the fix: the extraction is EMPTY
    expect(text).toContain("payroll admin compliance"); // the guard-clearing body text
  });

  it("extracts an ASCII85-only stream (no Flate — R109-A)", async () => {
    // the A85-alone leg: /Filter /ASCII85Decode with UNCOMPRESSED content —
    // the decoded bytes ARE the content
    const content =
      "BT /F1 12 Tf 20 700 Td (payroll admin compliance training onboarding specialist platform systems technology) Tj ET";
    const file = await pdfWithA85Streams([
      { raw: "<< /Type /Catalog /Pages 5 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>" },
      { raw: "<< /Font << /F1 2 0 R >> >>" },
      { dict: "/Filter /ASCII85Decode", stream: content, flate: false },
      { raw: "<< /Type /Pages /Kids [6 0 R] >>" },
      { raw: "<< /Type /Page /Contents 4 0 R /Resources 3 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("payroll admin compliance"); // RED before the fix: EMPTY
  });

  it("remaps a WinAnsi font's raw C1 literals through cp1252 (the em-dash/quote — R109-B)", async () => {
    // the measured ReportLab shape: the fonts declare /Encoding
    // /WinAnsiEncoding (no ToUnicode) and the typographic chars are RAW
    // single-byte atoms — 0x97 is — U+2014 ("To die—to sleep", the
    // pdftotext reading), 0x92 the right quote
    const content =
      "BT 11 0 0 -11 45 222 Tm /Tc2 1 Tf [(T) 0.2 (o) 0.2 ( die) 35.5 (\u0097) 18.1 (to sleep)] TJ ET\n" +
      "BT 11 0 0 -11 45 260 Tm /Tc2 1 Tf [(It) 35.5 (\u0092) 18.1 (s the rub)] TJ ET\n" +
      "BT 11 0 0 -11 45 300 Tm /Tc2 1 Tf (payroll admin compliance training onboarding specialist platform systems technology) Tj ET";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 5 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding /FirstChar 32 /LastChar 255 >>" },
      { raw: "<< /Font << /Tc2 2 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [6 0 R] >>" },
      { raw: "<< /Type /Page /Contents 4 0 R /Resources 3 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("To die\u2014to sleep"); // RED before the fix: the raw U+0097 control char rides the output verbatim
    expect(text).toContain("It\u2019s the rub"); // RED before the fix: U+0092
    expect(text).toContain("payroll admin compliance");
  });

  it("keeps a WinAnsi font's high Latin-1 zone verbatim (the C1 boundary guard — R109-B)", async () => {
    // WinAnsi = Latin-1 above 0x9F: a raw 0xD5 stays Õ (the remap is the C1
    // zone ONLY); the MacRoman font's 0xD5 keeps its ' remap (the r108
    // behavior) — both legs of the zone boundary
    const content =
      "BT 11 0 0 -11 45 222 Tm /Tc2 1 Tf [(There) 35.5 (\u00D5) 18.1 (s)] TJ ET\n" +
      "BT 11 0 0 -11 45 260 Tm /Tc3 1 Tf [(There) 35.5 (\u00D5) 18.1 (s)] TJ ET\n" +
      "BT 11 0 0 -11 45 300 Tm /Tc2 1 Tf (payroll admin compliance training onboarding specialist platform systems technology) Tj ET";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding /FirstChar 32 /LastChar 255 >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /AAAAAC+BearSansUI-Regular /Encoding /MacRomanEncoding /FirstChar 32 /LastChar 213 >>" },
      { raw: "<< /Font << /Tc2 2 0 R /Tc3 3 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources 4 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("There\u00D5s"); // the WinAnsi leg: 0xD5 OUTSIDE the C1 remap zone — stays Õ (born green; RED only if the remap over-applies)
    expect(text).toContain("There\u2019s"); // the MacRoman control: the r108 remap unchanged
    expect(text).toContain("payroll admin compliance");
  });

  it("decodes a Symbol font's high-zone octal literal as the bullet (R109-C)", async () => {
    // the measured ReportLab bullet: (\267) Tj = 0xB7 under /F4 = Symbol —
    // pdftotext reads • U+2022; the old table had NO high zone (0xB7 fell
    // to the latin1Printable fallback → · U+00B7)
    const content =
      "BT /F4 10 Tf 18 2 Td (\\267) Tj ET\n" +
      "BT /F1 10 Tf 54 2 Td (What is ReportLab all about, and why should I use it?) Tj ET\n" +
      "BT /F1 10 Tf 20 40 Td (payroll admin compliance training onboarding specialist platform systems technology) Tj ET";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /Symbol >>" },
      { raw: "<< /Font << /F1 2 0 R /F4 3 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources 4 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("\u2022"); // RED before the fix: "·" U+00B7 (no high zone in the Symbol table)
    expect(text).toContain("What is ReportLab all about"); // the bullet's item
    expect(text).toContain("payroll admin compliance");
  });

  it("remaps a Symbol font's ASCII-zone literals through the marker map (the covering discipline — R109-C)", async () => {
    // the marker-font LITERAL path: under a real Symbol font the ASCII bytes
    // ARE glyph codes — (ab) reads αβ; the marker tables previously fired
    // only on HEX atoms (decodeHexString's covering rule). Born-green guard:
    // the ASCII zone has always been in the table — this member isolates
    // the remap PASS from the high-zone addition
    const content =
      "BT /F4 10 Tf 18 2 Td (ab) Tj ET\n" +
      "BT /F1 10 Tf 20 40 Td (payroll admin compliance training onboarding specialist platform systems technology) Tj ET";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /Symbol >>" },
      { raw: "<< /Font << /F1 2 0 R /F4 3 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources 4 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("\u03B1\u03B2"); // RED before the marker-literal pass: "ab" rides verbatim
    expect(text).toContain("payroll admin compliance"); // the non-Symbol font's text stays verbatim
  });

  it("remaps a MacRoman font's C1-zone literals through MacRoman (the cp1252-escape fix — R109-D)", async () => {
    // THE r109 DISCOVERY: TextDecoder("latin1") is the WHATWG alias for
    // windows-1252 — byte 0x87 decodes to ‡ U+2021, NOT U+0087 — so the
    // r108 remap's [\u0080-\u00ff] class NEVER MATCHES the C1-zone bytes
    // (their cp1252 readings live outside it): MacRoman 0x87 = á and
    // 0x80 = Ä read "‡€" today. The identity zone (0xA0–0xFF) is unaffected
    // (cp1252 = Latin-1 there — the r108 QUARTZ pin holds). The fix maps
    // the cp1252 CHAR space back through MacRoman.
    const content =
      "BT 11 0 0 -11 45 222 Tm /Tc2 1 Tf [(caf) 35.5 (\u00E9) 18.1 35.5 (\u0087\u0080) 0.2 (grande)] TJ ET\n" +
      "BT 11 0 0 -11 45 260 Tm /Tc2 1 Tf (payroll admin compliance training onboarding specialist platform systems technology) Tj ET";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 5 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /AAAAAC+BearSansUI-Regular /Encoding /MacRomanEncoding /FirstChar 32 /LastChar 213 >>" },
      { raw: "<< /Font << /Tc2 2 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [6 0 R] >>" },
      { raw: "<< /Type /Page /Contents 4 0 R /Resources 3 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("\u00E1\u00C4"); // RED before the fix: the C1-zone pair reads \u2021\u20AC ("\u2021\u20AC") — their cp1252 chars escape the [\u0080-\u00ff] remap class
    expect(text).toContain("payroll admin compliance");
  });

  // Session 110 (R110-A/B/C/D/E): the Prawn 15th-writer round — the sourced
  // Prawn manual (Producer "Prawn", 2,099,393 bytes, md5 699ebcab…, 129
  // pages) exposed FIVE stacked defects: [R110-A] 182 of its 189 streams
  // declare NO /Filter at all (the oldest PDF form — Ruby's Prawn writes
  // content and ToUnicode CMaps both uncompressed) and the extractor's
  // best-effort inflate failed on every one — `if (!text) continue`
  // silently dropped them ALL (0 chars from an 83,632-alnum document);
  // [R110-B] the font resources are DOTTED /F-names (/F3.0, /F4.1, even
  // /F21.1 — two dots) and the standing F\w+ pair regex never bound them
  // (F\w+ stops at the dot), so every atom rode the all-cmaps
  // first-covering walk and MIXED-FONT pages misdecoded (the Jigmo CJK
  // segments read as their latin1 code chars — pdftotext reads 972 CJK
  // chars); [R110-C] the glyph-table pages render the WinAnsi table under
  // Helvetica /Encoding /WinAnsiEncoding with no ToUnicode and the
  // first-covering walk picked the Iosevka cmap's 0xa1→° (pdftotext reads
  // ¡, the WinAnsi reading — the R108-B named-encoding doctrine's third
  // member); [R110-D] the code font's "space" is NBSP (U+00A0, code 0xCA)
  // — the R103-C space-glyph census /^\s+$/ counted NBSP runs as word-gap
  // glyphs, so every stream read hasSpaceGlyphs=true and the join fired
  // on 14-em CHART AXIS TICK repositionings ("100.0200.0300.0");
  // [R110-E] parseToUnicode's base-offset bfrange pass ran GLOBALLY over
  // the block — array ELEMENT triples (<0020><20ac><1f55> inside a […])
  // re-matched as a range (lo=0x20, hi=0x20AC) and OVERWROTE the array's
  // own entries with Greek-Extended garbage (the polytonic Greek demo
  // read "ὗ὘Ὑ὚" where pdftotext reads "ὕαλον ϕαγεῖν").
  async function pdfWithRawStreams(
    objects: ({ raw: string } | { dict?: string; stream: string })[]
  ): Promise<File> {
    // the Prawn shape: NO /Filter at all — the stream bytes ARE the content
    const parts: Uint8Array[] = [];
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      if ("raw" in obj) {
        parts.push(encS(`${i + 1} 0 obj\n${obj.raw}\nendobj\n`));
      } else {
        const payload = encL(obj.stream);
        parts.push(encS(`${i + 1} 0 obj\n<< ${obj.dict ?? ""} /Length ${payload.length} >>\nstream\n`));
        parts.push(payload);
        parts.push(encS("\nendstream\nendobj\n"));
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

  it("extracts an UNCOMPRESSED content stream (no /Filter — R110-A)", async () => {
    // the measured Prawn shape: the content stream declares NO /Filter —
    // its bytes ARE the content; the old best-effort inflate failed and
    // the stream was silently dropped
    const content =
      "BT /F1 12 Tf 20 700 Td (Prawn Document Generation) Tj ET\n" +
      "BT /F1 12 Tf 20 680 Td (payroll admin compliance training onboarding specialist platform systems technology) Tj ET";
    const file = await pdfWithRawStreams([
      { raw: "<< /Type /Catalog /Pages 5 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>" },
      { raw: "<< /Font << /F1 2 0 R >> >>" },
      { stream: content }, // NO /Filter key at all
      { raw: "<< /Type /Pages /Kids [6 0 R] >>" },
      { raw: "<< /Type /Page /Contents 4 0 R /Resources 3 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("Prawn Document Generation"); // RED before the fix: the extraction is EMPTY
    expect(text).toContain("payroll admin compliance"); // the guard-clearing body text
  });

  it("harvests an UNCOMPRESSED ToUnicode CMap (no /Filter — R110-A)", async () => {
    // the CMap leg: Prawn writes its ToUnicode CMaps raw too — a raw CMap
    // + raw content; the hex atoms decode through the harvested map
    const content =
      "BT /F1 12 Tf 20 700 Td <4242424242> Tj ET\n" +
      "BT /F1 12 Tf 20 680 Td (payroll admin compliance training onboarding specialist platform systems technology) Tj ET";
    const cmap =
      "/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n" +
      "/CMapName /Adobe-Identity-UCS def\n1 begincodespacerange\n<00><ff>\nendcodespacerange\n" +
      "1 beginbfchar\n<42><0061>\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop end end\n";
    const file = await pdfWithRawStreams([
      { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 3 0 R >>" },
      { stream: cmap }, // the RAW CMap (no /Filter)
      { raw: "<< /Font << /F1 2 0 R >> >>" },
      { stream: content }, // the RAW content
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources 4 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("aaaaa"); // RED before the fix: <42> falls to the latin1 fallback "BBBBB" — the raw CMap was never harvested
    expect(text).toContain("payroll admin compliance");
  });

  it("binds DOTTED /F-name font resources (the Prawn /F3.0 form — R110-B)", async () => {
    // the measured Prawn shape: the page's /Font << /F3.0 2 0 R /F4.0 3 0 R >>
    // carries DOTTED names — the standing F\w+ pair regex never bound them,
    // so the atom under /F3.0 rode the all-cmaps first-covering walk and the
    // WRONG font's cmap won. Two fonts, two conflicting maps for the same
    // code: the atom must read through its OWN font's map.
    const content =
      "BT /F3.0 12 Tf 20 700 Td <21> Tj ET\n" +
      "BT /F1 12 Tf 20 680 Td (payroll admin compliance training onboarding specialist platform systems technology) Tj ET";
    const cmapRight =
      "begincmap\n1 begincodespacerange\n<00><ff>\nendcodespacerange\n" +
      "1 beginbfchar\n<21><0061>\nendbfchar\nendcmap\n"; // /F3.0's own map: 0x21 → a
    const cmapWrong =
      "begincmap\n1 begincodespacerange\n<00><ff>\nendcodespacerange\n" +
      "1 beginbfchar\n<21><005A>\nendbfchar\nendcmap\n"; // the OTHER font's map: 0x21 → Z (Z appears nowhere else in the fixture)
    // Flate streams (the leg isolates from R110-A: at HEAD the extraction
    // WORKS — the dotted name just never binds, so the all-cmaps
    // first-covering walk picks the WRONG map: the wrong font's cmap rides
    // EARLIER in file order, exactly the real file's shape)
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 7 0 R >>" },
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /BBBBBB+Wrong /ToUnicode 3 0 R >>" }, // obj 2 — the wrong font FIRST
      { dict: "/Filter /FlateDecode", stream: cmapWrong }, // obj 3 — its cmap rides earlier in the walk
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /AAAAAA+Right /ToUnicode 5 0 R >>" }, // obj 4 — /F3.0's own font
      { dict: "/Filter /FlateDecode", stream: cmapRight }, // obj 5 — its cmap (later in the walk)
      { raw: "<< /Font << /F3.0 4 0 R /F9.0 2 0 R >> >>" }, // the DOTTED binding (page-inline)
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [8 0 R] >>" },
      { raw: "<< /Type /Page /Contents 7 0 R /Resources 6 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("a"); // RED before the fix: "Z" — the dotted name never binds, the wrong font's map first-covers
    expect(text).toContain("payroll admin compliance");
    expect(text).not.toContain("Z"); // the wrong map must never win
  });

  it("decodes a WinAnsi font's hex atoms through the cp1252 table (the glyph-table class — R110-C)", async () => {
    // the measured Prawn glyph-table shape: the table's glyph column is
    // drawn under Helvetica /Encoding /WinAnsiEncoding with NO ToUnicode —
    // the hex atom <a1> is ¡ (the WinAnsi reading), but the file's OTHER
    // fonts carry cmaps that cover 0xa1 with different glyphs and the
    // first-covering walk picked one (the Iosevka 0xa1→° on the real
    // file). The named-encoding marker must win.
    const content =
      "BT /F1 10 Tf 20 700 Td <a1> Tj ET\n" +
      "BT /F1 10 Tf 20 680 Td (payroll admin compliance training onboarding specialist platform systems technology) Tj ET";
    const cmapWrong =
      "begincmap\n1 begincodespacerange\n<00><ff>\nendcodespacerange\n" +
      "1 beginbfchar\n<a1><00b0>\nendbfchar\nendcmap\n"; // the other font's 0xa1 → ° (the hazard)
    // Flate streams (the leg isolates from R110-A: at HEAD the wrong cmap
    // covers — the named-encoding marker is the only missing piece)
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 7 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>" }, // no ToUnicode — the named encoding is its own
      { dict: "/Filter /FlateDecode", stream: cmapWrong },
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /CCCCCC+Other /ToUnicode 3 0 R >>" },
      { raw: "<< /Font << /F1 2 0 R /F9 4 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [8 0 R] >>" },
      { raw: "<< /Type /Page /Contents 6 0 R /Resources 5 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("\u00A1"); // RED before the fix: "\u00B0" — the wrong cmap first-covers the code
    expect(text).toContain("payroll admin compliance");
  });

  it("keeps move-driven gaps in NBSP-only streams (the chart-tick class — R110-D)", async () => {
    // the measured Prawn shape: the code font's "space" is NBSP (U+00A0,
    // code 0xCA) — its NBSP-only runs made the R103-C space-glyph census
    // fire and every condGap piece JOINED, fusing the 14-em-apart chart
    // axis ticks ("100.0200.0"). A word-separation space GLYPH is U+0020;
    // NBSP is a non-breaking space — a no-space-glyph stream keeps its gaps.
    const content =
      "BT /F1 12 Tf 20 700 Td (\u00A0\u00A0) Tj ET\n" + // the NBSP run (indentation — never a word separator)
      "BT 20 680 Td /F1 7 Tf (100.0) Tj ET\n" +
      "BT 120 680 Td /F1 7 Tf (200.0) Tj ET\n" + // 100/7 = 14.3-em forward move on the same line — a word gap
      "BT 20 660 Td /F1 12 Tf (payroll admin compliance training onboarding specialist platform systems technology) Tj ET";
    // Flate streams (the leg isolates from R110-A: at HEAD the census
    // fires on the NBSP run and the ticks JOIN)
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 5 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>" },
      { raw: "<< /Font << /F1 2 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [6 0 R] >>" },
      { raw: "<< /Type /Page /Contents 4 0 R /Resources 3 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("100.0 200.0"); // RED before the fix: "100.0200.0" — the NBSP census joined the ticks
    expect(text).toContain("payroll admin compliance");
  });

  it("keeps ARRAY-form bfrange entries intact against the base-offset re-parse (R110-E)", async () => {
    // the measured Prawn Greek cmap: <20><35>[<0020><20ac><1f55><03b1>…] —
    // the ARRAY form maps 0x21→€ 0x22→ὕ 0x23→α; the old GLOBAL base-offset
    // pass re-matched the element TRIPLE <0020><20ac><1f55> as a range
    // (lo=0x20, hi=0x20AC, dst=0x1F55) and overwrote 0x20..0x201F with
    // consecutive Greek-Extended garbage
    const content =
      "BT /F1 12 Tf 20 700 Td <222324> Tj ET\n" + // ὕ α λ through the array entries
      "BT /F1 12 Tf 20 680 Td (payroll admin compliance training onboarding specialist platform systems technology) Tj ET";
    const cmap =
      "begincmap\n1 begincodespacerange\n<00><ff>\nendcodespacerange\n" +
      "1 beginbfrange\n<20><35>[<0020><20ac><1f55><03b1><03bb><03bf>]\nendbfrange\nendcmap\n";
    // Flate streams (the leg isolates from R110-A: at HEAD the cmap
    // harvests — the re-parsed triple then overwrites the array entries)
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /DDDDDD+Greek /ToUnicode 3 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmap }, // the array-form cmap (the element-triple hazard inside)
      { raw: "<< /Font << /F1 2 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources 4 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("\u1F55\u03B1\u03BB"); // RED before the fix: the Greek-Extended garbage "\u1F57\u1F58\u1F59" — the re-parsed triple overwrote the array
    expect(text).toContain("payroll admin compliance");
  });

  // Session 113 (R113-A): the EXPLICIT-ZERO KERN — WeasyPrint (the 18th
  // writer family, the Python HTML-to-PDF engine behind many CV/invoice
  // pipelines) writes every glyph as its own hex atom with an explicit 0
  // kern between pairs: [<4A>0<6F>0<68>0<6E>…] TJ is "John". The measured
  // specimen read alnums EXACT (692/692) as LETTER SOUP ("J o h n   S m i
  // t h") — the count-pin blind spot class, the second consecutive round.
  // The root cause: the TJ-array internals' `kern !== 0` conflated an
  // explicit NUMBER token (even a net-zero one — the writer's contiguous
  // placement intent) with the ABSENCE of a number (the W3C dummy.pdf
  // shape, whose adjacent atoms keep the standing space join). The fix:
  // sawNum — a number token since the last atom triggers the kern
  // decision (a 0 sum joins), only the token-free adjacency keeps the
  // space join.
  it("joins per-glyph hex atoms across explicit zero kerns (the WeasyPrint form — R113-A)", async () => {
    // the measured WeasyPrint array shape: single-glyph hex atoms, an
    // explicit 0 between every pair, the space glyph <20> carrying the
    // word gap — at HEAD this reads "J o h n   S m i t h !"
    const file = await pdfWithContent(
      "BT /F1 12 Tf (payroll admin compliance training onboarding specialist platform experience) Tj " +
      "[<4A>0<6F>0<68>0<6E>0<20>0<53>0<6D>0<69>0<74>0<68>0<21>] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("John Smith!"); // RED at HEAD: "J o h n   S m i t h !"
  });

  it("extracts a WeasyPrint stream slice with the flip Tm and a mid-word kern (the real shape — R113-A)", async () => {
    // the genuine stream anatomy: the page-flip Tm (1 0 0 -1 x y), the
    // fractional Tf size, per-glyph zero kerns, one real positive kern
    // (54 — the display overhang), the space glyph, and the line move to
    // the next run's Tm
    const file = await pdfWithContent(
      "BT /F1 12 Tf 1 0 0 -1 68.47 107.61 Tm (payroll admin compliance training onboarding specialist platform experience) Tj " +
      "[<4A>0<6F>0<68>0<6E>0<20>0<53>0<6D>0<69>0<74>0<68>] TJ ET\n" +
      "BT /F1 12 Tf 1 0 0 -1 68.47 130.00 Tm [<53>0<65>0<6E>0<69>0<6F>0<72> 54 <20>0<48>0<52>] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("John Smith"); // RED at HEAD: the soup
    expect(text).toContain("Senior HR"); // the 54 kern joins, the space glyph carries the gap
    expect(text.indexOf("John Smith")).toBeLessThan(text.indexOf("Senior HR")); // the Tm line move keeps its newline
  });

  it("joins atoms across consecutive numbers summing to zero (the token-presence rule — R113-A)", async () => {
    // the rule's purest edge: the SUM decides gap-vs-kern, the TOKEN
    // PRESENCE triggers the decision — [(Joh) -5 5 (n…)] carries number
    // tokens summing to 0, a contiguous placement the old `kern !== 0`
    // read as the token-free adjacency (a space)
    const file = await pdfWithContent(
      "BT /F1 12 Tf (payroll admin compliance training onboarding specialist platform experience) Tj " +
      "[(Joh) -5 5 (n Smi) -3 3 (th)] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("John Smith"); // RED at HEAD: "Joh n Smi th"
  });

  it("keeps the space join between atoms with no number after a kerned pair (the reset leg — R113-A guard)", async () => {
    // the over-fix guard: the 18 kern joins its atoms, the FOLLOWING
    // adjacency (no number token) keeps the standing space join — the
    // sawNum flag must reset at every atom push
    const file = await pdfWithContent(
      "BT /F1 12 Tf (payroll admin compliance training onboarding specialist platform experience) Tj " +
      "[<61 62> 18 <63 64> <65 66>] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("abcd"); // the kern joins (standing R101-A)
    expect(text).toContain("cd ef"); // the token-free adjacency keeps its space
  });

  it("keeps a numeric word gap inside a zero-kern array (the mixed form — R113-A guard)", async () => {
    // a real gap number rides alongside the zero kerns: the -322 glue
    // keeps its space, the 0 kerns join — the trigger must not flatten
    // the threshold's distinction
    const file = await pdfWithContent(
      "BT /F1 12 Tf (payroll admin compliance training onboarding specialist platform experience) Tj " +
      "[<70> -322 <71>0<72>0<73>] TJ ET"
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("p q"); // the -322 gap keeps its space (born-green at HEAD: "p q r s"; post-fix: "p qrs")
  });
});


// ---------------------------------------------------------------------------
// Session 111 (R111-A/B/C'): the 16th-writer Typst class — Identity-H codes
// in LITERAL strings, lowercase font names, and raw nested parens
// ---------------------------------------------------------------------------
describe("cv-text — the Typst 16th-writer class (session 111)", () => {
  const encS = (s: string) => new TextEncoder().encode(s);
  const encL = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

  async function pdfWithLatin1Streams(
    objects: ({ raw: string } | { dict: string; stream: string })[]
  ): Promise<File> {
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
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  // the shared 16th-writer fixture shape: a Type0 Identity-H font whose
  // ToUnicode maps code i+1 → phrase[i] (the Typst per-glyph subset form),
  // a page binding /F1 to it, and a content stream writing the codes —
  // the phrase rides the 40-alnum readability guard (the r97 lesson)
  const PHRASE = "JohnSmithSeniorHRManagerPayrollGOSIComplianceOnboarding";
  // codes 40/41 are the PAREN bytes — the raw-byte form skips them so its
  // RED stays R111-A's own defect, not the nested-paren leg's (isolation)
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
  const octalLiteral = () =>
    [...PHRASE].map((_, i) => `\\000\\${codeFor(i).toString(8).padStart(3, "0")}`).join("");
  const rawByteLiteral = () =>
    [...PHRASE].map((_, i) => String.fromCharCode(0, codeFor(i))).join("");

  it("decodes 2-byte Identity-H codes written as OCTAL-ESCAPED LITERALS through the font's own ToUnicode (R111-A)", async () => {
    // the measured Typst form: every show is a literal string whose octal
    // escapes carry the 2-byte codes — (\000\001\000\002…) is "John…"
    // under the font's Identity-H ToUnicode. The literal path decoded
    // per-byte through latin1Printable — control bytes to spaces.
    const content = `BT /F1 12 Tf (${octalLiteral()}) Tj ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /AAAAAA+Libertinus /Encoding /Identity-H /ToUnicode 3 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmapForPhrase() },
      { raw: "<< /Font << /F1 2 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources 4 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("JohnSmithSeniorHRManager"); // RED before the fix: the per-byte latin1 scrub reads spaces
  });

  it("decodes 2-byte Identity-H codes written as RAW BYTES in literals (the arXiv literal-CID region — R111-A)", async () => {
    // the arXiv member's latent class: raw control bytes inside literal
    // strings (not octal-escaped) carrying 2-byte codes — HEAD read the
    // per-byte soup (raw NULs + low bytes as latin1 chars)
    // the real arXiv shape: the raw-code literals ride LONG ASCII operator
    // sequences (the printable-dominant stream guard passes on the whole)
    const content =
      `BT /F1 12 Tf (${rawByteLiteral()}) Tj ET\n` +
      "BT /F1 12 Tf (with plain ascii operators around the coded runs for the printable dominant stream guard) Tj ET";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /AAAAAA+Libertinus /Encoding /Identity-H /ToUnicode 3 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmapForPhrase() },
      { raw: "<< /Font << /F1 2 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources 4 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("JohnSmithSeniorHRManager"); // RED before the fix: the raw control bytes scrubbed per-byte
  });

  it("binds LOWERCASE /f0 font names through the page tree (the Typst swapped-page-dict form — R111-B)", async () => {
    // the measured Typst shape: two pages whose resources bind the SAME
    // lowercase name /f0 to DIFFERENT fonts — page 1 to the font whose map
    // spells the WRONG letters, page 2 to the font whose map spells the
    // phrase. The uppercase-F page-tree scan never bound /f0, so page 2's
    // atoms rode the file-order candidate chain and the FIRST (wrong) map
    // covered. Both maps cover the same code range (the collision class).
    const wrongPairs = [...PHRASE].map((_, i) => `<${codeFor(i).toString(16).padStart(4, "0")}> <005A>`).join("\n");
    const cmapA =
      "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
      `${PHRASE.length} beginbfchar\n${wrongPairs}\nendbfchar\nendcmap\n`; // every code → "Z"
    const hexAtoms = [...PHRASE].map((_, i) => codeFor(i).toString(16).padStart(4, "0")).join("");
    const content = `BT /f0 12 Tf <${hexAtoms}> Tj ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 9 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /BBBBBB+Wrong /Encoding /Identity-H /ToUnicode 3 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmapA }, // the WRONG map (first in file order)
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /CCCCCC+Right /Encoding /Identity-H /ToUnicode 5 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmapForPhrase() }, // the RIGHT map (page 2's own font)
      { raw: "<< /Font << /f0 2 0 R >> >>" }, // page 1 resources: f0 → the wrong font
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Font << /f0 4 0 R >> >>" }, // page 2 resources: f0 → the right font
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [11 0 R 12 0 R] >>" },
      { raw: "<< /Type /Page /Contents 7 0 R /Resources 6 0 R >>" },
      { raw: "<< /Type /Page /Contents 9 0 R /Resources 8 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("JohnSmith"); // RED before the fix: the wrong page's "ZZZ…" map covered first
  });

  it("reads literals carrying RAW NESTED PARENS inside TJ arrays (the Typst code-byte form — R111-C)", async () => {
    // the measured Typst quirk: subset-font code bytes 0x28/0x29 — the (
    // and ) glyphs inside words — emitted RAW inside literal strings (a
    // PDF-spec violation pdf.js and pdftotext tolerate by nesting depth).
    // The flat string alternative ended the literal at the inner ) and the
    // array body then died at the orphaned paren — whole paragraphs lost.
    const content =
      "BT /F1 12 Tf [(Senior HR Ma(nager) with payroll, GOSI, onboarding, and compliance skills)] TJ ET";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("Senior HR Ma(nager) with payroll"); // RED before the fix: the array body died at the raw inner paren
  });

  it("keeps 1-byte-font literals VERBATIM when a foreign 2-byte CMap would cover their byte pairs (the dvipdfmx false-cover guard — R111-A narrowing)", async () => {
    // the blast-radius class: a literal under a plain 1-byte font whose
    // ASCII bytes pair into a foreign Identity-H map's codes — the loose
    // first-covering walk (the global fallback) would read "XY" for "Te…"
    // the foreign map covers EVERY byte pair of the whole literal (the
    // full-coverage rule is what makes the naive global-chain decode fire)
    const LIT5 = "TeamHRwithpayrollGOSIonboardingandcomplianceskills";
    const pairs5 = [...LIT5]
      .map((c, i) => `<${(i % 2 === 0 ? c.charCodeAt(0) * 256 + LIT5.charCodeAt(i + 1) : 0).toString(16).padStart(4, "0")}>`)
      .filter((x) => x !== "<0000>");
    const seen5 = new Set();
    const uniqPairs5 = pairs5.filter((x) => (seen5.has(x) ? false : (seen5.add(x), true)));
    const cmapA =
      "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
      `${uniqPairs5.length} beginbfchar\n${uniqPairs5.map((x, i) => `${x} <${(0x58 + (i % 2)).toString(16).padStart(4, "0")}>`).join("\n")}\nendbfchar\nendcmap\n`;
    const content = `BT /F2 12 Tf (${LIT5}) Tj ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /BBBBBB+Foreign /Encoding /Identity-H /ToUnicode 3 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmapA },
      { raw: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>" }, // F2: a plain 1-byte font, no ToUnicode
      { raw: "<< /Font << /F1 2 0 R /F2 4 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 6 0 R /Resources 5 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("TeamHRwithpayroll"); // born-green pin: the own-binding narrowing keeps the literal verbatim (the naive global chain would read XYXY…)
  });

  it("keeps single-glyph XFA-style literals verbatim under a 2-byte-mapped font (the odd-length guard — R111-A)", async () => {
    // the IRS/Acrobat XFA form: every glyph its own (X)Tj literal with a
    // glyph-advance Td (0.2-0.65 em at 12pt joins — the R100-A form). The
    // odd raw length can never pair — the standing per-glyph reading holds
    const content =
      "BT /F1 12 Tf (T) Tj 2.5 0 Td (e) Tj 2.3 0 Td (a) Tj 2.9 0 Td (m) Tj ET\n" +
      "BT /F1 12 Tf (with payroll, GOSI, onboarding, and compliance skills) Tj ET";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /DDDDDD+Glyph /Encoding /Identity-H /ToUnicode 3 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmapForPhrase() },
      { raw: "<< /Font << /F1 2 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources 4 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("Team"); // born-green pin: the per-glyph literals read through the standing join
    expect(text).toContain("with payroll");
  });

  // Session 112 (R112-A): the HOISTED-PREFIX REPAIR — the Chromium/Skia
  // print pipeline (the 17th writer family: headless-Chromium page.pdf(),
  // the modern "Download CV" path) paints FLOATED boxes BEFORE the in-flow
  // content, so the stream reads every float first regardless of its layout
  // position (a right-floated date column hoists above the candidate's
  // name; pdftotext emits the merged reading order). The repair re-merges
  // the hoisted run under a seven-guard signature; the fixtures below pin
  // each leg with the measured Chromium geometry (outer flip cm .24 0 0
  // -.24 0 842.88 + inner scale cm 3.125 … — device y = 842.88 -
  // .24*(215.625 + 3.125*f)).
  it("merges the hoisted float run back into reading order (the Chromium print form — R112-A)", async () => {
    // floats FIRST (Tm f=313/455 — device y 556/450), then the main flow
    // from the page top (f=39 — device y 762) descending — the measured
    // shape of a genuine Chromium print's content stream
    const content =
      "q 0.24 0 0 -0.24 0 842.88 cm q 3.125 0 0 3.125 190.625 215.625 cm\n" +
      "BT /F4 12.66 Tf 1 0 0 -1 565 313 Tm (Mar 2021 dash Present floating date line one) Tj ET\n" +
      "BT /F4 12.66 Tf 1 0 0 -1 558 455 Tm (Jun 2016 dash Feb 2021 second floating dates) Tj ET\n" +
      "BT /F5 29.3 Tf 1 0 0 -1 8 39 Tm (John Smith Senior HR Manager resume header) Tj ET\n" +
      "BT /F4 14 Tf 1 0 0 -1 8 100 Tm (john.smith@example.com contact details line) Tj ET\n" +
      "BT /F4 14 Tf 1 0 0 -1 8 141 Tm (SUMMARY section heading of the document) Tj ET\n" +
      "Q Q";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("John Smith Senior HR Manager");
    expect(text).toContain("Mar 2021 dash Present");
    expect(text).toContain("Jun 2016 dash Feb 2021");
    // RED at HEAD: the floats read FIRST (stream order) — "Mar 2021" at 0,
    // the name after them; the repair lands them at their layout position
    // (below the SUMMARY heading, above nothing — the page's low mid)
    expect(text.indexOf("John Smith")).toBeLessThan(text.indexOf("Mar 2021"));
    expect(text.indexOf("SUMMARY")).toBeLessThan(text.indexOf("Mar 2021"));
  });

  it("orders a same-line float after the flow text it shares the line with (the x tiebreak — R112-A)", async () => {
    // the entry line: flow text from x=8, the floated date at x=565 — the
    // SAME device y (both Tm f=313); Chromium emits the float first, the
    // merged reading orders the line by x (flow 51.75 < float 469.8)
    const content =
      "q 0.24 0 0 -0.24 0 842.88 cm q 3.125 0 0 3.125 190.625 215.625 cm\n" +
      "BT /F4 12.66 Tf 1 0 0 -1 565 313 Tm (EntryDateFloat right side label) Tj ET\n" +
      "BT /F5 29.3 Tf 1 0 0 -1 8 39 Tm (John Smith Senior HR Manager resume header top) Tj ET\n" +
      "BT /F4 14 Tf 1 0 0 -1 8 70 Tm (The subtitle line under the header here) Tj ET\n" +
      "BT /F4 14 Tf 1 0 0 -1 8 313 Tm (Senior HR Manager entry line with enough words) Tj ET\n" +
      "BT /F4 14 Tf 1 0 0 -1 8 400 Tm (Bullet points below the entry line follow here) Tj ET\n" +
      "Q Q";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("EntryDateFloat");
    // RED at HEAD: the float reads before the entry line it belongs beside
    expect(text.indexOf("Senior HR Manager entry line")).toBeLessThan(text.indexOf("EntryDateFloat"));
    // and the float still reads before the line BELOW it
    expect(text.indexOf("EntryDateFloat")).toBeLessThan(text.indexOf("Bullet points"));
  });

  it("keeps a two-column layout in stream order (the column guards — R112-A minority + suffix-above)", async () => {
    // column 1 descends the full height, then the ascent back to the top
    // opens column 2 — the second column starts at the SAME height as the
    // first (suffixTop == prefixTop) and the run is half the stream: both
    // column guards veto the merge, exactly like the arXiv 2-column pages
    const col = (x: number, f: number, w: string) =>
      `BT /F1 12 Tf 1 0 0 -1 ${x} ${f} Tm (${w}) Tj ET\n`;
    const content =
      "q 0.24 0 0 -0.24 0 842.88 cm q 3.125 0 0 3.125 190.625 215.625 cm\n" +
      col(8, 39, "ColumnOneFirst line of the left column text") +
      col(8, 100, "ColumnOneSecond line of the left column here") +
      col(8, 141, "ColumnOneThird line of the left column ends") +
      col(300, 39, "ColumnTwoFirst line of the right column text") +
      col(300, 100, "ColumnTwoSecond line of the right column here") +
      col(300, 141, "ColumnTwoThird line of the right column ends") +
      "Q Q";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    // born-green pin: the WHOLE first column precedes the second (a merge
    // would interleave the two by line)
    expect(text.indexOf("ColumnOneThird")).toBeLessThan(text.indexOf("ColumnTwoFirst"));
  });

  it("keeps a lone top-edge stray in stream order (the step2 guard — R112-A)", async () => {
    // the QUARTZ class: a clipped glyph at the very top edge (device y 816,
    // above the flow's top) drawn mid-stream, then the flow drops -196 back
    // does not CONTINUE from its start (pdftotext reads the stray late and
    // so must we)
    const content =
      "q 0.24 0 0 -0.24 0 842.88 cm q 3.125 0 0 3.125 190.625 215.625 cm\n" +
      "BT /F1 12 Tf 1 0 0 -1 8 33 Tm (FlowTopLine the first line of the flow) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 -1 8 100 Tm (FlowSecondLine the second line here) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 -1 400 -33 Tm (TopEdgeStray the clipped stray) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 -1 8 355 Tm (FlowResumes the flow continues below) Tj ET\n" +
      "Q Q";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("TopEdgeStray");
    // born-green pin: the stray reads where the writer painted it (a merge
    // would hoist it above the flow's top line)
    expect(text.indexOf("FlowTopLine")).toBeLessThan(text.indexOf("TopEdgeStray"));
  });

  it("keeps figure-label furniture in stream order when a running header rides above the flow (the suffix-max guard — R112-A)", async () => {
    // the ReportLab class: the "(0,0) the Origin" label paints first, then
    // higher figure labels, then the page's running header ABOVE them all —
    // the ascent lands mid-furniture, and the suffix's own max sits above
    // its start: that suffix is scattered furniture, not a flow
    const content =
      "q 0.24 0 0 -0.24 0 842.88 cm q 3.125 0 0 3.125 190.625 215.625 cm\n" +
      "BT /F1 12 Tf 1 0 0 -1 8 213 Tm (OriginLabel the origin marker text) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 -1 150 160 Tm (InchesLabel the second marker text) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 -1 200 55 Tm (TopMarker the third marker higher) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 -1 8 10 Tm (RunningHeader the page header line top) Tj ET\n" +
      "Q Q";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("OriginLabel");
    // born-green pin: the label reads where the writer painted it
    expect(text.indexOf("OriginLabel")).toBeLessThan(text.indexOf("InchesLabel"));
  });

  it("keeps a page-floor footer in stream order (the reading-band guard — R112-A)", async () => {
    // the LO Calc class: the page footer paints FIRST at the page floor
    // (device y 118 of a 762-high flow — below a quarter of the flow's
    // top). The verified improvement exists (pdftotext reads the footer at
    // its layout position) but the conservative bar keeps standing members
    // byte-identical — the footer class stays stream-ordered
    const content =
      "q 0.24 0 0 -0.24 0 842.88 cm q 3.125 0 0 3.125 190.625 215.625 cm\n" +
      "BT /F1 12 Tf 1 0 0 -1 8 900 Tm (PageFooterNum the footer paints first) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 -1 8 39 Tm (FlowHead the flow starts at the top) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 -1 8 100 Tm (FlowBody the body of the flow here) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 -1 8 141 Tm (FlowTail the flow continues below) Tj ET\n" +
      "Q Q";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("PageFooterNum");
    // born-green pin: the footer keeps its stream position (the band guard
    // vetoes the merge; removing it would drop the footer to the end)
    expect(text.indexOf("PageFooterNum")).toBeLessThan(text.indexOf("FlowHead"));
  });

  it("keeps stream order when any piece rides the BT-default origin (the explicit-positioning guard — R112-A)", async () => {
    // the IRS XFA class: XML payload the walk matches incidentally, drawn
    // with NO Tm/Td since its BT — the identity line matrix is not a layout
    // position. One such piece anywhere in the stream disables the repair
    // plain user-space Tms (no cm — the identity CTM puts the BT-default
    // piece at the origin (0,0), exactly the IRS XFA class)
    const content =
      "BT /F4 12.66 Tf 1 0 0 1 565 556 Tm (FloatOne the hoisted float text) Tj ET\n" +
      "BT /F4 12.66 Tf 1 0 0 1 558 450 Tm (FloatTwo the second hoisted float) Tj ET\n" +
      "BT /F5 29.3 Tf 1 0 0 1 8 762 Tm (FlowTop the flow starts at the top) Tj ET\n" +
      "BT /F5 14 Tf 1 0 0 1 8 738 Tm (FlowNext the flow continues below it) Tj ET\n" +
      "BT /F1 12 Tf (UnpositionedTail the XFA style garbage) Tj ET";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("FloatOne");
    expect(text).toContain("UnpositionedTail");
    // born-green pin: the whole stream keeps stream order (the repair is
    // disabled — removing the guard would merge the floats after FlowNext)
    expect(text.indexOf("FloatOne")).toBeLessThan(text.indexOf("FlowTop"));
  });

  it("keeps a trailing running header in stream order (the suffix-substance guard — R112-A)", async () => {
    // the ReportLab TOC class: the TOC body paints first, the running
    // header LAST (k=8 of 11 on the tail fragments — the suffix is 3
    // pieces, 27% of the stream): the hoisted-run bound vetoes the merge
    const content =
      "BT /F1 12 Tf 1 0 0 1 8 746 Tm (TocEntryFirst the first toc line here) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 1 8 716 Tm (TocEntrySecond the second toc line) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 1 8 686 Tm (TocEntryThird the third toc line text) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 1 8 656 Tm (TocEntryFourth the fourth toc line text) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 1 8 626 Tm (TocEntryFifth the fifth toc line text) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 1 8 596 Tm (TocEntrySixth the sixth toc line text) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 1 8 566 Tm (TocEntrySeventh the seventh line text) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 1 8 536 Tm (TocEntryEighth the eighth line text) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 1 400 800 Tm (RunningHeaderTail the header paints last) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 1 400 780 Tm (PageNumber the page number piece) Tj ET\n" +
      "BT /F1 12 Tf 1 0 0 1 400 760 Tm (ChapterMark the chapter mark piece) Tj ET";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("RunningHeaderTail");
    // born-green pin: the header keeps its stream position (a merge would
    // hoist it above the whole TOC body)
    expect(text.indexOf("TocEntryFirst")).toBeLessThan(text.indexOf("RunningHeaderTail"));
  });

});


// ---------------------------------------------------------------------------
// Session 114 (R114-A/B): the 19th-writer fpdf2 class — the raw-code literal
// census false-reject and the kern+space-glyph word-gap duality
// ---------------------------------------------------------------------------
describe("cv-text — the fpdf2 19th-writer class (session 114)", () => {
  const encS = (s: string) => new TextEncoder().encode(s);
  const encL = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

  async function pdfWithLatin1Streams(
    objects: ({ raw: string } | { dict: string; stream: string })[]
  ): Promise<File> {
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
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  // the shared pad (the standing r113 fixture-padding guard: the yield gate
  // needs >= 40 alnums)
  const PAD = "payroll admin compliance training onboarding specialist platform experience";

  // Session 114 (R114-A): the LITERAL-INTERIOR CENSUS MASK. fpdf2 2.8.5 (the
  // 19th writer family — the PyFPDF lineage behind many CV/invoice
  // pipelines) writes 2-byte Identity-H codes as RAW control bytes in
  // literal strings (high byte 0x00), so a genuine content stream measured
  // 51.8% printable on the whole-stream census — under the 60% gate — and
  // the WHOLE file read 0 characters. The census measures the stream's
  // SYNTAX (operators, numbers, names), never the payload bytes inside
  // literal strings: sampled positions inside a literal span are skipped.
  it("reads a raw-code literal stream the whole-stream census false-rejected (the fpdf2 dead-file — R114-A)", async () => {
    // the fpdf2 shape: one dominant literal carrying the 2-byte codes raw
    // (the high bytes are NULs) + short operator syntax — the whole-stream
    // printable ratio lands near 34% (under the 60% gate), the syntax
    // outside the literal is 100% printable
    const PHRASE = "JohnSmithSeniorHRManagerPayrollGOSIComplianceOnboarding";
    const codeFor = (i: number) => (i + 1 >= 40 ? i + 3 : i + 1); // skip the paren bytes
    const cmap = (() => {
      const pairs = [...PHRASE]
        .map((c, i) => `<${codeFor(i).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`)
        .join("\n");
      return (
        "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
        `${PHRASE.length} beginbfchar\n${pairs}\nendbfchar\nendcmap\n`
      );
    })();
    const rawLiteral = [...PHRASE].map((_, i) => String.fromCharCode(0, codeFor(i))).join("");
    const content = `BT /F1 12 Tf (${rawLiteral}) Tj ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /AAAAAA+LibSans /Encoding /Identity-H /ToUnicode 3 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmap },
      { raw: "<< /Font << /F1 2 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources 4 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("JohnSmithSeniorHRManager"); // RED before the fix: the census rejected the whole stream (0 chars)
  });

  it("keeps rejecting paren-free binary decoys after the mask (the guard holds — R114-A)", async () => {
    // the masking must not open the binary gate: a stream whose bytes are
    // non-printable garbage carrying a text-op-shaped ") Tj" fragment (and
    // NO parens, so nothing is maskable) stays out of the operator walk —
    // only the sibling content stream's text yields
    const garbage = "\uFFFD".repeat(1500) + ") Tj " + "\uFFFD".repeat(1500);
    const good = "BT /F1 12 Tf (Senior HR Manager with payroll and compliance skills) Tj ET";
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 5 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: garbage },
      { dict: "/Filter /FlateDecode", stream: good },
      { raw: "<< /Type /Pages /Kids [6 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("Senior HR Manager with payroll"); // the real text survives
    expect(text.replace(/\uFFFD/g, "").trim().length).toBeLessThan(120); // no garbage payload yielded (born-green: the decoy was rejected at HEAD too)
  });

  // Session 114 (R114-B): the KERN+SPACE-GLYPH WORD-GAP DUALITY. fpdf2's
  // justified multi_cell writes every word gap DOUBLY encoded: a negative
  // kern <= -100 between the atoms AND a leading space glyph inside the
  // NEXT atom — the standing kern rule fired its separator AND the decoded
  // space carried another ("word1  word2" where pdftotext reads one space).
  // The fix: the kern-gap piece carries condKern, and at assembly the
  // separator collapses when the atom's leading space is the WRITER'S OWN —
  // a cmap-declared U+0020 or a real 0x20 byte — never the printable-scrub
  // remap of a control byte (the pdfTeX fi-ligature class).
  it("collapses the kern gap when the next atom opens with a real space byte (the 1-byte form — R114-B)", async () => {
    // the fpdf2 core-font class: plain literals, the -177.696 justification
    // kern, the next atom's leading 0x20 space byte
    const content = `BT /F1 12 Tf (${PAD}) Tj [(JohnSmith) -177.696( SeniorHRManager)] TJ ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("JohnSmith SeniorHRManager"); // RED before the fix: "JohnSmith  SeniorHRManager" (the doubled gap)
  });

  it("collapses the kern gap when the cmap declares the next atom's leading code a space (the 2-byte form — R114-B)", async () => {
    // the fpdf2 embedded-TTF class: 2-byte Identity-H codes as raw-byte
    // literals inside a TJ array, the kern gap, and the next atom opening
    // with the code the ToUnicode maps to U+0020
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
    const content = `BT /F1 12 Tf (${PAD}) Tj [(${atom1}) -177.696(${atom2})] TJ ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /AAAAAA+LibSans /Encoding /Identity-H /ToUnicode 3 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmap },
      { raw: "<< /Font << /F1 2 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources 4 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("JohnSmith SeniorHRManager"); // RED before the fix: the doubled gap
  });

  it("collapses the kern gap for HEX atoms whose leading code the cmap declares a space (the hex form — R114-B)", async () => {
    // the same duality in the hex-atom spelling: [<codes> -177.696<0020…>]
    // under a codeLen-2 ToUnicode
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
    const content = `BT /F1 12 Tf (${PAD}) Tj [<${hex1}> -177.696<${hex2}>] TJ ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /AAAAAA+LibSans /Encoding /Identity-H /ToUnicode 3 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmap },
      { raw: "<< /Font << /F1 2 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources 4 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("JohnSmith SeniorHRManager"); // RED before the fix: the doubled gap
  });

  it("keeps the kern gap when the atom's leading space is a scrubbed control byte (the pdfTeX ligature guard — R114-B)", async () => {
    // the arXiv byte-identity guard: pdfTeX's fi-ligature glyph (the \034
    // control byte) remaps to a space through the printable scrub — that is
    // NOT the writer's own space, so the kern's separator must stand (the
    // standing corpus reading keeps its double space)
    const content = `BT /F1 12 Tf (${PAD}) Tj [(training,) -378 (\\034netuning)] TJ ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("training,  netuning"); // born-green: the scrub-class gap keeps BOTH separators (the collapse must not fire)
  });

  it("keeps the sub-threshold kern join with the leading space byte (the boundary guard — R114-B)", async () => {
    // the fpdf2 SKILLS line class: the -92.953 kern is UNDER the -100 word
    // gap boundary — it JOINS (the glyph advance), and the atom's leading
    // space byte carries the single separation. The condKern marker must
    // never fire below the boundary
    const content = `BT /F1 12 Tf (${PAD}) Tj [(Talent) -92.953( Acquisition Skills)] TJ ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("Talent Acquisition Skills"); // born-green: single-spaced at HEAD and after (the join + the space byte)
    expect(text).not.toContain("Talent  Acquisition"); // the join must not double
  });
});

// ---------------------------------------------------------------------------
// Session 115 (R115-A/B/C): the Typst positioned-space duality round — the
// duality family: the standalone space-glyph run sandwiched between standing
// joins, the TRAILING-space-in-previous-atom kern duality (the r115-queued
// hunt class), the consecutive space runs, and the hex-trailing cmap-first
// order (the fontspec guard)
// ---------------------------------------------------------------------------
describe("cv-text — the Typst positioned-space duality class (session 115)", () => {
  const encS = (s: string) => new TextEncoder().encode(s);
  const encL = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

  async function pdfWithLatin1Streams(
    objects: ({ raw: string } | { dict: string; stream: string })[]
  ): Promise<File> {
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
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  // the shared pad (the standing r113 fixture-padding guard: the yield gate
  // needs >= 40 alnums)
  const PAD = "payroll admin compliance training onboarding specialist platform experience";

  // Session 115 (R115-A): THE POSITIONED SPACE RUN. The Typst engine places
  // every header-grid word as its own repositioned run (q/cm/BT blocks, the
  // text matrix at origin) and writes the word separator as a STANDALONE
  // space-glyph run between them — the standing-join separators around the
  // space run read "John" | " " | "Smith" as THREE separators. The fix: a
  // piece whose ENTIRE text is the writer's OWN space IS the separator — its
  // own " " sep collapses and the FOLLOWING piece's " " sep collapses.
  it("collapses the sandwich around a standalone genuine space run (the Typst header grid — R115-A)", async () => {
    const content = `BT /F1 12 Tf (${PAD}) Tj (John) Tj ( ) Tj (Smith) Tj ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("John Smith"); // RED before the fix: "John   Smith" (the tripled gap)
    expect(text).not.toContain("John  "); // no doubled gap anywhere around the name
  });

  // Session 115 (R115-C): THE CONSECUTIVE SPACE RUNS. The Typst contacts
  // separator ("  " between phone and email) is TWO standalone space-glyph
  // pieces — the first carries the separation, the second contributes
  // nothing (the output already ends whitespace).
  it("collapses consecutive genuine space runs to a single separation (the contacts separator — R115-C)", async () => {
    const content = `BT /F1 12 Tf (${PAD}) Tj (John) Tj ( ) Tj ( ) Tj (Smith) Tj ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("John Smith"); // RED before the fix: "John    Smith" (the quadrupled gap)
  });

  // Session 115 (R115-B): THE TRAILING-SPACE-IN-PREVIOUS-ATOM DUALITY — the
  // r115-queued hunt class, MEASURED on the Typst justified paragraphs: every
  // word gap is written as the word atom's TRAILING space glyph (a real 0x20
  // byte) PLUS an adjustment kern; the justification SQUEEZE kerns (<= -100)
  // fire the word-gap rule and double with the glyph.
  it("collapses the kern gap when the previous atom ends with a real space byte (the 1-byte trailing form — R115-B)", async () => {
    const content = `BT /F1 12 Tf (${PAD}) Tj [(design ) -120.5(and organizational)] TJ ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("design and organizational"); // RED before the fix: "design  and" (the doubled gap)
  });

  it("collapses the kern gap for HEX atoms whose trailing code the cmap declares a space (the hex trailing form — R115-B)", async () => {
    // the same duality in the hex-atom spelling: [<design codes + space
    // code> -150 <and codes>] under a codeLen-2 ToUnicode
    const w1 = "design";
    const w2 = "and organizational"; // the internal space rides its own code (0031)
    const pairs: string[] = [];
    w1.split("").forEach((c, i) => pairs.push(`<${(i + 1).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`));
    pairs.push(`<0030> <0020>`);
    pairs.push(`<0031> <0020>`);
    let code = 20;
    const codeOf: string[] = [];
    for (const c of w2) {
      if (c === " ") codeOf.push("0031");
      else {
        pairs.push(`<${code.toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`);
        codeOf.push(code.toString(16).padStart(4, "0"));
        code++;
      }
    }
    const cmap =
      "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
      `${pairs.length} beginbfchar\n${pairs.join("\n")}\nendbfchar\nendcmap\n`;
    const hex1 = w1.split("").map((_, i) => (i + 1).toString(16).padStart(4, "0")).join("") + "0030";
    const hex2 = codeOf.join("");
    const content = `BT /F1 12 Tf (${PAD}) Tj [<${hex1}> -150 <${hex2}>] TJ ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /AAAAAA+LibSans /Encoding /Identity-H /ToUnicode 3 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmap },
      { raw: "<< /Font << /F1 2 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources 4 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("design and organizational"); // RED before the fix: the doubled gap
  });

  // the born-green guards — the collapse must NEVER fire on these forms

  it("keeps the kern gap when the previous atom's trailing space is a scrubbed control byte (the trailing scrub guard — R115-B)", async () => {
    // the arXiv byte-identity guard's TRAILING mirror: pdfTeX's fi-ligature
    // glyph (the \\034 control byte) remaps to a space through the printable
    // scrub — NOT the writer's own space, so the kern's separator stands
    const content = `BT /F1 12 Tf (${PAD}) Tj [(ne\\034) -378 (tuning)] TJ ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("ne  tuning"); // born-green: the scrub-class trailing gap keeps BOTH separators
  });

  it("keeps the kern gap when a 2-byte code's LOW byte is 0x20 but the cmap maps it to a non-space (the fontspec guard — the cmap-first order)", async () => {
    // the fontspec TOC class measured in-round: the hex atom ends with the
    // code 0x0020 whose ToUnicode maps to "?" (an arbitrary subset-code
    // assignment) — the bare 0x20 BYTE check on a 2-byte code's low byte is
    // NOT the writer's space; without the cmap-first order the separator
    // collapses and the words FUSE
    const w1 = "fonts";
    const w2 = "dotleader";
    const pairs: string[] = [];
    w1.split("").forEach((c, i) => pairs.push(`<${(i + 1).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`));
    pairs.push(`<0020> <003f>`); // the code 0x0020 (whose LOW byte is 0x20) maps to "?" — NOT a space
    w2.split("").forEach((c, i) => pairs.push(`<${(20 + i).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`));
    const cmap =
      "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
      `${pairs.length} beginbfchar\n${pairs.join("\n")}\nendbfchar\nendcmap\n`;
    const hex1 = w1.split("").map((_, i) => (i + 1).toString(16).padStart(4, "0")).join("") + "0020";
    const hex2 = w2.split("").map((_, i) => (20 + i).toString(16).padStart(4, "0")).join("");
    const content = `BT /F1 12 Tf (${PAD}) Tj [<${hex1}> -150 <${hex2}>] TJ ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 6 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /AAAAAA+LibSans /Encoding /Identity-H /ToUnicode 3 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmap },
      { raw: "<< /Font << /F1 2 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources 4 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("fonts? dotleader"); // born-green: the separator stands (the byte-first misfire would read "fonts?dotleader" — FUSED)
  });

  it("keeps the line move after a trailing genuine space (the newline guard — R115-B)", async () => {
    // a trailing space followed by a LINE MOVE keeps its newline — the
    // collapse fires only on " " separators, never on "\\n"
    const content = `BT /F1 12 Tf (${PAD}) Tj [(design )] TJ 0 -14 Td (and organizational) Tj ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("design \nand organizational"); // born-green: the newline survives the trailing space
  });
});

describe("cv-text — the cm-carried line-structure class (session 116)", () => {
  const encS = (s: string) => new TextEncoder().encode(s);
  const encL = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

  async function pdfWithLatin1Streams(
    objects: ({ raw: string } | { dict: string; stream: string })[]
  ): Promise<File> {
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
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  const PAD = "payroll admin compliance training onboarding specialist platform experience";

  // the Typst block builder: every word its own q/cm/BT block, the flip-y
  // carried by BOTH the cm and the Tm (the double flip cancels — the R112-A
  // tracker stamps the untranslated (tx, ty) as the device position)
  const typstBlock = (tx: number, ty: number, size: number, text: string) =>
    `q\n1 0 0 -1 ${tx} ${ty} cm\nBT 0 Tr /f0 ${size} Tf 1 0 0 -1 0 0 Tm (${text}) Tj\nET\nQ`;

  // Session 116 (R116-A): THE CM-CARRIED LINE MOVE. The Typst engine places
  // every word as its own q/cm/BT block — the `cm` translation carries the
  // line position but NEVER feeds the walk's separator tracker (it only
  // concatenates the CTM for the R112-A position stamps), so a line move
  // reads as the STANDING " " join where every positional reader reads a
  // newline. The fix: at assembly, a positioned piece pair whose DEVICE-space
  // y-delta >= 0.5 em (max-ps denominator) upgrades its " " separator to a
  // line break — never a join, never an existing newline.
  it("breaks the line between cm-positioned blocks a line step apart (the Typst body form — R116-A)", async () => {
    // two 9pt blocks 24 units apart (2.67 em) — pdftotext reads a newline
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" + typstBlock(50, 700, 9, "First") + "\n" + typstBlock(50, 676, 9, "Second");
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("First\nSecond"); // RED before the fix: "First Second" (the standing join)
  });

  it("breaks the line across a size change (the Typst header-to-contacts step — R116-A)", async () => {
    // the 32pt header at y 792.4873 and the 9pt contacts line at y 768.3653 —
    // the measured resume geometry: dy 24.12 / max(32, 9) = 0.754 em >= 0.5
    const content =
      typstBlock(219.8, 792.4873, 32, PAD) + "\n" + typstBlock(219.8, 792.4873, 32, "John") + "\n" +
      typstBlock(257.9, 768.3653, 9, "Senior");
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("John\nSenior"); // RED before the fix: "John Senior"
  });

  // the born-green guards — the upgrade must NEVER fire on these forms

  it("keeps the space between same-line cm-positioned blocks (the same-line keep — R116-A)", async () => {
    // the header-grid words share the line (dy = 0) — the standing join is
    // the correct reading; the R115-A collapse family still applies
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" + typstBlock(50, 700, 12, "John") + "\n" + typstBlock(200, 700, 12, "Smith");
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("John Smith"); // born-green: same-line pieces never break
    expect(text).not.toContain("John\nSmith");
  });

  it("keeps the space across a sub-em y-delta (the arXiv accent guard — R116-A)", async () => {
    // the r115 REFUTATION constraint: the arXiv math accents ride SUB-EM
    // device deltas above their base words and pdftotext reads them
    // same-line — a delta under the 0.5-em threshold must never break
    const content =
      typstBlock(50, 750, 12, PAD) + "\n" + typstBlock(50, 700.0, 12, "wide") + "\n" + typstBlock(54, 696.4, 12, "hat");
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("wide hat"); // born-green: 3.6/12 = 0.3 em — under the threshold, no break
    expect(text).not.toContain("wide\nhat");
  });

  it("keeps the glyph-advance join across a device line shift (the join guard — R116-A)", async () => {
    // the upgrade fires ONLY on " " separators: a sub-em Td glyph-advance
    // JOIN between shows (the R100-A form) keeps its join even when a cm
    // between the blocks shifted the device baseline a full line step —
    // re-breaking joins is the r115 refutation's mirror class
    const content =
      `q\n1 0 0 -1 50 750 cm\nBT 0 Tr /f0 9 Tf 1 0 0 -1 0 0 Tm (${PAD}) Tj\nET\nQ\n` +
      `q\n1 0 0 -1 50 700 cm\nBT 0 Tr /f0 12 Tf 1 0 0 -1 0 0 Tm (First) Tj\nET\nQ\n` +
      `1 0 0 1 0 -20 cm\n` +
      `BT 0 Tr /f0 12 Tf 1 0 0 -1 0 0 Tm 3 0 Td (Second) Tj ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("FirstSecond"); // born-green: the 0.25-em Td join survives the 20-unit device shift
  });

  it("keeps the standing space when the following block carries no position stamp (the unpositioned guard — R116-A)", async () => {
    // the R112-A stamps require an EXPLICIT Tm/Td line matrix — a BT block
    // at the default origin is deliberately unpositioned (the XFA-XML
    // garbage class) and the rule never fires on it, even after a stamped
    // piece a full line step away (a stamp-less pair is not a positioned
    // pair; the unguarded form would treat the missing stamp as origin 0)
    const content =
      `BT /F1 12 Tf (${PAD}) Tj ET\n` +
      `BT /F1 12 Tf 1 0 0 1 50 700 Tm (First) Tj ET\n` +
      `BT /F1 12 Tf (Second) Tj ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 2 0 R >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("First Second"); // born-green: no second stamp, no upgrade — the standing join
    expect(text).not.toContain("First\nSecond");
  });
});

describe("cv-text — the same-line x-gap column class (session 117)", () => {
  const encS = (s: string) => new TextEncoder().encode(s);
  const encL = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

  async function pdfWithLatin1Streams(
    objects: ({ raw: string } | { dict: string; stream: string })[]
  ): Promise<File> {
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
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  // The phrase carries spaces AT the trail positions the fixtures need; every
  // char (spaces included) maps to its own 2-byte code through the ToUnicode
  // (the R111-A literal-CID form), and the descendant's /W carries each code's
  // width in the TYPST TRIPLE FORM (k k w — measured on the real resume: 255
  // numbers, CID k → w_k, the space 250, letters 500).
  // the pad prefix rides every fixture (the 40-alnum readability guard, the
  // r97 lesson) — its own block at a line above the fixture geometry
  const PAD = "payrolladmincompliancetrainingonboardingspecialistplatform";
  const PHRASE = `${PAD}experience SeniorHRManager TechCorp Mar2021Present nextword ticks trail`;
  const codeFor = (i: number) => i + 1;
  const spaceCodes = new Set([...PHRASE].map((c, i) => (c === " " ? codeFor(i) : -1)).filter((x) => x >= 0));
  const cmapForPhrase = () => {
    const pairs = [...PHRASE]
      .map((c, i) => `<${codeFor(i).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`)
      .join("\n");
    return (
      "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
      `${PHRASE.length} beginbfchar\n${pairs}\nendbfchar\nendcmap\n`
    );
  };
  const wTriple = () =>
    [...PHRASE].map((_, i) => `${codeFor(i)} ${codeFor(i)} ${spaceCodes.has(codeFor(i)) ? 250 : 500}`).join(" ");
  const codesFor = (text: string) => {
    const idx = PHRASE.indexOf(text);
    if (idx < 0) throw new Error(`fixture phrase missing "${text}"`);
    return [...text].map((_, i) => `\\000\\${codeFor(idx + i).toString(8).padStart(3, "0")}`).join("");
  };
  // the Typst block form (the R116-A builder): every element its own
  // q/cm/BT block, the flip-y carried by BOTH the cm and the Tm
  const typstBlock = (tx: number, ty: number, size: number, text: string) =>
    `q\n1 0 0 -1 ${tx} ${ty} cm\nBT 0 Tr /f0 ${size} Tf 1 0 0 -1 0 0 Tm (${codesFor(text)}) Tj\nET\nQ`;

  const fontFixture = (content: string, descendantExtra = `/DW 500 /W [${wTriple()}]`) =>
    pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 7 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /AAAAAA+Test /Encoding /Identity-H /ToUnicode 3 0 R /DescendantFonts [4 0 R] >>" },
      { dict: "/Filter /FlateDecode", stream: cmapForPhrase() },
      { raw: `<< /Type /Font /Subtype /CIDFontType0 /BaseFont /AAAAAA+Test /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> ${descendantExtra} >>` },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources << /Font << /f0 2 0 R >> >> >>" },
    ]);

  // Session 117 (R117-A): THE SAME-LINE X-GAP COLUMN MOVE. The Typst entry
  // layout places the company/dates/year/university at a BLOCK BOUNDARY on
  // the SAME baseline, a true device-space x-gap of 15+ em past the left
  // block's GLYPH-ACCURATE end (the /W width table) — pdftotext reads a
  // line break there; the stream-order walk read the standing " " join.
  // The fix: at assembly, a stamped pair at a block boundary (different
  // stamp origins) on the same baseline whose left block's width-tracked
  // end sits >= 13 em left of the right block's origin upgrades its " "
  // separator to "\n". Never a join, never an existing newline, and only
  // when the left side carries the writer's own trailing space (the
  // R115-B trail / the R115-A space run) and the right side carries real
  // alphanumeric content (the IRS bare-period refutation).
  it("breaks the line between same-baseline blocks a column apart (the Typst title|company form — R117-A)", async () => {
    // the measured resume geometry: the 12pt title at 50 (15 codes × 500/1000
    // × 12 = 90pt wide → true end 140), the trailing-space block at 150 (the
    // 250/1000 × 11 space → end 152.75), the 11pt company at 508.8 — the gap
    // (508.8 − 152.75)/11 = 32.4 em >= 13 → the column move
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" +
      typstBlock(50, 700, 12, "SeniorHRManager") + "\n" +
      typstBlock(150, 700, 11, " ") + "\n" +
      typstBlock(508.8, 700, 11, "TechCorp");
    const file = await fontFixture(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("SeniorHRManager\nTechCorp"); // RED before the fix: "SeniorHRManager TechCorp" (the standing join)
  });

  it("breaks the line at a direct trail-carrying block boundary (the Typst description|dates form — R117-A)", async () => {
    // the justified-line form: the 10pt line block ends with its own trailing
    // space (10 letters × 500 + 250 = 5250/1000 × 10 = 52.5pt → true end
    // 42.5 + 52.5 = 95), the 10pt dates at 483.8 — the gap
    // (483.8 − 95)/10 = 38.9 em >= 13 → the column move (the R115-B trail
    // would have collapsed the separator; the upgrade overrides it and the
    // trailing space strips — the line lands clean, never " \n")
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" +
      typstBlock(42.5, 560, 10, "experience ") + "\n" +
      typstBlock(483.8, 560, 10, "Mar2021Present");
    const file = await fontFixture(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("experience\nMar2021Present"); // RED before the fix: "experience Mar2021Present"
    expect(text).not.toContain("experience \nMar2021Present"); // the clean form
  });

  // the born-green guards — the upgrade must NEVER fire on these forms

  it("breaks the line between trail-carrying blocks 2.5+ em apart (the Prawn tick form — R119-A, the r118 artifact refutation)", async () => {
    // the r117 "11.78 em Prawn chart-tick join" — the calibration's
    // load-bearing JOIN — was EXPOSED by the r118 bbox-layout census as a
    // nearest-word measurement artifact: no joined numeric pair exists in
    // the Prawn output (each tick its own line), and the r119 live drift
    // ledger reads the cured Prawn ticks tick-per-line, matching pdftotext.
    // The 11.7 em pair now breaks.
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" +
      typstBlock(50, 700, 8, "ticks ") + "\n" +
      typstBlock(144.2, 700, 8, "nextword"); // ≈ 11.7 em — the artifact-join band, measured SPLIT
    const file = await fontFixture(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("ticks\nnextword"); // the r119 cure — the artifact join is dead
    expect(text).not.toContain("ticks nextword");
  });

  it("breaks the line between trailless blocks 2.5+ em apart (the trail-license retirement — R119-A, the r118 cross-page refutation)", async () => {
    // the r117 trail license rode the ReportLab cover's "33.6-em trailless
    // join" — refuted by the r118 census as a CROSS-PAGE adjacency ("User
    // Guide" ends page 1; "Table of contents" opens page 2 — not a
    // same-line join). The r119 piece-level census reads the trailless
    // population in [2.5, 13) em all-SPLIT, and the ReportLab form-field
    // tables cure through the retirement. The 38.3 em trailless pair now
    // breaks.
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" +
      typstBlock(50, 700, 10, "SeniorHRManager") + "\n" + // no trailing space: 15×500/1000×10 = 75pt → end 125
      typstBlock(508, 700, 10, "TechCorp"); // gap (508−125)/10 = 38.3 em — the license is retired
    const file = await fontFixture(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("SeniorHRManager\nTechCorp"); // the r119 cure — the license is retired
    expect(text).not.toContain("SeniorHRManager TechCorp");
  });

  it("keeps the space when the font's widths are unresolvable (the blind guard — R117-A)", async () => {
    // a Type0 font whose encoding is NOT Identity-H (Identity-V — the
    // vertical form) has no parseable code→width path: the advance cursor
    // stays blind and the rule never fires, whatever the geometry
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" +
      typstBlock(50, 700, 12, "SeniorHRManager") + "\n" +
      typstBlock(150, 700, 11, " ") + "\n" +
      typstBlock(508.8, 700, 11, "TechCorp");
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 7 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /AAAAAA+Test /Encoding /Identity-V /ToUnicode 3 0 R /DescendantFonts [4 0 R] >>" },
      { dict: "/Filter /FlateDecode", stream: cmapForPhrase() },
      { raw: `<< /Type /Font /Subtype /CIDFontType0 /BaseFont /AAAAAA+Test /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /DW 500 /W [${wTriple()}] >>` },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources << /Font << /f0 2 0 R >> >> >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("SeniorHRManager TechCorp"); // born-green: blind widths — the standing join
    expect(text).not.toContain("SeniorHRManager\nTechCorp");
  });

  it("keeps the move-driven join across a device column shift (the join guard — R117-A)", async () => {
    // the upgrade fires ONLY on " " separators: a sub-em Td glyph-advance
    // JOIN between shows keeps its join even when the pair's true gap is a
    // full column width — re-breaking joins is the r115 refutation class
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" +
      `q\n1 0 0 -1 50 700 cm\nBT 0 Tr /f0 9 Tf 1 0 0 -1 0 0 Tm (${codesFor("SeniorHRManager")}) Tj\nET\nQ\n` +
      `q\n1 0 0 -1 50 700 cm\nBT 0 Tr /f0 9 Tf 1 0 0 -1 0 0 Tm 3 0 Td (${codesFor("TechCorp")}) Tj ET`;
    const file = await fontFixture(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("SeniorHRManagerTechCorp"); // born-green: the 0.33-em Td join survives (no " " to upgrade)
  });

  it("reads a single newline at a cross-line column pair (the R116-A interplay — R117-A)", async () => {
    // a pair BOTH a line step AND a column apart: the R116-A y-delta rule
    // breaks the line; the R117-A never doubles it (the " "-only upgrade
    // sees the already-broken separator, and a line step is not a column)
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" +
      typstBlock(50, 700, 12, "SeniorHRManager") + "\n" +
      typstBlock(150, 700, 11, " ") + "\n" +
      typstBlock(508.8, 660, 11, "TechCorp"); // 40/11 = 3.6 em below — the R116-A line step
    const file = await fontFixture(content);
    const text = await extractTextFromFile(file);
    // the standing R116-A form: the space piece's text precedes the line
    // break — ONE newline, never doubled, never re-broken by the column rule
    expect(text).toContain("SeniorHRManager \nTechCorp");
    expect(text).not.toContain("SeniorHRManager\n\nTechCorp");
    expect(text).not.toContain("SeniorHRManager TechCorp");
  });
});

describe("cv-text — the icon-anchored sub-threshold column class (session 118)", () => {
  const encS = (s: string) => new TextEncoder().encode(s);
  const encL = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

  async function pdfWithLatin1Streams(
    objects: ({ raw: string } | { dict: string; stream: string })[]
  ): Promise<File> {
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
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  // The phrase carries the PUA icon glyphs (U+F098 the phone icon, U+F0E0
  // the envelope — the measured ToUnicode targets on the real resume) and
  // the em-dash (U+2014 — the Skia guard's zero-alnum join); every char
  // maps to its own 2-byte code through the ToUnicode (the R111-A literal
  // form) and the descendant's /W carries each code's width in the TYPST
  // TRIPLE FORM (the space 250, every other glyph 500 — the icons ride the
  // same 500 as the letters; the geometry below absorbs the difference).
  const PAD = "payrolladmincompliancetrainingonboardingspecialistplatform";
  const ICON_MAIL = "\uF0E0";
  const ICON_PHONE = "\uF098";
  const EMDASH = "\u2014";
  const PHRASE = `${PAD} ${ICON_PHONE} ${ICON_MAIL} ${EMDASH} phonenumber mailaddress emword dashword nextword trail`;
  const codeFor = (i: number) => i + 1;
  const spaceCodes = new Set([...PHRASE].map((c, i) => (c === " " ? codeFor(i) : -1)).filter((x) => x >= 0));
  const cmapForPhrase = () => {
    const pairs = [...PHRASE]
      .map((c, i) => `<${codeFor(i).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`)
      .join("\n");
    return (
      "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
      `${PHRASE.length} beginbfchar\n${pairs}\nendbfchar\nendcmap\n`
    );
  };
  const wTriple = () =>
    [...PHRASE].map((_, i) => `${codeFor(i)} ${codeFor(i)} ${spaceCodes.has(codeFor(i)) ? 250 : 500}`).join(" ");
  const codesFor = (text: string) => {
    const idx = PHRASE.indexOf(text);
    if (idx < 0) throw new Error(`fixture phrase missing "${text}"`);
    return [...text].map((_, i) => `\\000\\${codeFor(idx + i).toString(8).padStart(3, "0")}`).join("");
  };
  const typstBlock = (tx: number, ty: number, size: number, text: string) =>
    `q\n1 0 0 -1 ${tx} ${ty} cm\nBT 0 Tr /f0 ${size} Tf 1 0 0 -1 0 0 Tm (${codesFor(text)}) Tj\nET\nQ`;

  const fontFixture = (content: string, descendantExtra = `/DW 500 /W [${wTriple()}]`) =>
    pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 7 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /AAAAAA+Test /Encoding /Identity-H /ToUnicode 3 0 R /DescendantFonts [4 0 R] >>" },
      { dict: "/Filter /FlateDecode", stream: cmapForPhrase() },
      { raw: `<< /Type /Font /Subtype /CIDFontType0 /BaseFont /AAAAAA+Test /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> ${descendantExtra} >>` },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources << /Font << /f0 2 0 R >> >> >>" },
    ]);

  // Session 118 (R118-A): THE ICON-ANCHORED SUB-THRESHOLD COLUMN SPLIT. The
  // Typst contacts row — measured end-to-end this round (the controlled-
  // variant census refuting the queue's icon hypothesis: the split is
  // GAP-driven; the icons are neither required (the no-icons variant
  // splits) nor sufficient (the no-separator variant joins)) — reads in
  // pdftotext as "<phone-icon> +1 (555) 010-9911" / blank /
  // "<mail-icon> john.smith@example.com" while the standing extraction
  // joins all six blocks onto one line. The poppler word-gap boundary sits
  // at ~1 em (the separator bisect: 0.944 em joins, 1.056 em splits); the
  // icon-anchored walk-back census measured the corpus fire surface — the
  // Typst contacts pairs SPLIT at 1.06/2.43 em, the Skia em-dash JOINS at
  // 0.89 em, every other member ZERO candidates. The rule: a zero-alnum
  // content block (an icon/symbol/punctuation anchor — never a space run)
  // at a same-baseline block boundary whose walk-back content block sits
  // >= 0.95 em behind upgrades the separator to a clean newline; the icon
  // then joins the FOLLOWING content at its sub-threshold gap, exactly as
  // pdftotext reads the line.
  it("breaks the line at the icon-anchored contacts boundary (the Typst phone|mail form — R118-A)", async () => {
    // the measured resume geometry: the 9pt phone at 46.75 (11 codes x
    // 500/1000 x 9 = 49.5pt wide -> true end 96.25), the two space-run
    // blocks (the 5pt separator box between them), the mail icon at 105.75
    // — the walk-back gap (105.75 - 96.25)/9 = 1.06 em >= 0.95 -> the split
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" +
      typstBlock(40, 700, 9, ICON_PHONE) + "\n" +
      typstBlock(44.5, 700, 9, " ") + "\n" +
      typstBlock(46.75, 700, 9, "phonenumber") + "\n" +
      typstBlock(96.25, 700, 9, " ") + "\n" +
      typstBlock(103.5, 700, 9, " ") + "\n" +
      typstBlock(105.75, 700, 9, ICON_MAIL) + "\n" +
      typstBlock(110.25, 700, 9, " ") + "\n" +
      typstBlock(112.5, 700, 9, "mailaddress");
    const file = await fontFixture(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain(`${ICON_PHONE} phonenumber\n${ICON_MAIL} mailaddress`); // RED before the fix: one joined line
    expect(text).not.toContain(`phonenumber ${ICON_MAIL}`);
  });

  it("breaks the line at the wider icon-anchored gap (the resume2 2.43 em form — R118-A)", async () => {
    // the resume2/coverletter2 class: the same contacts anatomy at a
    // 2.43 em walk-back gap (the wider separator) — the split fires there
    // too (pdftotext reads the pair on separate lines on all four members)
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" +
      typstBlock(40, 700, 9, ICON_PHONE) + "\n" +
      typstBlock(44.5, 700, 9, " ") + "\n" +
      typstBlock(46.75, 700, 9, "phonenumber") + "\n" +
      typstBlock(96.25, 700, 9, " ") + "\n" +
      typstBlock(101, 700, 9, " ") + "\n" +
      typstBlock(118.12, 700, 9, ICON_MAIL) + "\n" +
      typstBlock(122.62, 700, 9, " ") + "\n" +
      typstBlock(124.87, 700, 9, "mailaddress");
    const file = await fontFixture(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain(`${ICON_PHONE} phonenumber\n${ICON_MAIL} mailaddress`); // RED before the fix
    expect(text).not.toContain(`phonenumber ${ICON_MAIL}`);
  });

  // the born-green guards — the split must NEVER fire on these forms

  it("keeps the space before a sub-threshold symbol block (the Skia em-dash guard — R118-A)", async () => {
    // the measured Skia CV join: the em-dash block 0.89 em past the content
    // end — pdftotext keeps "Senior HR Manager — TechCorp Inc." joined; the
    // threshold sits above it (0.95) and below the Typst splits (1.06)
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" +
      typstBlock(46.75, 700, 9, "emword") + "\n" +
      typstBlock(73.75, 700, 9, " ") + "\n" +
      typstBlock(81.76, 700, 9, EMDASH) + "\n" +
      typstBlock(86.26, 700, 9, " ") + "\n" +
      typstBlock(88.51, 700, 9, "dashword");
    const file = await fontFixture(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain(`emword ${EMDASH} dashword`); // born-green: 0.89 em < 0.95 — no split
    expect(text).not.toContain(`emword\n${EMDASH}`);
  });

  it("keeps the space at the no-separator icon form (the 0.5 em guard — R118-A)", async () => {
    // the controlled-variant v3 form: the icons WITHOUT the separator box —
    // the walk-back gap 0.5 em (the two space runs only) joins in pdftotext
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" +
      typstBlock(40, 700, 9, ICON_PHONE) + "\n" +
      typstBlock(44.5, 700, 9, " ") + "\n" +
      typstBlock(46.75, 700, 9, "phonenumber") + "\n" +
      typstBlock(96.25, 700, 9, " ") + "\n" +
      typstBlock(98.5, 700, 9, " ") + "\n" +
      typstBlock(100.75, 700, 9, ICON_MAIL) + "\n" +
      typstBlock(105.25, 700, 9, " ") + "\n" +
      typstBlock(107.5, 700, 9, "mailaddress");
    const file = await fontFixture(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain(`phonenumber ${ICON_MAIL} mailaddress`); // born-green: 0.5 em < 0.95 — no split
    expect(text).not.toContain(`phonenumber\n${ICON_MAIL}`);
  });

  it("keeps the space when the fonts widths are unresolvable (the blind guard — R118-A)", async () => {
    // the R117-A blind discipline verbatim: without a parseable /W the
    // walk-back end is undefined and the rule never fires (a missing table
    // never misfires, it only cures less)
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" +
      typstBlock(40, 700, 9, ICON_PHONE) + "\n" +
      typstBlock(44.5, 700, 9, " ") + "\n" +
      typstBlock(46.75, 700, 9, "phonenumber") + "\n" +
      typstBlock(96.25, 700, 9, " ") + "\n" +
      typstBlock(103.5, 700, 9, " ") + "\n" +
      typstBlock(105.75, 700, 9, ICON_MAIL) + "\n" +
      typstBlock(110.25, 700, 9, " ") + "\n" +
      typstBlock(112.5, 700, 9, "mailaddress");
    const file = await fontFixture(content, "");
    const text = await extractTextFromFile(file);
    expect(text).toContain(`phonenumber ${ICON_MAIL} mailaddress`); // born-green: blind — no split
  });

  it("keeps the space before an alnum block at a sub-13 em gap (the anchor guard — R118-A)", async () => {
    // the "Jun 2018" class: an ALNUM-RICH right block at 2 em — the anchor
    // is the zero-alnum icon class only; the alnum-rich sub-13 em toward-
    // splits stay joined (the r119 queue keeps them with this round's
    // census data)
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" +
      typstBlock(46.75, 700, 9, "phonenumber") + "\n" +
      typstBlock(96.25, 700, 9, " ") + "\n" +
      typstBlock(103.5, 700, 9, " ") + "\n" +
      typstBlock(114.25, 700, 9, "nextword");
    const file = await fontFixture(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("phonenumber nextword"); // born-green: the anchor guard — no split
    expect(text).not.toContain("phonenumber\nnextword");
  });

  it("reads a single newline at a cross-line icon pair (the R116-A interplay — R118-A)", async () => {
    // the icon BOTH a line step below and a gap right: the R116-A y-delta
    // rule breaks the line; the R118-A never doubles it (the adjacent-piece
    // baseline check rejects the cross-line walk-back)
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" +
      typstBlock(46.75, 700, 9, "phonenumber") + "\n" +
      typstBlock(96.25, 700, 9, " ") + "\n" +
      typstBlock(118.12, 660, 9, ICON_MAIL) + "\n" +
      typstBlock(122.62, 660, 9, " ") + "\n" +
      typstBlock(124.87, 660, 9, "mailaddress");
    const file = await fontFixture(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain(`phonenumber \n${ICON_MAIL}`); // the standing R116-A form — ONE newline
    expect(text).not.toContain(`\n\n${ICON_MAIL}`);
    expect(text).not.toContain(`phonenumber ${ICON_MAIL}`);
  });

  it("reads a single newline at an icon 13+ em away (the R117-A interplay — R118-A)", async () => {
    // an icon at a >= 13 em walk-back gap: the R117-A's alnum guard rejects
    // (the icon carries none) and the R118-A form fires — ONE newline, the
    // clean emission, never doubled
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" +
      typstBlock(46.75, 700, 9, "phonenumber") + "\n" +
      typstBlock(96.25, 700, 9, " ") + "\n" +
      typstBlock(103.5, 700, 9, " ") + "\n" +
      typstBlock(218.25, 700, 9, ICON_MAIL) + "\n" +
      typstBlock(222.75, 700, 9, " ") + "\n" +
      typstBlock(225, 700, 9, "mailaddress");
    const file = await fontFixture(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain(`phonenumber\n${ICON_MAIL} mailaddress`); // the icon split — single, clean
    expect(text).not.toContain("\n\n");
  });
});

describe("cv-text — the sub-13 em alnum-rich threshold class (session 119)", () => {
  const encS = (s: string) => new TextEncoder().encode(s);
  const encL = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

  async function pdfWithLatin1Streams(
    objects: ({ raw: string } | { dict: string; stream: string })[]
  ): Promise<File> {
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
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  // ---- the Typst side (the /W-tracked trail form — the hunt specimen) ----
  const PAD = "payrolladmincompliancetrainingonboardingspecialistplatform";
  const ICON_MAIL = "\uF0E0";
  const PHRASE = `${PAD} onboardinghires Jun2018Feb2021 phonenumber ${ICON_MAIL} mailaddress nextword trail`;
  const codeFor = (i: number) => i + 1;
  const spaceCodes = new Set([...PHRASE].map((c, i) => (c === " " ? codeFor(i) : -1)).filter((x) => x >= 0));
  const cmapForPhrase = () => {
    const pairs = [...PHRASE]
      .map((c, i) => `<${codeFor(i).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`)
      .join("\n");
    return (
      "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
      `${PHRASE.length} beginbfchar\n${pairs}\nendbfchar\nendcmap\n`
    );
  };
  const wTriple = () =>
    [...PHRASE].map((_, i) => `${codeFor(i)} ${codeFor(i)} ${spaceCodes.has(codeFor(i)) ? 250 : 500}`).join(" ");
  const codesFor = (text: string) => {
    const idx = PHRASE.indexOf(text);
    if (idx < 0) throw new Error(`fixture phrase missing "${text}"`);
    return [...text].map((_, i) => `\\000\\${codeFor(idx + i).toString(8).padStart(3, "0")}`).join("");
  };
  const typstBlock = (tx: number, ty: number, size: number, text: string) =>
    `q\n1 0 0 -1 ${tx} ${ty} cm\nBT 0 Tr /f0 ${size} Tf 1 0 0 -1 0 0 Tm (${codesFor(text)}) Tj\nET\nQ`;
  const typstFixture = (content: string) =>
    pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 7 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /AAAAAA+Test /Encoding /Identity-H /ToUnicode 3 0 R /DescendantFonts [4 0 R] >>" },
      { dict: "/Filter /FlateDecode", stream: cmapForPhrase() },
      { raw: `<< /Type /Font /Subtype /CIDFontType0 /BaseFont /AAAAAA+Test /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /DW 500 /W [${wTriple()}] >>` },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources << /Font << /f0 2 0 R >> >> >>" },
    ]);

  // ---- the ReportLab side (the standard-14 convention — the table-row specimen) ----
  // A simple Type1 Helvetica with NO /Widths (the viewer-supplies-metrics
  // contract); the R119-B seeding supplies the AFM byte map. The geometry
  // mirrors the real form-field tables: the label "fieldFlags" at 7pt
  // tracks 10 chars x 427.9/1000 x 7 = 29.95pt.
  const rlBlock = (x: number, y: number, size: number, text: string) =>
    `BT /f0 ${size} Tf ${x} ${y} Td (${text}) Tj ET`;
  const rlFixture = (content: string, fontRaw = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>") =>
    pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 7 0 R >>" },
      { raw: fontRaw },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 3 0 R /Resources << /Font << /f0 2 0 R >> >> >>" },
    ]);
  const RL_PAD_BLOCK = `${rlBlock(50, 750, 9, "payrolladmincompliancetrainingonboardingspecialistplatform")}\n`;

  // Session 119 (R119-A + R119-B): THE SUB-13 EM ALNUM-RICH THRESHOLD DROP +
  // THE STANDARD-14 WIDTH TABLES. The fresh separation census (poppler's own
  // bbox-layout line membership): every join above 1 em lives in [1, 2.05]
  // em, every pair >= 2.06 em splits — the R117-A 13 em threshold left the
  // [2.5, 13) em band joined (the Typst description|"Jun 2018" pair at
  // 4.80 em). The trail license is retired for the class (its load-bearing
  // refutation — the ReportLab cover's 33.6-em trailless "join" — was a
  // cross-page adjacency, killed by the r118 census). The standard-14
  // convention (Helvetica/Times/Courier/Symbol/ZapfDingbats without
  // /Widths) seeds from the AFM tables — the ReportLab form-field tables
  // (8.7-9.4 em trailless cells) read cell-per-line like pdftotext.
  it("breaks the line between same-baseline blocks 2.5-13 em apart (the Typst description|dates form — R119-A)", async () => {
    // the measured resume geometry scaled to the fixture: the description
    // "onboardinghires" at (50, 700, 10) tracks 16 x 500/1000 x 10 = 80pt
    // -> end 130; the space run at 132; the date "Jun2018Feb2021" at
    // (178, 700, 9) -> the walk-back gap (178 - 130)/10 = 4.8 em — the
    // sub-13 em hunt class, previously joined
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" +
      typstBlock(50, 700, 10, "onboardinghires") + "\n" +
      typstBlock(132, 700, 10, " ") + "\n" +
      typstBlock(178, 700, 9, "Jun2018Feb2021");
    const file = await typstFixture(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("onboardinghires\nJun2018Feb2021"); // the cure — the clean split, the space run consumed
    expect(text).not.toContain("onboardinghires Jun2018Feb2021");
    expect(text).not.toContain("onboardinghires \nJun2018Feb2021");
  });

  it("breaks the line between trailless standard-14 table cells (the ReportLab fieldFlags form — R119-A + R119-B)", async () => {
    // the measured form-field table geometry: the label "fieldFlags" at
    // (100, 700, 7) tracks 427.9/1000 x 7 = 29.95pt -> end 129.95; the
    // description at (190, 700, 7) -> the TRAILLESS gap (190 - 129.95)/7 =
    // 8.6 em; the default at (330, 700, 7) past the description's tracked
    // end — pdftotext reads each cell on its own line
    const content =
      RL_PAD_BLOCK +
      rlBlock(100, 700, 7, "fieldFlags") + "\n" +
      rlBlock(190, 700, 7, "Blank separated field flags see below") + "\n" +
      rlBlock(330, 700, 7, "required");
    const file = await rlFixture(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("fieldFlags\nBlank separated field flags see below"); // the trailless label|description split
    expect(text).toContain("below\nrequired"); // the description|default split
    expect(text).not.toContain("fieldFlags Blank");
  });

  it("keeps the [1, 2.5) em band joined (the measured overlap zone — R119-A guard)", async () => {
    // the arXiv max-join class: a same-baseline pair at 1.9 em — inside the
    // [1, 2.05] em overlap band where joins live — keeps its space
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" +
      typstBlock(50, 700, 10, "onboardinghires") + "\n" +
      typstBlock(132, 700, 10, " ") + "\n" +
      typstBlock(149, 700, 9, "Jun2018Feb2021"); // (149 - 130)/10 = 1.9 em — under the threshold
    const file = await typstFixture(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("onboardinghires Jun2018Feb2021"); // born-green: the overlap band stays joined
    expect(text).not.toContain("onboardinghires\nJun2018Feb2021");
  });

  it("keeps an unknown base font without widths joined (the blind-font conservative guard — R119-B)", async () => {
    // a font the AFM seeding does not know (an embedded name, no /Widths):
    // no width table -> no bx -> no gap -> the standing join. A missing
    // table never misfires, it only cures less.
    const content =
      RL_PAD_BLOCK +
      rlBlock(100, 700, 7, "fieldFlags") + "\n" +
      rlBlock(190, 700, 7, "Blank separated field flags see below");
    const file = await rlFixture(content, "<< /Type /Font /Subtype /Type1 /BaseFont /AAAAAA+ObscureFace >>");
    const text = await extractTextFromFile(file);
    expect(text).toContain("fieldFlags Blank separated field flags see below"); // born-green: blind widths — the standing join
    expect(text).not.toContain("fieldFlags\nBlank");
  });

  it("keeps a parsed /Widths table authoritative over the AFM seeding (the real-font precedence guard — R119-B)", async () => {
    // the same Helvetica geometry but WITH a parsed /Widths array whose
    // wide advances push the tracked end past the right block's origin:
    // the parsed table wins (the seeding is strictly additive), the gap
    // reads negative, the pair stays joined
    const content =
      RL_PAD_BLOCK +
      rlBlock(100, 700, 7, "fieldFlags") + "\n" +
      rlBlock(190, 700, 7, "Blank separated field flags see below");
    const widths = Array.from({ length: 256 }, () => 1500).join(" ");
    const file = await rlFixture(
      content,
      `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding /FirstChar 0 /Widths [${widths}] >>`
    );
    const text = await extractTextFromFile(file);
    expect(text).toContain("fieldFlags Blank separated field flags see below"); // born-green: 10 x 1.5 x 7 = 105 -> end 205 > 190 — no fire
    expect(text).not.toContain("fieldFlags\nBlank");
  });

  it("keeps a 1-alnum right block joined (the between-rules guard — R119-A)", async () => {
    // the alnum guard verbatim: the column rule needs >= 2 alphanumerics on
    // the right, and the R118-A anchor rule needs ZERO (the icon/punctuation
    // class — a bare period at 8.6 em splits through the ANCHOR path, the
    // measured icon doctrine). A 1-alnum right block falls between the two
    // rules and keeps its space (the real IRS bare-period class rides the
    // width-blind fonts — its protection is the blindness itself)
    const content =
      RL_PAD_BLOCK +
      rlBlock(100, 700, 7, "fieldFlags") + "\n" +
      rlBlock(190, 700, 7, "a");
    const file = await rlFixture(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("fieldFlags a"); // born-green: 1 alnum — neither the column nor the anchor rule
    expect(text).not.toContain("fieldFlags\na");
  });

  it("keeps a cross-line pair on its standing newline (the R116-A interplay — R119-A guard)", async () => {
    // a pair a full line step apart AND 8 em over: the same-baseline check
    // (the R116-A territory) rejects the column rule — ONE newline, the
    // standing form, never doubled
    const content =
      RL_PAD_BLOCK +
      rlBlock(100, 700, 7, "fieldFlags") + "\n" +
      rlBlock(190, 690, 7, "Blank separated field flags see below"); // 10/7 = 1.4 em below — a line step
    const file = await rlFixture(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain("fieldFlags\nBlank separated field flags see below"); // the R116-A line step — not the column rule
    expect(text).not.toContain("fieldFlags\n\nBlank");
  });

  it("reads a single newline at a zero-alnum anchor 2.5+ em away (the R118-A interplay — R119-A)", async () => {
    // an icon-anchored pair in the new threshold band: the R119-A alnum
    // guard rejects the icon (zero alnum) and the R118-A anchor path fires
    // — the icon joins the FOLLOWING content, the walk-back split lands
    // clean, never doubled
    const content =
      typstBlock(50, 750, 9, PAD) + "\n" +
      typstBlock(50, 700, 9, "phonenumber") + "\n" +
      typstBlock(96.25, 700, 9, " ") + "\n" +
      typstBlock(103.5, 700, 9, " ") + "\n" +
      typstBlock(146.25, 700, 9, ICON_MAIL) + "\n" + // (146.25 - 96.25)/9 = 5.6 em walk-back — the anchor band
      typstBlock(150.75, 700, 9, " ") + "\n" +
      typstBlock(153, 700, 9, "mailaddress");
    const file = await typstFixture(content);
    const text = await extractTextFromFile(file);
    expect(text).toContain(`phonenumber\n${ICON_MAIL} mailaddress`); // the anchor split — single, clean
    expect(text).not.toContain("\n\n");
  });
});

describe("cv-text — the width-blind elimination class (session 120)", () => {
  const encS = (s: string) => new TextEncoder().encode(s);
  const encL = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

  async function pdfWithLatin1Streams(
    objects: ({ raw: string } | { dict: string; stream: string })[]
  ): Promise<File> {
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
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  // a simple font whose /Widths rides a SEPARATE array object — the Prawn
  // embedded-font / arXiv Type1 form (every used code 500 units wide)
  const W500 = Array.from({ length: 96 }, () => "500").join(" ");
  const W200 = Array.from({ length: 96 }, () => "200").join(" ");
  const indirectWidthsFont = { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /TestPlus /FirstChar 32 /LastChar 127 /Widths 9 0 R >>" };
  const widthsArrayObj = { raw: `[${W500}]` };
  // the same font with the widths INLINE — the specs that must be
  // meaningful at HEAD (the kern/leader/icon/Tw forms) need WORKING
  // width tracking before the round's cures
  const inlineWidthsFont = { raw: `<< /Type /Font /Subtype /TrueType /BaseFont /TestPlus /FirstChar 32 /LastChar 127 /Widths [${W500}] >>` };

  const block = (x: number, y: number, size: number, text: string) =>
    `BT /f0 ${size} Tf ${x} ${y} Td (${text}) Tj ET`;

  // ---- R120-A: the indirect /Widths form (the Prawn/arXiv class) ----
  it("resolves a /Widths INDIRECT reference to a raw array object (R120-A)", async () => {
    // "payrollcompliancetraining" (25 chars x 500/1000 x 10 = 125pt) at
    // (50,700) tracks to 175; the right block at 230 -> (230-175)/10 =
    // 5.5 em — the column class. At HEAD the indirect /Widths never
    // parses (the font is width-blind, the rule cannot fire) and the pair
    // reads JOINED
    const content =
      block(50, 700, 10, "payrollcompliancetraining") + "\n" +
      block(230, 700, 10, "onboardingspecialist");
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      indirectWidthsFont, // obj 2 — /Widths 9 0 R
      { dict: "/Filter /FlateDecode", stream: content }, // obj 3
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" }, // obj 4
      { raw: "<< /Type /Page /Contents 3 0 R /Resources << /Font << /f0 2 0 R >> >> >>" }, // obj 5
      { raw: "<< >>" }, { raw: "<< >>" }, { raw: "<< >>" },
      widthsArrayObj, // obj 9 — the indirect width array
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("payrollcompliancetraining\nonboardingspecialist"); // ← RED at HEAD: joined
  });

  it("keeps a real inline /Widths winning over a same-font indirect ref (the precedence guard — R120-A)", async () => {
    // the font carries an INLINE array (every code 200 — narrow): the
    // tracked end 50 + 25x2 = 100; the right block at 230 -> 13 em —
    // splits on the INLINE table; the deferred parse must NOT override it
    const content =
      block(50, 700, 10, "payrollcompliancetraining") + "\n" +
      block(230, 700, 10, "onboardingspecialist");
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { raw: `<< /Type /Font /Subtype /TrueType /BaseFont /TestPlus /FirstChar 32 /LastChar 127 /Widths [${W200}] >>` },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 3 0 R /Resources << /Font << /f0 2 0 R >> >> >>" },
      { raw: "<< >>" }, { raw: "<< >>" }, { raw: "<< >>" },
      widthsArrayObj, // obj 9 — the losing indirect table (all 500s)
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("payrollcompliancetraining\nonboardingspecialist"); // the inline table drives — 13 em
  });

  // ---- R120-A: the indirect /W form, the array ObjStm-carried (dvipdfmx/fontspec) ----
  it("resolves a CID descendant's /W INDIRECT reference from an ObjStm-carried array (R120-A)", async () => {
    // the dvipdfmx real form: the Type0 parent + the CID descendant + the
    // descendant's /W pointing at a SEPARATE object that rides an ObjStm.
    // Codes <0001>=a <0002>=b …; every code 500 units. The left word (21
    // CIDs x 500/1000 x 10 = 105pt) at (50,700) tracks to 155; the right
    // block at 210 -> 5.5 em — the column class
    const letters = "abcdefgh";
    const cmap =
      "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
      `${letters.length} beginbfchar\n${[...letters].map((c, i) => `<000${i + 1}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`).join("\n")}\nendbfchar\nendcmap\n`;
    const wTriple = [...letters].map((_, i) => `000${i + 1} 000${i + 1} 500`).join(" ");
    const hex = (n: number) => n.toString(16).padStart(4, "0");
    const left = Array.from({ length: 21 }, (_, i) => hex((i % 2) + 1)).join("");
    const right = Array.from({ length: 21 }, (_, i) => hex((i % 2) + 3)).join("");
    const content =
      `BT /f0 10 Tf 50 700 Td <${left}> Tj ET\n` +
      `BT /f0 10 Tf 210 700 Td <${right}> Tj ET`;
    // the ObjStm carrying the /W array object (obj 12)
    const arrBody = `[${wTriple}]`;
    const entries = [{ obj: 12, body: arrBody }];
    const bodyLens = entries.map((e) => e.body.length + 1);
    let headerLen = -1;
    let objstmStream = "";
    for (let guard = 0; guard < 8; guard++) {
      const parts: string[] = [];
      let acc = 0;
      for (let i = 0; i < entries.length; i++) {
        parts.push(`${entries[i].obj} ${acc} `);
        acc += bodyLens[i];
      }
      const h = parts.join("").length;
      if (h === headerLen) {
        objstmStream = parts.join("") + entries.map((e) => e.body + "\n").join("");
        break;
      }
      headerLen = h;
    }
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" }, // obj 1
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /TestPlus /Encoding /Identity-H /ToUnicode 6 0 R /DescendantFonts [7 0 R] >>" }, // obj 2
      { dict: "/Filter /FlateDecode", stream: content }, // obj 3
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" }, // obj 4
      { raw: "<< /Type /Page /Contents 3 0 R /Resources << /Font << /f0 2 0 R >> >> >>" }, // obj 5
      { dict: "/Filter /FlateDecode", stream: cmap }, // obj 6 — the ToUnicode
      { raw: "<< /Type /Font /Subtype /CIDFontType0 /BaseFont /TestPlus /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /DW 500 /W 12 0 R >>" }, // obj 7 — the descendant, /W INDIRECT
      { raw: "<< >>" }, { raw: "<< >>" }, { raw: "<< >>" }, { raw: "<< >>" },
      { dict: `/Type /ObjStm /N 1 /First ${headerLen} /Filter /FlateDecode`, stream: objstmStream }, // obj 12 — the ObjStm carrying the /W array (inner obj 12)
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("ababababababababababa\ncdcdcdcdcdcdcdcdcdcdc"); // ← RED at HEAD: the descendant is width-blind, joined
  });

  // ---- R120-B: the general-name font bindings (the WeasyPrint class) ----
  it("binds a pure-pair-dict font resource referenced two hops from the page (R120-B)", async () => {
    // the WeasyPrint real form: the page references /Resources 8 0 R;
    // obj 8 carries /Font 9 0 R (the link); obj 9 IS the pure pair dict
    // << /BAWKYD 2 0 R >>; the content selects /BAWKYD (the subset-tag
    // name — never /F-prefixed). The widths ride the Type0 descendant's
    // inline /W: the left word (21 CIDs x 500/1000 x 10 = 105pt) at
    // (50,700) tracks to 155; the right block at 210 -> 5.5 em
    const letters = "abcdefgh";
    const cmap =
      "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
      `${letters.length} beginbfchar\n${[...letters].map((c, i) => `<000${i + 1}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`).join("\n")}\nendbfchar\nendcmap\n`;
    const wTriple = [...letters].map((_, i) => `000${i + 1} 000${i + 1} 500`).join(" ");
    const hex = (n: number) => n.toString(16).padStart(4, "0");
    const left = Array.from({ length: 21 }, (_, i) => hex((i % 2) + 1)).join("");
    const right = Array.from({ length: 21 }, (_, i) => hex((i % 2) + 3)).join("");
    const content =
      `BT /BAWKYD 10 Tf 50 700 Td <${left}> Tj ET\n` +
      `BT /BAWKYD 10 Tf 210 700 Td <${right}> Tj ET`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" }, // obj 1
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /BAWKYD+DejaVu /Encoding /Identity-H /ToUnicode 6 0 R /DescendantFonts [7 0 R] >>" }, // obj 2
      { dict: "/Filter /FlateDecode", stream: content }, // obj 3
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" }, // obj 4
      { raw: "<< /Type /Page /Contents 3 0 R /Resources 8 0 R >>" }, // obj 5 — the referenced resources
      { dict: "/Filter /FlateDecode", stream: cmap }, // obj 6
      { raw: `<< /Type /Font /Subtype /CIDFontType0 /BaseFont /BAWKYD+DejaVu /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /DW 500 /W [${wTriple}] >>` }, // obj 7 — inline /W
      { raw: "<< /Font 9 0 R >>" }, // obj 8 — the resources: the /Font link
      { raw: "<< /BAWKYD 2 0 R >>" }, // obj 9 — the PURE PAIR DICT
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("ababababababababababa\ncdcdcdcdcdcdcdcdcdcdc"); // ← RED at HEAD: BAWKYD never binds, blind, joined
  });

  // ---- R120-C: the pageMap-less fallback ----
  it("resolves widths through the candidate chain when the part has no page map (R120-C)", async () => {
    // the orphan-stream class: the page carries NO /Resources at all; the
    // /f0 pair appears only in an unreferenced dict (the candidate chain's
    // feed). The width post-pass falls back to the first width-carrying
    // candidate
    const content =
      block(50, 700, 10, "payrollcompliancetraining") + "\n" +
      block(230, 700, 10, "onboardingspecialist");
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      indirectWidthsFont, // obj 2 — /Widths 9 0 R
      { dict: "/Filter /FlateDecode", stream: content }, // obj 3
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" }, // obj 4
      { raw: "<< /Type /Page /Contents 3 0 R >>" }, // obj 5 — NO /Resources
      { raw: "<< >>" }, { raw: "<< >>" },
      { raw: "<< /Font << /f0 2 0 R >> >>" }, // obj 8 — the unreferenced pair dict (the candidate feed)
      widthsArrayObj, // obj 9
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("payrollcompliancetraining\nonboardingspecialist"); // ← RED at HEAD: widthFor requires the page map
  });

  it("keeps a page map that lacks the font blind (the misbind guard — R120-C)", async () => {
    // the page binds f0 to a font WITHOUT widths (the misbind signal);
    // the candidate chain knows a width-carrying /f0 elsewhere — the
    // fallback must NOT fire (a page map exists, the font is missing from
    // it: the fontspec collision class)
    const content =
      block(50, 700, 10, "payrollcompliancetraining") + "\n" +
      block(230, 700, 10, "onboardingspecialist");
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /NoWidths >>" }, // obj 2 — the page's own f0: NO widths
      { dict: "/Filter /FlateDecode", stream: content }, // obj 3
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" }, // obj 4
      { raw: "<< /Type /Page /Contents 3 0 R /Resources << /Font << /f0 2 0 R >> >> >>" }, // obj 5
      { raw: "<< >>" }, { raw: "<< >>" },
      { raw: "<< /Font << /f0 2 0 R >> >>" }, // obj 8 — the candidate chain's f0 → the SAME widthless font
      widthsArrayObj, // obj 9 — a width array no font references
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("payrollcompliancetraining onboardingspecialist"); // blind — the pair reads joined (never a misfire)
    expect(text).not.toContain("payrollcompliancetraining\nonboardingspecialist");
  });

  // ---- R120-D: the TJ kern-sign ----
  it("advances a TJ word-gap kern to the RIGHT (ISO 32000-1 9.4.3 — R120-D)", async () => {
    // [(payrollcompliance) -400 (onboardingspecialist)] TJ in one block:
    // the -400 kern moves the pen +4pt (the spec's NEGATED displacement).
    // "payrollcompliance" (17x500/1000x10 = 85pt) ends 135; the kern +4;
    // "onboardingspecialist" (20x5 = 100pt) ends 239. The next block at
    // 259 -> (259-239)/10 = 2.0 em — the TRUE intra-line continuation,
    // JOINED. The sign-inverted tracker reads the end at 231 -> 2.8 em ->
    // a PHANTOM column split
    const content =
      `BT /f0 10 Tf 50 700 Td [(payrollcompliance) -400 (onboardingspecialist)] TJ ET\n` +
      block(259, 700, 10, "trainingspecplatform");
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      inlineWidthsFont, // obj 2 — /Widths 9 0 R (all 500s)
      { dict: "/Filter /FlateDecode", stream: content }, // obj 3
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" }, // obj 4
      { raw: "<< /Type /Page /Contents 3 0 R /Resources << /Font << /f0 2 0 R >> >> >>" }, // obj 5
      { raw: "<< >>" }, { raw: "<< >>" }, { raw: "<< >>" },
      widthsArrayObj, // obj 9
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("onboardingspecialist trainingspecplatform"); // ← RED at HEAD: the phantom split fires
    expect(text).not.toContain("onboardingspecialist\ntrainingspecplatform");
  });

  // ---- R120-E: the leader-run guard ----
  it("keeps a TOC dot-leader anchor on the line (the per-dot repositioned form — R120-E)", async () => {
    // the IRS form: the entry "payrollcompliancetrainingonboardingspecialist"
    // (46 x 500/1000 x 10 = 230pt at 50, ends 280) + individually
    // repositioned dots at 295, 306, 317 (1.1 em steps — the leader run).
    // The first dot sits 1.5 em from the entry — the R118-A anchor band —
    // but a LEADER bridges the row: pdftotext reads the whole row same-line
    const content =
      block(50, 700, 10, "payrollcompliancetrainingonboardingspecialist") + "\n" +
      block(295, 700, 10, ".") + "\n" +
      block(306, 700, 10, ".") + "\n" +
      block(317, 700, 10, ".") + "\n" +
      block(500, 700, 10, "36");
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      inlineWidthsFont,
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 3 0 R /Resources << /Font << /f0 2 0 R >> >> >>" },
      { raw: "<< >>" }, { raw: "<< >>" }, { raw: "<< >>" },
      widthsArrayObj,
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("payrollcompliancetrainingonboardingspecialist . . ."); // ← RED at HEAD: the anchor rule splits before the first dot
    expect(text).not.toContain("specialist\n.");
  });

  it("keeps the icon anchor firing when the anchor leads DIFFERENT content (the icon class — R120-E guard)", async () => {
    // the control: an anchor at the same 3 em band followed by DIFFERENT
    // content (the Typst contacts form) — the split still fires
    const content =
      block(50, 700, 10, "phonenumberpayrollcompliance") + "\n" +
      block(220, 700, 10, "\uF0E0") + "\n" +
      block(225, 700, 10, "mailaddressonboarding");
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      inlineWidthsFont,
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 3 0 R /Resources << /Font << /f0 2 0 R >> >> >>" },
      { raw: "<< >>" }, { raw: "<< >>" }, { raw: "<< >>" },
      widthsArrayObj,
    ]);
    const text = await extractTextFromFile(file);
    // the anchor glyph is the literal's 0xE0 byte (cp1252 à) — a zero-alnum
    // content anchor; the SPLIT lands before it and it joins the following
    // content at its sub-threshold gap (the R118-A measured form)
    expect(text).toContain("phonenumberpayrollcompliance\nàmailaddressonboarding");
    expect(text).not.toContain("phonenumberpayrollcompliance à");
  });

  // ---- R120-F: the Tw word-spacing advance ----
  it("adds the Tw word spacing to the space glyphs' advance (R120-F)", async () => {
    // the Prawn form: 0.4 Tw + real 0x20 bytes inside the atom.
    // "payroll compliance onboarding specialist platform" (45 alnum chars
    // x 500/1000 x 10 = 225pt + 4 spaces x 0.4 x 10 = 16pt) at (50,700)
    // tracks to 311; the right block at 325 -> 1.4 em — the TRUE
    // intra-line continuation, JOINED. The Tw-blind tracker reads the end
    // at 295 -> 3.0 em -> the phantom split fires
    const content =
      `BT /f0 10 Tf 0.4 Tw 50 700 Td (payroll compliance onboarding specialist platform) Tj ET\n` +
      block(325, 700, 10, "trainingspec");
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 4 0 R >>" },
      inlineWidthsFont,
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [5 0 R] >>" },
      { raw: "<< /Type /Page /Contents 3 0 R /Resources << /Font << /f0 2 0 R >> >> >>" },
      { raw: "<< >>" }, { raw: "<< >>" }, { raw: "<< >>" },
      widthsArrayObj,
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("platform trainingspec"); // ← RED at HEAD: the Tw-blind phantom split fires
    expect(text).not.toContain("platform\ntrainingspec");
  });
});

describe("cv-text — the /W range-triple elimination class (session 121)", () => {
  const encS = (s: string) => new TextEncoder().encode(s);
  const encL = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

  async function pdfWithLatin1Streams(
    objects: ({ raw: string } | { dict: string; stream: string })[]
  ): Promise<File> {
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
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  // The resume2 anatomy (the r121 hunt): the Typst /W table with ONE RANGE
  // triple (`15 16 485` on the real member — consecutive subset CIDs that
  // share a width). The r117 strict k-k-w detection requires nums[i] ===
  // nums[i+1] on EVERY group, so the range triple kills it and the pair
  // fallback reads the triple sequence as interleaved garbage — on the real
  // member the body text under-advances ~45% (the tracked end 259.7 vs the
  // true 435.8) and, with /DW 0, a range-covered code missing from the
  // garbage pair map blinds the whole block (no bx — the column rule cannot
  // fire). The measured standing watch: resume2's pair reads 22.21 em vs
  // the true 4.99.
  const PAD = "payrolladmincompliancetrainingonboardingspecialistplatform";
  const PHRASE = `${PAD}abcd fhi`;
  const codeFor = (i: number) => i + 1;
  const cmapForPhrase = () => {
    const pairs = [...PHRASE]
      .map((c, i) => `<${codeFor(i).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`)
      .join("\n");
    return (
      "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
      `${PHRASE.length} beginbfchar\n${pairs}\nendbfchar\nendcmap\n`
    );
  };
  // the /W table: the pad codes as k-k-w, then the fixture codes — with
  // ONE RANGE TRIPLE over "cd" (codes 63 64, both 480 — the resume2
  // `15 16 485` class), the space at 250
  const wRangeTriple = () => {
    const toks: string[] = [];
    for (let i = 0; i < PHRASE.length; i++) {
      const c = codeFor(i);
      if (c === 63) toks.push("63 64 480"); // the RANGE triple (cd share 480)
      else if (c === 64) continue; // consumed by the range
      else toks.push(`${c} ${c} ${PHRASE[i] === " " ? 250 : 500}`);
    }
    return toks.join(" ");
  };
  const codesFor = (text: string) => {
    const idx = PHRASE.indexOf(text);
    if (idx < 0) throw new Error(`fixture phrase missing "${text}"`);
    return [...text].map((_, i) => `\\000\\${codeFor(idx + i).toString(8).padStart(3, "0")}`).join("");
  };
  const typstBlock = (tx: number, ty: number, size: number, text: string) =>
    `q\n1 0 0 -1 ${tx} ${ty} cm\nBT 0 Tr /f0 ${size} Tf 1 0 0 -1 0 0 Tm (${codesFor(text)}) Tj\nET\nQ`;

  const fontFixture = (content: string, descendantExtra = `/DW 0 /W [${wRangeTriple()}]`) =>
    pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 7 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /BBBBBB+Test /Encoding /Identity-H /ToUnicode 3 0 R /DescendantFonts [4 0 R] >>" },
      { dict: "/Filter /FlateDecode", stream: cmapForPhrase() },
      { raw: `<< /Type /Font /Subtype /CIDFontType0 /BaseFont /BBBBBB+Test /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> ${descendantExtra} >>` },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources << /Font << /f0 2 0 R >> >> >>" },
    ]);

  // ---- R121-A: the range-triple /W table (the resume2 class) ----
  it("expands a /W RANGE triple and keeps the column rule armed (R121-A)", async () => {
    // "abcd f" (codes 61-66: 500+500+480+480+250+500 = 2710/1000 x 10 =
    // 27.1pt) at (50,700) tracks to 77.1; "hi" at 110 -> (110-77.1)/10 =
    // 3.29 em >= 2.5 -> the column split. At HEAD the range triple kills
    // the strict detection; the pair fallback's garbage map MISSES code 64
    // ('d' — the range's end landed as a pair VALUE), and /DW 0 blinds the
    // block (no bx) -> the pair reads JOINED — the resume2 under-tracking
    // class, at its intra-block root
    const content =
      typstBlock(50, 750, 10, PAD) + "\n" +
      typstBlock(50, 700, 10, "abcd f") + "\n" +
      typstBlock(110, 700, 10, "hi");
    const text = await extractTextFromFile(await fontFixture(content));
    expect(text).toContain("abcd f\nhi"); // ← RED at HEAD: the range-covered code blinds the block, the pair joins
  });

  it("keeps a sub-threshold pair JOINED under the range-triple table (the over-reach guard — R121-A)", async () => {
    // the same table, the geometry pulled in: the correct 2710-sum tracks
    // the end to 77.1; "hi" at 95 -> (95-77.1)/10 = 1.79 em < 2.5 -> the
    // TRUE intra-line continuation stays JOINED. A mis-expanded range
    // (say d at 1000 -> end 82.3 -> 1.27 em, still joined) cannot flip
    // this case — but an over-firing rule would
    const content =
      typstBlock(50, 750, 10, PAD) + "\n" +
      typstBlock(50, 700, 10, "abcd f") + "\n" +
      typstBlock(95, 700, 10, "hi");
    const text = await extractTextFromFile(await fontFixture(content));
    expect(text).toContain("abcd f hi");
    expect(text).not.toContain("abcd f\nhi");
  });

  /* The both-valid ambiguity (an in-round design finding): a /W sequence
     where BOTH the pair reading and the range reading validate
     (`61 62 63 64 65 66` — pairs {61:62,63:64,65:66}, ranges 61-62->63 +
     64-65->66) yields near-identical maps wherever the coverages overlap,
     and the only divergence (a range-gap code going missing under the
     range reading) requires the pair keys to skip codes — which makes the
     pair sequence itself non-covering for any realistic fixture text.
     The pairs preference (the standing behavior) is therefore
     behaviorally indistinguishable on this class — the pair-validity
     guard is belt-and-suspenders, pinned by the mutation matrix's M3
     arm (the sync arm only) rather than a spec. */

  // ---- R121-A: the pair-form preservation (the discrimination guard) ----
  it("keeps a PURE ascending /W pair sequence reading as pairs (the standing spec form — R121-A)", async () => {
    // the measured "spec c w" pairs class: codes 59 600 60 700 61 800 …
    // for the fixture glyphs ("abc" = codes 59-61 — the 58-char pad owns
    // 1-58). As ranges this reads (59,600,60)(700,61,800) — the second
    // group's 700 > 61 fails cfirst<=clast, so the range reading MUST
    // self-reject and the pair reading stands: "abc" (59-61, 600+700+800
    // = 2100/1000 x 10 = 21pt) at (50,700) tracks to 71; "hi" at 100 ->
    // 2.9 em -> the split fires on the PAIR widths
    const pairW = () => {
      const toks: string[] = [];
      for (let i = 0; i < PHRASE.length; i++) {
        const c = codeFor(i);
        if (c >= 59) toks.push(`${c} ${600 + (c - 59) * 100}`);
      }
      return toks.join(" ");
    };
    const content =
      typstBlock(50, 750, 10, PAD) + "\n" +
      typstBlock(50, 700, 10, "abc") + "\n" +
      typstBlock(100, 700, 10, "hi");
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 7 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /CCCCCC+Test /Encoding /Identity-H /ToUnicode 3 0 R /DescendantFonts [4 0 R] >>" },
      { dict: "/Filter /FlateDecode", stream: cmapForPhrase() },
      { raw: `<< /Type /Font /Subtype /CIDFontType0 /BaseFont /CCCCCC+Test /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /DW 0 /W [${pairW()}] >>` },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources << /Font << /f0 2 0 R >> >> >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("abc\nhi"); // the pair widths carry the split
  });
});

describe("cv-text — the leader-dot line re-order class (session 122)", () => {
  const encS = (s: string) => new TextEncoder().encode(s);
  const encL = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

  async function pdfWithLatin1Streams(
    objects: ({ raw: string } | { dict: string; stream: string })[]
  ): Promise<File> {
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
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "rl-toc.pdf", { type: "application/pdf" });
  }

  // The ReportLab TOC anatomy (the r122 hunt, measured on the real member):
  // each TOC row paints [the dot-leader run + its page number] BEFORE the
  // entry text — one piece " .  .  .  .  . 6" (px 230.4, ps 12, bx 517.3)
  // followed by the entry "1.1 About this document" (px 98, the SAME py,
  // bx 227.4 — the leader begins 3.0 units after the entry ends). The
  // stream-order emission reads ". . . 6 1.1 About this document" where
  // pdftotext's x-order reads "1.1 About this document . . . 6". The r116
  // global same-line x-sort was REFUTED by the IRS member (the f1040
  // date-box fields rearranged, fusions appeared) — the cure is narrowly
  // scoped to the leader-dot class: a dots-only piece (>= 3 dots, optional
  // trailing digits, no letters) whose FOLLOWING same-baseline piece
  // carries the alnum entry at SMALLER px with the leader's start within a
  // small forward tolerance of the entry's tracked end (the contiguity
  // guard — the leader begins where the entry ends).
  const PAD = "payrolladmincompliancetrainingonboardingspecialistplatform";
  const PHRASE = `${PAD}Chapter 1 Introduction 1.1About thisdocument  .  .  .  .  . 6 leaderend`;
  const codeFor = (i: number) => i + 1;
  const spaceCodes = new Set([...PHRASE].map((c, i) => (c === " " ? codeFor(i) : -1)).filter((x) => x >= 0));
  const cmapForPhrase = () => {
    const pairs = [...PHRASE]
      .map((c, i) => `<${codeFor(i).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`)
      .join("\n");
    return (
      "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
      `${PHRASE.length} beginbfchar\n${pairs}\nendbfchar\nendcmap\n`
    );
  };
  const wTriple = () =>
    [...PHRASE].map((_, i) => `${codeFor(i)} ${codeFor(i)} ${spaceCodes.has(codeFor(i)) ? 250 : 500}`).join(" ");
  const codesFor = (text: string) => {
    const idx = PHRASE.indexOf(text);
    if (idx < 0) throw new Error(`fixture phrase missing "${text}"`);
    return [...text].map((_, i) => `\\000\\${codeFor(idx + i).toString(8).padStart(3, "0")}`).join("");
  };
  const typstBlock = (tx: number, ty: number, size: number, text: string) =>
    `q\n1 0 0 -1 ${tx} ${ty} cm\nBT 0 Tr /f0 ${size} Tf 1 0 0 -1 0 0 Tm (${codesFor(text)}) Tj\nET\nQ`;

  const fontFixture = (content: string, descendantExtra = `/DW 500 /W [${wTriple()}]`) =>
    pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 7 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /CCCCCC+Test /Encoding /Identity-H /ToUnicode 3 0 R /DescendantFonts [4 0 R] >>" },
      { dict: "/Filter /FlateDecode", stream: cmapForPhrase() },
      { raw: `<< /Type /Font /Subtype /CIDFontType0 /BaseFont /CCCCCC+Test /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> ${descendantExtra} >>` },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources << /Font << /f0 2 0 R >> >> >>" },
    ]);

  // ---- R122-B: the leader-dot phase-shift re-order ----
  it("re-orders the dots-before-entry phase shift to the x-order row form (R122-B)", async () => {
    // the measured ReportLab geometry: the section header at (98, 674.9)
    // ps 14; the row's LEADER " .  .  .  .  . 6" painted FIRST at
    // (230.4, 654.9) ps 12; the ENTRY "1.1About thisdocument" painted
    // SECOND at (98, 654.9) — the same baseline, the entry 21 codes x
    // 500/1000 x 12 = 126pt wide → tracked end 224, the leader's start
    // 6.4 units later (0.53 em — the contiguity window). pdftotext reads
    // "1.1About thisdocument . . . 6"; the stream order reads the leader
    // first — the phase shift.
    const content =
      typstBlock(98, 674.9, 14, "Chapter 1 Introduction") + "\n" +
      typstBlock(230.4, 654.9, 12, " .  .  .  .  . 6") + "\n" +
      typstBlock(98, 654.9, 12, "1.1About thisdocument");
    const text = await extractTextFromFile(await fontFixture(content));
    expect(text).toContain("1.1About thisdocument  .  .  .  .  . 6"); // ← RED at HEAD: the leader paints first
  });

  it("keeps an alnum-first stream order untouched (the IRS date-box refutation guard — R122-B)", async () => {
    // the IRS f1040 date-box class: alnum content painted at LARGER x
    // before alnum content at smaller x on the same baseline — the r116
    // global x-sort refutation. The narrow rule never fires: the first
    // piece is not a dot-leader run.
    const content =
      typstBlock(50, 750, 10, PAD) + "\n" +
      typstBlock(300, 700, 10, "leaderend") + "\n" +
      typstBlock(100, 700, 10, "1.1About thisdocument");
    const text = await extractTextFromFile(await fontFixture(content));
    expect(text).toContain("leaderend 1.1About thisdocument"); // the stream order stands
  });

  it("keeps a NON-CONTIGUOUS dots piece in stream order (the contiguity guard — R122-B)", async () => {
    // a dots-only piece far from the entry's end (14.7 em — not a TOC row:
    // the leader never begins where this entry ends) keeps the stream
    // order; only the contiguous leader row re-orders.
    const content =
      typstBlock(50, 750, 10, PAD) + "\n" +
      typstBlock(400, 700, 10, " .  .  .  .  . 6") + "\n" +
      typstBlock(100, 700, 10, "1.1About thisdocument");
    const text = await extractTextFromFile(await fontFixture(content));
    expect(text).toContain(" .  .  .  .  . 6 1.1About thisdocument"); // the stream order stands
  });
});

describe("cv-text — the bare-number re-order classes (session 123)", () => {
  const encS = (s: string) => new TextEncoder().encode(s);
  const encL = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

  async function pdfWithLatin1Streams(
    objects: ({ raw: string } | { dict: string; stream: string })[]
  ): Promise<File> {
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
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "rl-toc-residual.pdf", { type: "application/pdf" });
  }

  // The ReportLab TOC residual anatomy (the r123 hunt, measured on the real
  // member). TWO residual classes survived the r122 leader-dot cure:
  //
  // R123-A — THE SQUEEZED-NUMBER CLASS (the wrapped entry): a long TOC entry
  // wraps, its leader dots squeeze to zero, and the page number paints as a
  // BARE number at a TINY ps (the measured 8.3 row: "92" at px 511.5,
  // ps 5.165607 = 0.43x the entry's ps 12) BEFORE the full entry (px 98,
  // same baseline) whose tracked end bx 511.5 sits EXACTLY at the number's
  // start (the gap-0 squeeze). pdftotext reads the number GLUED to the
  // entry's last word — "8.3 DocPara(...escape=True)92".
  //
  // R123-B — THE CHAPTER-HEADER CLASS: the page number paints BEFORE the
  // title at the FAR-RIGHT page-number column (the measured row: "6" at
  // px 510.3, ps 14, before "Chapter 1 Introduction" at px 78, same
  // baseline, the title's bx 218 — the gap 292.3 units = 20.9 em, the
  // column band). pdftotext reads the title first, the number on its OWN
  // line (the block assembly) — "Chapter 1 Introduction\n\n6".
  //
  // The fire-separation census (the bare-number pairs across the whole
  // corpus): ReportLab 14 pairs (13 chapter rows + the squeezed row), IRS 1
  // pair — the f1040 title "25" at px 298 ps 20 before "U.S. Individual
  // Income Tax Return" at px 97.6 ps 12, the title's bx 283.8, the gap
  // 1.18 em — INSIDE the contiguity band but the swap measures word-stream
  // NEUTRAL (the split-year "20 25" construction), a pin drift without a
  // toward verdict: the ps guard (the number's ps < the entry's ps) is
  // load-bearing to keep the IRS member IDENTICAL. The two cures are
  // disjoint on the gap axis (contiguity [-1, +3.5] em vs the column band
  // >= 13 em — the R117-A threshold doctrine) and double-separated on ps.
  const PAD = "payrolladmincompliancetrainingonboardingspecialistplatform";
  const PHRASE = `${PAD}Chapter 1 Introduction 1.1Wrapped entrytext  .  .  .  .  . 6 92 20 25 U.S.Individual IncomeTax leaderend`;
  const codeFor = (i: number) => i + 1;
  const spaceCodes = new Set([...PHRASE].map((c, i) => (c === " " ? codeFor(i) : -1)).filter((x) => x >= 0));
  const cmapForPhrase = () => {
    const pairs = [...PHRASE]
      .map((c, i) => `<${codeFor(i).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`)
      .join("\n");
    return (
      "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
      `${PHRASE.length} beginbfchar\n${pairs}\nendbfchar\nendcmap\n`
    );
  };
  const wTriple = () =>
    [...PHRASE].map((_, i) => `${codeFor(i)} ${codeFor(i)} ${spaceCodes.has(codeFor(i)) ? 250 : 500}`).join(" ");
  const codesFor = (text: string) => {
    const idx = PHRASE.indexOf(text);
    if (idx < 0) throw new Error(`fixture phrase missing "${text}"`);
    return [...text].map((_, i) => `\\000\\${codeFor(idx + i).toString(8).padStart(3, "0")}`).join("");
  };
  const typstBlock = (tx: number, ty: number, size: number, text: string) =>
    `q\n1 0 0 -1 ${tx} ${ty} cm\nBT 0 Tr /f0 ${size} Tf 1 0 0 -1 0 0 Tm (${codesFor(text)}) Tj\nET\nQ`;

  const fontFixture = (content: string, descendantExtra = `/DW 500 /W [${wTriple()}]`) =>
    pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 7 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /CCCCCC+Test /Encoding /Identity-H /ToUnicode 3 0 R /DescendantFonts [4 0 R] >>" },
      { dict: "/Filter /FlateDecode", stream: cmapForPhrase() },
      { raw: `<< /Type /Font /Subtype /CIDFontType0 /BaseFont /CCCCCC+Test /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> ${descendantExtra} >>` },
      { dict: "/Filter /FlateDecode", stream: content },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources << /Font << /f0 2 0 R >> >> >>" },
    ]);

  // ---- R123-A: the squeezed-number re-order (the wrapped-entry class) ----
  it("re-orders the squeezed bare number to the entry's end, GLUED (R123-A)", async () => {
    // the measured 8.3-row geometry, scaled: the entry "1.1Wrapped
    // entrytext" (19 codes x 500/1000 x 12 = 114pt wide) at (100, 700)
    // ps 12 -> tracked end 214; the BARE number "92" at ps 5.2 (0.43x —
    // the tiny-number squeeze) painted FIRST at (214, 700) — the gap-0
    // contiguity. pdftotext reads "1.1Wrapped entrytext92" (the number
    // glued to the entry's last word — the geometric adjacency); the
    // stream order reads "92 1.1Wrapped entrytext".
    const content =
      typstBlock(50, 750, 10, PAD) + "\n" +
      typstBlock(220, 700, 5.2, "92") + "\n" +
      typstBlock(100, 700, 12, "1.1Wrapped entrytext");
    const text = await extractTextFromFile(await fontFixture(content));
    expect(text).toContain("1.1Wrapped entrytext92"); // ← RED at HEAD: the number paints first, joined with " "
    expect(text).not.toContain("92 1.1Wrapped entrytext");
  });

  it("keeps the BOXED-PAIR number in stream order (the IRS year-box fire-separation guard — R123-B)", async () => {
    // the measured IRS f1040 title row: TWO bare numbers — "20" then
    // "25" — painted at the SAME origin (px 298, py 748.7, ps 20: the
    // split-year box construction) BEFORE the title "U.S. Individual
    // Income Tax Return" at ps 12, the title's end 1.18 em back. The
    // chapter pass's ps axis alone does NOT block this pair (ps 20 >=
    // 12) — THE BOXED-PAIR GUARD is the load-bearing refutation: a
    // number immediately preceded by a same-origin piece is a boxed
    // pair, never a page-number column. The swap there measures
    // word-stream NEUTRAL (the split-year "20 25" form: pdftotext reads
    // the glued "2025") — a pin drift without a toward verdict — so
    // the IRS member stays IDENTICAL.
    const content =
      typstBlock(50, 750, 10, PAD) + "\n" +
      typstBlock(260, 700, 20, "20") + "\n" +
      typstBlock(260, 700, 20, "25") + "\n" +
      typstBlock(100, 700, 12, "U.S.Individual IncomeTax");
    const text = await extractTextFromFile(await fontFixture(content));
    expect(text).toContain("25 U.S.Individual IncomeTax"); // the stream order stands — the boxed-pair guard
    expect(text).not.toContain("U.S.Individual IncomeTax\n25");
  });

  // ---- R123-B: the chapter-header re-order (the number-before-title class) ----
  it("re-orders the far-right bare number after the title, on its OWN line (R123-B)", async () => {
    // the measured chapter-row geometry: the title "Chapter 1
    // Introduction" (20 nonspace codes x 500 + 2 spaces x 250)/1000 x
    // 14 = 147pt at (78, 674.9) ps 14 -> tracked end 225; the bare
    // number "6" at ps 14 painted FIRST at (524, 674.9) — the gap 299
    // units = 21.4 em, the FAR-RIGHT page-number column (the R117-A
    // column band, >= 13 em). pdftotext reads "Chapter 1 Introduction"
    // then the number on its own line.
    const content =
      typstBlock(50, 750, 10, PAD) + "\n" +
      typstBlock(524, 674.9, 14, "6") + "\n" +
      typstBlock(78, 674.9, 14, "Chapter 1 Introduction");
    const text = await extractTextFromFile(await fontFixture(content));
    expect(text).toContain("Chapter 1 Introduction\n6"); // ← RED at HEAD: the number paints first on the title's line
    expect(text).not.toContain("6 Chapter 1 Introduction");
  });

  it("re-orders a mid-gap bare number at the entry's ps (the gap-axis refutation — R123-B)", async () => {
    // the in-round refutation: the FIRST design guarded the gap (>= 13
    // em, the R117-A column band) and the real member's LONG titles left
    // gaps of 1-12.5 em (Chapter 5's title ends 1.01 em from its
    // right-aligned number) — the gap axis is NOT the chapter class's
    // invariant. A mid-gap number at the entry's OWN ps re-orders like
    // any column number: the entry's tracked end 217, the number at
    // (316, 700) ps 12 -> the gap 8.25 em — the rewritten doctrine.
    const content =
      typstBlock(50, 750, 10, PAD) + "\n" +
      typstBlock(316, 700, 12, "6") + "\n" +
      typstBlock(100, 700, 12, "1.1Wrapped entrytext");
    const text = await extractTextFromFile(await fontFixture(content));
    expect(text).toContain("1.1Wrapped entrytext\n6"); // the column re-order fires — the gap axis refuted
    expect(text).not.toContain("6 1.1Wrapped entrytext");
  });

  it("keeps the r122 leader-dot class firing unchanged (the disjointness guard — R123-A/B)", async () => {
    // the r122 dots-leader shape still re-orders after the two new
    // bare-number passes join the pre-pass chain — the three shapes are
    // pairwise disjoint (dots >= 2 vs bare digits vs neither).
    const content =
      typstBlock(50, 750, 10, PAD) + "\n" +
      typstBlock(230.4, 654.9, 12, " .  .  .  .  . 6") + "\n" +
      typstBlock(98, 654.9, 12, "1.1Wrapped entrytext");
    const text = await extractTextFromFile(await fontFixture(content));
    expect(text).toContain("1.1Wrapped entrytext  .  .  .  .  . 6");
  });
});

// ---------------------------------------------------------------------------
// Session 124 (R124-A/B): the indirect-/Font page binding + the odd-length
// /W pair-invalidity — the blind-pocket completion round
// ---------------------------------------------------------------------------
// R124-A — THE INDIRECT /FONT DICTIONARY: the ReportLab page form carries
// /Resources << /Font 1 0 R /XObject << /FormXob.<32-hex> N 0 R >> >> —
// the /Font VALUE itself an indirect ref (obj 1 = the shared pure pair
// dict << /F1 2 0 R /F2 3 0 R … >>, all 135 pages referencing it, zero
// inline /Font dicts in the file). The page scan's F-pattern collects the
// XObject entry FIRST — the name "FormXob.<hex>" STARTS WITH F, so the
// false pair {FormXob…: N} makes fonts.size truthy and the R107-B
// shape-(a) else-if chain never queues the pendingFontRef resolution: the
// pageMap binds the XObject name, every real font lookup fails the
// "pageMap exists but lacks this font" misbind guard, and the whole page
// goes width-blind (the measured 546-piece pocket, bx 95.6%). The cure:
// the fontRef queue fires WHENEVER the page carries the indirect form;
// the post-walk resolution REPLACES the false-pair map (the R107-B
// replace semantics). The fire-separation census: the indirect /Font form
// rides ReportLab ALONE (135 refs; zero on the other 6 members, the 16
// family members, and the IRS/arXiv ObjStm bodies).
//
// R124-B — THE ODD-LENGTH /W PAIR-INVALIDITY: the arXiv F5 class — the
// descendant carries /DW 0 /W [ 0 92 600.098 ] (CourierNew, monospaced):
// a THREE-TOKEN pure-number array. The R121-A range-triple reading is the
// writer's intent (CIDs 0-92 at 600.098), but its pairsValid guard reads
// the pair (0, 92) as plausible and the pair reading wins — {0: 92} with
// the 600.098 DANGLING-discarded, every CID > 0 falling to /DW 0 and the
// w <= 0 guard blinding every F5 block (the measured 388-piece class).
// The bug: a pair list must consume EVERY number — an odd token count
// dangles its last value, proving the pair reading invalid by
// construction. The cure pre-invalidates pairsValid on odd lengths.
describe("cv-text — the indirect-font + odd-W round (session 124)", () => {
  const encS = (s: string) => new TextEncoder().encode(s);
  const encL = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

  async function pdfWithLatin1Streams(
    objects: ({ raw: string } | { dict: string; stream: string })[]
  ): Promise<File> {
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
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  // ---- the R124-A fixtures: a simple Courier font (STD14-seeded, the
  // ReportLab userguide's own form) + the page-resource variants ----
  const simpleBlock = (tx: number, ty: number, size: number, text: string) =>
    `q\n1 0 0 -1 ${tx} ${ty} cm\nBT 0 Tr /F1 ${size} Tf 1 0 0 -1 0 0 Tm (${text}) Tj\nET\nQ`;
  const FALSE_PAIR_NAME = "/FormXob.2740c11ac32f9355ddf50eada5ea982f";
  // the measured column-pair geometry: "SeniorHRManager" (15 Courier codes
  // x 600/1000 x 12 = 108pt) at (50, 700) ps 12 -> tracked end 158;
  // "TechCorp" at (508.8, 700) ps 12 — the gap (508.8 - 158)/12 = 29.2 em
  // >= 13, the R117-A column band -> the line break. BLIND widths keep the
  // standing space join ("SeniorHRManager TechCorp").
  const columnContent =
    simpleBlock(50, 750, 10, "payrolladmincompliancetrainingonboardingspecialist") + "\n" +
    simpleBlock(50, 700, 12, "SeniorHRManager") + "\n" +
    simpleBlock(508.8, 700, 12, "TechCorp");
  const aObjects = (pageResources: string) => [
    { raw: "<< /Type /Catalog /Pages 7 0 R >>" },
    { raw: "<< /BaseFont /Courier /Encoding /WinAnsiEncoding /Name /F1 /Subtype /Type1 /Type /Font >>" },
    { dict: "/Filter /FlateDecode", stream: columnContent },
    { raw: "<< /Type /XObject /Subtype /Image /Width 1 /Height 1 /ColorSpace /DeviceGray /BitsPerComponent 8 /Length 0 >>" },
    { raw: "<< /F1 2 0 R >>" },
    { raw: `<< /Type /Page /Contents 3 0 R /Resources ${pageResources} >>` },
    { raw: "<< /Type /Pages /Kids [6 0 R] >>" },
  ];

  // ---- the R124-B fixtures: the Type0/Identity-H form + the /W variants ----
  const PAD = "payrolladmincompliancetrainingonboardingspecialistplatform";
  const PHRASE = `${PAD}SeniorHRManagerTechCorp`; // 83 codes (1..83), all inside the measured [0, 92] run
  const codeFor = (i: number) => i + 1;
  const cmapForPhrase = () => {
    const pairs = [...PHRASE]
      .map((c, i) => `<${codeFor(i).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`)
      .join("\n");
    return (
      "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
      `${PHRASE.length} beginbfchar\n${pairs}\nendbfchar\nendcmap\n`
    );
  };
  const codesFor = (text: string) => {
    const idx = PHRASE.indexOf(text);
    if (idx < 0) throw new Error(`fixture phrase missing "${text}"`);
    return [...text].map((_, i) => `\\000\\${codeFor(idx + i).toString(8).padStart(3, "0")}`).join("");
  };
  const typstBlock = (tx: number, ty: number, size: number, text: string) =>
    `q\n1 0 0 -1 ${tx} ${ty} cm\nBT 0 Tr /f0 ${size} Tf 1 0 0 -1 0 0 Tm (${codesFor(text)}) Tj\nET\nQ`;
  const bContent =
    typstBlock(50, 750, 10, PAD) + "\n" +
    typstBlock(50, 700, 12, "SeniorHRManager") + "\n" +
    typstBlock(508.8, 700, 12, "TechCorp");
  const fontFixture = (descendantW: string) =>
    pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 7 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /CCCCCC+Test /Encoding /Identity-H /ToUnicode 3 0 R /DescendantFonts [4 0 R] >>" },
      { dict: "/Filter /FlateDecode", stream: cmapForPhrase() },
      { raw: `<< /Type /Font /Subtype /CIDFontType0 /BaseFont /CCCCCC+Test /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> ${descendantW} >>` },
      { dict: "/Filter /FlateDecode", stream: bContent },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources << /Font << /f0 2 0 R >> >> >>" },
    ]);

  // ---- R124-A: the indirect-/Font page + the FormXob false pair ----
  it("resolves the INDIRECT /Font dictionary through the false F-prefixed XObject pair (R124-A)", async () => {
    // the measured ReportLab page form: /Resources << /Font 5 0 R /XObject
    // << /FormXob.<hex> 4 0 R >> >> — the F-pattern collects the FormXob
    // entry as a "font" (the name starts with F), fonts.size goes truthy,
    // and the HEAD's else-if chain never queues the pendingFontRef — the
    // page binds only the XObject name and every /F1 lookup fails the
    // misbind guard. The cure queues the fontRef resolution whenever the
    // indirect form is present; the post-walk resolution REPLACES the
    // false-pair map, the STD14 Courier widths seed, and the R117-A
    // column rule fires on the tracked geometry.
    const file = await pdfWithLatin1Streams(aObjects(
      `<< /Font 5 0 R /ProcSet [/PDF] /XObject << ${FALSE_PAIR_NAME} 4 0 R >> >>`
    ));
    const text = await extractTextFromFile(file);
    expect(text).toContain("SeniorHRManager\nTechCorp"); // ← RED at HEAD: the false pair blinds the page — "SeniorHRManager TechCorp"
    expect(text).not.toContain("SeniorHRManager TechCorp");
  });

  it("keeps a no-/Font page blind (the indirect-form fire-separation guard — R124-A)", async () => {
    // the same false-pair XObject subdict with NO /Font entry at all: the
    // cure must never manufacture a binding the page does not declare —
    // the pageMap stays the false pair alone and the widths stay blind
    // (the misbind signal, never a fallback license).
    const file = await pdfWithLatin1Streams(aObjects(
      `<< /ProcSet [/PDF] /XObject << ${FALSE_PAIR_NAME} 4 0 R >> >>`
    ));
    const text = await extractTextFromFile(file);
    expect(text).toContain("SeniorHRManager TechCorp"); // born-green: no indirect /Font — the standing blind join
    expect(text).not.toContain("SeniorHRManager\nTechCorp");
  });

  it("keeps the INLINE /Font dictionary binding (the standing direct form — R124-A)", async () => {
    // the R108-B/R120-B standing form: the page's own inline /Font region
    // carries the pair directly — the direct-pairs branch lands it and the
    // tracked column split stands, untouched by the fontRef queue.
    const file = await pdfWithLatin1Streams(aObjects(
      `<< /Font << /F1 2 0 R >> /ProcSet [/PDF] >>`
    ));
    const text = await extractTextFromFile(file);
    expect(text).toContain("SeniorHRManager\nTechCorp"); // born-green: the direct binding — the standing tracked form
  });

  // ---- R124-B: the odd-length /W range-triple reading ----
  it("reads the 3-token /W run as the CID range (the odd-length pair-invalidity — R124-B)", async () => {
    // the measured arXiv F5 descendant: /DW 0 /W [ 0 92 600.098 ] —
    // CourierNew monospaced, every CID 0-92 at 600.098. The HEAD's
    // pairsValid guard reads the pair (0, 92) as plausible and discards
    // the dangling 600.098: {0: 92} covers nothing the stream shows, every
    // code falls to /DW 0 and the w <= 0 guard blinds the block. The cure:
    // an odd token count pre-invalidates the pair reading — the R121-A
    // range expansion covers CIDs 0-92 and the column rule fires.
    const file = await fontFixture("/DW 0 /W [ 0 92 600.098 ]");
    const text = await extractTextFromFile(file);
    expect(text).toContain("SeniorHRManager\nTechCorp"); // ← RED at HEAD: {0: 92} blinds every code — "SeniorHRManager TechCorp"
    expect(text).not.toContain("SeniorHRManager TechCorp");
  });

  it("keeps the c-c-w singleton-range /W reading (the r121 path — R124-B)", async () => {
    // the Typst range-run genus: /W as c c w singleton groups (the r121
    // first-branch form — an ODD token count that never reaches the range
    // branch). The odd-length invalidity must not redirect it: every code
    // stays covered at its own width and the tracked split stands.
    const ccw = [...PHRASE].map((_, i) => `${codeFor(i)} ${codeFor(i)} 600.098`).join(" ");
    const file = await fontFixture(`/DW 0 /W [ ${ccw} ]`);
    const text = await extractTextFromFile(file);
    expect(text).toContain("SeniorHRManager\nTechCorp"); // born-green: the singleton-range path — the r121 pin
  });
});

// Session 125 (R125-A/B/C): the mixed-/W range arms, the known-zero
// advance, and the /Contents-array text-state carry. Measured on the
// re-verified corpus: the arXiv Font2 Calibri descendants carry the
// bracketed /W with BOTH entry forms interleaved (the array entries
// `0 [ 506 0 0 226 578 ]` and the RANGE arms `5 12 0` — the spec's
// cfirst clast w, the w=0 gap-ranges legitimate); the IRS page 2403's
// 8-stream /Contents array walks with a fresh text state per stream, so
// the Tf-less mid-array streams (2407/2409/2410/2411 — the inherited-font
// class) lose their font and blind 108 pieces; and the advance guard
// conflates the UNKNOWN width (a code outside the table — the
// conservative blind signal) with the KNOWN zero (a code the table covers
// at 0 — the .null-glyph class, a legitimate zero advance).
describe("cv-text — the contents-carry + mixed-W + zero-advance round (session 125)", () => {
  const encS = (s: string) => new TextEncoder().encode(s);
  const encL = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

  async function pdfWithLatin1Streams(
    objects: ({ raw: string } | { dict: string; stream: string })[]
  ): Promise<File> {
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
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  // ---- the R125-A/B fixtures: the Type0/Identity-H form (the r124-B
  // machinery) — the PHRASE codes 1..83 ride the /W coverage under test ----
  const PAD = "payrolladmincompliancetrainingonboardingspecialistplatform";
  const PHRASE = `${PAD}SeniorHRManagerTechCorp`; // codes 1..83
  const codeFor = (i: number) => i + 1;
  const cmapForPhrase = () => {
    const pairs = [...PHRASE]
      .map((c, i) => `<${codeFor(i).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`)
      .join("\n");
    return (
      "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
      `${PHRASE.length} beginbfchar\n${pairs}\nendbfchar\nendcmap\n`
    );
  };
  const codesFor = (text: string) => {
    const idx = PHRASE.indexOf(text);
    if (idx < 0) throw new Error(`fixture phrase missing "${text}"`);
    return [...text].map((_, i) => `\\000\\${codeFor(idx + i).toString(8).padStart(3, "0")}`).join("");
  };
  // the measured column-pair geometry (the r124 pin): "SeniorHRManager"
  // (15 codes x 600.098/1000 x 12 = 108.2pt) at (50,700) ps 12 -> tracked
  // end ~158; "TechCorp" at (508.8,700) — the gap ~29 em >= 13, the R117-A
  // column band -> the line break. BLIND widths keep the space join.
  const typstBlock = (tx: number, ty: number, size: number, text: string) =>
    `q\n1 0 0 -1 ${tx} ${ty} cm\nBT 0 Tr /f0 ${size} Tf 1 0 0 -1 0 0 Tm (${codesFor(text)}) Tj\nET\nQ`;
  const abContent =
    typstBlock(50, 750, 10, PAD) + "\n" +
    typstBlock(50, 700, 12, "SeniorHRManager") + "\n" +
    typstBlock(508.8, 700, 12, "TechCorp");
  const fontFixture = (descendantW: string) =>
    pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 7 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /CCCCCC+Test /Encoding /Identity-H /ToUnicode 3 0 R /DescendantFonts [4 0 R] >>" },
      { dict: "/Filter /FlateDecode", stream: cmapForPhrase() },
      { raw: `<< /Type /Font /Subtype /CIDFontType0 /BaseFont /CCCCCC+Test /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> ${descendantW} >>` },
      { dict: "/Filter /FlateDecode", stream: abContent },
      { raw: "<< /Type /Pages /Kids [7 0 R] >>" },
      { raw: "<< /Type /Page /Contents 5 0 R /Resources << /Font << /f0 2 0 R >> >> >>" },
    ]);

  // ---- R125-A: the mixed /W's RANGE arms ----
  it("reads the bare number groups of a bracketed /W as RANGE entries (the mixed-form arms — R125-A)", async () => {
    // the measured arXiv Font2 descendant form: /W [ 0 [ 506 ] 1 83 600.098
    // 84 92 0 ] — the array entry covers CID 0, the RANGE arms cover CIDs
    // 1-83 at 600.098 (the shown codes) and the 84-92 GAP at 0 (the
    // legitimate zero class). The HEAD's bracket-walk reads the bare group
    // as PAIRS — pair(1, 83), pair(600.098, 84), pair(92, 0) — the map
    // corrupts, every shown code falls to /DW 0 and the block blinds.
    const file = await fontFixture("/DW 0 /W [ 0 [ 506 ] 1 83 600.098 84 92 0 ]");
    const text = await extractTextFromFile(file);
    expect(text).toContain("SeniorHRManager\nTechCorp"); // ← RED at HEAD: the pair reading corrupts the map — "SeniorHRManager TechCorp"
    expect(text).not.toContain("SeniorHRManager TechCorp");
  });

  it("keeps the pure-array /W reading (the WeasyPrint class — R125-A guard)", async () => {
    // the WeasyPrint corpus form: /W as sparse ARRAY entries only (no bare
    // number groups) — the multi-entry form needs the BRACKET-BALANCED /W
    // capture (the HEAD's [^\]]* capture truncated at the first entry's
    // closer, keeping only the leading fragment); the range branch never
    // fires on this form.
    const arr = [...PHRASE].map((_, i) => `${codeFor(i)} [ 600.098 ]`).join(" ");
    const file = await fontFixture(`/DW 0 /W [ ${arr} ]`);
    const text = await extractTextFromFile(file);
    expect(text).toContain("SeniorHRManager\nTechCorp"); // born-green: the array-entry path — untouched
  });

  it("keeps the UNCOVERED code blind (the map-miss conservative guard — R125-B guard)", async () => {
    // the codes 1-83 sit OUTSIDE every entry (the array covers CID 0; the
    // range arm covers 84-92): a map-miss with /DW 0 stays the blind
    // signal — the R117-A doctrine verbatim (a missing table never
    // misfires, it only cures less).
    const file = await fontFixture("/DW 0 /W [ 0 [ 506 ] 84 92 600.098 ]");
    const text = await extractTextFromFile(file);
    expect(text).toContain("SeniorHRManager TechCorp"); // born-green: the uncovered codes — the standing blind join
    expect(text).not.toContain("SeniorHRManager\nTechCorp");
  });

  // ---- R125-B: the known-zero advance ----
  it("advances a map-covered ZERO width instead of blinding (the .null-glyph class — R125-B)", async () => {
    // the measured Calibri array form: the array's zero-width entries ride
    // LEGITIMATELY-covered codes (the .null glyph class) — here the 'S' of
    // the SHOWN "SeniorHRManager" (code 58) carries the 0 with the real
    // widths behind it. The HEAD's w <= 0 guard conflates the KNOWN zero
    // with the UNKNOWN and blinds the whole block; the cure advances 0
    // (the tracked end loses one glyph's width) and keeps tracking.
    const widths = [...PHRASE].map((_, i) => (i === PHRASE.indexOf("S") ? "0" : "600.098")).join(" ");
    const file = await fontFixture(`/DW 0 /W [ 1 [ ${widths} ] ]`);
    const text = await extractTextFromFile(file);
    expect(text).toContain("SeniorHRManager\nTechCorp"); // ← RED at HEAD: the zero-covered code blinds the block — "SeniorHRManager TechCorp"
    expect(text).not.toContain("SeniorHRManager TechCorp");
  });

  // ---- R125-C: the /Contents-array text-state carry ----
  it("carries the text state across a /Contents-array stream boundary (the inherited-font class — R125-C)", async () => {
    // the measured IRS page-2403 form: /Contents [s1 s2] — the streams
    // process AS-IF-CONCATENATED (ISO 32000-1 §7.7.4) and the text state
    // persists across the boundary. Stream s1 sets /F1 and shows; stream
    // s2 carries NO Tf — its shows inherit F1. The HEAD walks each stream
    // with a fresh state: s2's pieces carry font "" and blind.
    const s1 = `q\n1 0 0 -1 50 750 cm\nBT 0 Tr /F1 10 Tf 1 0 0 -1 0 0 Tm (${codesFor(PAD)}) Tj\nET\nQ`;
    const s2 =
      `q\n1 0 0 -1 50 700 cm\nBT 0 Tr 1 0 0 -1 0 0 Tm (${codesFor("SeniorHRManager")}) Tj\nET\nQ\n` +
      `q\n1 0 0 -1 508.8 700 cm\nBT 0 Tr 1 0 0 -1 0 0 Tm (${codesFor("TechCorp")}) Tj\nET\nQ`;
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 8 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /CCCCCC+Test /Encoding /Identity-H /ToUnicode 3 0 R /DescendantFonts [5 0 R] >>" },
      { dict: "/Filter /FlateDecode", stream: cmapForPhrase() },
      { dict: "/Filter /FlateDecode", stream: s1 },
      { raw: `<< /Type /Font /Subtype /CIDFontType0 /BaseFont /CCCCCC+Test /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /DW 0 /W [ ${[...PHRASE].map((_, i) => `${codeFor(i)} ${codeFor(i)} 600.098`).join(" ")} ] >>` },
      { dict: "/Filter /FlateDecode", stream: s2 },
      { raw: "<< /Type /Pages /Kids [8 0 R] >>" },
      { raw: "<< /Type /Page /Contents [4 0 R 6 0 R] /Resources << /Font << /F1 2 0 R >> >> >>" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("SeniorHRManager\nTechCorp"); // ← RED at HEAD: s2's Tf-less shows carry no font — "SeniorHRManager TechCorp"
    expect(text).not.toContain("SeniorHRManager TechCorp");
  });

  it("keeps the odd-length pure-number /W range reading (the r124-B pin under the cure)", async () => {
    // the r124-B form: /W [ 0 92 600.098 ] — the pure-number array never
    // enters the bracket-walk; the odd-length pair-invalidity reading
    // stands verbatim under the mixed-form cure.
    const file = await fontFixture("/DW 0 /W [ 0 92 600.098 ]");
    const text = await extractTextFromFile(file);
    expect(text).toContain("SeniorHRManager\nTechCorp"); // born-green: the no-bracket branch — the r124 pin
  });
});

// Session 125 (R125-D — added in-round): the Form XObject's OWN resources.
// The measured anatomy: the arXiv PTEX figure PDFs (the /Im10-class forms)
// carry their own /Resources /Font << /Font1 799 0 R >> — but their content
// streams walk as candidates with NO page binding, so the /F-name resolved
// through the candidate chain to the FIRST same-named font in file order
// (a DIFFERENT form's Calibri-Bold answering for the ArialMT pieces). The
// misbind corrupted BOTH the width tracking (the codes falling on the wrong
// /W's zero arms — the false column splits) AND the ToUnicode decode (the
// fontspec "Utfiight SMALL JAPS" → "Upright SMALL CAPS" class — a standing
// garbage-decode corrected to pdftotext's exact reading).
describe("cv-text — the form's own resources round (session 125, R125-D)", () => {
  const encS = (s: string) => new TextEncoder().encode(s);
  const encL = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

  async function pdfWithLatin1Streams(
    objects: ({ raw: string } | { dict: string; stream: string })[]
  ): Promise<File> {
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
    for (const p of parts) {
      pdf.set(p, o);
      o += p.length;
    }
    return new File([pdf], "resume.pdf", { type: "application/pdf" });
  }

  const PAD = "payrolladmincompliancetrainingonboardingspecialistplatform";
  const PHRASE = `${PAD}SeniorHRManagerTechCorp`; // codes 1..83
  const codeFor = (i: number) => i + 1;
  const cmapForPhrase = () => {
    const pairs = [...PHRASE]
      .map((c, i) => `<${codeFor(i).toString(16).padStart(4, "0")}> <${c.charCodeAt(0).toString(16).padStart(4, "0")}>`)
      .join("\n");
    return (
      "begincmap\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n" +
      `${PHRASE.length} beginbfchar\n${pairs}\nendbfchar\nendcmap\n`
    );
  };
  const codesFor = (text: string) => {
    const idx = PHRASE.indexOf(text);
    if (idx < 0) throw new Error(`fixture phrase missing "${text}"`);
    return [...text].map((_, i) => `\\000\\${codeFor(idx + i).toString(8).padStart(3, "0")}`).join("");
  };
  const typstBlock = (tx: number, ty: number, size: number, text: string) =>
    `q\n1 0 0 -1 ${tx} ${ty} cm\nBT 0 Tr /F1 ${size} Tf 1 0 0 -1 0 0 Tm (${codesFor(text)}) Tj\nET\nQ`;
  const formContent =
    typstBlock(50, 750, 10, PAD) + "\n" +
    typstBlock(50, 700, 12, "SeniorHRManager") + "\n" +
    typstBlock(508.8, 700, 12, "TechCorp");

  it("binds a Form XObject's own /Resources fonts to its stream (the embedded-figure misbind — R125-D)", async () => {
    // two same-named fonts: the WRONG one (obj 2 — the earlier form's
    // font, a /W covering NONE of the shown codes, /DW 0) and the RIGHT
    // one (obj 3 — the target form's own /F1, the full c-c-w coverage).
    // The earlier form (obj 5) declares /F1 → 2 first in file order; the
    // target form (obj 6) declares /F1 → 3 in ITS OWN /Resources. At HEAD
    // the candidate chain resolves the target form's /F1 to obj 2 (the
    // first width-carrying candidate) — every code falls to /DW 0 and the
    // block blinds; the cure binds the form's OWN pairs.
    const file = await pdfWithLatin1Streams([
      { raw: "<< /Type /Catalog /Pages 9 0 R >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /AAAAAA+Wrong /Encoding /Identity-H /ToUnicode 4 0 R /DescendantFonts [7 0 R] >>" },
      { raw: "<< /Type /Font /Subtype /Type0 /BaseFont /BBBBBB+Right /Encoding /Identity-H /ToUnicode 4 0 R /DescendantFonts [8 0 R] >>" },
      { dict: "/Filter /FlateDecode", stream: cmapForPhrase() },
      { raw: "<< /Type /XObject /Subtype /Form /BBox [0 0 100 100] /Resources << /Font << /F1 2 0 R >> >> >>" },
      { dict: "/Filter /FlateDecode /Type /XObject /Subtype /Form /BBox [0 0 100 100] /Resources << /Font << /F1 3 0 R >> >>", stream: formContent },
      { raw: "<< /Type /Font /Subtype /CIDFontType0 /BaseFont /AAAAAA+Wrong /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /DW 0 /W [ 0 [ 506 ] ] >>" },
      { raw: `<< /Type /Font /Subtype /CIDFontType0 /BaseFont /BBBBBB+Right /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /DW 0 /W [ ${[...PHRASE].map((_, i) => `${codeFor(i)} ${codeFor(i)} 600.098`).join(" ")} ] >>` },
      { raw: "<< /Type /Pages /Kids [10 0 R] >>" },
      { raw: "<< /Type /Page /Contents 11 0 R /Resources << /XObject << /Im1 6 0 R >> >> >>" },
      { dict: "/Filter /FlateDecode", stream: "q Q" },
    ]);
    const text = await extractTextFromFile(file);
    expect(text).toContain("SeniorHRManager\nTechCorp"); // ← RED at HEAD: the candidate chain resolves /F1 to the WRONG font — "SeniorHRManager TechCorp"
    expect(text).not.toContain("SeniorHRManager TechCorp");
  });
});
