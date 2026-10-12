import { expect, test } from "@playwright/test";

/**
 * Session 27 (R26-B): the kanban drag-drop superset — E2E round-trip.
 *
 * REF ships zero draggables on its taskmanager kanban (documented since
 * session-21); the clone's cards LOOK grabbable (the REF cursor-grab
 * recipe) and now actually drag. HTML5 DnD cannot be driven by plain
 * mouse events — the spec dispatches synthetic DragEvents (dragstart →
 * dragover → drop) with a real DataTransfer, the same event sequence a
 * native drag produces.
 *
 * Round-trip: create a task (API) → drag Backlog → Done → assert the
 * optimistic move + toast → reload → assert persistence → cleanup (API).
 */
test.describe("taskmanager kanban drag-drop (session 27 superset)", () => {
  test("card drags between columns and persists after reload", async ({ page }) => {
    // Setup: a task in Backlog via the API (the wizard path is covered by
    // the unit source pins; the E2E cares about the DnD contract only).
    const create = await page.request.post("/api/tasks", {
      data: {
        kind: "task",
        title: "E2E DnD Probe",
        status: "backlog",
        priority: "medium",
      },
    });
    const created = await create.json();
    expect(created.ok).toBe(true);
    const taskId: string = created.data.task.id;

    try {
      await page.goto("/taskmanager");
      const board = page.locator("div.md\\:grid-cols-5").first();
      await expect(board).toBeVisible();

      // The card renders in the Backlog column and is draggable.
      const card = board.locator("div[draggable='true']", {
        hasText: "E2E DnD Probe",
      });
      await expect(card).toBeVisible();
      await expect(card).toHaveCSS("cursor", "grab");

      // Column headers locate the drop zones (Backlog first, Done last).
      const backlogCol = board.locator("div.space-y-3", { hasText: "Backlog" }).first();
      const doneCol = board.locator("div.space-y-3", { hasText: "Done" }).first();
      await expect(backlogCol).toBeVisible();
      await expect(doneCol).toBeVisible();

      // The synthetic drag sequence: dragstart (card) → dragover (target
      // column, repeated as the browser would) → drop. React needs a tick
      // after dragstart to flush the dragTaskId state the drop reads.
      await card.evaluate((el) => {
        el.dispatchEvent(
          new DragEvent("dragstart", {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer(),
          })
        );
      });
      await page.waitForTimeout(150);
      await doneCol.evaluate((el) => {
        el.dispatchEvent(
          new DragEvent("dragover", {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer(),
          })
        );
      });
      await page.waitForTimeout(60);
      await doneCol.evaluate((el) => {
        el.dispatchEvent(
          new DragEvent("drop", {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer(),
          })
        );
      });

      // The optimistic move: the card now lives inside the Done column
      // and the toast confirms the PATCH round-trip.
      await expect(doneCol.locator("div[draggable='true']", { hasText: "E2E DnD Probe" })).toBeVisible();
      await expect(backlogCol.locator("div[draggable='true']", { hasText: "E2E DnD Probe" })).toHaveCount(0);
      await expect(page.getByText("Task moved")).toBeVisible();

      // Persistence: reload and re-read the board from the server.
      await page.reload();
      const board2 = page.locator("div.md\\:grid-cols-5").first();
      await expect(board2).toBeVisible();
      const doneCol2 = board2.locator("div.space-y-3", { hasText: "Done" }).first();
      await expect(doneCol2.locator("div[draggable='true']", { hasText: "E2E DnD Probe" })).toBeVisible();
    } finally {
      // Cleanup: restore the seeded state regardless of outcome.
      await page.request.delete(`/api/tasks?kind=task&id=${taskId}`);
    }
  });

  /**
   * Session 28 (R27-B): the within-column reorder — dropping a card ONTO
   * another card inserts it immediately before that card, and the order
   * persists (position column) after reload.
   */
  test("card reorders within its column and persists after reload", async ({ page }) => {
    // Setup: two tasks in Backlog. Position ties break on createdAt desc
    // (newest first), so Beta (created second) renders ABOVE Alpha; the
    // test then drags the LOWER card (Alpha) onto Beta to flip the order.
    const createA = await page.request.post("/api/tasks", {
      data: { kind: "task", title: "E2E Reorder Alpha", status: "backlog", priority: "low" },
    });
    const jsonA = await createA.json();
    expect(jsonA.ok).toBe(true);
    const idA: string = jsonA.data.task.id;

    const createB = await page.request.post("/api/tasks", {
      data: { kind: "task", title: "E2E Reorder Beta", status: "backlog", priority: "low" },
    });
    const jsonB = await createB.json();
    expect(jsonB.ok).toBe(true);
    const idB: string = jsonB.data.task.id;

    try {
      await page.goto("/taskmanager");
      const board = page.locator("div.md\\:grid-cols-5").first();
      await expect(board).toBeVisible();

      const backlogCol = board.locator("div.space-y-3", { hasText: "Backlog" }).first();
      const alpha = backlogCol.locator("div[draggable='true']", { hasText: "E2E Reorder Alpha" });
      const beta = backlogCol.locator("div[draggable='true']", { hasText: "E2E Reorder Beta" });
      await expect(alpha).toBeVisible();
      await expect(beta).toBeVisible();

      // Baseline: Beta (created later) renders ABOVE Alpha.
      const yBefore = await alpha.boundingBox();
      const yBetaBefore = await beta.boundingBox();
      expect(yBetaBefore!.y).toBeLessThan(yBefore!.y);

      // Drag Alpha ONTO Beta — insert Alpha immediately before Beta (above
      // it). Synthetic DragEvents with a real DataTransfer.
      await alpha.evaluate((el) => {
        el.dispatchEvent(
          new DragEvent("dragstart", {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer(),
          })
        );
      });
      await page.waitForTimeout(150);
      await beta.evaluate((el) => {
        el.dispatchEvent(
          new DragEvent("dragover", {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer(),
          })
        );
      });
      await page.waitForTimeout(60);
      await beta.evaluate((el) => {
        el.dispatchEvent(
          new DragEvent("drop", {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer(),
          })
        );
      });

      // The optimistic reorder: Alpha now renders ABOVE Beta + the toast.
      const yAfter = await alpha.boundingBox();
      const yBetaAfter = await beta.boundingBox();
      expect(yAfter!.y).toBeLessThan(yBetaAfter!.y);
      await expect(page.getByText("Order updated")).toBeVisible();

      // Persistence: reload and re-read the board from the server.
      await page.reload();
      const board2 = page.locator("div.md\\:grid-cols-5").first();
      await expect(board2).toBeVisible();
      const backlogCol2 = board2.locator("div.space-y-3", { hasText: "Backlog" }).first();
      const alpha2 = backlogCol2.locator("div[draggable='true']", { hasText: "E2E Reorder Alpha" });
      const beta2 = backlogCol2.locator("div[draggable='true']", { hasText: "E2E Reorder Beta" });
      const yAlphaReloaded = await alpha2.boundingBox();
      const yBetaReloaded = await beta2.boundingBox();
      expect(yAlphaReloaded!.y).toBeLessThan(yBetaReloaded!.y);
    } finally {
      // Cleanup: restore the seeded state regardless of outcome.
      await page.request.delete(`/api/tasks?kind=task&id=${idA}`);
      await page.request.delete(`/api/tasks?kind=task&id=${idB}`);
    }
  });
});
