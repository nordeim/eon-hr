import { expect, test } from "@playwright/test";

/**
 * Session-40 / parity round 39 — the restructure + migration contracts.
 *
 * Covers the round's three fronts end to end:
 *  1. the login redeploy (social buttons dropped type; the login is
 *     THEME-INERT — darkMode armed, html.dark never applied),
 *  2. the app-shell restructure (the shadcn peer sidebar, the
 *     flex-1 overflow-auto scroll container, the header inside main),
 *  3. the input-family migration (ring-1 + shadow-sm at rest) and the
 *     careers org view (?org= state).
 */
const AUTHED = test.describe("session-40 shell + input + careers (authed)", () => {
  test("the shell restructure — the scroll container carries the page, the header sits inside main", async ({ page }) => {
    await page.goto("/employees");
    await expect(page.getByRole("heading", { name: "Employees", exact: true })).toBeVisible();

    const structure = await page.evaluate(() => {
      const main = document.querySelector("main")!;
      const header = main.querySelector("header");
      const scroller = [...main.children].find((c) => (c as HTMLElement).className.includes("overflow-auto"));
      return {
        headerInsideMain: !!header,
        headerFirst: main.firstElementChild === header,
        scrollerExists: !!scroller,
        scrollerCarriesH1: !!(scroller && scroller.querySelector("h1")),
        scrollerCls: scroller ? (scroller as HTMLElement).className : null,
      };
    });
    expect(structure.headerInsideMain).toBe(true);
    expect(structure.headerFirst).toBe(true);
    expect(structure.scrollerExists).toBe(true);
    expect(structure.scrollerCarriesH1).toBe(true);
    expect(structure.scrollerCls).toBe("flex-1 overflow-auto");
  });

  test("the peer sidebar — [data-sidebar=sidebar] paints inside the fixed panel at left", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();

    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await expect(sidebar).toBeVisible();
    const panel = await sidebar.evaluate((el) => {
      const p = el.parentElement!;
      const r = p.getBoundingClientRect();
      return {
        position: getComputedStyle(p).position,
        x: Math.round(r.x),
        w: Math.round(r.width),
        surface: getComputedStyle(el).backgroundColor,
      };
    });
    expect(panel.position).toBe("fixed");
    expect(panel.x).toBe(0);
    expect(panel.w).toBe(256);
    // the bg-sidebar token surface: #FAFAFA in light
    expect(panel.surface).toBe("rgb(250, 250, 250)");
  });

  test("the input family — the migrated base renders shadow-sm at rest and ring-1 on focus", async ({ page }) => {
    await page.goto("/loans");
    const trigger = page.getByRole("button", { name: /New Loan Request/i }).first();
    await expect(trigger).toBeVisible();
    await trigger.click();
    const dialog = page.locator("[role=dialog]");
    await expect(dialog).toBeVisible();

    const input = dialog.locator("input").first();
    await expect(input).toBeVisible();
    // at-rest: the v4 shadow-sm (rgba(0,0,0,0.05) 0 1px 2px) + transparent bg
    const atRest = await input.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { shadow: cs.boxShadow, bg: cs.backgroundColor, h: Math.round(el.getBoundingClientRect().height) };
    });
    expect(atRest.shadow).toContain("rgba(0, 0, 0, 0.05)");
    expect(atRest.bg).toBe("rgba(0, 0, 0, 0)");
    expect(atRest.h).toBe(36);
    // focus: ring-1 offset-0 (the ring token #0a0a0a)
    await input.focus();
    const focused = await input.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(focused).toContain("rgb(10, 10, 10) 0px 0px 0px 1px");
    await page.keyboard.press("Escape");
  });

  test("careers org view — chips navigate to ?org= with the org h2 + back button", async ({ page }) => {
    // seed one active job with a company (the chips' source since round 40).
    // Session 93 (R93-H): the REF's draft|active vocabulary + the seeded
    // System Admin (active, company "Company") — the board counts TWO.
    const post = await page.request.post("/api/jobs", {
      data: { title: "Senior Test Engineer", company: "Acme Rockets", department: "Engineering", location: "Remote", type: "full_time", status: "active", salaryRange: "12000-15000" },
    });
    const json = await post.json();
    expect(json.ok).toBe(true);
    const jobId = json.data?.job?.id ?? json.data?.id;

    try {
      await page.goto("/careers");
      const chip = page.getByRole("button", { name: "Acme Rockets", exact: true });
      await expect(chip).toBeVisible();
      // the count heading: the seeded System Admin + the posted job
      await expect(page.getByRole("heading", { name: "2 Open Positions" })).toBeVisible();

      await chip.click();
      await expect(page).toHaveURL(/\/careers\?org=acme-rockets$/);
      await expect(page.getByRole("heading", { name: "Acme Rockets", level: 2 })).toBeVisible();
      await expect(page.getByRole("button", { name: /Back to all companies/i })).toBeVisible();
      // the org's job card renders
      await expect(page.getByText("Senior Test Engineer").first()).toBeVisible();

      // back returns to the board
      await page.getByRole("button", { name: /Back to all companies/i }).click();
      await expect(page).toHaveURL(/\/careers$/);
      await expect(page.getByRole("heading", { name: "Browse by Company" })).toBeVisible();
    } finally {
      if (jobId) await page.request.delete(`/api/jobs?id=${jobId}`);
    }
  });

  test("tenantsetup mobile — the p-4 canvas insets the card (x=16 at 390)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/tenantsetup");
    // Session 48 (R47-B6): REF renders a DIV (not an h2) — getByText.
    await expect(page.getByText("Welcome to EonHR")).toBeVisible();

    const card = await page.evaluate(() => {
      const el = [...document.querySelectorAll("div")].find(
        (d) => d.className.includes("max-w-2xl") && d.getBoundingClientRect().width > 300
      )!;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), w: Math.round(r.width) };
    });
    expect(card.x).toBe(16);
    expect(card.w).toBe(358);
  });
});

// The login tests need the logged-out surface (the config injects the
// shared storageState at project level).
test.describe("session-40 login redeploy (logged out)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the social buttons carry NO type attribute (the redeploy's change)", async ({ page }) => {
    await page.goto("/login");
    const socials = page.locator("button", { hasText: /Continue with (Google|Microsoft|Apple)/ });
    await expect(socials).toHaveCount(3);
    const types = await socials.evaluateAll((els) => els.map((e) => (e as HTMLButtonElement).getAttribute("type")));
    expect(types).toEqual([null, null, null]);
  });

  test("the login is THEME-INERT — darkMode armed, html.dark never applied (REF's login build ships no theme boot)", async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => localStorage.setItem("darkMode", "true"));
    await page.reload();
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();

    const state = await page.evaluate(() => ({
      htmlDark: document.documentElement.classList.contains("dark"),
      stored: localStorage.getItem("darkMode"),
    }));
    expect(state.htmlDark).toBe(false);
    expect(state.stored).toBe("true");
    // cleanup for the shared browser context
    await page.evaluate(() => localStorage.setItem("darkMode", "false"));
  });
});
