import { expect, test } from "@playwright/test";

/**
 * Session 31 (R30-B): the /hrassistantchat empty-state contract.
 *
 * REF's measured recipe (dual-browser, 1440×900): the left card is a
 * natural-height Card with a CardHeader (p-4, border-b) carrying the
 * 14px/600 "Active Chats" title over a plain muted "No chats" line; the
 * right pane's h-full card centers a 64px slate-300 MessageSquare above
 * the single 16px slate-500 line. The clone previously shipped a
 * stretched card + iconed EmptyStates with two extra text blocks — this
 * spec pins the restored contract (presence AND absence).
 */
test.describe("hr assistant chat empty states (session 31)", () => {
  test("the left card and right pane render REF's empty contract", async ({ page }) => {
    await page.goto("/hrassistantchat");

    // The header row contract (already byte-identical — the anchor).
    await expect(page.getByRole("heading", { name: "HR Assistant", exact: true })).toBeVisible();
    await expect(page.getByText("Chat with your AI-powered HR assistant")).toBeVisible();

    // The left card: the 14px/600 title in a bordered CardHeader...
    // (text-sm's DEFAULT 20px line box — the 1px-overshoot lesson)
    /* Session 47 (R46-D1): CardTitle is a DIV — locate by text. */
    const activeChats = page.getByText("Active Chats", { exact: true });
    await expect(activeChats).toBeVisible();
    await expect(activeChats).toHaveClass(/font-semibold tracking-tight text-sm/);

    // ...over the plain muted line (no h3, no icon block).
    const noChats = page.getByText("No chats", { exact: true });
    await expect(noChats).toBeVisible();
    await expect(noChats.locator("xpath=..")).not.toHaveClass(/text-lg/);

    // The right pane: the centered MessageSquare + the single line.
    const icon = page.locator("svg.h-16.w-16.text-slate-300");
    await expect(icon).toBeVisible();
    const line = page.getByText("Select a chat or start a new one", { exact: true });
    await expect(line).toBeVisible();
    await expect(line.locator("xpath=..")).toHaveClass(/text-center/);

    // The extra copy REF does not render must stay absent.
    await expect(page.getByText("Start a new chat to ask a question.")).toHaveCount(0);
    await expect(page.getByText(/Your HR assistant answers questions/)).toHaveCount(0);

    // The centered block sits over the line inside the pane card (order).
    // Session 66 (R66-B) amendment: the icon is SVG-AUTHORED (REF's live
    // form — mx-auto mb-4 on the icon itself); the mb-4 wrapper div is
    // retired, so the icon is now a DIRECT child of the text-center block.
    const pane = page.locator("div.lg\\:col-span-3");
    await expect(pane.locator("div.text-center > svg")).toHaveCount(1);

    // Geometry anchor (desktop 1280 default): the pane card fills the row.
    const cardBox = await pane.locator(".rounded-xl").boundingBox();
    expect(cardBox).toBeTruthy();
    expect(cardBox!.height).toBeGreaterThan(400);
  });
});
