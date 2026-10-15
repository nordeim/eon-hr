import { expect, test } from "@playwright/test";

/**
 * Session 43 (parity round 42) — the login redeploy re-audit: the input
 * base migration + the ring token + the w-full column structure.
 *
 * REF redeployed BOTH login chunks (JS + CSS). The rendered surface stayed
 * byte-identical on both viewport bands — the redeploy changed the
 * AUTHORED recipes: the login build's input component adopted the
 * ring-2/offset-2 base with the ring-ring TOKEN (the round-39 two-build
 * split counters shadow-none/transition-none retired), the Sign in ring
 * switched to the token over a login-scoped zinc-950 --ring, the w-full
 * column flattened to three direct children (social group / divider /
 * form), and the field wrapper adopted space-y-1.5 with the explicit
 * mt-1.5 kept (the trap-6 v4 restoration).
 */
test.describe("session-43 login redeploy (logged out)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the login inputs carry REF's new-base DOM string — ring-ring in base, the plain-focus slate-400 member, NO shadow/transition members", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();

    const inputs = await page.evaluate(() => {
      const email = document.querySelector('input[type="email"]')!;
      const password = document.querySelector('input[type="password"]')!;
      return { email: email.className, password: password.className };
    });
    // the verbatim content contract (member presence; order may reorder
    // under tailwind-merge — content is the contract)
    for (const [name, cls] of Object.entries(inputs)) {
      expect(cls, `${name} carries the ring token member`).toContain("focus-visible:ring-ring");
      expect(cls, `${name} carries the ring-2/offset-2 family`).toContain("focus-visible:ring-2");
      expect(cls, `${name} carries the offset member`).toContain("focus-visible:ring-offset-2");
      expect(cls, `${name} carries the plain-focus slate-400 ring`).toContain("focus:ring-slate-400");
      expect(cls, `${name} carries the slate-400 border pair`).toContain("focus:border-slate-400");
      expect(cls, `${name} carries the responsive height pair`).toContain("h-11");
      expect(cls, `${name} carries the sm height`).toContain("sm:h-12");
      expect(cls, `${name} carries the placeholder member`).toContain("placeholder:text-slate-600");
      // the retired round-39 split counters — REF's new base ships neither
      expect(cls, `${name} has NO shadow member`).not.toContain("shadow-none");
      expect(cls, `${name} has NO shadow-sm at rest`).not.toContain("shadow-sm");
      expect(cls, `${name} has NO transition member`).not.toContain("transition-none");
      expect(cls, `${name} has NO transition-colors`).not.toContain("transition-colors");
    }
  });

  test("the Sign in ring renders the login-scoped zinc-950 under real keyboard focus (the token resolves [--ring:#09090b])", async ({ page }) => {
    await page.goto("/login");
    const email = page.locator('input[type="email"]');
    await email.click();
    // Tab from the email input reaches password → Sign in
    await page.keyboard.press("Tab"); // password
    await page.keyboard.press("Tab"); // Sign in
    // the button's transition-all duration-200 (the R38-E1 motion pin)
    // transitions the ring box-shadow in — wait past the 200ms window
    await page.waitForTimeout(350);
    const ring = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find(
        (b) => (b.textContent || "").trim() === "Sign in"
      );
      if (!btn || btn !== document.activeElement) return { focused: false };
      const cs = getComputedStyle(btn);
      return { focused: true, shadow: cs.boxShadow, cls: btn.className };
    });
    expect(ring.focused).toBe(true);
    // the ring-ring member + the 2px #09090b ring under the offset white
    expect(ring.cls).toContain("focus-visible:ring-ring");
    expect(ring.shadow).toContain("rgb(9, 9, 11)");
    expect(ring.shadow).toContain("rgb(255, 255, 255)");
  });

  test("the w-full column has THREE direct children — the social space-y-3 group, the my-6 divider, the form", async ({ page }) => {
    await page.goto("/login");
    const column = await page.evaluate(() => {
      const form = document.querySelector("form")!;
      const wcol = form.parentElement!;
      const kids = [...wcol.children].map((c) => ({
        tag: c.tagName,
        cls: (c.className || "").slice(0, 40),
      }));
      return { wcolCls: wcol.className, kids };
    });
    expect(column.wcolCls).toBe("w-full");
    expect(column.kids).toHaveLength(3);
    expect(column.kids[0].cls).toContain("space-y-3");
    expect(column.kids[1].cls).toContain("relative my-6");
    expect(column.kids[2].tag).toBe("FORM");
  });

  test("the field wrappers carry space-y-1.5 with the relative mt-1.5 inner (the trap-6 pair)", async ({ page }) => {
    await page.goto("/login");
    const fields = await page.evaluate(() => {
      const inputs = [...document.querySelectorAll("input[type=\"email\"], input[type=\"password\"]")];
      return inputs.map((i) => {
        const rel = i.parentElement!;
        const field = rel.parentElement!;
        return { fieldCls: field.className, relCls: rel.className };
      });
    });
    expect(fields).toHaveLength(2);
    for (const f of fields) {
      expect(f.fieldCls).toContain("space-y-1.5");
      expect(f.relCls).toContain("relative");
      expect(f.relCls).toContain("mt-1.5");
    }
  });

  test("the mobile responsive pair still holds — 44px/16px inputs at 390×844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/login");
    const input = await page.evaluate(() => {
      const el = document.querySelector('input[type="email"]')!;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { h: Math.round(r.height), fs: cs.fontSize };
    });
    expect(input.h).toBe(44);
    expect(input.fs).toBe("16px");
  });
});
