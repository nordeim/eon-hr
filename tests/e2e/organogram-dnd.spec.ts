import { expect, test } from "@playwright/test";

/**
 * Session 30 (R29-B): the organogram drag-drop superset — E2E round-trip.
 *
 * REF /organogram ships zero draggables (re-verified this round); the
 * clone's tree now actually re-parents through the employees PATCH
 * (managerId). HTML5 DnD cannot be driven by plain mouse events — the
 * spec dispatches synthetic DragEvents (dragstart → dragover → drop) with
 * a real DataTransfer, the same event sequence a native drag produces.
 *
 * Round-trip: create the A → B → C chain via the API → drag C onto A →
 * assert the optimistic move + toast → reload → assert persistence (C
 * renders directly under A, not under B) → cleanup. The second test pins
 * the cycle rejection: dragging A onto its own descendant C errors and
 * never persists.
 */

/** Depth reader: each card's border-l-2 ancestor count IS its tree depth. */
async function readTree(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const cards = [...document.querySelectorAll("div[draggable='true']")];
    return cards.map((c) => {
      const name = c.querySelector("p.font-medium")?.textContent?.trim() ?? "";
      let depth = 0;
      let el: HTMLElement | null = c.parentElement;
      while (el) {
        if (String(el.className).includes("border-l-2")) depth++;
        el = el.parentElement;
      }
      return { name, depth };
    });
  });
}

test.describe("organogram drag-drop (session 30 superset)", () => {
  test("employee card re-parents onto another node and persists after reload", async ({ page }) => {
    // Setup: the A → B → C chain via the API (the edit-form path is the
    // keyboard path; the E2E cares about the DnD contract only).
    const mk = async (firstName: string, lastName: string, managerId?: string) => {
      const res = await page.request.post("/api/employees", {
        data: {
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.r29@example.com`,
          jobTitle: "R29 Probe",
          ...(managerId ? { managerId } : {}),
        },
      });
      const json = await res.json();
      expect(json.ok).toBe(true);
      return json.data.employee.id as string;
    };
    const aId = await mk("R29a", "Root");
    const bId = await mk("R29b", "Mid", aId);
    const cId = await mk("R29c", "Leaf", bId);

    try {
      await page.goto("/organogram");
      const board = page.locator("div.ml-6.border-l-2").first();
      await expect(board).toBeVisible();

      // The chain renders: A at depth 0, B at 1, C at 2.
      let tree = await readTree(page);
      expect(tree.find((n) => n.name === "R29a Root")).toMatchObject({ depth: 0 });
      expect(tree.find((n) => n.name === "R29b Mid")).toMatchObject({ depth: 1 });
      expect(tree.find((n) => n.name === "R29c Leaf")).toMatchObject({ depth: 2 });

      // The cards are draggable with the round-27 affordance.
      const cCard = page.locator("div[draggable='true']", { hasText: "R29c Leaf" }).first();
      const aCard = page.locator("div[draggable='true']", { hasText: "R29a Root" }).first();
      await expect(cCard).toHaveCSS("cursor", "grab");

      // The synthetic drag sequence: dragstart (C) → dragover (A,
      // repeated as the browser would) → drop. React needs a tick after
      // dragstart to flush the draggedId state the drop reads.
      await cCard.evaluate((el) => {
        el.dispatchEvent(
          new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })
        );
      });
      await page.waitForTimeout(150);
      await aCard.evaluate((el) => {
        el.dispatchEvent(
          new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })
        );
      });
      await page.waitForTimeout(60);
      // mid-drag: the insertion ring on the hovered target (computed DOM
      // is the ground truth — the 2px 40%-alpha ring is imperceptible in
      // screenshots, the round-27 lesson; Chrome serializes the blue-500/40
      // ring as lab() with the inset 2px geometry last).
      await expect(aCard).toHaveCSS("box-shadow", /0px 0px 0px 2px inset/);
      await aCard.evaluate((el) => {
        el.dispatchEvent(
          new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })
        );
      });

      // The optimistic re-parent: C now renders at depth 1 (directly
      // under A) and the toast confirms the PATCH round-trip.
      tree = await readTree(page);
      expect(tree.find((n) => n.name === "R29c Leaf")).toMatchObject({ depth: 1 });
      await expect(page.getByText("R29c Leaf now reports to R29a Root")).toBeVisible();

      // Persistence: reload and re-read the tree from the server.
      await page.reload();
      const board2 = page.locator("div.ml-6.border-l-2").first();
      await expect(board2).toBeVisible();
      tree = await readTree(page);
      expect(tree.find((n) => n.name === "R29c Leaf")).toMatchObject({ depth: 1 });
    } finally {
      // Cleanup: leaves first (the manager self-relation) — restore the
      // seeded state regardless of outcome.
      await page.request.delete(`/api/employees?id=${cId}`);
      await page.request.delete(`/api/employees?id=${bId}`);
      await page.request.delete(`/api/employees?id=${aId}`);
    }
  });

  test("dropping a node onto its own descendant is rejected with the cycle toast", async ({ page }) => {
    const mk = async (firstName: string, lastName: string, managerId?: string) => {
      const res = await page.request.post("/api/employees", {
        data: {
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.cyc@example.com`,
          jobTitle: "R29 Cycle Probe",
          ...(managerId ? { managerId } : {}),
        },
      });
      const json = await res.json();
      expect(json.ok).toBe(true);
      return json.data.employee.id as string;
    };
    const aId = await mk("R29d", "Ancestor");
    const bId = await mk("R29e", "Middle", aId);
    const cId = await mk("R29f", "Descendant", bId);

    try {
      await page.goto("/organogram");
      const board = page.locator("div.ml-6.border-l-2").first();
      await expect(board).toBeVisible();

      // Drag A (the root) onto C (its own descendant) — the client cycle
      // guard must reject the move before any request fires.
      const aCard = page.locator("div[draggable='true']", { hasText: "R29d Ancestor" }).first();
      const cCard = page.locator("div[draggable='true']", { hasText: "R29f Descendant" }).first();

      await aCard.evaluate((el) => {
        el.dispatchEvent(
          new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })
        );
      });
      await page.waitForTimeout(150);
      await cCard.evaluate((el) => {
        el.dispatchEvent(
          new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })
        );
      });
      await page.waitForTimeout(60);
      await cCard.evaluate((el) => {
        el.dispatchEvent(
          new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })
        );
      });

      // The cycle toast — no move, no persistence.
      await expect(page.getByText("Cannot create a reporting cycle")).toBeVisible();
      let tree = await readTree(page);
      expect(tree.find((n) => n.name === "R29d Ancestor")).toMatchObject({ depth: 0 });

      await page.reload();
      await page.locator("div.ml-6.border-l-2").first().waitFor();
      tree = await readTree(page);
      expect(tree.find((n) => n.name === "R29d Ancestor")).toMatchObject({ depth: 0 });
      expect(tree.find((n) => n.name === "R29f Descendant")).toMatchObject({ depth: 2 });
    } finally {
      await page.request.delete(`/api/employees?id=${cId}`);
      await page.request.delete(`/api/employees?id=${bId}`);
      await page.request.delete(`/api/employees?id=${aId}`);
    }
  });
});
