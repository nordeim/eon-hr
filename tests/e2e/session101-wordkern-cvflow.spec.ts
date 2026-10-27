import { expect, test } from "@playwright/test";

// Session 101 (R101-A): the TJ-array INTERNAL kern round — the r100
// close-out's named frontier (a real Word-Save-as-PDF pin + the Tz/Ts/Type3
// edges). The real-file leg (the real "Microsoft Word for Office 365"
// pitt-word.pdf + the Adobe PDF Library tisch-resume.pdf + the standing
// arXiv paper re-read) found the round's defect: all three writers put
// KERNING numbers (thousandths of text space, ≤ 92) between TJ atoms while
// the words' spaces ride INSIDE atoms — and the blind " "-join split every
// kerned word ("In for m ation"). The fix: the 0.1-em threshold — |sum| ≥
// 100 thousandths is a word gap, under is a kern → join.
//
// This spec drives a Word-shaped PDF whose ENTIRE CV vocabulary rides
// kern-split clusters ((ad)4(min)4(istration) …) — the payload-exclusivity
// rule: under the blind join the split tokens ("ad", "min", "istration")
// match ZERO job keywords (the tokenizer drops sub-3-char tokens and the
// prefix rule needs ≥ 4 chars on both sides), so the analysis card's
// skillsMatch > 0 proves the kerns joined. The soup's own alnums still
// clear the 40-alnum extraction guard (the fixture-length lesson).
async function pdfBytes(streams: { content: string }[]): Promise<Uint8Array> {
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
    parts.push(enc(`${i + 1} 0 obj\n<< /Length ${d.length} >>\nstream\r\n`));
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

/** A Word-writer kern-split word: 3-char clusters, sub-100 kerns between,
 *  the word's trailing space INSIDE the last atom (the real Word form:
 *  `(ation)-2( T)` — the space rides in the atom, never between atoms). */
function kernWord(word: string): string {
  // every cluster is ≤ 3 chars: under the blind join every token is a
  // sub-4-char fragment that can neither exact-match nor prefix-match any
  // keyword (the scorer's prefix rule needs ≥ 4 chars on BOTH sides) —
  // zero matches, the floor score (the payload-exclusivity rule)
  const clusters: string[] = [];
  for (let i = 0; i < word.length; i += 3) clusters.push(word.slice(i, i + 3));
  clusters[clusters.length - 1] += " "; // the trailing space rides inside the atom
  return clusters.map((c, j) => (j === 0 ? `(${c})` : `${3 + ((j * 2) % 5)}(${c})`)).join("");
}

test.describe("session 101 — the TJ-array internal kern CV flow (R101-A)", () => {
  // The e2e DB persists across runs, and THIS spec's kern-soup payload
  // deliberately clears the 40-alnum extraction guard — a FAILED run (a
  // mutation proof, a regression) still POSTs the candidate before the
  // assertions fire, and the never-reached cleanup leaks the row forward
  // (the r100 final-gate pollution catch). The pre-clean sweep is the
  // /assets-spec pattern: any leaked "r101 wordkern cv" rows go BEFORE the
  // test, so a failed run can never pollute the exact-order and zero-state
  // specs downstream.
  test.beforeEach(async ({ request }) => {
    const list = await request.get("/api/candidates");
    const json = (await list.json()) as {
      ok: boolean;
      data?: { candidates?: { id: string; name: string }[] };
    };
    for (const c of json.data?.candidates ?? []) {
      if (c.name === "r101 wordkern cv") {
        await request.delete(`/api/candidates?id=${encodeURIComponent(c.id)}`);
      }
    }
  });

  test("a Word-shaped kern-split PDF parses, matches keywords, and renders the analysis card", async ({ page }) => {
    // The ENTIRE CV vocabulary rides KERN-SPLIT clusters (the Word writer
    // form) — the payload-exclusivity rule: no whole-word atom carries a
    // matchable keyword (under the blind join the split tokens match zero
    // keywords; the soup's own alnums still clear the extraction guard).
    const words = [
      "administration",
      "specialist",
      "platform",
      "payroll",
      "compliance",
      "onboarding",
      "hris",
      "training",
      "manager",
      "senior",
      "experience",
      "technology",
      "systems",
      "securely",
    ];
    // the Word one-array-per-line form: BT /F1 12 Tf 1 0 0 1 x y Tm […] TJ ET
    // NO years member: a `5 years` pair would survive the mutation (the
    // years regex parses the split soup too — its +10 would break the
    // aiScore > 5 discrimination; the r100 spec's floor-score property)
    const lines = [
      [words[0], words[1], words[2]].map(kernWord).join(""),
      [words[3], words[4], words[5]].map(kernWord).join(""),
      [words[6], words[7], words[8]].map(kernWord).join(""),
      [words[9], words[10], words[11]].map(kernWord).join(""),
      [words[12], words[13]].map(kernWord).join(""),
    ];
    const content = lines
      .map((line, idx) => `BT /F1 12 Tf 1 0 0 1 71.544 ${731.04 - idx * 14.4} Tm [${line}] TJ ET`)
      .join("\n");

    const pdf = await pdfBytes([{ content }]);

    await page.goto("/recruitment");
    await page.getByRole("tab", { name: "AI CV Upload" }).click();

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "System Admin — IT" }).click();

    await page.locator("input[type=file]").setInputFiles({
      name: "r101 wordkern cv.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(pdf),
    });

    const panel = page.getByRole("tabpanel");
    await expect(panel.getByText("r101 wordkern cv")).toBeVisible({ timeout: 10_000 });
    await expect(panel.getByText(/AI score/i)).toBeVisible();

    // the matched-keywords proof: the kern-split words joined into real
    // tokens the scorer could match (the split soup matches NOTHING —
    // skillsMatch is the persisted share of matched job keywords)
    const list = await page.request.get("/api/candidates");
    const json = (await list.json()) as {
      ok: boolean;
      data?: {
        candidates?: { id: string; name: string; aiScore?: number; skillsMatch?: number }[];
      };
    };
    expect(json.ok).toBe(true);
    const created = json.data?.candidates?.find((c) => c.name === "r101 wordkern cv");
    expect(created).toBeDefined();
    // the discriminating assertions: the keyword vocabulary rode kern-split
    // clusters — only the 0.1-em threshold join lets the scorer match
    // anything (the blind join's split soup scores skillsMatch 0 at the
    // floor 5)
    expect((created?.skillsMatch ?? 0) > 0).toBe(true);
    expect((created?.aiScore ?? 0) > 5).toBe(true); // above the floor the split soup scores

    if (created) {
      await page.request.delete(`/api/candidates?id=${encodeURIComponent(created.id)}`);
    }
  });
});
