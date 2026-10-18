import { expect, test } from "@playwright/test";

// Session 56 — the read-only surface family (R56-A..D) + the history
// one-click contract (R56-E). The r56 census (scripts/r56-census.mjs,
// phases H/I/J) paired REF's read-only recipe live on both apps and
// found the clone rendering four surfaces plain: the settings Company
// Information tiles (REF: p-4 bg-slate-50 rounded-lg + the Address
// tile's UNPREFIXED col-span-2 that forces the 2-track implicit grid
// below md), the profile identity Email (REF: disabled + bg-slate-50),
// the profile Phone/Job Title placeholders (REF: none), and the
// hrreports thead row (REF: border-b bg-slate-50, inert — no hover
// tint). These pins hold the fixes with COMPUTED truth (the r52
// method: assert the cascade result, not the class-list bytes).
//
// R56-E pins the history stack's one-click back contract — the correct
// behavior that holds today. The TWO-click corruption after a fresh
// document load (back-back skips the loaded page) is a Next.js 16.4.0
// framework bug, root-caused this round with the Navigation API entry
// dumps (scripts/r56-probe8.mjs, 5/5 deterministic, generic across
// routes — the beforeFiles rewrite is innocent). It is documented in
// docs/remediation-plan-session56.md §B; this pin guards the contract
// that must never regress FURTHER, and the repro script stays the
// standing detector for the framework fix.

test.describe("session-56 read-only surface family (computed truth)", () => {
  test("R56-A: the settings Company tiles render REF's read-only recipe (bg + radius + the Address span map)", async ({ page }) => {
    await page.goto("/settings");
    // the card renders after the company fetch settles (the Loader2 gate)
    await expect(page.getByText("Company Information")).toBeVisible();
    const tiles = await page.evaluate(() => {
      const g = [...document.querySelectorAll("main div")].filter(
        (d) => /grid-cols/.test(String(d.className)),
      )[0] as HTMLElement | undefined;
      if (!g) return null;
      const first = g.children[0] as HTMLElement;
      const cs = getComputedStyle(first);
      return {
        bg: cs.backgroundColor,
        radius: cs.borderRadius,
        count: g.children.length,
        spans: [...g.children]
          .map((c) => (String((c as HTMLElement).className).includes("col-span-2") ? "SPAN" : "-"))
          .join(""),
      };
    });
    expect(tiles).not.toBeNull();
    // REF live-measured: rgb(248, 250, 252) + 8px on every tile
    expect(tiles!.bg).toBe("rgb(248, 250, 252)");
    expect(tiles!.radius).toBe("8px");
    expect(tiles!.count).toBe(9);
    // the 7th tile (Address) rides the always-on span; the rest don't
    expect(tiles!.spans).toBe("------SPAN--");
  });

  test("R56-A2: the settings Company grid computes 2 implicit tracks at 390px (the span's mechanism, REF-matched)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/settings");
    await expect(page.getByText("Company Information")).toBeVisible();
    const tracks = await page.evaluate(() => {
      const g = [...document.querySelectorAll("main div")].filter(
        (d) => /grid-cols/.test(String(d.className)),
      )[0] as HTMLElement | undefined;
      if (!g) return null;
      return getComputedStyle(g).gridTemplateColumns.split(" ").length;
    });
    // REF at 390: 2 content-sized tracks (the col-span-2 forces the
    // implicit grid) — not the single stacked column
    expect(tracks).toBe(2);
  });

  test("R56-B + C: the profile Email is the read-only identity field; Phone/Job Title carry no placeholders", async ({ page }) => {
    await page.goto("/profile");
    const fields = await page.evaluate(() => {
      const groups = [...document.querySelectorAll("main label")].map((l) => {
        const grp = l.parentElement as HTMLElement;
        const inp = grp.querySelector("input, textarea") as HTMLInputElement | null;
        return inp
          ? { label: l.textContent?.trim(), disabled: inp.disabled, bg: getComputedStyle(inp).backgroundColor, ph: inp.placeholder }
          : null;
      });
      return groups.filter(Boolean) as Array<{ label?: string; disabled: boolean; bg: string; ph: string }>;
    });
    const email = fields.find((f) => f.label === "Email");
    expect(email).toBeDefined();
    // REF live-measured: the identity email is disabled + slate-filled
    expect(email!.disabled).toBe(true);
    expect(email!.bg).toBe("rgb(248, 250, 252)");
    // REF renders both empty fields BARE — no authored placeholders
    const phone = fields.find((f) => f.label === "Phone");
    const jobTitle = fields.find((f) => f.label === "Job Title");
    expect(phone?.ph).toBe("");
    expect(jobTitle?.ph).toBe("");
  });

  test("R56-D: the hrreports thead row carries REF's slate header (computed bg, 33px)", async ({ page }) => {
    await page.goto("/hrreports");
    // the table renders after the records fetch settles (the Loader2 gate)
    await page.waitForSelector("main thead tr", { timeout: 15_000 });
    const thead = await page.evaluate(() => {
      const tr = document.querySelector("main thead tr") as HTMLElement | null;
      if (!tr) return null;
      const cs = getComputedStyle(tr);
      return { bg: cs.backgroundColor, h: Math.round(tr.getBoundingClientRect().height) };
    });
    expect(thead).not.toBeNull();
    // REF live-measured: rgb(248, 250, 252), the 33px pinned row height
    expect(thead!.bg).toBe("rgb(248, 250, 252)");
    expect(thead!.h).toBe(33);
  });

  test("R56-E: the one-click back contract — back after a fresh load + one client navigation returns to the loaded page", async ({ page }) => {
    // the correct contract (holds today; pinned so it never regresses
    // further). The TWO-click corruption — the fresh-loaded entry's URL
    // replaced by the below entry's duplicate on the second client
    // navigation — is the documented Next.js 16.4.0 framework bug
    // (remediation-plan-session56 §B); the repro script is the detector.
    await page.goto("/profile");
    await page.evaluate(() => {
      const a = [...document.querySelectorAll("[data-sidebar=menu-button]")]
        .filter((x) => x.tagName === "A" && /staff requests/i.test(x.textContent || ""))
        .find((x) => (x as HTMLElement).offsetParent !== null) as HTMLAnchorElement | undefined;
      a?.click();
    });
    await expect(page).toHaveURL(/\/staffrequests$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole("heading", { name: "Profile Settings" })).toBeVisible();
  });
});
