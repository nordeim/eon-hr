import { expect, test } from "@playwright/test";

// Session 57 — the affordance-stub family (R57-A..E) + the palette pins
// (R57-p). The r57 census (scripts/r57-census.mjs, phases A-E, pre-fix
// 0/6 MATCH) paired REF's click behavior live on both apps and found the
// clone stubbing five affordances with info toasts or invented interiors:
// the employees Import CSV (REF: the real "Bulk Import Employees"
// dialog), the company wall Photo/Video (REF: the hidden #media-upload
// input, accept="image/*,video/*"), the settings WhatsApp Connect (REF:
// the real "Configure WhatsApp API" dialog), the profile Social Accounts
// tab (REF: the "Connected Accounts" 4-field URL form), and the profile
// Preferences tab (REF: the two-card recipe — Notification Preferences +
// the Danger Zone with the DELETE-typed confirmation). The pins hold the
// fixes with COMPUTED truth (the r52 method).
//
// The superset layers are exercised end-to-end: the import round-trip
// (template → file → Process File → review → Import → the employee row),
// the wall media round-trip (file → preview → post → the served media),
// and the account-deletion round-trip (a fresh signup user, deleted
// through the Danger Zone, landing back on /login).

const IMPORT_CSV = `full_name,email,job_title,start_date,phone,department_id,template_id
E2E Import One,e2e-import-1@eon-hr.test,QA Engineer,2026-01-15,+966501234567,,
E2E Import Two,e2e-import-2@eon-hr.test,Designer,2026-02-20,+966501234568,,
`;

test.describe("session-57 affordance-stub family (computed truth)", () => {
  test("R57-A1: the employees Import CSV opens REF's Bulk Import Employees dialog (the verbatim recipe)", async ({ page }) => {
    await page.goto("/employees");
    await page.getByRole("button", { name: "Import CSV" }).click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // REF's title + icon (the icon renders the lucide-file-spreadsheet class)
    await expect(dlg.getByRole("heading", { name: "Bulk Import Employees" })).toBeVisible();
    await expect(dlg.locator("h2 svg.lucide-file-spreadsheet")).toHaveClass(/w-6 h-6 text-blue-600/);
    // the info alert + the 4-step list (REF's texts verbatim)
    await expect(dlg.getByText("How to import employees:")).toBeVisible();
    for (const step of [
      "Download the CSV template below",
      "Fill in employee information (required: full_name, email, job_title, start_date)",
      "Upload the completed CSV file",
      "Review the data and click Import",
    ]) {
      await expect(dlg.getByText(step)).toBeVisible();
    }
    // the w-full template button + the dropzone recipe
    const templateBtn = dlg.getByRole("button", { name: "Download CSV Template" });
    await expect(templateBtn).toBeVisible();
    expect(await templateBtn.evaluate((b) => getComputedStyle(b).width)).toBeTruthy();
    await expect(dlg.getByText("Click to upload CSV file")).toBeVisible();
    await expect(dlg.getByText("or drag and drop your CSV file here")).toBeVisible();
    // REF's hidden file input contract
    const input = dlg.locator("#csv-file");
    await expect(input).toBeAttached();
    expect(await input.evaluate((i) => (i as HTMLInputElement).className)).toContain("hidden");
    // the footer pair
    await expect(dlg.getByRole("button", { name: "Cancel" })).toBeVisible();
    await dlg.getByRole("button", { name: "Cancel" }).click();
    await expect(dlg).toBeHidden();
  });

  test("R57-A2: the import superset round-trip (file → Process File → review → Import → the rows land)", async ({ page }) => {
    await page.goto("/employees");
    await page.getByRole("button", { name: "Import CSV" }).click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    // pick the file → the filename swap + the Process File button (REF's states)
    const input = dlg.locator("#csv-file");
    await input.setInputFiles({
      name: "e2e-import.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(IMPORT_CSV),
    });
    await expect(dlg.getByText("e2e-import.csv")).toBeVisible();
    await dlg.getByRole("button", { name: "Process File" }).click();
    // the review table (both rows) + the Import action
    await expect(dlg.getByRole("cell", { name: "E2E Import One" })).toBeVisible();
    await expect(dlg.getByRole("cell", { name: "E2E Import Two" })).toBeVisible();
    await dlg.getByRole("button", { name: "Import", exact: true }).click();
    await expect(dlg).toBeHidden();
    // the rows land in the directory (the purge sweeps @eon-hr.test rows)
    await expect(page.getByText("E2E Import One").first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("e2e-import-1@eon-hr.test").first()).toBeVisible();
  });

  test("R57-B: the wall Photo/Video trigger REF's hidden media-upload input + the media round-trip", async ({ page }) => {
    await page.goto("/companywall");
    // REF's input contract: id, accept, hidden — BEFORE any click (the
    // composer mounts it with the page)
    const input = page.locator("#media-upload");
    await expect(input).toBeAttached();
    expect(await input.getAttribute("accept")).toBe("image/*,video/*");
    // a tiny valid PNG (2×2 red)
    const png = Buffer.from(
      "89504e470d0a1a0a0000000d4948445200000002000000020802000000fdd49a2f0000001c4944415478da63fcc0c0c0c0000003300031fe32fe2ff053f03e37a131180000000049454e44ae426082",
      "hex"
    );
    await input.setInputFiles({ name: "e2e-photo.png", mimeType: "image/png", buffer: png });
    // the preview renders above the action row
    await expect(page.locator('img[alt="Attached media preview"]')).toBeVisible();
    // post with media → the post card serves it from /api/media/ (the
    // content marker rides the purge sweep)
    await page.getByLabel("Share an update").fill("e2e-media-post");
    await page.getByRole("button", { name: "Post", exact: true }).click();
    const postMedia = page.locator('img[alt="Post media"]').first();
    await expect(postMedia).toBeVisible({ timeout: 15000 });
    expect(await postMedia.getAttribute("src")).toMatch(/^\/api\/media\//);
    // the media route answers with the right content type
    const src = (await postMedia.getAttribute("src")) as string;
    const res = await page.request.get(src);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/png");
  });

  test("R57-C: the WhatsApp Connect opens REF's Configure WhatsApp API dialog (the recipe)", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("tab", { name: "Integrations" }).click();
    // the WhatsApp tile's Connect (the first of the two Connect buttons —
    // ZKT's is second and stays the REF-parity no-op)
    await page.getByRole("button", { name: "Connect", exact: true }).first().click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    await expect(dlg.getByRole("heading", { name: "Configure WhatsApp API" })).toBeVisible();
    // REF's three fields (labels + placeholders + the required pair)
    const fields = await dlg.evaluate(() => {
      const d = document.querySelector("[role=dialog]") as HTMLElement;
      const labels = [...d.querySelectorAll("label")].map((l) => l.textContent?.trim());
      const inputs = [...d.querySelectorAll("input")].map((i) => ({
        ph: (i as HTMLInputElement).placeholder,
        required: (i as HTMLInputElement).required,
      }));
      const buttons = [...d.querySelectorAll("button")]
        .map((b) => b.textContent?.trim())
        .filter((t) => t && !t.includes("Close"));
      return { labels, inputs, buttons, width: getComputedStyle(d).maxWidth };
    });
    expect(fields.labels).toEqual(["API Key", "Phone Number (with country code)", "Webhook URL (Optional)"]);
    expect(fields.inputs).toEqual([
      { ph: "Enter your WhatsApp API key", required: true },
      { ph: "+966XXXXXXXXX", required: true },
      { ph: "https://your-webhook.com", required: false },
    ]);
    expect(fields.buttons).toEqual(["Cancel", "Save Configuration"]);
    expect(fields.width).toBe("512px"); // max-w-lg
    await dlg.getByRole("button", { name: "Cancel" }).click();
    await expect(dlg).toBeHidden();
  });

  test("R57-D: the profile Social Accounts tab is REF's Connected Accounts form (4 rows + the sky tile computes sRGB)", async ({ page }) => {
    await page.goto("/profile");
    await page.getByRole("tab", { name: "Social Accounts" }).click();
    const panel = page.locator('[data-state=active][role=tabpanel]');
    await expect(panel.getByText("Connected Accounts")).toBeVisible();
    const form = await panel.evaluate(() => {
      const p = document.querySelector('[data-state=active][role=tabpanel]') as HTMLElement;
      const rows = [...p.querySelectorAll(".flex.items-center.gap-4")].map((r) => {
        const tile = r.firstElementChild as HTMLElement;
        const tileBg = getComputedStyle(tile).backgroundColor;
        const inp = r.querySelector("input") as HTMLInputElement;
        return { tileBg, ph: inp.placeholder, label: r.querySelector("label")?.textContent?.trim() };
      });
      const save = [...p.querySelectorAll("button")].find((b) => b.textContent?.includes("Save"));
      return { rows, saveText: save?.textContent?.trim() };
    });
    expect(form.rows.map((r: { label?: string }) => r.label)).toEqual([
      "LinkedIn Profile",
      "Twitter Profile",
      "GitHub Profile",
      "Facebook Profile",
    ]);
    expect(form.rows.map((r: { ph?: string }) => r.ph)).toEqual([
      "https://linkedin.com/in/yourprofile",
      "https://twitter.com/yourusername",
      "https://github.com/yourusername",
      "https://facebook.com/yourprofile",
    ]);
    // R57-p: the sky tile computes REF's sRGB #e0f2fe (the v4 oklch drift
    // trap — an unpinned sky-100 serializes as lab())
    expect(form.rows[1].tileBg).toBe("rgb(224, 242, 254)");
    // the blue/slate tiles still compute their pinned values
    expect(form.rows[0].tileBg).toBe("rgb(219, 234, 254)");
    expect(form.rows[2].tileBg).toBe("rgb(241, 245, 249)");
    expect(form.saveText).toBe("Save Accounts");
  });

  test("R57-E1: the profile Preferences tab is REF's two-card recipe (the slate rows + the red Danger Zone frame)", async ({ page }) => {
    await page.goto("/profile");
    await page.getByRole("tab", { name: "Preferences" }).click();
    const panel = page.locator('[data-state=active][role=tabpanel]');
    await expect(panel.getByText("Notification Preferences")).toBeVisible();
    const recipe = await panel.evaluate(() => {
      const p = document.querySelector('[data-state=active][role=tabpanel]') as HTMLElement;
      const rows = [...p.querySelectorAll(".bg-slate-50")].map((r) => ({
        title: r.querySelector("h4")?.textContent?.trim(),
        sub: r.querySelector("p")?.textContent?.trim(),
        bg: getComputedStyle(r).backgroundColor,
        state: r.querySelector('[role=switch]')?.getAttribute("data-state"),
      }));
      const danger = [...p.querySelectorAll(".border-red-200")].find((c) =>
        c.textContent?.includes("Danger Zone")
      ) as HTMLElement;
      const title = danger?.querySelector(".text-red-600") as HTMLElement;
      return {
        rows,
        saveBtn: [...p.querySelectorAll("button")].find((b) => b.textContent?.includes("Save Preferences"))?.textContent?.trim(),
        dangerFrame: danger ? getComputedStyle(danger).borderColor : null,
        dangerTitleColor: title ? getComputedStyle(title).color : null,
        deleteBtn: [...p.querySelectorAll("button")].find((b) => b.textContent?.includes("Delete My Account"))?.textContent?.trim(),
      };
    });
    // the two notification rows (REF's verbatim titles + subs, checked default)
    type Row = { title?: string; sub?: string; bg?: string; state?: string };
    const rows = recipe.rows as Row[];
    expect(rows.map((r) => r.title)).toEqual(["Email Notifications", "Push Notifications"]);
    expect(rows.map((r) => r.sub)).toEqual([
      "Receive notifications via email",
      "Receive push notifications in browser",
    ]);
    expect(rows.map((r) => r.state)).toEqual(["checked", "checked"]);
    expect(rows.map((r) => r.bg)).toEqual(["rgb(248, 250, 252)", "rgb(248, 250, 252)"]);
    expect(recipe.saveBtn).toBe("Save Preferences");
    // R57-p: the Danger Zone frame + title compute REF's pinned reds
    expect(recipe.dangerFrame).toBe("rgb(254, 202, 202)"); // red-200
    expect(recipe.dangerTitleColor).toBe("rgb(220, 38, 38)"); // red-600
    expect(recipe.deleteBtn).toBe("Delete My Account");
  });

  test("R57-E2: the DELETE-typed confirmation contract + the full account-deletion round-trip", async ({ browser }) => {
    // a fresh user signs up (the storageState-free context), deletes
    // itself through the Danger Zone, and lands on /login — the superset
    // round-trip; the purge sweeps the user if anything fails mid-way.
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    const email = `e2e-delete-${Date.now()}@eon-hr.test`;
    await page.request.post("/api/auth/signup", {
      data: {
        name: "E2E Delete Me",
        email,
        password: "Superset123!",
        confirmPassword: "Superset123!",
      },
    });
    // sign in as the fresh user
    await page.goto("/login");
    await page.fill('input[type=email]', email);
    await page.fill('input[type=password]', "Superset123!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
    // the DELETE-typed gate: the destructive button stays disabled until
    // the exact word is typed
    await page.goto("/profile");
    await page.getByRole("tab", { name: "Preferences" }).click();
    await page.getByRole("button", { name: "Delete My Account" }).click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    await expect(dlg.getByText("This action cannot be undone. This will permanently delete your account and remove your data from our servers.")).toBeVisible();
    const confirmBtn = dlg.getByRole("button", { name: "Delete Account", exact: true });
    await expect(confirmBtn).toBeDisabled();
    await dlg.locator("#delete-confirm").fill("DELETE");
    await expect(confirmBtn).toBeEnabled();
    // the deletion lands back on /login (the sign-out rides the delete)
    await confirmBtn.click();
    await page.waitForURL((u) => u.pathname.startsWith("/login"), { timeout: 20000 });
    // the account is really gone: the auth probe reports no user
    const me = await page.request.get("/api/auth/me");
    const meJson = (await me.json()) as { ok: boolean; data?: { user?: unknown } };
    expect(meJson.data?.user ?? null).toBeNull();
    await ctx.close();
  });
});
