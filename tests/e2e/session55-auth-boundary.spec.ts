import { expect, test } from "@playwright/test";

// Session 55 — the auth-boundary navigation family (R55-A..E). The r55
// census (scripts/r55-census.mjs) paired the URL-level user journey at
// the session boundary live on both apps and found 6 DIFFs (1/7 MATCH):
// REF's post-login landing is the ROOT `/` (which serves the dashboard
// URL-unchanged — its index route maps to the dashboard page), its
// logged-out guard carries the REQUESTED absolute URL as from_url, its
// logout carries the CURRENT page as from_url, and the from_url
// round-trip returns the user to the page they asked for. The clone
// landed at /dashboard, hardcoded the guard's param, dropped the logout
// context, and only honored path-form params. These pins hold the fix.
//
// Logged-out contexts opt out of the shared storageState (the auth.spec
// pattern); the authed phases keep it.
test.describe("session-55 auth-boundary (logged-out phases)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("(A) the post-login landing is the ROOT — URL `/` with the dashboard content", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
    await page.getByLabel("Password").fill("$Abcd1234");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    // REF's landing (census phase A): the URL stays at the root while the
    // dashboard content renders (the root rewrite serves it in place)
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /Welcome back,/ })).toBeVisible();
    await expect(page.getByText("Quick Actions", { exact: true })).toBeVisible();
  });

  test("(C) the deep-link round-trip: logged-out /settings → sign in → back to /settings", async ({ page }) => {
    await page.goto("/settings");
    // the proxy carries the REQUESTED absolute URL as from_url (REF's format)
    await expect(page).toHaveURL(/\/login\?from_url=http%3A%2F%2Flocalhost%3A3100%2Fsettings/);
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();
    await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
    await page.getByLabel("Password").fill("$Abcd1234");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    // the round-trip returns the user to the guarded page (census phase E)
    await expect(page).toHaveURL(/\/settings$/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  });

  test("(E) the open-redirect guard: a foreign from_url is ignored — the ROOT takes over", async ({ page }) => {
    await page.goto("/login?from_url=https%3A%2F%2Fevil.example.com%2Fphish");
    await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
    await page.getByLabel("Password").fill("$Abcd1234");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    // the resolver rejects foreign origins (and // and /\ forms — the unit
    // table): the default root lands, NEVER the attacker's target
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
    await expect(page).not.toHaveURL(/evil\.example\.com/);
    await expect(page.getByRole("heading", { name: /Welcome back,/ })).toBeVisible();
  });
});

test.describe("session-55 auth-boundary (authed phases)", () => {
  test("(B) the root serves the dashboard URL-unchanged (the rewrite, not a redirect)", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: /Welcome back,/ })).toBeVisible();
    await expect(page.getByText("Quick Actions", { exact: true })).toBeVisible();
    await expect(page.getByText("My Leave Balances", { exact: true })).toBeVisible();
    await expect(page).toHaveTitle("Eon HR");
  });

  test("(D) the logout walk carries the current page as from_url", async ({ page }) => {
    await page.goto("/settings");
    const trigger = page.getByRole("button", { name: /sepnetflix2023/ }).first();
    await trigger.click();
    await page.getByRole("menuitem", { name: "Logout" }).click();
    // REF's logout (census phase F): the login URL carries the page the
    // user was on, so the next sign-in returns them there
    await expect(page).toHaveURL(/\/login\?from_url=http%3A%2F%2Flocalhost%3A3100%2Fsettings/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();
  });

  test("(G) authed /login stays renderable (REF has no redirect-away guard)", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });
});
