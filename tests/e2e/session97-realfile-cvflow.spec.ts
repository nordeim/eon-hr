import { expect, test } from "@playwright/test";
import { makeZip } from "../unit/zip-fixture";

// Session 97 (R97-A + R97-B): the AI CV Upload tab's REAL-FILE flow — the
// r96 close-out's named frontier ("a real .docx/.pdf through the parse →
// the analysis card"). Until this round the superset flow was E2E-exercised
// with a .txt only; the .docx zip-walk and the .pdf stream-scan paths
// shipped covered by crafted UNIT fixtures alone — and the unit PDF fixture
// used the Tj operator only, which is exactly how the TJ-array gap (the
// dominant real-world PDF text form) survived. These specs drive the actual
// UI upload with a real-shaped .docx (the deflate-method-8 zip from the
// shared fixture builder) and a TJ-carrying .pdf (deflated content stream),
// asserting the analysis card + the persisted candidate row.

async function docxBytes(): Promise<Uint8Array> {
  // a real-shaped word/document.xml: three <w:t> runs across paragraphs,
  // carrying the seeded job's keyword vocabulary so the scorer engages.
  const xml =
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    "<w:body><w:p><w:r><w:t>Senior HR Administrator</w:t></w:r></w:p>" +
    "<w:p><w:r><w:t>HRIS administration, GOSI registration, payroll cycles, onboarding, and compliance reporting.</w:t></w:r></w:p></w:body></w:document>";
  return makeZip([{ name: "word/document.xml", data: new TextEncoder().encode(xml) }]);
}

async function tjPdfBytes(): Promise<Uint8Array> {
  // the real-world PDF text form: strings inside a kerned TJ array.
  const content =
    "BT /F1 12 Tf [(Senior HR Administrator with) -120 (HRIS, GOSI, payroll, onboarding, and compliance experience)] TJ ET";
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
  return pdf;
}

test.describe("session 97 — the real-file CV flow (R97-A/B)", () => {
  for (const [label, build, filename] of [
    ["docx", docxBytes, "real-cv.docx"],
    ["pdf (TJ array)", tjPdfBytes, "real-cv.pdf"],
  ] as const) {
    test(`the ${label} upload parses, scores, and renders the analysis card`, async ({ page }) => {
      await page.goto("/recruitment");
      await page.getByRole("tab", { name: "AI CV Upload" }).click();

      await page.getByRole("combobox").click();
      await page.getByRole("option", { name: "System Admin — IT" }).click();

      await page.locator("input[type=file]").setInputFiles({
        name: filename,
        mimeType:
          label === "docx"
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : "application/pdf",
        buffer: Buffer.from(await build()),
      });

      const panel = page.getByRole("tabpanel");
      // the filename-stem name (deriveCandidateName) on the analysis card
      await expect(panel.getByText("real cv")).toBeVisible({ timeout: 10_000 });
      await expect(panel.getByText(/AI score/i)).toBeVisible();

      // the candidate persisted through the API (the working superset the
      // REF's broken creation path cannot do)
      const list = await page.request.get("/api/candidates");
      const json = (await list.json()) as {
        ok: boolean;
        data?: { candidates?: { id: string; name: string; aiScore?: number }[] };
      };
      expect(json.ok).toBe(true);
      const created = json.data?.candidates?.find((c) => c.name === "real cv");
      expect(created).toBeDefined();
      // the parse actually yielded the CV text — the deterministic scorer
      // awarded a nonzero score on the keyword overlap
      expect((created?.aiScore ?? 0) > 0).toBe(true);

      // cleanup — keep the e2e tenant pristine for the other specs
      if (created) {
        await page.request.delete(`/api/candidates?id=${encodeURIComponent(created.id)}`);
      }
    });
  }
});
