import { expect, test, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import path from "node:path";

// Session 58 — the CTA-fill recipe family (R58-1..23). The r58 census
// (scripts/r58-fills-final.mjs, all 50 routes, paired live) found the
// clone rendering its blue gradient at nearly every primary action
// where REF maintains five distinct fills: the DARK solid (bg-primary
// #171717), the BLUE-600 solid, the INDIGO-600 solid, the TEAL-600
// solid, plus two one-off gradients (the REVERSED indigo→blue on
// recruitment, purple→pink on expenses) — and the P1 assets bg-none
// authoring that rendered NO fill at all. The switch/checkbox checked
// fills resolved --color-primary (the Facebook blue) where REF renders
// the dark neutral. These pins hold the fixes with COMPUTED truth.
//
// R58-22's regression guard: the with-data deletion round-trip — a user
// whose employee holds an assigned asset, a reviewer duty, and a survey
// response (the three non-cascade relations the old walk missed, the
// P2003 repro) deletes cleanly through the Danger Zone.

const DARK = "rgb(23, 23, 23)";
const BLUE600 = "rgb(37, 99, 235)";
const INDIGO600 = "rgb(79, 70, 229)";
const TEAL600 = "rgb(13, 148, 136)";

async function readFill(page: Page, name: string, exact = true) {
  const btn = page.getByRole("button", { name, exact }).first();
  return btn.evaluate((b) => {
    const cs = getComputedStyle(b);
    const r = b.getBoundingClientRect();
    return {
      bg: cs.backgroundColor,
      img: cs.backgroundImage.includes("gradient") ? cs.backgroundImage : "none",
      h: Math.round(r.height),
      w: Math.round(r.width),
    };
  });
}

test.describe("session-58 CTA-fill recipe family (computed truth)", () => {
  test("R58-1..5: the DARK-solid sites — wall Post, profile saves, loans empty CTA, tenantsetup, securitysettings", async ({ page }) => {
    // the wall's Post
    await page.goto("/companywall");
    expect((await readFill(page, "Post")).bg).toBe(DARK);
    // the profile's four saves (General tab default: Save Changes)
    await page.goto("/profile");
    expect((await readFill(page, "Save Changes")).bg).toBe(DARK);
    await page.getByRole("tab", { name: "Security" }).click();
    expect((await readFill(page, "Update Password")).bg).toBe(DARK);
    // the loans empty-state CTA (the SECOND New Loan Request — the
    // header keeps REF's gradient; wait for the empty state to settle)
    await page.goto("/loans");
    await expect(page.getByText("No loans yet")).toBeVisible();
    const loans = await page.getByRole("button", { name: "New Loan Request", exact: true }).all();
    expect(loans.length).toBe(2);
    const emptyFill = await loans[1].evaluate((b) => getComputedStyle(b).backgroundColor);
    expect(emptyFill).toBe(DARK);
    const headerFill = await loans[0].evaluate((b) => (getComputedStyle(b).backgroundImage || "").includes("gradient"));
    expect(headerFill).toBe(true);
    // tenantsetup Continue
    await page.goto("/tenantsetup");
    expect((await readFill(page, "Continue")).bg).toBe(DARK);
    // securitysettings Save + REF's Lock glyph
    await page.goto("/securitysettings");
    const saveFill = await readFill(page, "Save Security Settings");
    expect(saveFill.bg).toBe(DARK);
    expect(saveFill.w).toBe(222);
    await expect(page.locator("main button svg.lucide-lock").first()).toHaveClass(/h-4 w-4 mr-2/);
  });

  test("R58-6: the hrassistant send is the DARK solid at the default size (48x36, icon-only)", async ({ page }) => {
    await page.goto("/hrassistant");
    const send = page.locator("main button").filter({ has: page.locator("svg.lucide-send") }).first();
    const fill = await send.evaluate((b) => {
      const cs = getComputedStyle(b);
      const r = b.getBoundingClientRect();
      return { bg: cs.backgroundColor, img: cs.backgroundImage, h: Math.round(r.height), w: Math.round(r.width) };
    });
    expect(fill.bg).toBe(DARK);
    expect(fill.img).toBe("none");
    expect(fill.h).toBe(36);
    expect(fill.w).toBe(48);
  });

  test("R58-7: the employees view-toggle pair — the dark+sm recipe with the outline-width asymmetry", async ({ page }) => {
    await page.goto("/employees");
    const readToggles = () =>
      page.evaluate(() => {
        const btns = [...document.querySelectorAll("main button")].filter((b) => {
          const s = (b.querySelector("svg") || {}).className?.baseVal || "";
          return s.includes("grid3x3") || s.includes("lucide-list");
        });
        return btns.map((b) => {
          const cs = getComputedStyle(b);
          const r = b.getBoundingClientRect();
          return {
            svg: (b.querySelector("svg") as SVGElement).className.baseVal.includes("grid3x3") ? "GRID" : "LIST",
            bg: cs.backgroundColor,
            h: Math.round(r.height),
            w: Math.round(r.width),
            fs: cs.fontSize,
          };
        });
      });
    // list is the default active state: dark 40px, the outline grid 42px;
    // REF renders LIST FIRST (left), GRID second — re-measured live (the
    // session-14 "Grid first" order flipped in a deploy)
    let toggles = await readToggles();
    expect(toggles).toEqual([
      { svg: "LIST", bg: DARK, h: 32, w: 40, fs: "12px" },
      { svg: "GRID", bg: "rgb(255, 255, 255)", h: 32, w: 42, fs: "12px" },
    ]);
    // the round-trip: grid becomes the active dark one (move the mouse
    // away first — playwright's click parks it on the button and the
    // hover state serializes the /90 color-mix as lab()/oklab(), not rgb)
    await page.getByRole("button", { name: "Grid view" }).click();
    await page.mouse.move(5, 5);
    await page.waitForTimeout(250);
    toggles = await readToggles();
    expect(toggles).toEqual([
      { svg: "LIST", bg: "rgb(255, 255, 255)", h: 32, w: 42, fs: "12px" },
      { svg: "GRID", bg: DARK, h: 32, w: 40, fs: "12px" },
    ]);
  });

  test("R58-8..12: the BLUE-600 sites — staffrequests, documenttracker, workflowconfigpage x2, recruitmentkanban, notificationpreferences", async ({ page }) => {
    await page.goto("/staffrequests");
    expect((await readFill(page, "New Request")).bg).toBe(BLUE600);
    expect((await readFill(page, "Submit your first request")).bg).toBe(DARK);
    await page.goto("/documenttracker");
    expect((await readFill(page, "Add Document")).bg).toBe(BLUE600);
    await page.goto("/workflowconfigpage");
    expect((await readFill(page, "New Workflow")).bg).toBe(BLUE600);
    expect((await readFill(page, "Create First Workflow")).bg).toBe(BLUE600);
    await page.goto("/recruitmentkanban");
    expect((await readFill(page, "Add Applicant")).bg).toBe(BLUE600);
    await page.goto("/notificationpreferences");
    expect((await readFill(page, "Save Preferences")).bg).toBe(BLUE600);
  });

  test("R58-13..15: the INDIGO-600 and TEAL-600 sites", async ({ page }) => {
    await page.goto("/evaluations");
    const review = await readFill(page, "New Review");
    expect(review.bg).toBe(INDIGO600);
    expect(review.h).toBe(32);
    const reviewFs = await page.getByRole("button", { name: "New Review" }).evaluate((b) => getComputedStyle(b).fontSize);
    expect(reviewFs).toBe("12px");
    await page.goto("/performancemanagement");
    expect((await readFill(page, "Set New Goal")).bg).toBe(INDIGO600);
    await page.goto("/surveyanalytics");
    expect((await readFill(page, "Run AI Analysis")).bg).toBe(TEAL600);
  });

  test("R58-16..18: the gradient one-offs — recruitment REVERSED, expenses purple→pink, assets green (the bg-none fix)", async ({ page }) => {
    await page.goto("/recruitment");
    const jobImg = await readFill(page, "Post New Job");
    expect(jobImg.img).toContain("rgb(79, 70, 229)");
    expect(jobImg.img.indexOf("rgb(79, 70, 229)")).toBeLessThan(jobImg.img.indexOf("rgb(37, 99, 235)"));
    await page.goto("/expenses");
    const expImg = await readFill(page, "New Expense");
    expect(expImg.img).toContain("rgb(147, 51, 234)");
    expect(expImg.img.indexOf("rgb(147, 51, 234)")).toBeLessThan(expImg.img.indexOf("rgb(219, 39, 119)"));
    // the P1 fix: the assets Add Asset renders the green gradient (the
    // bg-none authoring rendered backgroundImage: none — near-white text
    // on a fully transparent button)
    await page.goto("/assets");
    const asset = await readFill(page, "Add Asset");
    expect(asset.img).toContain("rgb(22, 163, 74)");
    expect(asset.img).toContain("rgb(5, 150, 105)");
    expect(asset.img).not.toBe("none");
  });

  test("R58-19..20: the switch + checkbox checked fills render the dark neutral (not the Facebook blue)", async ({ page }) => {
    await page.goto("/notificationpreferences");
    // the switches render after the prefs fetch
    await expect(page.locator("main [role=switch]").first()).toBeVisible({ timeout: 15000 });
    const switches = await page.locator("main [role=switch]").all();
    expect(switches.length).toBeGreaterThanOrEqual(6);
    for (const sw of switches) {
      expect(await sw.evaluate((s) => getComputedStyle(s).backgroundColor)).toBe(DARK);
    }
    await page.goto("/securitysettings");
    const checked = await page.locator("main [role=checkbox][aria-checked=true]").all();
    // the settings defaults: audit logging, encryption, backups, GDPR on;
    // 2FA off (the fifth, unchecked)
    expect(checked.length).toBe(4);
    for (const cb of checked) {
      expect(await cb.evaluate((c) => getComputedStyle(c).backgroundColor)).toBe(DARK);
    }
  });

  test("R58-21: the interviewassistant Analyze Interview is the w-full green CTA", async ({ page }) => {
    await page.goto("/interviewassistant");
    const btn = page.getByRole("button", { name: "Analyze Interview" });
    // the button is w-full: it spans the card body's inner width
    // (whatever the viewport — REF measured 498 at 1440, the card body
    // inner width; the E2E viewport is narrower)
    const fill = await btn.evaluate((b) => {
      const cs = getComputedStyle(b);
      const r = b.getBoundingClientRect();
      const body = b.closest("[class*=p-6]");
      const br = body ? body.getBoundingClientRect() : null;
      const bcs = body ? getComputedStyle(body) : null;
      return {
        img: cs.backgroundImage,
        w: Math.round(r.width),
        bodyInnerW: br && bcs ? Math.round(br.width - parseFloat(bcs.paddingLeft) - parseFloat(bcs.paddingRight)) : null,
      };
    });
    expect(fill.img).toContain("rgb(22, 163, 74)");
    expect(fill.w).toBe(fill.bodyInnerW);
  });

  test("R58-23: the posts multipart path enforces the content cap", async ({ page }) => {
    const res = await page.request.post("/api/posts", {
      multipart: { content: "x".repeat(2500), audience: "all" },
    });
    expect(res.status()).toBe(400);
    const json = (await res.json()) as { ok: boolean; error?: { code: string } };
    expect(json.ok).toBe(false);
    expect(json.error?.code).toBe("VALIDATION");
  });

  test("R58-22: the with-data deletion round-trip — the P2003 regression guard", async ({ browser }) => {
    // a fresh user whose employee row holds ALL THREE of the relations
    // the old walk missed (an assigned asset, a reviewer duty, a survey
    // response) — the pre-fix DELETE failed with P2003 here.
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    const email = `e2e-fill-delete-${Date.now()}@eon-hr.test`;
    await page.request.post("/api/auth/signup", {
      data: { name: "E2E Fill Delete", email, password: "Superset123!", confirmPassword: "Superset123!" },
    });
    // the dependent rows, created directly in the isolated e2e db
    const db = new PrismaClient({ datasources: { db: { url: `file:${path.resolve("db", "e2e.db")}` } } });
    const user = await db.user.findUnique({ where: { email } });
    expect(user).not.toBeNull();
    const employee = await db.employee.create({
      data: {
        employeeId: `E2E-${Date.now().toString(36).toUpperCase()}`,
        firstName: "Fill",
        lastName: "Delete",
        email: `emp-${email}`,
        employmentStatus: "active",
        employmentType: "full_time",
        startDate: new Date(),
        baseSalary: 0,
        userId: user!.id,
      },
    });
    await db.asset.create({ data: { name: "E2E Fill Laptop", assignedToId: employee.id, status: "assigned" } });
    const cycle = await db.reviewCycle.create({ data: { name: "E2E Fill Cycle", status: "active" } });
    const other = await db.employee.findFirst({ where: { email: { not: `emp-${email}` } } });
    await db.review.create({
      data: { cycleId: cycle.id, employeeId: other!.id, reviewerId: employee.id, status: "not_started" },
    });
    const survey = await db.survey.create({ data: { title: "E2E Fill Survey", status: "active" } });
    await db.surveyResponse.create({ data: { surveyId: survey.id, employeeId: employee.id } });
    await db.$disconnect();

    // sign in and delete through the Danger Zone
    await page.goto("/login");
    await page.fill('input[type=email]', email);
    await page.fill('input[type=password]', "Superset123!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
    await page.goto("/profile");
    await page.getByRole("tab", { name: "Preferences" }).click();
    await page.getByRole("button", { name: "Delete My Account" }).click();
    const dlg = page.getByRole("dialog");
    await dlg.locator("#delete-confirm").fill("DELETE");
    await dlg.getByRole("button", { name: "Delete Account", exact: true }).click();
    // the deletion SUCCEEDS despite the three relations — lands on /login
    await page.waitForURL((u) => u.pathname.startsWith("/login"), { timeout: 20000 });
    const me = await page.request.get("/api/auth/me");
    const meJson = (await me.json()) as { ok: boolean; data?: { user?: unknown } };
    expect(meJson.data?.user ?? null).toBeNull();
    // the asset is back in the pool (detached, not deleted)
    const db2 = new PrismaClient({ datasources: { db: { url: `file:${path.resolve("db", "e2e.db")}` } } });
    const asset = await db2.asset.findFirst({ where: { name: "E2E Fill Laptop" } });
    expect(asset?.assignedToId).toBeNull();
    await db2.asset.deleteMany({ where: { name: "E2E Fill Laptop" } });
    await db2.reviewCycle.deleteMany({ where: { name: "E2E Fill Cycle" } });
    await db2.survey.deleteMany({ where: { title: "E2E Fill Survey" } });
    await db2.$disconnect();
    await ctx.close();
  });
});
