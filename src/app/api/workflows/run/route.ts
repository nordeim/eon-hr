import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err, guard, requireRole } from "@/lib/api";

// POST /api/workflows/run?id= — execute a workflow manually:
// increments the execution counter and records a WorkflowExecution row.
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Workflow id is required");

    const workflow = await db.workflow.findUnique({ where: { id } });
    if (!workflow) return err("NOT_FOUND", "Workflow not found");

    let actions: string[] = [];
    try {
      const parsed: unknown = JSON.parse(workflow.actions || "[]");
      if (Array.isArray(parsed)) actions = parsed.filter((a): a is string => typeof a === "string");
    } catch {
      actions = [];
    }

    const now = new Date();
    const executions = workflow.executions + 1;
    await db.workflow.update({ where: { id }, data: { executions } });
    const run = await db.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        status: "success",
        detail:
          `Executed "${workflow.name}" (${workflow.module} module, ${workflow.trigger} trigger)` +
          (actions.length > 0 ? ` — ${actions.length} action(s): ${actions.join(", ")}` : " — no actions defined"),
        startedAt: now,
        completedAt: now,
      },
      select: { id: true },
    });

    return ok({ runId: run.id, executions });
  });
}
