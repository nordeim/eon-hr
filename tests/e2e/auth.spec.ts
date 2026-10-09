import { expect, test } from "@playwright/test";

// Logged-out surface (see playwright.config.ts: this file opts out of the
// shared storageState so the auth guard actually redirects).
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("logged-out surface", () => {
  test("root redirects unauthenticated visitors to the login page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();
  });

  test("protected routes redirect to login with a from_url parameter", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?from_url=/);
  });

  test("login page renders the reference structure", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();
    await expect(page.getByText("Sign in to continue")).toBeVisible();
    await expect(page.getByRole("img", { name: "Eon HR" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with Microsoft" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with Apple" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeEnabled();
  });

  test("sign-in action uses the reference dark style with gray links", async ({ page }) => {
    await page.goto("/login");
    // Reference: slate-900 sign-in action (not brand blue), gray link colors.
    const signIn = page.getByRole("button", { name: "Sign in", exact: true });
    await expect(signIn).toHaveCSS("background-color", "rgb(15, 23, 42)");
    await expect(page.getByRole("button", { name: "Forgot password?" })).toHaveCSS(
      "color",
      "rgb(100, 116, 139)"
    );
    // Reference placeholder text
    await expect(page.getByLabel("Email")).toHaveAttribute("placeholder", "you@example.com");
  });

  test("invalid credentials show an actionable error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.locator("p[role='alert']")).toContainText(/invalid email or password/i);
    await expect(page).toHaveURL(/\/login/);
  });
});
