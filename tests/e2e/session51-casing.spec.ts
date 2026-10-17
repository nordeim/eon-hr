import { expect, test } from "@playwright/test";

// Session 51 (R51-A) — the /Dashboard route-casing alias. REF's platform
// serves routes case-insensitively: its canonical dashboard URL is the
// CAPITAL /Dashboard (the target of its own /organizationsetup +
// /dynamicdashboard redirects) while its internal links use the lowercase
// form. The clone's Next.js serves only /dashboard — the capital form
// 404'd until the next.config.ts rewrite landed. These pins hold the
// rewrite: the capital URL serves the dashboard with the URL bar
// UNCHANGED (a rewrite, not a redirect) and the lowercase form keeps
// working.
test.describe("session-51 route casing", () => {
  test("/Dashboard (REF's canonical capital form) renders the dashboard — URL unchanged, plain title", async ({ page }) => {
    await page.goto("/Dashboard");
    // the rewrite serves in place — no client- or server-side redirect
    await expect(page).toHaveURL(/\/Dashboard$/);
    await expect(page.getByRole("heading", { name: /Welcome back,/ })).toBeVisible();
    await expect(page.getByText("Quick Actions", { exact: true })).toBeVisible();
    await expect(page.getByText("My Leave Balances", { exact: true })).toBeVisible();
    // the dashboard's plain title (no mechanical slug)
    await expect(page).toHaveTitle("Eon HR");
  });

  test("/dashboard (the internal-link form) keeps working — the regression guard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: /Welcome back,/ })).toBeVisible();
    await expect(page).toHaveTitle("Eon HR");
  });

  test("the alias rides the real route's auth guard — logged-out /Dashboard bounces to /login", async ({ page }) => {
    // rewrites map to the (app) route stack, so the layout's auth guard
    // applies to the capital form exactly as it does to the lowercase one
    await page.context().clearCookies();
    await page.goto("/Dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
