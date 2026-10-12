import { expect, test } from "@playwright/test";

/**
 * Session 28 (R27-A): the recruitment pipeline drag-drop superset — E2E
 * round-trip.
 *
 * REF ships zero draggables on /recruitmentkanban (re-verified round 27);
 * the clone's cards now actually drag through the pipeline. HTML5 DnD
 * cannot be driven by plain mouse events — the spec dispatches synthetic
 * DragEvents (dragstart → dragover → drop) with a real DataTransfer, the
 * same event sequence a native drag produces.
 *
 * Round-trip: create a job + candidate (API) → drag Applied →
 * Interviewing → assert the optimistic move + toast → reload → assert
 * persistence → cleanup (API, job cascades the candidate).
 */
test.describe("recruitment pipeline drag-drop (session 28 superset)", () => {
  test("candidate card drags between stages and persists after reload", async ({ page }) => {
    // Setup: a job + a candidate in Applied via the API (the dialog path
    // is covered by the unit source pins; the E2E cares about the DnD
    // contract only).
    const jobRes = await page.request.post("/api/jobs", {
      data: { title: "E2E DnD Probe Role", department: "QA", openings: 1 },
    });
    const jobJson = await jobRes.json();
    expect(jobJson.ok).toBe(true);
    const jobId: string = jobJson.data.job.id;

    const candRes = await page.request.post("/api/candidates", {
      data: { jobPostingId: jobId, name: "E2E DnD Probe", email: "probe@example.com" },
    });
    const candJson = await candRes.json();
    expect(candJson.ok).toBe(true);
    const candId: string = candJson.data.candidate.id;

    try {
      await page.goto("/recruitmentkanban");
      const board = page.locator("div.flex.gap-4.overflow-x-auto").first();
      await expect(board).toBeVisible();

      // The card renders in the Applied column and is draggable.
      const card = board.locator("div[draggable='true']", { hasText: "E2E DnD Probe" });
      await expect(card).toBeVisible();
      await expect(card).toHaveCSS("cursor", "grab");

      // Column headers locate the drop zones (Applied first, Interviewing second).
      const appliedCol = board.locator("div.w-64", { hasText: "Applied" }).first();
      const interviewingCol = board.locator("div.w-64", { hasText: "Interviewing" }).first();
      await expect(appliedCol).toBeVisible();
      await expect(interviewingCol).toBeVisible();

      // The synthetic drag sequence: dragstart (card) → dragover (target
      // column, repeated as the browser would) → drop. React needs a tick
      // after dragstart to flush the dragCandId state the drop reads.
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
      await interviewingCol.evaluate((el) => {
        el.dispatchEvent(
          new DragEvent("dragover", {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer(),
          })
        );
      });
      await page.waitForTimeout(60);
      await interviewingCol.evaluate((el) => {
        el.dispatchEvent(
          new DragEvent("drop", {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer(),
          })
        );
      });

      // The optimistic move: the card now lives inside the Interviewing
      // column and the toast confirms the PATCH round-trip.
      await expect(
        interviewingCol.locator("div[draggable='true']", { hasText: "E2E DnD Probe" })
      ).toBeVisible();
      await expect(
        appliedCol.locator("div[draggable='true']", { hasText: "E2E DnD Probe" })
      ).toHaveCount(0);
      await expect(page.getByText("E2E DnD Probe → Interviewing")).toBeVisible();

      // Persistence: reload and re-read the board from the server.
      await page.reload();
      const board2 = page.locator("div.flex.gap-4.overflow-x-auto").first();
      await expect(board2).toBeVisible();
      const interviewingCol2 = board2.locator("div.w-64", { hasText: "Interviewing" }).first();
      await expect(
        interviewingCol2.locator("div[draggable='true']", { hasText: "E2E DnD Probe" })
      ).toBeVisible();
    } finally {
      // Cleanup: the job delete cascades the candidate — restore the
      // seeded state regardless of outcome.
      await page.request.delete(`/api/jobs?id=${jobId}`);
    }
  });

  /**
   * Session 29 (R28-A): the within-stage ordering superset — the same
   * round-trip as the taskmanager reorder (session 28 / R27-B) applied to
   * the pipeline. Two candidates in Applied (Beta renders above Alpha via
   * the appliedAt tiebreak — both positions backfill to 0); drag Alpha
   * ONTO Beta to insert it before her, assert the visual order flips +
   * the "Order updated" toast, reload, assert persistence via the
   * position column.
   */
  test("candidate card reorders within its stage and persists after reload", async ({ page }) => {
    const jobRes = await page.request.post("/api/jobs", {
      data: { title: "E2E Reorder Probe Role", department: "QA", openings: 1 },
    });
    const jobJson = await jobRes.json();
    expect(jobJson.ok).toBe(true);
    const jobId: string = jobJson.data.job.id;

    // Alpha first, then Beta — with equal positions the appliedAt desc
    // tiebreak renders Beta ABOVE Alpha in the Applied column.
    const alphaRes = await page.request.post("/api/candidates", {
      data: { jobPostingId: jobId, name: "E2E Alpha", email: "alpha@example.com" },
    });
    const betaRes = await page.request.post("/api/candidates", {
      data: { jobPostingId: jobId, name: "E2E Beta", email: "beta@example.com" },
    });
    expect((await alphaRes.json()).ok).toBe(true);
    expect((await betaRes.json()).ok).toBe(true);

    try {
      await page.goto("/recruitmentkanban");
      const board = page.locator("div.flex.gap-4.overflow-x-auto").first();
      await expect(board).toBeVisible();
      const appliedCol = board.locator("div.w-64", { hasText: "Applied" }).first();

      const readOrder = () =>
        appliedCol.evaluate((col) =>
          [...col.querySelectorAll("div[draggable='true'] p.font-medium")].map((p) =>
            p.textContent?.trim()
          )
        );

      // Before: Beta above Alpha (the appliedAt tiebreak).
      await expect(board.locator("div[draggable='true']", { hasText: "E2E Beta" })).toBeVisible();
      expect(await readOrder()).toEqual(["E2E Beta", "E2E Alpha"]);

      // Drag Alpha ONTO Beta — the insertion drop inserts Alpha BEFORE Beta.
      const alpha = board.locator("div[draggable='true']", { hasText: "E2E Alpha" });
      const beta = board.locator("div[draggable='true']", { hasText: "E2E Beta" });
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

      // The optimistic flip + the same-stage toast.
      await expect(page.getByText("Order updated")).toBeVisible();
      expect(await readOrder()).toEqual(["E2E Alpha", "E2E Beta"]);

      // Persistence: reload and re-read the board from the server (the
      // position column now orders the stage).
      await page.reload();
      const board2 = page.locator("div.flex.gap-4.overflow-x-auto").first();
      await expect(board2).toBeVisible();
      const appliedCol2 = board2.locator("div.w-64", { hasText: "Applied" }).first();
      const order2 = await appliedCol2.evaluate((col) =>
        [...col.querySelectorAll("div[draggable='true'] p.font-medium")].map((p) =>
          p.textContent?.trim()
        )
      );
      expect(order2).toEqual(["E2E Alpha", "E2E Beta"]);

      // Both cards still live in Applied (the reorder did not move stages).
      expect(order2.length).toBe(2);
    } finally {
      await page.request.delete(`/api/jobs?id=${jobId}`);
    }
  });
});
