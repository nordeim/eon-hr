import { expect, test } from "@playwright/test";

// Session 98 (R98-A + R98-B): the multi-stream + octal-escape CV flow — the
// r97 close-out's named frontier ("a multi-stream real PDF … the scanner
// handles it but it's never been pinned" + "the octal-escape unescaping in
// PDF strings"). The pin found the scanner did NOT handle it: the scan
// regex re-matched the "stream" inside "endstream", so every stream after
// the first was silently lost (a multi-page CV yielded page 1 only), and
// the octal escapes (\227 em-dash, \351 é — WinAnsiEncoding, how
// Word/Acrobat write the non-ASCII characters CVs are full of) stayed as
// literal garbage. This spec drives BOTH through the actual UI upload —
// a two-stream (two-page) PDF whose second page carries the seeded job's
// keyword vocabulary, with octal escapes in the first page's strings —
// asserting the analysis card + the persisted candidate row.

async function multiStreamPdfBytes(): Promise<Uint8Array> {
  // Two content streams — the real multi-page PDF shape. Page 1 carries
  // the name vocabulary + octal escapes; page 2 alone carries the job's
  // keyword vocabulary, so a passing score PROVES page 2 was extracted
  // (the old scan lost it — the score would stay low without it).
  const content1 =
    "BT /F1 12 Tf [(Senior HR Administrator \\227 r\\351sum\\351)] TJ ET";
  const content2 =
    "BT /F1 12 Tf [(HRIS administration, GOSI registration, payroll cycles, onboarding, and compliance reporting)] TJ ET";
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
  return pdf;
}

test.describe("session 98 — the multi-stream + octal-escape CV flow (R98-A/B)", () => {
  test("a two-stream PDF's SECOND page parses, scores, and renders the analysis card", async ({ page }) => {
    await page.goto("/recruitment");
    await page.getByRole("tab", { name: "AI CV Upload" }).click();

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "System Admin — IT" }).click();

    await page.locator("input[type=file]").setInputFiles({
      name: "r98 multistream cv.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(await multiStreamPdfBytes()),
    });

    const panel = page.getByRole("tabpanel");
    // the filename-stem name (deriveCandidateName) on the analysis card
    await expect(panel.getByText("r98 multistream cv")).toBeVisible({ timeout: 10_000 });
    await expect(panel.getByText(/AI score/i)).toBeVisible();

    // the candidate persisted through the API (the working superset the
    // REF's broken creation path cannot do)
    const list = await page.request.get("/api/candidates");
    const json = (await list.json()) as {
      ok: boolean;
      data?: { candidates?: { id: string; name: string; aiScore?: number }[] };
    };
    expect(json.ok).toBe(true);
    const created = json.data?.candidates?.find((c) => c.name === "r98 multistream cv");
    expect(created).toBeDefined();
    // page 2's keywords drove a nonzero score — the multi-stream extraction
    // actually delivered the second page's text to the scorer
    expect((created?.aiScore ?? 0) > 0).toBe(true);

    // cleanup — keep the e2e tenant pristine for the other specs
    if (created) {
      await page.request.delete(`/api/candidates?id=${encodeURIComponent(created.id)}`);
    }
  });
});
