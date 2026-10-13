import { expect, test } from "@playwright/test";

/**
 * Session 31 (R30-C): the legacy /assets route — REF's orphan page.
 *
 * REF serves a legacy assets page at /assets (the sidebar links to
 * /assetmanagement, the modern byte-identical page). The clone 404'd
 * here; this spec pins the replicated contract (the flat36 always-row
 * header, the green→blue canvas, the bg-slate-50 card header band, the
 * centered "No assets yet" empty state) and the Add Asset round-trip
 * through the shared /api/assets (the desktop/tablet types included).
 */
test.describe("legacy /assets route (session 31)", () => {
  // A failed prior run may leave the probe behind (the e2e DB persists
  // across runs) — BOTH tests need the pristine empty state, so the
  // pre-clean runs before each (the organogram spec's lesson, applied at
  // describe scope after a full-suite cascade).
  test.beforeEach(async ({ page }) => {
    const pre = await page.request.get("/api/assets");
    const preJson = await pre.json();
    if (preJson?.data?.assets) {
      for (const a of preJson.data.assets.filter((x: { name: string }) => x.name.startsWith("R30 Legacy Probe"))) {
        await page.request.delete(`/api/assets?id=${a.id}`);
      }
    }
  });

  test("renders REF's legacy page contract instead of a 404", async ({ page }) => {
    await page.goto("/assets");

    // The flat36 header: kicker + h1 + subtitle + the badge-row button.
    await expect(page.getByText("Asset Management", { exact: true })).toBeVisible();
    const h1 = page.getByRole("heading", { name: "Assets", exact: true, level: 1 });
    await expect(h1).toBeVisible();
    await expect(page.getByText("Track and manage company assets")).toBeVisible();
    const addBtn = page.getByRole("button", { name: "Add Asset" });
    await expect(addBtn).toBeVisible();

    // The always-row header: the button rides the badge row (top-right),
    // not a stacked column — the row is flex at EVERY width.
    const h1Box = await h1.boundingBox();
    const btnBox = await addBtn.boundingBox();
    expect(h1Box).toBeTruthy();
    expect(btnBox).toBeTruthy();
    expect(btnBox!.y).toBeLessThan(h1Box!.y); // the badge row, above the h1

    // The card: the bg-slate-50 header band + the centered empty state.
    const card = page.locator(".rounded-xl.border-slate-200").first();
    await expect(card).toBeVisible();
    const band = card.locator(".bg-slate-50");
    await expect(band).toBeVisible();
    await expect(band.getByText("Assets", { exact: true })).toBeVisible();
    await expect(card.getByText("No assets yet")).toBeVisible();

    // The header title is leading-none (16px box, REF's measured h=16).
    const bandTitle = band.getByText("Assets", { exact: true });
    await expect(bandTitle).toHaveClass(/leading-none/);
  });

  test("the Add Asset dialog registers an asset (desktop type) and lists it", async ({ page }) => {
    await page.goto("/assets");
    await expect(page.getByText("No assets yet")).toBeVisible();

    // Open the dialog.
    await page.getByRole("button", { name: "Add Asset" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Asset Name")).toBeVisible();
    await expect(dialog.getByText("Serial Number")).toBeVisible();
    await expect(dialog.getByText("Assign To (Optional)")).toBeVisible();

    // Fill: a Desktop-type asset (the legacy-only enum member).
    await dialog.getByLabel("Asset Name").fill("R30 Legacy Probe");
    await dialog.getByRole("combobox", { name: "Asset type" }).click();
    await page.getByRole("option", { name: "Desktop", exact: true }).click();
    await dialog.getByLabel("Serial Number").fill("R30-SN-001");
    await dialog.getByRole("button", { name: "Add Asset" }).last().click();

    // The row lands + the toast confirms.
    await expect(page.getByText("R30 Legacy Probe")).toBeVisible();
    await expect(page.getByText("R30-SN-001")).toBeVisible();
    await expect(page.getByText("Asset added")).toBeVisible();

    // Cleanup: delete via the API (leaves the pristine empty state).
    const list = await page.request.get("/api/assets");
    const json = await list.json();
    const probe = json.data.assets.find((a: { name: string }) => a.name === "R30 Legacy Probe");
    expect(probe).toBeTruthy();
    const del = await page.request.delete(`/api/assets?id=${probe.id}`);
    expect((await del.json()).ok).toBe(true);

    await page.reload();
    await expect(page.getByText("No assets yet")).toBeVisible();
  });
});
