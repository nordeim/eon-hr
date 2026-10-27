import { expect, test } from "@playwright/test";

// Session 102 (R102-A/B/C): the LibreOffice real-writer round — the 8th
// writer family (LibreOffice 26.2 / PDF 2.0, pinned on the real Writer +
// Calc guides) exposed three defect classes: (A) the non-content-stream
// crash — a 26MB /Subtype /Image stream's binary garbage blows the V8
// regex stack and kills the WHOLE file (the unit layer carries the gate
// teeth: the pollution assertions); (B) the font-scoped CMap decode — 15
// subset fonts each restart glyph codes at <01>, and the first-covering
// rule decodes every font's atoms through the wrong map; (C) the
// T-overhang kerns — LibreOffice writes the classic T-lowercase kerns as
// POSITIVE +110…+149 thousandths, which the sign-blind r101 rule read as
// word gaps ("T eam").
//
// This spec drives a LibreOffice-shaped PDF whose ENTIRE CV vocabulary
// rides F2's font-scoped hex atoms with +110 first-letter splits (the
// payload-exclusivity rule across BOTH new paths): under the wrong-CMap
// decode (M2) the words become gibberish that matches zero keywords, and
// under the sign-blind rule (M3) the split fragments ("echnology",
// "ystems" …) match zero keywords — the audit (scripts/probe-r102-e2e-audit.mjs):
// FIX matched=8 / skillsMatch=33 / aiScore=20 vs M2 and M3 both
// matched=0 / skillsMatch=0 / aiScore=5 (the floor).
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

/** A bfchar ToUnicode CMap (the LibreOffice form: 1-byte codes). */
function cmap(pairs: [string, string][]): string {
  const entries = pairs.map(([c, u]) => `<${c}> <${u}>`).join("\n");
  return `/CIDInit/ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo<< /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName/Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<00> <FF>\nendcodespacerange\n${pairs.length} beginbfchar\n${entries}\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
}

test.describe("session 102 — the LibreOffice font-scoped CV flow (R102-B/C)", () => {
  // The e2e DB persists across runs, and THIS spec's payload clears the
  // 40-alnum extraction guard on every build (the fix AND the mutations) —
  // a FAILED run (a mutation proof, a regression) still POSTs the candidate
  // before the assertions fire, and the never-reached cleanup leaks the row
  // forward (the r100 final-gate pollution catch). The pre-clean sweep is
  // the /assets-spec pattern.
  test.beforeEach(async ({ request }) => {
    const list = await request.get("/api/candidates");
    const json = (await list.json()) as {
      ok: boolean;
      data?: { candidates?: { id: string; name: string }[] };
    };
    for (const c of json.data?.candidates ?? []) {
      if (c.name === "r102 libreoffice cv") {
        await request.delete(`/api/candidates?id=${encodeURIComponent(c.id)}`);
      }
    }
  });

  test("a LibreOffice-shaped font-scoped kern-split PDF parses, matches keywords, and renders the card", async ({ page }) => {
    // The vocabulary (every word in the seeded System Admin job's first-24
    // keyword set — the audit's live computation) rides EXCLUSIVELY the two
    // new paths: F2's own CMap (under the first-covering rule the atoms
    // decode through F1's decoy map — gibberish) and the +110 first-letter
    // kern split (under the sign-blind rule the fragments match nothing).
    const words = ["technology", "systems", "securely", "support", "specialist", "platform"];

    // F2's code assignment: each distinct letter gets a code (01…), the
    // space glyph rides the last code — the real LibreOffice form (the
    // words' spaces INSIDE atoms, never as numbers).
    const letters = [...new Set(words.join(""))];
    const codeOf = new Map(letters.map((ch, i) => [ch, (i + 1).toString(16).padStart(2, "0").toUpperCase()]));
    const SPACE = (letters.length + 1).toString(16).padStart(2, "0").toUpperCase();
    const f2Map: [string, string][] = [
      ...letters.map((ch) => [codeOf.get(ch)!, ch.charCodeAt(0).toString(16).padStart(4, "0").toUpperCase()] as [string, string]),
      [SPACE, "0020"],
    ];
    // F1's decoy map: the SAME code values mapped to gibberish letters —
    // the wrong-font decode every multi-font subset file suffers under the
    // first-covering rule (F1's CMap is collected FIRST).
    const decoys = "qwzvxjkbmqwzvxjkbm";
    const f1Map: [string, string][] = f2Map.map(([c], i) => [
      c,
      decoys.charCodeAt(i % decoys.length).toString(16).padStart(4, "0").toUpperCase(),
    ]);

    // every word: [<first-letter code> 110 <rest + space>] TJ — the +110 is
    // the real LibreOffice T-overhang kern class (positive, ≥ 100)
    const wordArray = (w: string) =>
      `[<${codeOf.get(w[0])}> 110 <${[...w.slice(1)].map((ch) => codeOf.get(ch)).join("")}${SPACE}>] TJ`;
    const content = `BT /F2 11 Tf ${words.map(wordArray).join(" ")} ET`;

    const pdf = await pdfObjects([
      { raw: "<< /Type /Catalog /Pages 8 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmap(f1Map) }, // F1's CMap FIRST (collected first — the M2 trap)
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /Decoy /ToUnicode 2 0 R >>" },
      { dict: "/Filter /FlateDecode", stream: cmap(f2Map) },
      { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /Vocabulary /ToUnicode 4 0 R >>" },
      { raw: "<< /Font << /F1 3 0 R /F2 5 0 R >> >>" },
      // the authentic /Image member: never a content stream (the R102-A
      // shape; the unit layer carries this leg's teeth)
      {
        dict: "/Type /XObject /Subtype /Image /Width 320 /Height 240 /ColorSpace /DeviceRGB",
        stream: "(imagegarbage filler noise) Tj ".repeat(40),
      },
      { dict: "/Filter /FlateDecode", stream: content },
    ]);

    await page.goto("/recruitment");
    await page.getByRole("tab", { name: "AI CV Upload" }).click();

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "System Admin — IT" }).click();

    await page.locator("input[type=file]").setInputFiles({
      name: "r102 libreoffice cv.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(pdf),
    });

    const panel = page.getByRole("tabpanel");
    await expect(panel.getByText("r102 libreoffice cv")).toBeVisible({ timeout: 10_000 });
    await expect(panel.getByText(/AI score/i)).toBeVisible();

    // the discriminating assertions: the vocabulary rode F2's font-scoped
    // hex atoms AND +110 kern splits — only the font chain + the sign rule
    // let the scorer match anything (the wrong-CMap gibberish and the
    // split fragments both score skillsMatch 0 at the floor 5)
    const list = await page.request.get("/api/candidates");
    const json = (await list.json()) as {
      ok: boolean;
      data?: { candidates?: { id: string; name: string; aiScore?: number; skillsMatch?: number }[] };
    };
    expect(json.ok).toBe(true);
    const created = json.data?.candidates?.find((c) => c.name === "r102 libreoffice cv");
    expect(created).toBeDefined();
    expect((created?.skillsMatch ?? 0) > 0).toBe(true); // ← RED under M2 (wrong-CMap gibberish) and M3 (the split fragments)
    expect((created?.aiScore ?? 0) > 5).toBe(true); // above the floor both mutations score

    if (created) {
      await page.request.delete(`/api/candidates?id=${encodeURIComponent(created.id)}`);
    }
  });
});
