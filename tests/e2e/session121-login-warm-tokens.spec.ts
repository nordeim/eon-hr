import { test, expect } from "@playwright/test";

/* Session 121 / parity round 120 — the 85th-deploy login warm-token family.

   The opening read's find: the REF's 85th deploy (login JS index-CKrafp-m →
   index-r0DWh4vL, CSS index-CapATpwD → index-xihcXjhm) RENDERED on the login
   surface — the first visual movement since the 69th deploy. The member-by-
   member delta audit (r105 baseline vs the fresh capture, diff bbox
   536-903 × 309-531 = the social row + the or-divider only):

   - the social-auth row moved from the cool slate family to warm neutrals:
     text slate-700 rgb(51,65,85) → #0F0E0E rgb(15,14,14)
     border slate-200 rgb(226,232,240) → #E9E6E0 rgb(233,230,224)
     hover bg slate-50 → #F1EEEA rgb(241,238,234)
     hover border slate-300 → #DDD8D2 rgb(221,216,210)
     hover shadow → the v3-pinned --shadow-sm geometry (verified live)
   - the or-chip text: slate-500 rgb(100,116,139) → #5D5D5D rgb(93,93,93)
   - EVERYTHING ELSE byte-stable: h1 slate-900, labels slate-700, the
     divider LINE slate-200, the email/password borders slate-200, the
     Sign-in bg slate-900, the forgot/signup links slate-400, the card.

   The app side QUIET (assets C-IrDy5f/BGNH4KkS — the r42 baseline holds).

   These specs pin the cured clone to the new REF truth; the fire-separation
   guards pin the UNCHANGED members so the cure cannot over-reach. */

test.describe("session-121 login warm-token family (the 85th deploy)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("R121-A: the social row's at-rest warm tokens (all three buttons)", async ({ page }) => {
    await page.goto("/login");
    const socials = page.locator("button", { hasText: /Continue with (Google|Microsoft|Apple)/ });
    await expect(socials).toHaveCount(3);
    const reads = await socials.evaluateAll((els) =>
      els.map((e) => {
        const cs = getComputedStyle(e as HTMLElement);
        return { color: cs.color, border: cs.borderTopColor, bg: cs.backgroundColor };
      })
    );
    // #0F0E0E text on #E9E6E0 borders — the warm family, all three buttons
    expect(reads.map((r) => r.color)).toEqual([
      "rgb(15, 14, 14)",
      "rgb(15, 14, 14)",
      "rgb(15, 14, 14)",
    ]);
    expect(reads.map((r) => r.border)).toEqual([
      "rgb(233, 230, 224)",
      "rgb(233, 230, 224)",
      "rgb(233, 230, 224)",
    ]);
    // the button fill stays white
    expect(reads.map((r) => r.bg)).toEqual([
      "rgb(255, 255, 255)",
      "rgb(255, 255, 255)",
      "rgb(255, 255, 255)",
    ]);
  });

  test("R121-B: the social hover — the warm bg/border pair + the v3 shadow-sm geometry", async ({ page }) => {
    await page.goto("/login");
    const google = page.getByRole("button", { name: "Continue with Google" });
    await google.hover();
    await expect.poll(async () => google.evaluate((e) => e.matches(":hover"))).toBe(true);
    // the button carries transition-all duration-200 — let the hover state
    // settle before reading the computed styles (a mid-transition read
    // catches the interpolating values)
    await page.waitForTimeout(350);
    const hover = await google.evaluate((e) => {
      const cs = getComputedStyle(e);
      return { bg: cs.backgroundColor, border: cs.borderTopColor, shadow: cs.boxShadow, color: cs.color };
    });
    // #F1EEEA fill + #DDD8D2 border + the REF-measured hover shadow
    expect(hover.bg).toBe("rgb(241, 238, 234)");
    expect(hover.border).toBe("rgb(221, 216, 210)");
    expect(hover.shadow).toContain("rgba(0, 0, 0, 0.05) 0px 1px 2px 0px");
    // the text color holds through hover
    expect(hover.color).toBe("rgb(15, 14, 14)");
  });

  test("R121-C: the or-chip's neutral gray (slate-500 retired by the 85th deploy; session-122 amendment — the chip's classes ride the island's sem vars now, the locator re-anchored off the retired bg-white form)", async ({ page }) => {
    await page.goto("/login");
    const orChip = page.getByText("or", { exact: true });
    await expect(orChip).toHaveCSS("color", "rgb(93, 93, 93)");
    // the chip's own geometry holds (12px / 500 — the session-39 recipe)
    await expect(orChip).toHaveCSS("font-size", "12px");
    await expect(orChip).toHaveCSS("font-weight", "500");
  });

  test("R121-D (fire-separation): the 85th deploy's UNCHANGED members stay at the standing values", async ({ page }) => {
    await page.goto("/login");
    // h1 slate-900 (outside the diff bbox — byte-stable)
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toHaveCSS("color", "rgb(15, 23, 42)");
    // the email input border stays slate-200 (NOT the social row's warm border)
    const email = page.getByLabel("Email");
    await expect(email).toHaveCSS("border-top-color", "rgb(226, 232, 240)");
    // the or-divider LINE stays slate-200 (only the chip text warmed)
    const line = page.locator("div[data-orientation='horizontal'][role='none'].h-\\[1px\\]");
    await expect(line).toHaveCSS("background-color", "rgb(226, 232, 240)");
    // the Sign-in button keeps the slate-900 fill
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toHaveCSS(
      "background-color",
      "rgb(15, 23, 42)"
    );
    // the forgot-password link stays slate-400
    await expect(page.getByRole("button", { name: "Forgot password?" })).toHaveCSS(
      "color",
      "rgb(100, 116, 139)"
    );
  });
});

/* Session 122 (D-122a — the login semi-island, the neo-crm s211 genus
   transfer): the platform's design-system island decoded live on the eon
   reference and mirrored construction-for-construction. These specs pin
   the LIVE surface: the island wrapper, the Wix Madefor Text webfont
   rendering the label spans (164.3px vs the system stack's 172.5 — the
   typeface itself), and the scoped exception (the h1/labels stay the
   system stack; the app's own surfaces stay zero-webfont). */

test.describe("session-122 login semi-island (the neo-crm s211 genus transfer)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("R122-A: the island wrapper + the webfont-rendered label spans", async ({ page }) => {
    await page.goto("/login");
    const google = page.getByRole("button", { name: "Continue with Google" });
    await expect(google).toBeVisible();
    const read = await google.evaluate((e) => {
      const span = e.querySelector("span") ?? e;
      const cs = getComputedStyle(span);
      const island = e.closest("[data-ds]");
      return {
        island: island ? island.getAttribute("data-ds") + "/" + island.getAttribute("data-theme") : null,
        fontFamily: cs.fontFamily,
        width: Math.round((span as HTMLElement).getBoundingClientRect().width * 10) / 10,
      };
    });
    // the island wrapper — the reference's exact construction
    expect(read.island).toBe("base44/light");
    // the island font renders the label span (the system stack measures
    // 172.5 at 16px; the Madefor stack ~164 — the typeface delta)
    expect(read.fontFamily).toContain("Wix Madefor Text");
    expect(read.width).toBeLessThan(168);
    expect(read.width).toBeGreaterThan(160);
  });

  test("R122-B: the island's scoped exception — the h1 and labels stay the system stack (the app's own surfaces stay zero-webfont)", async ({ page }) => {
    await page.goto("/login");
    const h1 = page.locator("h1");
    const label = page.locator("label").first();
    const h1Font = await h1.evaluate((e) => getComputedStyle(e).fontFamily);
    const labelFont = await label.evaluate((e) => getComputedStyle(e).fontFamily);
    expect(h1Font).not.toContain("Madefor");
    expect(labelFont).not.toContain("Madefor");
    // the woff2 is the ONE loaded font family on the page (the app's own
    // surfaces ride the system stack)
    const families = await page.evaluate(() =>
      [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family)
    );
    expect(families.filter((f) => f.includes("Madefor"))).toHaveLength(1);
    expect(families.every((f) => f.includes("Madefor") || f === "")).toBe(true);
  });
});
