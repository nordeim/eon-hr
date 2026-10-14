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
    await expect(page.getByRole("img", { name: "Eon HR logo" })).toBeVisible();
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

  test("login fields use the reference geometry (session 4)", async ({ page }) => {
    await page.goto("/login");
    // Reference (live-measured): h-12 inputs, rounded-xl (12px), slate-200
    // border, slate-50/50 fill, icon inset at 40px; h-12 slate-900 action.
    const email = page.getByLabel("Email");
    await expect(email).toHaveCSS("height", "48px");
    await expect(email).toHaveCSS("border-radius", "12px");
    await expect(email).toHaveCSS("border-top-color", "rgb(226, 232, 240)");
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toHaveCSS(
      "height",
      "48px"
    );
  });

  test("invalid credentials show an actionable error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    /* Round 33 (R33-G): REF's error surface is the shadcn Alert —
       [data-slot=alert] replaced the round-4-era hand-rolled P. */
    await expect(page.locator("[data-slot=alert]")).toContainText(/invalid email or password/i);
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("login re-audit (session 39 — the login redeploy)", () => {
  /* REF's /login static JS chunk changed (index-CneaUv24.js →
     index-BYE5Ojxh.js) — the login page re-audited end to end, at
     1440×900 AND (for the first time) 390×844. */

  test("desktop: REF's recipes — placeholder slate-600, typed-text zinc-950, main root, social family, or-chip", async ({ page }) => {
    await page.goto("/login");
    const email = page.getByLabel("Email");
    await expect(email).toHaveCSS("height", "48px");
    await expect(email).toHaveCSS("font-size", "14px");
    // R38-C: the login build's zinc-950 foreground (NOT the app's neutral-950)
    await expect(email).toHaveCSS("color", "rgb(9, 9, 11)");
    // R38-B: the placeholder slate-600 (NOT the base's muted slate-500)
    const ph = await email.evaluate((el) => getComputedStyle(el, "::placeholder").color);
    expect(ph).toBe("rgb(71, 85, 105)");
    // R38-G: the canvas root is REF's MAIN element
    await expect(page.locator("main.min-h-screen")).toBeVisible();
    // R38-F (session-40 amendment): the social family — NO type attr
    // (the latest redeploy dropped it; inert outside the form either
    // way), the -ml-4 icon wrapper (the 8px left cluster shift), the
    // span label
    const google = page.getByRole("button", { name: "Continue with Google" });
    expect(await google.getAttribute("type")).toBeNull();
    await expect(google.locator("div.transition-transform.-ml-4")).toBeAttached();
    await expect(google.locator("span", { hasText: "Continue with Google" })).toBeAttached();
    // R38-K: the or-chip rides REF's white chip in slate-500
    const orChip = page.locator("span.bg-white.px-3");
    await expect(orChip).toHaveCSS("color", "rgb(100, 116, 139)");
    // R38-J2: the Sign up span is slate-700
    await expect(page.locator("span.font-medium.text-slate-700")).toHaveCSS("color", "rgb(51, 65, 85)");
    // R38-L: the logo glow layer + the span circle
    await expect(page.locator("div.relative.group > div.absolute.inset-0.blur-xl")).toBeAttached();
    await expect(page.locator("span.ring-4.ring-white\\/50 > img")).toBeAttached();
  });

  test("mobile 390x844: REF's responsive login — 44px inputs at 16px, stacked links, the spacer scroll", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/login");
    const email = page.getByLabel("Email");
    // R38-A: the responsive heights + fonts (44px / 16px at mobile)
    await expect(email).toHaveCSS("height", "44px");
    await expect(email).toHaveCSS("font-size", "16px");
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toHaveCSS("height", "44px");
    // R38-J: the links row STACKS at mobile (the clone's flat row wrapped
    // both links to two lines — 118+176=294 filling the row, h=40 each)
    const row = page.locator("div.flex.flex-col.sm\\:flex-row");
    await expect(row).toBeVisible();
    const forgot = page.getByRole("button", { name: "Forgot password?" });
    const need = page.getByRole("button", { name: "Need an account? Sign up" });
    const fb = await forgot.boundingBox();
    const nb = await need.boundingBox();
    expect(fb).not.toBeNull();
    expect(nb).not.toBeNull();
    expect(Math.round(fb!.height)).toBe(20);
    expect(Math.round(nb!.height)).toBe(20);
    expect(Math.round(nb!.y - fb!.y)).toBeGreaterThanOrEqual(24);
    // R38-D: the sm:hidden spacer scrolls the mobile page past the viewport
    // (REF: body scrollHeight 862 vs the 844 viewport) and pins the card
    // to the canvas top (y=16 — the p-4 edge)
    const sh = await page.evaluate(() => document.body.scrollHeight);
    expect(sh).toBeGreaterThan(844);
    const card = page.locator("main .max-w-md .rounded-2xl");
    const cb = await card.boundingBox();
    expect(cb).not.toBeNull();
    expect(Math.round(cb!.y)).toBe(16);
  });
});
