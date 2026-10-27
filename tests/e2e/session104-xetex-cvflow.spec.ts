import { expect, test } from "@playwright/test";

// Session 104 (R104-C/D): the XeTeX real-writer round — the 12th writer
// family (Tanmay_CV.pdf, Producer "xdvipdfmx \(20210318\)") exposed TWO
// defect classes: (C) every word its own BT block with an ABSOLUTE Td and
// NO Tm — the walk (no BT awareness) fired the between-shows ty rule per
// word: word-per-line soup; (D) the font chain's LAST-WINS /F-name mapping
// decoded multi-page docs through the wrong page's /F1 CMap.
//
// This spec drives a two-region PDF whose CV vocabulary rides both paths:
// region 1 (the XeTeX per-word-BT form — the flow leg) and region 2 (the
// F-name collision — the discrimination leg: font A's words decode through
// font A's own map under the FIX, but through font B's wrong letters under
// the last-wins revert). The audit (scripts/probe-r104-e2e-audit.mjs, the
// scorer's live first-24 keyword set): FIX matched=14 / skillsMatch=58 vs
// M2 (the font chain last-wins) matched=7 / 29.
//
// The documented no-teeth: the word-per-line defect does NOT change the
// score — the scorer's tokenizer splits on /[^a-z0-9+#]+/ (newlines are
// whitespace), so the M1 (fresh-Td rule reverted) leg rides the UNIT layer
// (the r100/r102 documented split; the XeTeX-form unit spec carries the
// teeth).
async function pdfObjects(
  objects: ({ raw: string } | { dict: string; stream: string })[]
): Promise<Uint8Array> {
  const enc = (s: string) => new TextEncoder().encode(s);
  const parts: Uint8Array[] = [];
  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    if ("raw" in obj) {
      parts.push(enc(`${i + 1} 0 obj\n${obj.raw}\nendobj\n`));
    } else {
      const zlib = new CompressionStream("deflate");
      const deflated = new Uint8Array(
        await new Response(new Blob([obj.stream]).stream().pipeThrough(zlib)).arrayBuffer()
      );
      parts.push(enc(`${i + 1} 0 obj\n<< ${obj.dict} /Length ${deflated.length} >>\nstream\r\n`));
      parts.push(deflated);
      parts.push(enc("\r\nendstream\nendobj\n"));
    }
  }
  parts.push(enc("trailer\n<< /Root 1 0 R >>\n%%EOF"));
  const total = parts.reduce((n, p) => n + p.length, 0);
  const pdf = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    pdf.set(p, o);
    o += p.length;
  }
  return pdf;
}

/** A bfchar ToUnicode CMap (2-byte codes) — the fontspec.pdf form. */
function cmapPairs(name: string, pairs: [string, string][]): string {
  const entries = pairs.map(([c, u]) => `<${c}> <${u}>`).join("\n");
  return `/CIDInit/ProcSet findresource begin\n12 dict begin\nbegincmap\n/CMapName/${name} def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n${pairs.length} beginbfchar\n${entries}\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
}

test.describe("session 104 — the XeTeX per-word-BT + F-name collision CV flow (R104-C/D)", () => {
  // The e2e DB persists across runs, and THIS spec's payload clears the
  // 40-alnum extraction guard on every build (the fix AND the mutations) —
  // the r100 final-gate pollution rule: the pre-clean sweep.
  test.beforeEach(async ({ request }) => {
    const list = await request.get("/api/candidates");
    const json = (await list.json()) as {
      ok: boolean;
      data?: { candidates?: { id: string; name: string }[] };
    };
    for (const c of json.data?.candidates ?? []) {
      if (c.name === "r104 xetex collision cv") {
        await request.delete(`/api/candidates?id=${encodeURIComponent(c.id)}`);
      }
    }
  });

  test("a XeTeX-shaped per-word-BT PDF with the F-name collision parses, matches keywords, and renders the card", async ({ page }) => {
    // The vocabulary — the audit's live computation against the seeded
    // System Admin job's first-24 keyword set. Region 1 (the XeTeX flow
    // leg): whole words in the per-word-BT absolute-Td form, riding font
    // B's exclusive codes (decodes correctly under the FIX AND the
    // last-wins revert alike — the flow leg). Region 2 (the collision
    // discrimination leg): font A's words at font A's codes — under the
    // FIX they decode through font A's own map (the candidates' first
    // fully-covering entry); under the last-wins revert they decode
    // through font B's wrong letters and the keywords die.
    const XETEX_WORDS = ["securely", "support", "specialist", "closely", "people"];
    const A_WORDS = ["systems", "technology", "oriented", "management", "optimization"];
    const B_WORDS = ["admin", "platform", "training"];

    const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(4, "0");
    const uni = (ch: string) => ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0");

    // font A: the distinct letters of its vocabulary at codes 0001+
    const aLetters = [...new Set(A_WORDS.join(""))];
    const aCode = new Map(aLetters.map((ch, i) => [ch, hex2(i + 1)]));
    const cmapA = cmapPairs("FontA-UTF16", aLetters.map((ch) => [aCode.get(ch)!, uni(ch)]));

    // font B: the SAME codes map to WRONG letters, plus its exclusive
    // codes for region 1's and region 3's words
    const bLetters = [...new Set([...XETEX_WORDS, ...B_WORDS].join(""))];
    const wrong = "qwzvxjk";
    const bPairs: [string, string][] = [];
    aLetters.forEach((_, i) => bPairs.push([hex2(i + 1), uni(wrong[i % wrong.length])]));
    const bCode = new Map(bLetters.map((ch, i) => [ch, hex2(0x11 + i)]));
    bLetters.forEach((ch) => bPairs.push([bCode.get(ch)!, uni(ch)]));
    const cmapB = cmapPairs("FontB-UTF16", bPairs);
    const hexOf = (w: string, code: Map<string, string>) => [...w].map((ch) => code.get(ch)!).join("");

    // the content: the XeTeX per-word-BT form — every word its own BT
    // block with an ABSOLUTE Td (same ty per line, one leading between
    // lines, word-width dx between words) — all under the colliding /F1
    const blocks: string[] = [];
    let tx = 20;
    const word = (w: string, code: Map<string, string>, ty: number, width: number) => {
      blocks.push(`BT /F1 12 Tf ${tx.toFixed(1)} ${ty} Td <${hexOf(w, code)}> Tj ET`);
      tx += width + 14; // the word gap: 1+ em
    };
    for (const w of XETEX_WORDS) word(w, bCode, 700, w.length * 7);
    tx = 20;
    for (const w of A_WORDS) word(w, aCode, 680, w.length * 7);
    tx = 20;
    for (const w of B_WORDS) word(w, bCode, 660, w.length * 7);
    const content = blocks.join("\n");

    const pdf = await pdfObjects([
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

    await page.goto("/recruitment");
    await page.getByRole("tab", { name: "AI CV Upload" }).click();

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "System Admin — IT" }).click();

    await page.locator("input[type=file]").setInputFiles({
      name: "r104 xetex collision cv.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(pdf),
    });

    const panel = page.getByRole("tabpanel");
    await expect(panel.getByText("r104 xetex collision cv")).toBeVisible({ timeout: 10_000 });
    await expect(panel.getByText(/AI score/i)).toBeVisible();

    // the discriminating assertion: font A's words decoded through font
    // A's OWN map (under the last-wins revert they garble through font
    // B's wrong letters and the keywords die) — the audit: FIX
    // skillsMatch=58 vs the last-wins revert 29
    const list = await page.request.get("/api/candidates");
    const json = (await list.json()) as {
      ok: boolean;
      data?: { candidates?: { id: string; name: string; aiScore?: number; skillsMatch?: number }[] };
    };
    expect(json.ok).toBe(true);
    const created = json.data?.candidates?.find((c) => c.name === "r104 xetex collision cv");
    expect(created).toBeDefined();
    expect((created?.skillsMatch ?? 0) >= 45).toBe(true); // ← RED under the last-wins revert (29)
    expect((created?.aiScore ?? 0) > 25).toBe(true); // above the floor both mutations score

    if (created) {
      await page.request.delete(`/api/candidates?id=${encodeURIComponent(created.id)}`);
    }
  });
});
