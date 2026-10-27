import { expect, test } from "@playwright/test";

// Session 100 (R100-A + R100-B): the per-glyph Tj+Td CV flow — the r99
// close-out's named frontier (the ObjStm/compressed-object form + a real
// Acrobat-produced PDF). The real-file leg (the IRS f1040 — a real
// Acrobat/LiveCycle XFA form with 30 ObjStm objects) found the round's
// defect: LiveCycle writes each glyph as its OWN (X)Tj show with a
// glyph-advance Td move between shows, and the blind " "-join turned
// every per-glyph word into LETTER SOUP ("p a y r o l l") — the scorer's
// tokenizer drops sub-3-char tokens, so such a CV matched ZERO keywords.
// This spec drives a per-glyph PDF (the Acrobat/LiveCycle writer form)
// whose CV vocabulary rides the per-glyph runs — the analysis card's
// MATCHED KEYWORDS prove the words joined. The PDF ALSO carries an
// ObjStm-shaped stream (R100-B: dicts only — the compressed-object form
// every modern writer uses) so both queue members are pinned in one leg.
async function pdfBytes(streams: { delim?: string; content: string }[]): Promise<Uint8Array> {
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
  return pdf;
}

/** A per-glyph word: each glyph its own (X)Tj show, 0.3–0.65 em Td moves. */
function perGlyph(word: string): string {
  const moves = [0.55, 0.6, 0.62, 0.58, 0.5, 0.45, 0.35, 0.65, 0.52, 0.4, 0.61, 0.57];
  return (
    word
      .split("")
      .map((ch, i) => `(${ch})Tj ${moves[i % moves.length]} 0 Td`)
      .join(" ") + " "
  );
}

test.describe("session 100 — the per-glyph Tj+Td CV flow (R100-A/B)", () => {
  // The e2e DB persists across runs, and THIS spec's letter-soup payload
  // deliberately clears the 40-alnum extraction guard — a FAILED run (a
  // mutation proof, a regression) still POSTs the candidate before the
  // assertions fire, and the never-reached cleanup leaks the row forward
  // (the r99-spec failures never leaked: their payloads died BEFORE the
  // POST). The pre-clean sweep is the /assets-spec pattern: any leaked
  // "r100 perglyph cv" rows go BEFORE the test, so a failed run can never
  // pollute the exact-order and zero-state specs downstream.
  test.beforeEach(async ({ request }) => {
    const list = await request.get("/api/candidates");
    const json = (await list.json()) as {
      ok: boolean;
      data?: { candidates?: { id: string; name: string }[] };
    };
    for (const c of json.data?.candidates ?? []) {
      if (c.name === "r100 perglyph cv") {
        await request.delete(`/api/candidates?id=${encodeURIComponent(c.id)}`);
      }
    }
  });

  test("a per-glyph Acrobat/LiveCycle PDF parses, matches keywords, and renders the analysis card", async ({ page }) => {
    // The ENTIRE CV vocabulary rides PER-GLYPH runs (the LiveCycle
    // field-value form) — the r97 fixture lesson applied at the E2E layer:
    // a whole-word atom carrying a matchable keyword would let the spec
    // pass even with the join reverted (letter soup matches ZERO keywords;
    // the soup's own alnums still clear the 40-alnum extraction guard).
    // Stream 1 is the ObjStm-shaped body (dicts only — R100-B): it must
    // contribute nothing while the standalone content stream extracts.
    const objstmBody =
      "12 dict begin\n" +
      "6 0 obj\n<< /Type /Page /Parent 2 0 R /Contents 4 0 R >>\nendobj\n" +
      "7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n" +
      "end";
    const words = [
      "onboarding",
      "hris",
      "administration",
      "specialist",
      "training",
      "compliance",
      "senior",
      "manager",
      "experience",
      "5",
      "years",
      "platform",
    ];
    const content = [
      "BT /T1_0 1 Tf 6.79 0 0 7 472 676.002 Tm",
      ...words.map((w) => perGlyph(w) + " 2.0 0 Td"),
      "ET",
    ].join("\n");

    const pdf = await pdfBytes([
      { content: objstmBody },
      { content },
    ]);

    await page.goto("/recruitment");
    await page.getByRole("tab", { name: "AI CV Upload" }).click();

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "System Admin — IT" }).click();

    await page.locator("input[type=file]").setInputFiles({
      name: "r100 perglyph cv.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(pdf),
    });

    const panel = page.getByRole("tabpanel");
    await expect(panel.getByText("r100 perglyph cv")).toBeVisible({ timeout: 10_000 });
    await expect(panel.getByText(/AI score/i)).toBeVisible();

    // the matched-keywords proof: the per-glyph words joined into real
    // tokens the scorer could match (letter soup matches NOTHING —
    // skillsMatch is the persisted share of matched job keywords)
    const list = await page.request.get("/api/candidates");
    const json = (await list.json()) as {
      ok: boolean;
      data?: {
        candidates?: { id: string; name: string; aiScore?: number; skillsMatch?: number }[];
      };
    };
    expect(json.ok).toBe(true);
    const created = json.data?.candidates?.find((c) => c.name === "r100 perglyph cv");
    expect(created).toBeDefined();
    // the discriminating assertions: the keyword vocabulary rode per-glyph
    // runs — only the position-aware join lets the scorer match anything
    // (the blind join's letter soup scores skillsMatch 0 at the floor 5)
    expect((created?.skillsMatch ?? 0) > 0).toBe(true);
    expect((created?.aiScore ?? 0) > 5).toBe(true); // above the floor the letter soup scores

    if (created) {
      await page.request.delete(`/api/candidates?id=${encodeURIComponent(created.id)}`);
    }
  });
});
