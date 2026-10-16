import { expect, test } from "@playwright/test";

/**
 * Session 47 (parity round 46) — the zero-state app-page interiors.
 *
 * 45 rounds censused the h1s (the route sweep) but never the page
 * INTERIORS at zero data. The round's census ran REF against a
 * ZERO-TENANT scratch server (schema + the demo user only — mirroring
 * REF's 0-employee tenant) and mapped: the page-root families (the
 * relative overflow-hidden > touch-pan-y trio on seven pages +
 * attendance's nested form; the v3 bg-gradient-to-br forms with the
 * dark: pairs; the bare staffrequests wrapper), the payroll/recruitment
 * stat rows ABSENT at zero, the CardTitle as a DIV, the dashboard's
 * DEFAULT leave-balances UI (Annual 21/21 + Sick 30/30 — not an empty
 * state), the profile's hidden avatar input + the full_name/email/
 * phone/job_title id family, and the training zero-state without a
 * create button.
 */
test.describe("session-47 zero-state interiors", () => {
  /* R46-B1/B2 CORRECTED: the stats render at zero on REF too — the
     round's first census read missed them (REF's values + labels are
     DIVs, invisible to the P-based outline). These tests pin the
     corrected contracts: the zero-state stat rows render with the DIV
     value family. */
  test("payroll renders its stat row at zero records — with DIV values (REF's family, the census correction)", async ({ page }) => {
    await page.goto("/payroll");
    await expect(page.getByRole("heading", { name: "No payroll records" })).toBeVisible();
    const statZone = page.locator("div[class*=md\\:grid-cols-4]").first();
    await expect(page.getByText("Total This Month")).toBeVisible();
    const tags = await statZone.evaluate((zone) => {
      const card = zone.children[0] as HTMLElement;
      const value = card.querySelector("[class*=text-3xl]");
      const label = [...card.querySelectorAll("div")].filter((d) => /text-sm/.test(d.className)).pop();
      return { valueTag: value?.tagName, labelTag: label?.tagName };
    });
    expect(tags.valueTag).toBe("DIV");
    expect(tags.labelTag).toBe("DIV");
  });

  test("recruitment renders its stat row at zero data — with DIV values + slate-500 labels (the census correction)", async ({ page }) => {
    await page.goto("/recruitment");
    await expect(page.getByRole("heading", { name: "Recruitment" })).toBeVisible();
    const statZone = page.locator("div[class*=md\\:grid-cols-4]").first();
    await expect(page.getByText("Active Jobs")).toBeVisible();
    const tags = await statZone.evaluate((zone) => {
      const card = zone.children[0] as HTMLElement;
      const value = card.querySelector("[class*=text-2xl]");
      const label = [...card.querySelectorAll("div")].filter((d) => /text-sm/.test(d.className)).pop();
      return { valueTag: value?.tagName, labelTag: label?.tagName, labelCls: label?.className };
    });
    expect(tags.valueTag).toBe("DIV");
    expect(tags.labelTag).toBe("DIV");
    expect(tags.labelCls).toBe("text-sm text-slate-500");
  });

  test("the payroll page renders REF's trio root + the v3 gradient (relative overflow-hidden > touch-pan-y > the from-green-50 gradient)", async ({ page }) => {
    await page.goto("/payroll");
    await expect(page.getByRole("heading", { name: "Payroll", exact: true }).first()).toBeVisible();
    const root = await page.evaluate(() => {
      const main = document.querySelector("main");
      const scroller = main?.querySelector("div.overflow-auto, div.overflow-y-auto") || main;
      const first = scroller?.children[0] as HTMLElement | undefined;
      const panY = first?.querySelector("div[class*=touch-pan-y]") as HTMLElement | undefined;
      const content = panY?.querySelector("div[class*=min-h-screen]") as HTMLElement | undefined;
      return {
        firstCls: first?.className ?? null,
        panY: panY?.className ?? null,
        contentCls: content?.className ?? null,
      };
    });
    expect(root.firstCls).toBe("relative overflow-hidden");
    expect(root.panY).toBe("touch-pan-y");
    expect(root.contentCls).toBe("min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8");
  });

  test("attendance keeps the gradient root first and NESTS the trio (the only measured page that nests)", async ({ page }) => {
    await page.goto("/attendance");
    await expect(page.getByRole("heading", { name: "Staff Attendance" })).toBeVisible();
    const root = await page.evaluate(() => {
      const main = document.querySelector("main");
      const scroller = main?.querySelector("div.overflow-auto, div.overflow-y-auto") || main;
      const first = scroller?.children[0] as HTMLElement | undefined;
      const panY = first?.querySelector("div[class*=touch-pan-y]") as HTMLElement | undefined;
      const content = panY?.querySelector("div[class*=max-w-7xl]") as HTMLElement | undefined;
      return {
        firstCls: first?.className ?? null,
        panY: panY?.className ?? null,
        contentCls: content?.className ?? null,
      };
    });
    expect(root.firstCls).toBe("min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8");
    expect(root.panY).toBe("touch-pan-y");
    expect(root.contentCls).toBe("max-w-7xl mx-auto space-y-8");
  });

  test("CardTitle renders as a DIV (no h3 card titles on the dashboard)", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    const census = await page.evaluate(() => {
      const main = document.querySelector("main");
      const h3s = main ? main.querySelectorAll("h3").length : -1;
      const titles = main
        ? [...main.querySelectorAll("div")].filter((d) =>
            /^font-semibold tracking-tight text-base$/.test(d.className),
          ).map((d) => d.textContent?.trim())
        : [];
      return { h3s, titles };
    });
    expect(census.h3s).toBe(0);
    expect(census.titles).toEqual([
      "Quick Actions",
      "My Leave Balances",
      "My Recent Requests",
      "My Expense Claims",
    ]);
  });

  test("the zero-tenant dashboard renders the DEFAULT leave-balances UI (Annual 21/21 blue + Sick 30/30 green — via the signup superset's employee-less user)", async ({ page }) => {
    // The e2e seed's demo user HAS balances — the default UI needs a
    // user with NO employee record. The r45 signup superset creates
    // exactly that (auto-login → the dashboard).
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign up" }).click();
    const stamp = Date.now();
    await page.getByLabel("Email", { exact: true }).fill(`e2e-zerodash-${stamp}@eon-hr.test`);
    await page.getByLabel("Password", { exact: true }).fill("Superset123!");
    await page.getByLabel("Confirm Password").fill("Superset123!");
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL("**/dashboard");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

    const rows = await page.evaluate(() => {
      const card = [...document.querySelectorAll("div")].find((d) =>
        /My Leave Balances/.test(d.textContent || "") && /rounded-xl/.test(d.className),
      );
      if (!card) return null;
      return [...card.querySelectorAll("div[class*=justify-between]")].flatMap((r) =>
        [...r.querySelectorAll("span")].map((s) => s.textContent?.trim()),
      );
    });
    expect(rows).toEqual(["Annual Leave", "21 / 21 days", "Sick Leave", "30 / 30 days"]);
  });

  test("the profile renders the hidden avatar input + REF's id family (full_name/email/phone/job_title)", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Profile Settings" })).toBeVisible();
    const avatar = page.locator('input[type=file]#avatar');
    await expect(avatar).toBeAttached();
    await expect(avatar).toBeHidden();
    await expect(page.locator('input#full_name')).toHaveCount(1);
    await expect(page.locator('input#email')).toHaveCount(1);
    await expect(page.locator('input#phone')).toHaveCount(1);
    await expect(page.locator('input#job_title')).toHaveCount(1);
    await expect(page.locator("input[id^=pf-]")).toHaveCount(0);
    await expect(page.getByText("audited for security")).toHaveCount(0);
  });

  test("training's zero-state renders message only (no create button)", async ({ page }) => {
    await page.goto("/training");
    await expect(page.getByText("No training platforms available")).toBeVisible();
    await expect(page.getByRole("button", { name: "New Platform" })).toHaveCount(0);
  });
});
