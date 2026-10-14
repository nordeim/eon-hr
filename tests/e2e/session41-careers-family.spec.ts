import { expect, test } from "@playwright/test";

/**
 * Session-41 / parity round 40 — the careers family + the login button.
 *
 * Covers the round's fronts end to end:
 *  1. the zero-card family (the briefcase icon, the card-carried centered
 *     padding, the state-dependent message),
 *  2. the wrapper rhythm + the count row (the between-aligned flex
 *     wrapper),
 *  3. the with-data job card (the Open badge, the company line, the
 *     four-row meta stack incl. the salary, the three-line clamp, the
 *     full-width apply CTA),
 *  4. the apply flow (the CTA routes to the external application page
 *     with the org + job slugs; the page resolves them — the superset —
 *     and renders its zero-state when they match nothing),
 *  5. the login Sign in button's base members (DOM class parity).
 */

test.describe("session-41 careers family (authed)", () => {
  test("the empty board renders the icon-over-line zero card — the briefcase + the recovery line + the card-carried padding", async ({ page }) => {
    await page.goto("/careers");
    await expect(page.getByRole("heading", { name: "Find Your Dream Job" })).toBeVisible();

    await expect(page.getByRole("heading", { name: "No Open Positions", exact: true })).toBeVisible();
    await expect(page.getByText("Check back later for new opportunities!")).toBeVisible();

    const card = await page.evaluate(() => {
      const card = [...document.querySelectorAll("div")].find(
        (d) => d.className.includes("text-center") && d.className.includes("py-12") && d.querySelector("h3")
      )!;
      const svg = card.querySelector("svg")!;
      const cs = getComputedStyle(card);
      return {
        cls: card.className,
        padTop: cs.paddingTop,
        textAlign: cs.textAlign,
        border: cs.borderTopColor,
        iconW: Math.round(svg.getBoundingClientRect().width),
        iconCls: svg.getAttribute("class"),
        h3mb: getComputedStyle(card.querySelector("h3")!).marginBottom,
      };
    });
    // the card: the centered tall padding rides on the card itself; the
    // default border (the neutral gray, not slate-200); the shadow from
    // the Card base
    expect(card.cls).toBe("rounded-xl border bg-card text-card-foreground shadow text-center py-12");
    expect(card.padTop).toBe("48px");
    expect(card.textAlign).toBe("center");
    expect(card.border).toBe("rgb(229, 229, 229)");
    // the briefcase: 64px, self-centered, the tight bottom gap
    expect(card.iconW).toBe(64);
    expect(card.iconCls).toContain("w-16 h-16 text-slate-300 mx-auto mb-4");
    expect(card.h3mb).toBe("8px");
  });

  test("the board content wrapper carries the tall rhythm; the count row is the between-aligned flex wrapper", async ({ page }) => {
    await page.goto("/careers");
    await expect(page.getByRole("heading", { name: "0 Open Positions" })).toBeVisible();

    const board = await page.evaluate(() => {
      const content = [...document.querySelectorAll("div")].find(
        (d) => d.className === "max-w-6xl mx-auto px-4 py-12"
      );
      const row = [...document.querySelectorAll("div")].find(
        (d) => d.className === "mb-4 flex items-center justify-between"
      );
      return {
        contentCls: content ? content.className : null,
        rowCls: row ? row.className : null,
        rowH3: row ? row.querySelector("h3")?.textContent : null,
      };
    });
    expect(board.contentCls).toBe("max-w-6xl mx-auto px-4 py-12");
    expect(board.rowCls).toBe("mb-4 flex items-center justify-between");
    expect(board.rowH3).toBe("0 Open Positions");
  });

  test("the seeded job card renders REF's with-data contract — the badge, the company line, the four-row meta stack, the clamp, the full-width CTA", async ({ page }) => {
    const longDescription =
      "We are looking for a detail-oriented and technology-forward engineer to join our growing platform team. " +
      "You will own critical infrastructure, mentor peers, and shape the engineering culture. ".repeat(4);
    const post = await page.request.post("/api/jobs", {
      data: {
        title: "Senior Test Engineer",
        company: "Acme Rockets",
        department: "Engineering",
        location: "Jeddah",
        type: "full_time",
        status: "open",
        salaryRange: "12000-15000",
        description: longDescription,
      },
    });
    const json = await post.json();
    expect(json.ok).toBe(true);
    const jobId = json.data?.job?.id ?? json.data?.id;

    try {
      await page.goto("/careers");
      await expect(page.getByRole("heading", { name: "1 Open Position" })).toBeVisible();

      const card = await page.evaluate(() => {
        const grid = [...document.querySelectorAll("div")].find(
          (d) => d.className.includes("grid-cols") && d.children.length > 0
        )!;
        const card = grid.children[0] as HTMLElement;
        const badge = card.querySelector("div.rounded-md.border") as HTMLElement;
        const title = card.querySelector(".text-xl.font-semibold") as HTMLElement;
        const company = card.querySelector("p.text-sm.text-slate-600") as HTMLElement;
        const metaRows = [...card.querySelectorAll(".space-y-2 > div")].map((r) => r.textContent!.trim());
        const desc = card.querySelector("p.line-clamp-3") as HTMLElement;
        const btn = [...card.querySelectorAll("button")].pop() as HTMLButtonElement;
        return {
          cardCls: card.className,
          badgeCls: badge.className,
          badgeText: badge.textContent,
          titleText: title.textContent,
          companyText: company.textContent,
          metaRows,
          clamp: getComputedStyle(desc).webkitLineClamp,
          descMb: getComputedStyle(desc).marginBottom,
          btnText: btn.textContent,
          btnW: Math.round(btn.getBoundingClientRect().width),
          cardW: Math.round(card.getBoundingClientRect().width),
        };
      });
      expect(card.cardCls).toBe("rounded-xl border bg-card text-card-foreground shadow hover:shadow-lg transition-shadow");
      expect(card.badgeText).toBe("Open");
      expect(card.badgeCls).toContain("bg-green-100 text-green-700");
      expect(card.badgeCls).toContain("rounded-md border px-2.5 py-0.5 text-xs font-semibold");
      expect(card.titleText).toBe("Senior Test Engineer");
      expect(card.companyText).toBe("Acme Rockets");
      expect(card.metaRows).toEqual(["Engineering", "Jeddah", "full time", "12000-15000"]);
      expect(card.clamp).toBe("3");
      expect(card.descMb).toBe("16px");
      expect(card.btnText).toBe("View Details & Apply");
      // the CTA spans the card's inner width
      expect(card.btnW).toBe(card.cardW - 2 - 48);
    } finally {
      if (jobId) await page.request.delete(`/api/jobs?id=${jobId}`);
    }
  });

  test("the apply CTA routes to the external page with the org + job slugs and the page resolves them (the superset)", async ({ page }) => {
    const post = await page.request.post("/api/jobs", {
      data: { title: "Senior Test Engineer", company: "Acme Rockets", department: "Engineering", location: "Remote", type: "full_time", status: "open" },
    });
    const json = await post.json();
    const jobId = json.data?.job?.id ?? json.data?.id;

    try {
      await page.goto("/careers");
      await page.getByRole("button", { name: "View Details & Apply" }).click();
      await expect(page).toHaveURL(/\/externaljobapplication\?org=acme-rockets&job=senior-test-engineer$/);
      await expect(page.getByRole("heading", { name: "Job Opportunities" })).toBeVisible();
      // the superset: the page lists the param-resolved job
      await expect(page.getByText("Senior Test Engineer").first()).toBeVisible();

      // unresolvable params render the zero-state (REF-parity)
      await page.goto("/externaljobapplication?org=nowhere&job=nothing");
      await expect(page.getByRole("heading", { name: "No Open Positions", exact: true })).toBeVisible();
      await expect(page.getByText(/We don't have any open positions at the moment/)).toBeVisible();
    } finally {
      if (jobId) await page.request.delete(`/api/jobs?id=${jobId}`);
    }
  });

  test("the search-filtered zero renders its own message", async ({ page }) => {
    const post = await page.request.post("/api/jobs", {
      data: { title: "Senior Test Engineer", company: "Acme Rockets", type: "full_time", status: "open" },
    });
    const json = await post.json();
    const jobId = json.data?.job?.id ?? json.data?.id;

    try {
      await page.goto("/careers");
      const input = page.getByPlaceholder("Search jobs by title, department, or location...");
      await input.fill("zzzzqqqqxxxx");
      await expect(page.getByRole("heading", { name: "0 Open Positions" })).toBeVisible();
      await expect(page.getByText("No jobs match your search. Try different keywords.")).toBeVisible();
      await expect(page.getByText("Check back later for new opportunities!")).toHaveCount(0);
    } finally {
      if (jobId) await page.request.delete(`/api/jobs?id=${jobId}`);
    }
  });
});

test.describe("session-41 login button members (logged out)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the Sign in button carries the login build's base members (the ring-offset background + the svg guards)", async ({ page }) => {
    await page.goto("/login");
    const btn = page.getByRole("button", { name: "Sign in", exact: true });
    await expect(btn).toBeVisible();

    const cls = await btn.evaluate((el) => el.className);
    expect(cls).toContain("ring-offset-background");
    expect(cls).toContain("[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0");
    expect(cls).toContain("focus-visible:ring-[#09090b]");
    // the rendered recipe is unchanged: 48px at desktop, the slate block
    const box = await btn.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { h: Math.round(r.height), bg: getComputedStyle(el).backgroundColor };
    });
    expect(box.h).toBe(48);
    expect(box.bg).toBe("rgb(15, 23, 42)");
  });
});
