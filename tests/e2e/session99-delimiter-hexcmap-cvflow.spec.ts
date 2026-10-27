import { expect, test } from "@playwright/test";

// Session 99 (R99-A + R99-B): the stream-delimiter + hex-string/CMap CV
// flow — the r98 close-out's named frontier (the space-form stream
// delimiters + a real-writer PDF pin). The pin found BOTH: the scanner's
// /stream\r?\n/g lost the WHOLE stream for every space-delimited or
// bare-CR writer, and the operator walk could not read hex strings
// (<01020303> Tj — the subset-font form whose glyph→character mapping
// rides a trailing bfchar ToUnicode CMap; a REAL downloaded W3C dummy.pdf
// extracted 0 chars before the fix). Test 1 pins the delimiter fix alone
// (space-delimited streams, literal strings); test 2 pins the hex/CMap fix
// alone (standard delimiters, hex strings mapped through a CMap) — each
// mutation reverts exactly one spec.

async function pdfBytes(streams: { delim: string; content: string }[]): Promise<Uint8Array> {
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
    parts.push(enc(`${i + 1} 0 obj\n<< /Length ${d.length} >>\n${streams[i].delim}`));
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
  return pdf;
}

test.describe("session 99 — the stream-delimiter + hex/CMap CV flow (R99-A/B)", () => {
  test("a space-delimited PDF parses, scores, and renders the analysis card (R99-A)", async ({ page }) => {
    // Both streams use the SPACE+CRLF delimiter ("stream \r\n" — the
    // r98-queue's named writer form). Page 2 alone carries the seeded
    // job's keyword vocabulary, so a nonzero score PROVES the second
    // space-delimited stream was extracted.
    const pdf = await pdfBytes([
      {
        delim: "stream \r\n",
        content: "BT /F1 12 Tf [(r99 specialist r\\351sum\\351)] TJ ET",
      },
      {
        delim: "stream \r\n",
        content:
          "BT /F1 12 Tf [(HRIS administration, GOSI registration, payroll cycles, onboarding, and compliance reporting)] TJ ET",
      },
    ]);

    await page.goto("/recruitment");
    await page.getByRole("tab", { name: "AI CV Upload" }).click();

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "System Admin — IT" }).click();

    await page.locator("input[type=file]").setInputFiles({
      name: "r99 delimiter cv.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(pdf),
    });

    const panel = page.getByRole("tabpanel");
    await expect(panel.getByText("r99 delimiter cv")).toBeVisible({ timeout: 10_000 });
    await expect(panel.getByText(/AI score/i)).toBeVisible();

    const list = await page.request.get("/api/candidates");
    const json = (await list.json()) as {
      ok: boolean;
      data?: { candidates?: { id: string; name: string; aiScore?: number }[] };
    };
    expect(json.ok).toBe(true);
    const created = json.data?.candidates?.find((c) => c.name === "r99 delimiter cv");
    expect(created).toBeDefined();
    // page 2's keywords drove a nonzero score — the space-delimited
    // second stream actually reached the scorer
    expect((created?.aiScore ?? 0) > 0).toBe(true);

    if (created) {
      await page.request.delete(`/api/candidates?id=${encodeURIComponent(created.id)}`);
    }
  });

  test("a hex-string + ToUnicode-CMap PDF parses, scores, and renders the analysis card (R99-B)", async ({ page }) => {
    // The W3C dummy.pdf writer shape: the text rides as HEX glyph codes
    // (<…> Tj) and a trailing bfchar CMap maps them to characters. The
    // mapped body carries the job's keyword vocabulary — without the
    // hex/CMap decode the extraction is "" and the card never renders.
    const body = "HRIS administration, GOSI registration, payroll cycles, onboarding, compliance reporting";
    const glyphFor: Record<string, string> = {};
    const codes: string[] = [];
    for (const ch of body) {
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
    const pdf = await pdfBytes([
      { delim: "stream\r\n", content: `BT /F1 12 Tf <${codes.join("")}> Tj ET` },
      { delim: "stream\r\n", content: cmap },
    ]);

    await page.goto("/recruitment");
    await page.getByRole("tab", { name: "AI CV Upload" }).click();

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "System Admin — IT" }).click();

    await page.locator("input[type=file]").setInputFiles({
      name: "r99 hexcmap cv.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(pdf),
    });

    const panel = page.getByRole("tabpanel");
    await expect(panel.getByText("r99 hexcmap cv")).toBeVisible({ timeout: 10_000 });
    await expect(panel.getByText(/AI score/i)).toBeVisible();

    const list = await page.request.get("/api/candidates");
    const json = (await list.json()) as {
      ok: boolean;
      data?: { candidates?: { id: string; name: string; aiScore?: number }[] };
    };
    expect(json.ok).toBe(true);
    const created = json.data?.candidates?.find((c) => c.name === "r99 hexcmap cv");
    expect(created).toBeDefined();
    // the CMap-mapped keywords drove a nonzero score — the hex atoms
    // actually reached the scorer through the ToUnicode map
    expect((created?.aiScore ?? 0) > 0).toBe(true);

    if (created) {
      await page.request.delete(`/api/candidates?id=${encodeURIComponent(created.id)}`);
    }
  });
});
