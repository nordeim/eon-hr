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
      if (Array.isArray(parsed)) {
        actions = parsed.map((a) => {
          if (typeof a === "string") return a; // legacy rows
          if (typeof a === "object" && a !== null && "type" in a) {
            const it = a as { type?: unknown; delayDays?: unknown };
            const t = typeof it.type === "string" ? it.type : "action";
            return typeof it.delayDays === "number" && it.delayDays > 0 ? `${t} (+${it.delayDays}d)` : t;
          }
          return "action";
        });
      }
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
          `Executed "${workflow.name}" (${workflow.triggerType} trigger)` +
          (workflow.targetDepartment ? `, ${workflow.targetDepartment} department` : "") +
          (actions.length > 0 ? ` — ${actions.length} action(s): ${actions.join(", ")}` : " — no actions defined"),
        startedAt: now,
        completedAt: now,
      },
      select: { id: true },
    });

    return ok({ runId: run.id, executions });
  });
}
