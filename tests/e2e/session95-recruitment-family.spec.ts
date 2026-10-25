import { expect, test } from "@playwright/test";

// Session 95 — the with-data recruitment-family round (the r95 queue: the
// recruitmentkanban pipeline + the job detail surfaces against the live REF
// with the seeded three-job tenant on both sides).
//
//   R95-A the AI CV Upload tab REBUILT to the REF's contract (live-captured
//         this round): a single STACKED column — (1) the "Select Job
//         Position" label + the w-96 combobox (placeholder "Choose a job
//         posting...", options "{title} — {dept}" for ALL jobs incl.
//         drafts, NO default selection); (2) the CONDITIONAL dropzone — with
//         no job selected the DISABLED form (slate-300 dashes +
//         "Select a job position above to start uploading CVs"), with a job
//         selected the ACTIVE indigo form ("Upload Candidate CV" +
//         "PDF, DOC, DOCX — AI will parse & score automatically" + the
//         hidden .pdf/.doc/.docx input). The clone's file-parse superset is
//         preserved: uploading a file creates the candidate and renders the
//         analysis result below (the REF's post-upload surface is unreadable
//         — its creation paths are the documented 403-broken class).
//
//   Also verified live this round (no E2E needed — the REF-side readings):
//   the kanban combobox (REF renders ONLY "All Jobs" with its own 3-job
//   tenant — the REF-broken class), the REF's Add Applicant submit (fails
//   with "App state check failed: 403"), the Upload CV button on job cards
//   (INERT on the REF — zero mutations), and interviewassistant (AT PARITY).

test.describe("session 95 — the AI CV Upload tab (R95-A)", () => {
  test("A1: the at-rest contract — the label + the placeholder select + the DISABLED dropzone", async ({ page }) => {
    await page.goto("/recruitment");
    await page.getByRole("tab", { name: "AI CV Upload" }).click();

    const panel = page.getByRole("tabpanel");
    await expect(panel.getByLabel("Select Job Position")).toBeVisible();

    // the REF's placeholder (NOT a default selection — verified 3x on fresh loads)
    const combo = panel.getByRole("combobox");
    await expect(combo).toHaveText(/Choose a job posting\.\.\./);

    // the disabled dropzone: the slate dashes + the message, NO file input
    await expect(panel.getByText("Select a job position above to start uploading CVs")).toBeVisible();
    await expect(panel.locator("input[type=file]")).toHaveCount(0);
  });

  test("A2: the job options carry the {title} — {dept} em-dash format (all three seeded jobs)", async ({ page }) => {
    await page.goto("/recruitment");
    await page.getByRole("tab", { name: "AI CV Upload" }).click();

    await page.getByRole("combobox").click();
    // Radix portals the listbox to the body — the options live OUTSIDE the
    // tabpanel's DOM (the documented portal pattern; query at page level)
    await expect(page.getByRole("option", { name: "System Admin — IT" })).toBeVisible();
    await expect(page.getByRole("option", { name: "HR Director — HR" })).toBeVisible();
    await expect(page.getByRole("option", { name: "HR Manager — HR" })).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("A3: the state transition — selecting a job swaps in the ACTIVE indigo dropzone + the file input", async ({ page }) => {
    await page.goto("/recruitment");
    await page.getByRole("tab", { name: "AI CV Upload" }).click();

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "System Admin — IT" }).click();
    const panel = page.getByRole("tabpanel");
    await expect(panel.getByText("Upload Candidate CV")).toBeVisible();
    await expect(panel.getByText("PDF, DOC, DOCX — AI will parse & score automatically")).toBeVisible();
    const input = panel.locator("input[type=file]");
    await expect(input).toHaveCount(1);
    await expect(input).toHaveAttribute("accept", ".pdf,.doc,.docx");
  });

  test("A4: the superset flow — uploading a file creates the candidate and renders the analysis result", async ({ page }) => {
    await page.goto("/recruitment");
    await page.getByRole("tab", { name: "AI CV Upload" }).click();

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "System Admin — IT" }).click();

    // the file-driven superset: the name derives from the filename, the text
    // from the file, the analysis renders below the dropzone.
    await page.locator("input[type=file]").setInputFiles({
      name: "jane-doe-cv.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(
        "Senior HR systems specialist with HRIS, GOSI, Qiwa, payroll, onboarding, and compliance experience."
      ),
    });

    const panel = page.getByRole("tabpanel");
    await expect(panel.getByText("jane doe cv")).toBeVisible({ timeout: 10_000 });
    await expect(panel.getByText(/AI score/i)).toBeVisible();

    // the result persists as a candidate on the pipeline (the working
    // superset the REF's broken creation path cannot do)
    const list = await page.request.get("/api/candidates");
    const json = (await list.json()) as {
      ok: boolean;
      data?: { candidates?: { id: string; name: string }[] };
    };
    expect(json.ok).toBe(true);
    expect(json.data?.candidates?.some((c) => c.name === "jane doe cv")).toBe(true);

    // cleanup — keep the e2e tenant pristine for the other specs
    const created = json.data?.candidates?.find((c) => c.name === "jane doe cv");
    if (created) {
      await page.request.delete(`/api/candidates?id=${encodeURIComponent(created.id)}`);
    }
  });

  test("A5: the R93-H deep-link — the job card's Upload CV lands on the tab with the job preselected", async ({ page }) => {
    await page.goto("/recruitment");
    await page.getByRole("tab", { name: "Job Postings" }).click();

    await page.getByRole("button", { name: "Upload CV" }).first().click();
    const panel = page.getByRole("tabpanel");
    await expect(panel.getByText("Upload Candidate CV")).toBeVisible({ timeout: 5_000 });
    await expect(panel.getByRole("combobox")).toHaveText(/— (HR|IT)$/);
  });
});
