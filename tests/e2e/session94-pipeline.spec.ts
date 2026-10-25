import { expect, test } from "@playwright/test";

// Session 94 — the with-data applicant-pipeline round (the r93 seed made every
// with-data surface readable for the first time; this round walked them
// cross-side against the live REF with its identical three-job tenant).
//
//   R94-A the careers org view's heading block — the REF wraps the org h2 in
//         a `flex items-center gap-4` wrapper and carries the
//         `Explore career opportunities` subtitle under it (live-captured at
//         /Careers?org=demo: <div class="flex items-center gap-4"><div>
//         <h2 class="text-3xl font-bold text-slate-900">Demo</h2>
//         <p class="text-slate-600">Explore career opportunities</p></div></div>).
//   R94-B the CAPITALIZED route pushes — the REF's careers chip click pushes
//         /Careers?org={slug}, the back button /Careers, and the card's
//         "View Details & Apply" /ExternalJobApplication?org={slug}&job={slug}
//         (the address bar carries the capitalized form; the platform serves
//         both casings). The clone pushes the same capitalized forms, with
//         next.config.ts rewrites serving the lowercase filesystem routes
//         URL-unchanged (the R51-A /Dashboard precedent).
//   R94-C (probe-side, no E2E) the verify-r49 zero-externaljobapplication
//         member reclassification — the REF's page makes NO jobs fetch (the
//         static zero state; the REF-inert class with payrollengine/
//         payrollmodule) while the clone's working superset renders the
//         seeded active job.

test.describe("session 94 — the with-data applicant-pipeline contracts", () => {
  async function postJob(page: import("@playwright/test").Page) {
    const post = await page.request.post("/api/jobs", {
      data: {
        title: "Senior Test Engineer",
        company: "Acme Rockets",
        department: "Engineering",
        location: "Remote",
        type: "full_time",
        status: "active",
        salaryRange: "12000-15000",
      },
    });
    const json = await post.json();
    expect(json.ok).toBe(true);
    return (json.data?.job?.id ?? json.data?.id) as string | undefined;
  }

  test("R94-A: the org view's heading block — the wrapper + the Explore career opportunities subtitle", async ({ page }) => {
    const jobId = await postJob(page);
    try {
      await page.goto("/careers");
      await page.getByRole("button", { name: "Acme Rockets", exact: true }).click();
      await expect(page).toHaveURL(/\/Careers\?org=acme-rockets$/);

      // the h2 + the subtitle ride inside the REF's flex wrapper structure
      const heading = page.getByRole("heading", { name: "Acme Rockets", level: 2 });
      await expect(heading).toBeVisible();
      const structure = await heading.evaluate((el) => {
        const p = el.parentElement!; // the inner div
        const w = p.parentElement!; // the flex items-center gap-4 wrapper
        return {
          wrapperCls: w.className,
          subtitleText: p.querySelector("p")?.textContent ?? null,
          subtitleCls: p.querySelector("p")?.className ?? null,
        };
      });
      expect(structure.wrapperCls).toContain("flex");
      expect(structure.wrapperCls).toContain("items-center");
      expect(structure.wrapperCls).toContain("gap-4");
      expect(structure.subtitleText).toBe("Explore career opportunities");
      expect(structure.subtitleCls).toContain("text-slate-600");
    } finally {
      if (jobId) await page.request.delete(`/api/jobs?id=${jobId}`);
    }
  });

  test("R94-B1: the back button pushes the CAPITALIZED /Careers", async ({ page }) => {
    const jobId = await postJob(page);
    try {
      await page.goto("/careers");
      await page.getByRole("button", { name: "Acme Rockets", exact: true }).click();
      await expect(page).toHaveURL(/\/Careers\?org=acme-rockets$/);
      await page.getByRole("button", { name: /Back to all companies/i }).click();
      await expect(page).toHaveURL(/\/Careers$/);
      await expect(page.getByRole("heading", { name: "Browse by Company" })).toBeVisible();
    } finally {
      if (jobId) await page.request.delete(`/api/jobs?id=${jobId}`);
    }
  });

  test("R94-B2: the apply CTA pushes the CAPITALIZED /ExternalJobApplication and the rewrite serves it", async ({ page }) => {
    const jobId = await postJob(page);
    try {
      await page.goto("/careers");
      await page.getByRole("button", { name: "View Details & Apply" }).first().click();
      await expect(page).toHaveURL(/\/ExternalJobApplication\?org=acme-rockets&job=senior-test-engineer$/);
      // the rewrite serves the page (URL-unchanged) — the heading + the
      // param-resolved job render
      await expect(page.getByRole("heading", { name: "Job Opportunities" })).toBeVisible();
      await expect(page.getByText("Senior Test Engineer").first()).toBeVisible();
    } finally {
      if (jobId) await page.request.delete(`/api/jobs?id=${jobId}`);
    }
  });

  test("R94-B3: direct entry on the CAPITALIZED routes renders (the rewrite path)", async ({ page }) => {
    await page.goto("/Careers");
    await expect(page.getByRole("heading", { name: "Find Your Dream Job" })).toBeVisible();
    expect(page.url()).toContain("/Careers");

    await page.goto("/ExternalJobApplication");
    await expect(page.getByRole("heading", { name: "Job Opportunities" })).toBeVisible();
    expect(page.url()).toContain("/ExternalJobApplication");
  });
});
