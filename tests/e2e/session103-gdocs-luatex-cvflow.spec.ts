import { expect, test } from "@playwright/test";

// Session 103 (R103-B/C): the Google Docs/Skia + LuaTeX real-writer round —
// the 9th and 10th writer families (gdocs-cv-template.pdf, Producer
// "Skia/PDF m158 Google Docs Renderer"; martino-lualatex.pdf, Producer
// "LuaTeX-0.80.0") carry their word positioning in the Tm TRANSLATION, which
// the walk blind-reset: the Skia form (a FLIPPED axis-aligned Tm + a
// constant-baseline Td per word, explicit space-glyph pieces) extracted as
// word-per-line soup, and the LuaTeX form (every glyph its own Tm) as letter
// soup — 1,012 runs, every keyword dead.
//
// This spec drives a two-stream PDF whose CV vocabulary rides BOTH new paths:
// stream 1 (the Skia region) carries whole words + space glyphs + THREE
// first-letter split continuations ("s|ystems", "d|etail", "p|latform" — a
// 1-char prefix cannot prefix-match under the scorer's 4-char rule, so under
// M2 the split fragments match zero keywords), and stream 2 (the LuaTeX
// region) carries five words in the per-glyph Tm form (under M1 every letter
// spaces into sub-3-char tokens that match nothing). The audit
// (scripts/probe-r103-e2e-audit.mjs, the scorer's live first-24 keyword set):
// FIX matched=14 / skillsMatch=58 vs M1 (the Tm rule reverted — the LuaTeX
// region soup'd) matched=9 / 38 and M2 (the conditional removed — the splits
// stay split) matched=10 / 42.
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

/** A bfchar ToUnicode CMap (1-byte codes). */
function cmap(pairs: [string, string][]): string {
  const entries = pairs.map(([c, u]) => `<${c}> <${u}>`).join("\n");
  return `/CIDInit/ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo<< /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName/Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<00> <FF>\nendcodespacerange\n${pairs.length} beginbfchar\n${entries}\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
}

test.describe("session 103 — the Google Docs/Skia + LuaTeX Tm-positioned CV flow (R103-B/C)", () => {
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
      if (c.name === "r103 gdocs luatex cv") {
        await request.delete(`/api/candidates?id=${encodeURIComponent(c.id)}`);
      }
    }
  });

  test("a Skia+LuaTeX-shaped Tm-positioned PDF parses, matches keywords, and renders the card", async ({ page }) => {
    // The vocabulary — every word in the seeded System Admin job's first-24
    // keyword set (the audit's live computation). The Skia region: whole
    // words + explicit space-glyph pieces + the first-letter split
    // continuations. The LuaTeX region: per-glyph Tms at sub-em letter
    // deltas with 1.2+ em word gaps.
    const skiaWords = ["securely", "support", "specialist", "closely", "people"];
    const luatexWords = ["admin", "technology", "oriented", "management", "optimization"];
    const words = [...skiaWords, "systems", "detail", "platform", ...luatexWords];

    // F2's code assignment: each distinct letter a code (01…), the space
    // glyph the last — the real Google Docs form.
    const letters = [...new Set(words.join(""))];
    const codeOf = new Map(letters.map((ch, i) => [ch, (i + 1).toString(16).padStart(2, "0").toUpperCase()]));
    const SPACE = (letters.length + 1).toString(16).padStart(2, "0").toUpperCase();
    const f2Map: [string, string][] = [
      ...letters.map((ch) => [codeOf.get(ch)!, ch.charCodeAt(0).toString(16).padStart(4, "0").toUpperCase()] as [string, string]),
      [SPACE, "0020"],
    ];
    const hexOf = (w: string) => [...w].map((ch) => codeOf.get(ch)).join("");

    // STREAM 1 — the Skia region (the real gdocs operator shape): every
    // word its own BT block — Tm(1 0 0 -1 ex ey) + the constant-baseline
    // Td(tx, -14.2578125) — with explicit space-glyph pieces between words
    // and THREE first-letter split continuations riding same-BT Td moves
    // (the tx exactly the preceding part's width — the kern-pair class).
    let tx = 0;
    const skiaBlocks: string[] = [];
    const skiaWord = (w: string, width: number) => {
      skiaBlocks.push(`BT /F2 16 Tf 1 0 0 -1 100 50 Tm ${tx.toFixed(1)} -14.2578125 Td <${hexOf(w)}> Tj ET`);
      tx += width + 4;
    };
    const skiaSpace = () => {
      skiaBlocks.push(`BT /F2 16 Tf 1 0 0 -1 100 50 Tm ${tx.toFixed(1)} -14.2578125 Td <${SPACE}> Tj ET`);
      tx += 4;
    };
    const skiaSplit = (first: string, rest: string, firstWidth: number) => {
      // one BT block: the first letter, then a same-BT Td continuation at
      // exactly the first part's width — the real split-word shape
      skiaBlocks.push(
        `BT /F2 16 Tf 1 0 0 -1 100 50 Tm ${tx.toFixed(1)} -14.2578125 Td <${hexOf(first)}> Tj ${firstWidth.toFixed(1)} 0 Td <${hexOf(rest)}> Tj ET`
      );
      tx += firstWidth + (rest.length + 1) * 9 + 4;
    };
    skiaWord("securely", 60);
    skiaSpace();
    skiaWord("support", 56);
    skiaSpace();
    skiaWord("specialist", 78);
    skiaSpace();
    skiaWord("closely", 52);
    skiaSpace();
    skiaWord("people", 50);
    skiaSpace();
    skiaSplit("sys", "tems", 24.0); // "systems" — a 3-char prefix (< the 4-char rule) at 1.5 em (≥ the gap rule)
    skiaSpace();
    skiaSplit("det", "ail", 23.6); // "detail"
    skiaSpace();
    skiaSplit("pla", "tform", 22.0); // "platform"
    const stream1 = skiaBlocks.join("\n");

    // STREAM 2 — the LuaTeX region (the real martino operator shape): every
    // glyph its own BT+Tm block with a single-code TJ array, the letter
    // advances at 0.45–0.55 em (at Tf 10), the word gaps at 1.2+ em.
    const glyphBlocks: string[] = [];
    let x = 100;
    const glyph = (ch: string, dx: number) => {
      x += dx;
      glyphBlocks.push(`BT /F2 10 Tf 1 0 0 1 ${x.toFixed(1)} 650 Tm [<${codeOf.get(ch)}>]TJ ET`);
    };
    for (const w of luatexWords) {
      for (const ch of w) glyph(ch, 4.8 + (ch.charCodeAt(0) % 3) * 0.4); // 0.48–0.56 em letter advances
      x += 12.5; // the word gap: 1.25 em past the last letter
    }
    const stream2 = glyphBlocks.join("\n");

    const pdf = await pdfObjects([
      { raw: "<< /Type /Catalog /Pages 8 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmap(f2Map) }, // F2's ToUnicode CMap
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /Vocabulary /ToUnicode 2 0 R >>" },
      { raw: "<< /Font << /F2 3 0 R >> >>" },
      { dict: "/Filter /FlateDecode", stream: stream1 }, // the Skia region
      { dict: "/Filter /FlateDecode", stream: stream2 }, // the LuaTeX region
      { raw: "<< /Type /Pages /Kids [] >>" },
    ]);

    await page.goto("/recruitment");
    await page.getByRole("tab", { name: "AI CV Upload" }).click();

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "System Admin — IT" }).click();

    await page.locator("input[type=file]").setInputFiles({
      name: "r103 gdocs luatex cv.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(pdf),
    });

    const panel = page.getByRole("tabpanel");
    await expect(panel.getByText("r103 gdocs luatex cv")).toBeVisible({ timeout: 10_000 });
    await expect(panel.getByText(/AI score/i)).toBeVisible();

    // the discriminating assertions: the LuaTeX region rode the Tm-origin
    // delta join (under M1 every letter spaces into sub-3-char tokens) and
    // the split words rode the space-glyph conditional (under M2 the
    // 1-char-prefixed fragments match nothing) — the audit: FIX
    // skillsMatch=58 vs M1 38 and M2 42
    const list = await page.request.get("/api/candidates");
    const json = (await list.json()) as {
      ok: boolean;
      data?: { candidates?: { id: string; name: string; aiScore?: number; skillsMatch?: number }[] };
    };
    expect(json.ok).toBe(true);
    const created = json.data?.candidates?.find((c) => c.name === "r103 gdocs luatex cv");
    expect(created).toBeDefined();
    expect((created?.skillsMatch ?? 0) >= 50).toBe(true); // ← RED under M1 (38) and M2 (42)
    expect((created?.aiScore ?? 0) > 30).toBe(true); // above the floor both mutations score

    if (created) {
      await page.request.delete(`/api/candidates?id=${encodeURIComponent(created.id)}`);
    }
  });
});
