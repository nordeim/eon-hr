import { expect, test } from "@playwright/test";

/**
 * Session 46 (parity round 45) — the hidden view-swapped login flows.
 *
 * REF's login card swaps its ENTIRE content when the sign-in action
 * buttons are clicked (the logo, welcome title, social row, and
 * or-divider all unmount) — two flows 44 rounds never censused:
 *
 * 1. The password-reset flow — "Forgot password?" swaps to the back
 *    button + "Reset your password" title + one-field form; the submit
 *    swaps to "Sending..." then the "Check your email" success view (the
 *    icon circle + the GREEN Alert + the submitted email span), with
 *    ANTI-ENUMERATION (a non-existent email renders the identical view).
 * 2. The sign-up flow — "Sign up" swaps to "Create your account" + the
 *    three-field form; the duplicate-email error renders REF's verbatim
 *    copy "A user with this email already exists"; both CTAs carry the
 *    r44 loading family (the text swap + the mr-2 spinner + disabled).
 */
test.describe("session-46 hidden login flows (logged out)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the Forgot password button swaps the card to the reset view (the logo/title/social unmount; the back button returns)", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();

    await page.getByRole("button", { name: "Forgot password?" }).click();

    // the sign-in surface is gone entirely
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Continue with Google" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toHaveCount(0);

    // the reset view's strings + fields
    await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
    await expect(page.getByText("Enter your email and we'll send you a link to reset your password")).toBeVisible();
    const email = page.locator("form input[type=email]");
    await expect(email).toHaveAttribute("placeholder", "you@example.com");
    await expect(page.getByRole("button", { name: "Send reset link" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Back to sign in" })).toBeVisible();

    // the field icon sits at the LIGHTER slate-400 (the sign-in pair is slate-500)
    const icon = await page.evaluate(() => {
      const svg = document.querySelector("form svg")!;
      return { cls: svg.getAttribute("class") || "", color: getComputedStyle(svg).color };
    });
    expect(icon.cls).toBe("lucide lucide-mail absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400");
    expect(icon.color).toBe("rgb(148, 163, 184)");

    // the sibling input family: the 44px height pair (not the sign-in's 48px)
    const h = await page.evaluate(() => Math.round(document.querySelector("form input")!.getBoundingClientRect().height));
    expect(h).toBe(44);

    // the back button returns the sign-in view
    await page.getByRole("button", { name: "Back to sign in" }).click();
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();
  });

  test("the reset submit renders the success view for a NON-EXISTENT email (anti-enumeration) with the green Alert + the email span", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();

    await page.getByRole("button", { name: "Forgot password?" }).click();
    await page.locator("form input[type=email]").fill("never-exists-probe@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();

    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    await expect(page.getByText("We've sent password reset instructions to")).toBeVisible();
    await expect(page.getByText("never-exists-probe@example.com")).toBeVisible();

    const alert = await page.evaluate(() => {
      const a = document.querySelector("[role=alert]")!;
      const cs = getComputedStyle(a);
      const inner = a.querySelector("div")!;
      return { cls: a.className, bg: cs.backgroundColor, borderColor: cs.borderColor, innerCls: inner.className, txt: (a.textContent || "").trim() };
    });
    expect(alert.txt).toBe("Please check your email for the password reset link. It may take a few minutes to arrive.");
    expect(alert.bg).toMatch(/^rgba\(240, 253, 244, 0\.7\)$|^lab\(/);
    // the sorted set (tw-merge orders the members base-first on the clone —
    // the documented serialization split, same set as REF)
    expect(alert.innerCls.split(" ").sort().join(" ")).toBe("[&_p]:leading-relaxed text-green-700 text-sm");

    // the icon circle + the bottom back button
    const circle = await page.evaluate(() => {
      const c = document.querySelector(".rounded-full")!;
      const svg = c.querySelector("svg")!;
      return { cls: c.className, svgCls: svg.getAttribute("class") };
    });
    expect(circle.cls).toBe("mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center");
    expect(circle.svgCls).toBe("lucide lucide-mail h-7 w-7 sm:h-8 sm:w-8 text-slate-700");

    await page.getByRole("button", { name: "Back to sign in" }).click();
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();
  });

  test("the Sign up button swaps the card to the three-field registration view (no subtitle; the back button returns)", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();

    await page.getByRole("button", { name: "Need an account? Sign up" }).click();

    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
    // NO subtitle under the signup H2 (REF renders none)
    await expect(page.locator("h2 + p")).toHaveCount(0);

    await expect(page.getByLabel("Email")).toHaveAttribute("placeholder", "you@example.com");
    await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("placeholder", "Min. 8 characters");
    await expect(page.getByLabel("Confirm Password")).toHaveAttribute("placeholder", "Re-enter password");
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();

    // all three inputs render the 44px sibling height
    const hs = await page.evaluate(() =>
      [...document.querySelectorAll("form input")].map((i) => Math.round(i.getBoundingClientRect().height))
    );
    expect(hs).toEqual([44, 44, 44]);

    await page.getByRole("button", { name: "Back to sign in" }).click();
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();
  });

  test("the duplicate-email error renders REF's verbatim copy inside the signup form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();

    await page.getByRole("button", { name: "Need an account? Sign up" }).click();
    await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
    await page.getByLabel("Password", { exact: true }).fill("SomePassword1!");
    await page.getByLabel("Confirm Password").fill("SomePassword1!");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("A user with this email already exists")).toBeVisible();

    const alert = await page.evaluate(() => {
      const a = document.querySelector("[role=alert]")!;
      const form = a.closest("form")!;
      const cta = [...form.querySelectorAll("button")].pop()!;
      return {
        txt: (a.textContent || "").trim(),
        insideForm: Boolean(form),
        // the alert sits BETWEEN the fields group and the CTA
        alertBeforeCta: Boolean(cta.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING),
        innerCls: a.querySelector("div")!.className,
      };
    });
    expect(alert.txt).toBe("A user with this email already exists");
    expect(alert.insideForm).toBe(true);
    expect(alert.alertBeforeCta).toBe(true);
    expect(alert.innerCls.split(" ").sort().join(" ")).toBe("[&_p]:leading-relaxed text-red-700 text-sm");
  });

  test("the reset CTA swaps to Sending... + the mr-2 spinner while the API is held open", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();
    await page.getByRole("button", { name: "Forgot password?" }).click();

    let release: (() => void) | null = null;
    await page.route("**/api/auth/forgot-password", async (route) => {
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, data: { acknowledged: true } }),
      });
    });

    await page.locator("form input[type=email]").fill("loading-probe@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText("Sending...")).toBeVisible();

    const loading = await page.evaluate(() => {
      const b = [...document.querySelectorAll("form button")].find((x) => (x.textContent || "").includes("Sending")) as HTMLButtonElement;
      const svg = b.querySelector("svg");
      return { disabled: b.disabled, spinCls: svg?.getAttribute("class") || null };
    });
    expect(loading.disabled).toBe(true);
    expect(loading.spinCls).toBe("lucide lucide-loader-circle mr-2 h-4 w-4 animate-spin");

    release!();
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible({ timeout: 10_000 });
  });

  test("the signup CTA swaps to Creating account... + the spinner while the API is held open", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();
    await page.getByRole("button", { name: "Need an account? Sign up" }).click();

    let release: (() => void) | null = null;
    await page.route("**/api/auth/signup", async (route) => {
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, error: { code: "CONFLICT", message: "A user with this email already exists" } }),
      });
    });

    await page.getByLabel("Email").fill("loading-probe@example.com");
    await page.getByLabel("Password", { exact: true }).fill("SomePassword1!");
    await page.getByLabel("Confirm Password").fill("SomePassword1!");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Creating account...")).toBeVisible();

    const loading = await page.evaluate(() => {
      const b = [...document.querySelectorAll("form button")].find((x) => (x.textContent || "").includes("Creating")) as HTMLButtonElement;
      const svg = b.querySelector("svg");
      return { disabled: b.disabled, spinCls: svg?.getAttribute("class") || null };
    });
    expect(loading.disabled).toBe(true);
    expect(loading.spinCls).toBe("lucide lucide-loader-circle mr-2 h-4 w-4 animate-spin");

    release!();
    await expect(page.getByText("A user with this email already exists")).toBeVisible({ timeout: 10_000 });
  });
});
